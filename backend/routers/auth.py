import datetime
import urllib.request
import json
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import pwd_context, create_access_token, normalize_phone, get_current_user_id
from backend.core.utils import send_smtp_email, send_email_background_task

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory dictionary to track OTP timestamps for rate limiting: {target: last_sent_datetime}
otp_timestamps = {}
# In-memory tracking for failed login attempts to prevent password brute-force: {identifier: [timestamps]}
failed_login_attempts = {}

def check_brute_force_limit(identifier: str):
    if not identifier:
        return
    now = datetime.datetime.utcnow()
    attempts = failed_login_attempts.get(identifier, [])
    # Keep attempts from last 15 minutes (900 seconds)
    valid_attempts = [t for t in attempts if (now - t).total_seconds() < 900]
    failed_login_attempts[identifier] = valid_attempts
    if len(valid_attempts) >= 5:
        raise HTTPException(
            status_code=429,
            detail="Занадто багато невдалих спроб входу. Спробуйте через 15 хвилин."
        )

def record_failed_login(identifier: str):
    if not identifier:
        return
    now = datetime.datetime.utcnow()
    attempts = failed_login_attempts.get(identifier, [])
    attempts.append(now)
    failed_login_attempts[identifier] = attempts

def get_google_user_info(access_token: str):
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {access_token}')
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching Google userinfo: {e}")
        return None

@router.post("/login-or-register", response_model=schemas.UserResponse)
def login_or_register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = None
    if user_data.email:
        user = db.query(models.User).filter(models.User.email == user_data.email).first()
    elif user_data.phone:
        normalized_phone = normalize_phone(user_data.phone)
        user = db.query(models.User).filter(models.User.phone == normalized_phone).first()
        
    target = user_data.email if user_data.email else (normalize_phone(user_data.phone) if user_data.phone else None)
    if not target:
        raise HTTPException(status_code=400, detail="Необхідно вказати телефон або email")

    # In Passwordless mode or when OTP code is provided, verify OTP
    if user_data.otp_code:
        now = datetime.datetime.utcnow()
        otp_entry = db.query(models.OTPCode).filter(
            models.OTPCode.target == target,
            models.OTPCode.code == user_data.otp_code,
            models.OTPCode.is_used == False,
            models.OTPCode.expires_at > now
        ).first()
        
        if not otp_entry:
            raise HTTPException(status_code=400, detail="Недійсний або прострочений код підтвердження")
            
        # Mark OTP as used
        otp_entry.is_used = True
        db.commit()
    elif user and user.password and user_data.password:
        # Legacy password verification fallback
        check_brute_force_limit(target)
        is_hash = user.password.startswith("$")
        if not is_hash:
            if user.password != user_data.password:
                record_failed_login(target)
                raise HTTPException(status_code=401, detail="Невірний пароль для цього облікового запису")
        else:
            if not pwd_context.verify(user_data.password, user.password):
                record_failed_login(target)
                raise HTTPException(status_code=401, detail="Невірний пароль для цього облікового запису")
    else:
        raise HTTPException(status_code=400, detail="Необхідно вказати код підтвердження з пошти")

    if user:
        if user_data.faculty:
            user.faculty = user_data.faculty
        if user_data.phone:
            normalized_p = normalize_phone(user_data.phone)
            if normalized_p:
                user.phone = normalized_p
        if user_data.name and (not user.name or user.name == "Користувач"):
            user.name = user_data.name
        db.commit()
        db.refresh(user)
    else:
        user = models.User(
            name=user_data.name or "Користувач",
            phone=normalize_phone(user_data.phone) if user_data.phone else None,
            email=user_data.email,
            role=user_data.role or "B2C",
            faculty=user_data.faculty if user_data.faculty else "ФКІТ",
            password=pwd_context.hash(user_data.password) if user_data.password else None
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r[0] for r in ratings) / len(ratings)
        
    completed_count = db.query(models.Application).filter(
        models.Application.volunteer_id == user.id,
        models.Application.status.in_(["attended", "reviewed"])
    ).count()
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.completed_shifts_count = completed_count
    return response

@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    return {"exists": user is not None}

@router.get("/check-phone")
def check_phone(phone: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == phone).first()
    return {"exists": user is not None}

