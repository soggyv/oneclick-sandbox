import sys
import os
import random
from fastapi import FastAPI, Depends, HTTPException, Header, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional

# Ensure backend directory is in the import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env variables from .env.local
def load_env_local():
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(parent_dir, ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key, val = parts[0].strip(), parts[1].strip()
                        os.environ[key] = val

load_env_local()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel

class EmailVerificationRequest(BaseModel):
    email: str
    code: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

def send_smtp_email(to_email: str, subject: str, html_content: str):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", f"OneClick <{smtp_username}>")

    if not smtp_username or not smtp_password:
        print("SMTP credentials are not configured in environment.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = email_from
        msg["To"] = to_email

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

from backend.database import engine, Base, get_db, SessionLocal
from backend import models, schemas

# Create tables
Base.metadata.create_all(bind=engine)

# Add password column to users table if it doesn't exist (SQLite migration support)
with engine.connect() as conn:
    from sqlalchemy import inspect
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'password' not in columns:
        try:
            from sqlalchemy import text
            conn.execute(text("ALTER TABLE users ADD COLUMN password TEXT"))
            conn.commit()
            print("Successfully migrated: Added 'password' column to 'users' table.")
        except Exception as e:
            print(f"Migration error: {e}")

app = FastAPI(title="OneClick Volunteering API")

# Mount static files for serving uploads (create directory first)
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
uploads_dir = os.path.join(static_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import jwt
import datetime
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = "super-secret-key-12345"
JWT_ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)

def create_access_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_id(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> int:
    if authorization and authorization.credentials:
        token = authorization.credentials
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
            if user_id is not None:
                user = db.query(models.User).filter(models.User.id == user_id).first()
                if user:
                    return user.id
        except jwt.PyJWTError:
            pass
            
    if x_user_id:
        try:
            uid = int(x_user_id)
            user = db.query(models.User).filter(models.User.id == uid).first()
            if user:
                return user.id
        except ValueError:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Необхідна авторизація (недійсний або відсутній токен)"
    )

# Helper function to generate a check-in code
def generate_check_in_code():
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    code = "".join(random.choice(chars) for _ in range(4))
    return f"1C-{code}"

# Seed initial data if the database is empty
def seed_data(db: Session):
    user_count = db.query(models.User).count()
    if user_count == 0:
        # Create a Coordinator User
        coordinator = models.User(
            name="Ілля",
            email="admin@coffee.ua",
            phone="+380 93 111 2233",
            role="B2B"
        )
        db.add(coordinator)
        db.commit()
        db.refresh(coordinator)

        # Create a Volunteer User
        volunteer = models.User(
            name="Дмитро",
            email="dima@student.ua",
            phone="+380 93 123 4567",
            role="B2C"
        )
        db.add(volunteer)
        db.commit()
        db.refresh(volunteer)

        # Create an Organization
        org = models.Organization(
            name="Foundation Coffee",
            coordinator_id=coordinator.id,
            description="Кав'ярня третьої хвилі, хаб студентських ініціатив",
            address="вул. Канатна, 15"
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        # Create another organization for general events
        org2 = models.Organization(
            name="Департамент IT ОНПУ",
            coordinator_id=coordinator.id,
            description="Координаційний центр інновацій та комп'ютерного супроводу",
            address="вул. Генуезька, 24"
        )
        db.add(org2)
        db.commit()
        db.refresh(org2)

        # 14 days calendar relative days
        from datetime import datetime, timedelta
        today_str = datetime.today().strftime('%Y-%m-%d')
        tomorrow_str = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')

        # Create Shifts
        shift1 = models.Shift(
            title="Волонтер на кавовий лекторій",
            category="Кав'ярні",
            date=today_str,
            time="09:00 - 18:00",
            location="Актова зала",
            address="вул. Канатна, 15",
            description="Допомога у зустрічі та реєстрації учасників лекторію, підтримка бариста.",
            organization_id=org.id,
            status="open"
        )
        shift2 = models.Shift(
            title="Технічний асистент сцени",
            category="IT-відділ",
            date=today_str,
            time="10:00 - 16:00",
            location="Студрада",
            address="просп. Глушка, 12",
            description="Допомога у налаштуванні звуку, мікрофонів та презентаційного екрану.",
            organization_id=org2.id,
            status="open"
        )
        shift3 = models.Shift(
            title="Помічник у приймальну комісію",
            category="Рітейл",
            date=tomorrow_str,
            time="10:00 - 19:00",
            location="IT-відділ",
            address="вул. Генуезька, 24",
            description="Консультації абітурієнтів щодо вступу, видача брошур.",
            organization_id=org2.id,
            status="open"
        )
        db.add_all([shift1, shift2, shift3])
        db.commit()

        # Create a sample completed app and review for the volunteer
        # Create an app
        sample_app = models.Application(
            shift_id=shift2.id,
            volunteer_id=volunteer.id,
            status="reviewed",
            check_in_code="1C-DEMO"
        )
        db.add(sample_app)
        db.commit()
        db.refresh(sample_app)

        # Create a review
        sample_review = models.Review(
            application_id=sample_app.id,
            author_id=coordinator.id,
            target_id=volunteer.id,
            rating=5,
            comment="Чудовий волонтер! Допоміг налаштувати звук швидко та професійно."
        )
        db.add(sample_review)
        db.commit()

# Seed database session
db = SessionLocal()
try:
    seed_data(db)
finally:
    db.close()


# --- ENDPOINTS ---

@app.post("/api/auth/login-or-register", response_model=schemas.UserResponse)
def login_or_register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = None
    if user_data.email:
        user = db.query(models.User).filter(models.User.email == user_data.email).first()
    elif user_data.phone:
        user = db.query(models.User).filter(models.User.phone == user_data.phone).first()
        
    if user:
        # Check password if provided
        if user_data.password:
            if user.password and user.password != user_data.password:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Невірний пароль для цього облікового запису"
                )
            elif not user.password:
                user.password = user_data.password
                db.commit()
                db.refresh(user)
    else:
        user = models.User(
            name=user_data.name,
            phone=user_data.phone,
            email=user_data.email,
            role=user_data.role,
            password=user_data.password
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


@app.get("/api/auth/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    return {"exists": user is not None}


@app.post("/api/auth/send-verification-email")
def send_verification_email(payload: EmailVerificationRequest):
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
          <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
          <p>Дякуємо за реєстрацію на нашій платформі!</p>
          <p>Ваш код підтвердження для створення облікового запису:</p>
          <div style="font-size: 28px; font-weight: bold; color: #FF5522; padding: 15px; background-color: #fff0eb; border-radius: 10px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            {payload.code}
          </div>
          <p style="font-size: 12px; color: #888888;">Якщо ви не здійснювали цей запит, просто проігноруйте цей лист.</p>
        </div>
      </body>
    </html>
    """
    
    success = send_smtp_email(
        to_email=payload.email,
        subject="Код підтвердження OneClick B2B",
        html_content=html_content
    )
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Не вдалося надіслати лист підтвердження. Перевірте налаштування SMTP."
        )
    return {"status": "ok"}


@app.post("/api/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    user.password = payload.new_password
    db.commit()
    return {"status": "ok"}


import urllib.request
import json

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

@app.post("/api/auth/google", response_model=schemas.UserResponse)
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
        user = models.User(
            name=name,
            email=email,
            role=payload.role or "B2C"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        

    else:
        # If the user already exists, but logs in as B2B, update their role to B2B
        if payload.role == "B2B" and user.role != "B2B":
            user.role = "B2B"
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


@app.post("/api/auth/register-org", response_model=schemas.OrganizationResponse)
def register_organization(
    org_data: schemas.OrganizationCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Check if org already exists for this coordinator
    existing_org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if existing_org:
        # Just update it
        existing_org.name = org_data.name
        existing_org.description = org_data.description
        existing_org.address = org_data.address
        org = existing_org
    else:
        org = models.Organization(
            name=org_data.name,
            coordinator_id=x_user_id,
            description=org_data.description,
            address=org_data.address
        )
        db.add(org)
    
    # Change role to B2B
    user.role = "B2B"
    db.commit()
    db.refresh(org)
    return org


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Calculate average rating
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
    return response


@app.put("/api/users/profile", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.ProfileUpdate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    user.name = profile_data.name
    if profile_data.phone:
        user.phone = profile_data.phone
        
    if user.role == "B2B" and profile_data.org_name:
        org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
        if org:
            org.name = profile_data.org_name
            org.address = profile_data.org_address
            org.description = profile_data.org_description
            
    db.commit()
    db.refresh(user)
    
    # Calculate average rating
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
    response.token = create_access_token(user.id)
    response.completed_shifts_count = completed_count
    return response


@app.post("/api/users/avatar", response_model=schemas.UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    # Validate file extension
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if file_ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Формат файлу має бути JPG, PNG або WEBP")
        
    # Generate unique filename using user id
    filename = f"avatar_{x_user_id}_{random.randint(1000, 9999)}.{file_ext}"
    file_path = os.path.join(uploads_dir, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update DB avatar_url (relative path)
    user.avatar_url = f"/static/uploads/{filename}"
    db.commit()
    db.refresh(user)
    
    # Calculate completed shifts count
    completed_count = db.query(models.Application).filter(
        models.Application.volunteer_id == user.id,
        models.Application.status.in_(["attended", "reviewed"])
    ).count()
        
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.completed_shifts_count = completed_count
    return response


@app.get("/api/users/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    # Calculate average rating
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
    return response




@app.get("/api/auth/my-org", response_model=Optional[schemas.OrganizationResponse])
def get_my_org(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    return org


@app.get("/api/shifts", response_model=List[schemas.ShiftResponse])
def get_shifts(
    date: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Shift).filter(models.Shift.status == "open")
    if date:
        query = query.filter(models.Shift.date == date)
    if category and category != "Всі сфери":
        query = query.filter(models.Shift.category == category)
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(
            func.lower(models.Shift.title).like(search_lower) |
            func.lower(models.Shift.description).like(search_lower) |
            func.lower(models.Shift.category).like(search_lower) |
            func.lower(models.Shift.location).like(search_lower)
        )
    
    shifts = query.all()
    response_list = []
    for shift in shifts:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = shift.organization.name
        res.approved_count = len([a for a in shift.applications if a.status in ['approved', 'attended', 'reviewed']])
        response_list.append(res)
    return response_list


@app.post("/api/shifts", response_model=schemas.ShiftResponse)
def create_shift(
    shift_data: schemas.ShiftCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if not org:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
    
    new_shift = models.Shift(
        title=shift_data.title,
        category=shift_data.category,
        date=shift_data.date,
        time=shift_data.time,
        location=shift_data.location,
        address=shift_data.address,
        description=shift_data.description,
        organization_id=org.id,
        status="open",
        max_volunteers=shift_data.max_volunteers or 5
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    
    res = schemas.ShiftResponse.model_validate(new_shift)
    res.organization_name = org.name
    res.approved_count = 0
    return res


@app.get("/api/shifts/b2b", response_model=List[schemas.ShiftResponse])
def get_b2b_shifts(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if not org:
        return []
    
    shifts = db.query(models.Shift).filter(models.Shift.organization_id == org.id).all()
    response_list = []
    for shift in shifts:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = org.name
        res.approved_count = len([a for a in shift.applications if a.status in ['approved', 'attended', 'reviewed']])
        response_list.append(res)
    return response_list


@app.post("/api/applications/apply", response_model=schemas.ApplicationResponse)
def apply_to_shift(
    app_data: schemas.ApplicationCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.shift_id == app_data.shift_id,
        models.Application.volunteer_id == x_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ви вже відгукнулися на цю зміну")

    # Check shift spots limit
    shift = db.query(models.Shift).filter(models.Shift.id == app_data.shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Зміну не знайдено")
        
    approved_count = db.query(models.Application).filter(
        models.Application.shift_id == app_data.shift_id,
        models.Application.status.in_(["approved", "attended", "reviewed"])
    ).count()
    
    if approved_count >= shift.max_volunteers:
        raise HTTPException(status_code=400, detail="На жаль, усі місця на цю зміну вже зайняті")
    
    # Generate unique check-in code
    while True:
        code = generate_check_in_code()
        dup = db.query(models.Application).filter(models.Application.check_in_code == code).first()
        if not dup:
            break
            
    new_app = models.Application(
        shift_id=app_data.shift_id,
        volunteer_id=x_user_id,
        status="pending",
        check_in_code=code
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    res = schemas.ApplicationResponse.model_validate(new_app)
    res.volunteer_name = new_app.volunteer.name
    res.volunteer_avatar_url = new_app.volunteer.avatar_url
    res.shift.organization_name = new_app.shift.organization.name
    return res


@app.get("/api/applications/my", response_model=List[schemas.ApplicationResponse])
def get_my_applications(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.volunteer_id == x_user_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.volunteer_avatar_url = app.volunteer.avatar_url
        res.shift.organization_name = app.shift.organization.name
        response_list.append(res)
    return response_list


@app.get("/api/applications/b2b", response_model=List[schemas.ApplicationResponse])
def get_b2b_applications(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if not org:
        return []
    
    apps = db.query(models.Application).join(models.Shift).filter(models.Shift.organization_id == org.id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.volunteer_avatar_url = app.volunteer.avatar_url
        res.shift.organization_name = org.name
        response_list.append(res)
    return response_list


@app.post("/api/applications/{app_id}/review-candidate", response_model=schemas.ApplicationResponse)
def review_candidate(
    app_id: int,
    status: str,  # 'approved' or 'rejected'
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Некоректний статус")
        
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Заявку не знайдено")
        
    # Verify ownership
    if app.shift.organization.coordinator_id != x_user_id:
        raise HTTPException(status_code=403, detail="Немає доступу")
        
    if status == "approved":
        # Check spots limit before approving
        approved_count = db.query(models.Application).filter(
            models.Application.shift_id == app.shift_id,
            models.Application.status.in_(["approved", "attended", "reviewed"])
        ).count()
        if approved_count >= app.shift.max_volunteers:
            raise HTTPException(status_code=400, detail="Досягнуто ліміт волонтерів на цю зміну")

    app.status = status
    db.commit()
    db.refresh(app)
    
    res = schemas.ApplicationResponse.model_validate(app)
    res.volunteer_name = app.volunteer.name
    res.volunteer_avatar_url = app.volunteer.avatar_url
    res.shift.organization_name = app.shift.organization.name
    return res


@app.post("/api/applications/confirm-attendance", response_model=schemas.ApplicationResponse)
def confirm_attendance(
    payload: schemas.ConfirmAttendanceRequest,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Find application by check_in_code
    app = db.query(models.Application).filter(models.Application.check_in_code == payload.code).first()
    if not app:
        raise HTTPException(status_code=404, detail="Невірний код або користувача не знайдено")
        
    # Verify this shift belongs to the coordinator's organization
    if app.shift.organization.coordinator_id != x_user_id:
        raise HTTPException(status_code=403, detail="Ви не є організатором цієї зміни")
        
    if app.status != "approved":
        raise HTTPException(status_code=400, detail="Кандидатура волонтера на цю зміну не була підтверджена")
        
    app.status = "attended"
    db.commit()
    db.refresh(app)
    
    res = schemas.ApplicationResponse.model_validate(app)
    res.volunteer_name = app.volunteer.name
    res.volunteer_avatar_url = app.volunteer.avatar_url
    res.shift.organization_name = app.shift.organization.name
    return res


@app.post("/api/applications/rate", response_model=schemas.ReviewResponse)
def rate_volunteer(
    review_data: schemas.ReviewCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(models.Application.id == review_data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Заявку не знайдено")
        
    # Verify access
    if app.shift.organization.coordinator_id != x_user_id:
        raise HTTPException(status_code=403, detail="Немає доступу")
        
    if app.status != "attended":
        raise HTTPException(status_code=400, detail="Не можна залишити відгук волонтеру, який не відвідав смену")
        
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Оцінка має бути від 1 до 5")
        
    # Create review
    review = models.Review(
        application_id=review_data.application_id,
        author_id=x_user_id,
        target_id=app.volunteer_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    
    # Update application status
    app.status = "reviewed"
    db.commit()
    db.refresh(review)
    
    res = schemas.ReviewResponse.model_validate(review)
    res.author_name = app.shift.organization.name
    return res


@app.get("/api/users/{user_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.target_id == user_id).all()
    response_list = []
    for r in reviews:
        res = schemas.ReviewResponse.model_validate(r)
        res.author_name = r.author.organizations[0].name if r.author.organizations else r.author.name
        response_list.append(res)
    return response_list
