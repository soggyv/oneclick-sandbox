import os
import random
import shutil
from typing import List
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["users"])

# uploads directory configuration
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
uploads_dir = os.path.join(static_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)

@router.post("/send-email-otp")
def send_email_otp(
    payload: schemas.EmailVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    import datetime
    from backend.core.utils import send_email_background_task
    
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.query(models.OTPCode).filter(models.OTPCode.target == payload.email).delete()
    
    otp_entry = models.OTPCode(
        target=payload.email,
        code=payload.code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_entry)
    db.commit()
    
    # Send email notification in background
    subject = "OneClick: Підтвердження електронної пошти"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
        <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
        <p>Вітаємо!</p>
        <p>Ви вказали цю адресу для отримання сповіщень у OneClick.</p>
        <p>Ваш код підтвердження:</p>
        <div style="font-size: 24px; font-weight: bold; color: #FF5522; padding: 15px; background-color: #fff0eb; border-radius: 10px; text-align: center; letter-spacing: 2px; margin: 20px 0;">
          {payload.code}
        </div>
        <p style="font-size: 13px; color: #555555;">Будь ласка, введіть цей код на сторінці профілю для завершення прив'язки.</p>
      </div>
    </body>
    </html>
    """
    
    background_tasks.add_task(send_email_background_task, payload.email, subject, html, payload.code)
    return {"status": "ok"}

@router.put("/profile", response_model=schemas.UserResponse)
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
        
    if profile_data.email is not None:
        email_clean = profile_data.email.strip().lower()
        current_email = user.email.lower() if user.email else ""
        if email_clean and email_clean != current_email:
            if not profile_data.email_otp_code:
                raise HTTPException(status_code=400, detail="Код підтвердження електронної пошти обов'язковий")
                
            import datetime
            now = datetime.datetime.utcnow()
            otp = db.query(models.OTPCode).filter(
                models.OTPCode.target == email_clean,
                models.OTPCode.code == profile_data.email_otp_code,
                models.OTPCode.expires_at > now,
                models.OTPCode.is_used == False
            ).first()
            
            if not otp:
                raise HTTPException(status_code=400, detail="Невірний або прострочений код підтвердження")
                
            # Check uniqueness
            dup = db.query(models.User).filter(models.User.email == email_clean, models.User.id != user.id).first()
            if dup:
                raise HTTPException(status_code=400, detail="Цей email вже використовується іншим користувачем")
                
            otp.is_used = True
            user.email = email_clean
        elif not email_clean:
            user.email = None
        
    # If B2B user and has a linked company, allow updating company info
    if user.role == "B2B" and user.company_id and profile_data.org_name:
        org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
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
    response.completed_shifts_count = completed_count
    return response

@router.post("/avatar", response_model=schemas.UserResponse)
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
        
    try:
        # Load image with PIL
        image = Image.open(file.file)
        # Convert RGBA to RGB to ensure webp/jpeg compatibility if needed
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
            
        # Scale to max 300x300
        image.thumbnail((300, 300))
        
        # Generate unique filename with webp extension
        filename = f"avatar_{x_user_id}_{random.randint(1000, 9999)}.webp"
        file_path = os.path.join(uploads_dir, filename)
        
        # Save as WebP with 80% quality
        image.save(file_path, "WEBP", quality=80)
    except Exception as e:
        print(f"Error processing avatar image: {e}")
        raise HTTPException(status_code=400, detail="Помилка при обробці зображення")
        
    # Delete old avatar if exists to prevent bloat
    if user.avatar_url:
        old_filename = user.avatar_url.split("/")[-1]
        old_file_path = os.path.join(uploads_dir, old_filename)
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except Exception as e:
                print(f"Error deleting old avatar file {old_file_path}: {e}")

    # Update DB avatar_url (relative path)
    user.avatar_url = f"/static/uploads/{filename}"
    db.commit()
    db.refresh(user)
    
    # Calculate completed shifts count
    completed_count = db.query(models.Application).filter(
        models.Application.volunteer_id == user.id,
        models.Application.status.in_(["attended", "reviewed"])
    ).count()
    
    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r[0] for r in ratings) / len(ratings)
        
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.completed_shifts_count = completed_count
    return response

@router.get("/{user_id}", response_model=schemas.UserResponse)
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

@router.get("/{user_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.target_id == user_id).all()
    response_list = []
    for r in reviews:
        res = schemas.ReviewResponse.model_validate(r)
        res.author_name = r.author.organization.name if r.author.company_id else r.author.name
        response_list.append(res)
    return response_list