@router.post("/send-verification-email")
def send_verification_email(
    payload: schemas.EmailVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Rate limiting check (60 seconds)
    now = datetime.datetime.utcnow()
    last_sent = otp_timestamps.get(payload.email)
    if last_sent:
        elapsed = (now - last_sent).total_seconds()
        if elapsed < 60:
            remaining = int(60 - elapsed) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Занадто багато запитів. Зачекайте {remaining} сек. перед наступною спробою."
            )
    
    # Secure server-side OTP code generation
    otp_code = str(secrets.randbelow(9000) + 1000)

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
          <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
          <p>Дякуємо за реєстрацію на нашій платформі!</p>
          <p>Ваш код підтвердження для створення облікового запису:</p>
          <div style="font-size: 28px; font-weight: bold; color: #FF5522; padding: 15px; background-color: #fff0eb; border-radius: 10px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            {otp_code}
          </div>
          <p style="font-size: 12px; color: #888888;">Якщо ви не здійснювали цей запит, просто проігноруйте цей лист.</p>
        </div>
      </body>
    </html>
    """
    
    # Save code to DB
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.query(models.OTPCode).filter(models.OTPCode.target == payload.email).delete()
    otp_entry = models.OTPCode(
        target=payload.email,
        code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_entry)
    db.commit()
    
    # Update last sent timestamp
    otp_timestamps[payload.email] = now
    
    # Send email notification in background
    background_tasks.add_task(
        send_email_background_task,
        payload.email,
        "Код підтвердження OneClick B2B",
        html_content,
        otp_code
    )
    return {"status": "ok"}

@router.post("/send-verification-sms")
def send_verification_sms(payload: schemas.SmsVerificationRequest, db: Session = Depends(get_db)):
    phone_normalized = normalize_phone(payload.phone)
    # Rate limiting check (60 seconds)
    now = datetime.datetime.utcnow()
    last_sent = otp_timestamps.get(phone_normalized)
    if last_sent:
        elapsed = (now - last_sent).total_seconds()
        if elapsed < 60:
            remaining = int(60 - elapsed) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Занадто багато запитів. Зачекайте {remaining} сек. перед наступною спробою."
            )

    # Secure server-side OTP code generation
    otp_code = str(secrets.randbelow(9000) + 1000)

    # Save B2C OTP code to DB
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.query(models.OTPCode).filter(models.OTPCode.target == phone_normalized).delete()
    otp_entry = models.OTPCode(
        target=phone_normalized,
        code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_entry)
    db.commit()
    
    # Update last sent timestamp
    otp_timestamps[phone_normalized] = now
    
    print(f"\n[LOCAL DEV] SMS simulation. Code for {phone_normalized} is: {otp_code}\n")
    return {"status": "ok"}

@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Verify OTP code
    now = datetime.datetime.utcnow()
    otp_entry = db.query(models.OTPCode).filter(
        models.OTPCode.target == payload.email,
        models.OTPCode.code == payload.otp_code,
        models.OTPCode.is_used == False,
        models.OTPCode.expires_at > now
    ).first()
    
    if not otp_entry:
        raise HTTPException(status_code=400, detail="Недійсний або прострочений код підтвердження")
        
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Пароль має містити щонайменше 6 символів")
    otp_entry.is_used = True
    user.password = pwd_context.hash(payload.new_password)
    db.commit()
    return {"status": "ok"}

@router.post("/google", response_model=schemas.UserResponse)
def google_auth(payload: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    user_info = get_google_user_info(payload.access_token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недійсний токен доступу Google"
        )
    
    email = user_info.get("email")
    name = user_info.get("name", "Користувач Google")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google не повернув електронну пошту"
        )
        
    # Check if user already exists
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Create new user from Google account info
        user = models.User(
            name=name,
            email=email,
            role=payload.role if payload.role in ["B2C", "B2B"] else "B2C"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r[0] for r in ratings) / len(ratings)
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.token = create_access_token(user.id)
    return response

@router.get("/me", response_model=schemas.UserResponse)
def get_me(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Calculate average rating for volunteer
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r[0] for r in ratings) / len(ratings)
        
    # Calculate completed shifts count
    completed_count = db.query(models.Application).filter(
        models.Application.volunteer_id == user.id,
        models.Application.status.in_(["attended", "reviewed"])
    ).count()
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.completed_shifts_count = completed_count
    response.token = create_access_token(user.id)
    return response

@router.get("/my-org", response_model=Optional[schemas.OrganizationResponse])
def get_my_org(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        return None
    if not user.company_id:
        return None
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    return org

@router.post("/register-org", response_model=schemas.OrganizationResponse)
def register_organization(
    org_data: schemas.OrganizationCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    if user.company_id and user.company_role and user.company_role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Ви вже є членом іншої організації. Спочатку вийдіть з поточної організації."
        )

    # Check if org already exists for this owner
    existing_org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if existing_org:
        # Just update it
        existing_org.name = org_data.name
        existing_org.description = org_data.description
        existing_org.address = org_data.address
        org = existing_org
    else:
        # Create a new organization
        org = models.Organization(
            name=org_data.name,
            coordinator_id=x_user_id,
            description=org_data.description,
            address=org_data.address
        )
        db.add(org)
        db.commit()
        db.refresh(org)
    
    # Link this user to the organization as the owner
    user.role = "B2B"
    user.company_id = org.id
    user.company_role = "owner"
    db.commit()
    db.refresh(org)
    return org
