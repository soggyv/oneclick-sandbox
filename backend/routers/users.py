import os
import random
import shutil
from typing import List
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["users"])

# uploads directory configuration
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
uploads_dir = os.path.join(static_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)

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
