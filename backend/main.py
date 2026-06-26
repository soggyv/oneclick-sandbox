import sys
import os
import random
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional

# Ensure backend directory is in the import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base, get_db, SessionLocal
from backend import models, schemas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OneClick Volunteering API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        
    if not user:
        user = models.User(
            name=user_data.name,
            phone=user_data.phone,
            email=user_data.email,
            role=user_data.role
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
    return response


@app.post("/api/auth/register-org", response_model=schemas.OrganizationResponse)
def register_organization(
    org_data: schemas.OrganizationCreate,
    x_user_id: int = Header(...),
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
def get_me(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r[0] for r in ratings) / len(ratings)
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    return response


@app.get("/api/auth/my-org", response_model=Optional[schemas.OrganizationResponse])
def get_my_org(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    return org


@app.get("/api/shifts", response_model=List[schemas.ShiftResponse])
def get_shifts(
    date: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Shift).filter(models.Shift.status == "open")
    if date:
        query = query.filter(models.Shift.date == date)
    if category and category != "Всі сфери":
        query = query.filter(models.Shift.category == category)
    
    shifts = query.all()
    response_list = []
    for shift in shifts:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = shift.organization.name
        response_list.append(res)
    return response_list


@app.post("/api/shifts", response_model=schemas.ShiftResponse)
def create_shift(
    shift_data: schemas.ShiftCreate,
    x_user_id: int = Header(...),
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
        status="open"
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    
    res = schemas.ShiftResponse.model_validate(new_shift)
    res.organization_name = org.name
    return res


@app.get("/api/shifts/b2b", response_model=List[schemas.ShiftResponse])
def get_b2b_shifts(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if not org:
        return []
    
    shifts = db.query(models.Shift).filter(models.Shift.organization_id == org.id).all()
    response_list = []
    for shift in shifts:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = org.name
        response_list.append(res)
    return response_list


@app.post("/api/applications/apply", response_model=schemas.ApplicationResponse)
def apply_to_shift(
    app_data: schemas.ApplicationCreate,
    x_user_id: int = Header(...),
    db: Session = Depends(get_db)
):
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.shift_id == app_data.shift_id,
        models.Application.volunteer_id == x_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ви вже відгукнулися на цю зміну")
    
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
    res.shift.organization_name = new_app.shift.organization.name
    return res


@app.get("/api/applications/my", response_model=List[schemas.ApplicationResponse])
def get_my_applications(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.volunteer_id == x_user_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.shift.organization_name = app.shift.organization.name
        response_list.append(res)
    return response_list


@app.get("/api/applications/b2b", response_model=List[schemas.ApplicationResponse])
def get_b2b_applications(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.coordinator_id == x_user_id).first()
    if not org:
        return []
    
    apps = db.query(models.Application).join(models.Shift).filter(models.Shift.organization_id == org.id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.shift.organization_name = org.name
        response_list.append(res)
    return response_list


@app.post("/api/applications/{app_id}/review-candidate", response_model=schemas.ApplicationResponse)
def review_candidate(
    app_id: int,
    status: str,  # 'approved' or 'rejected'
    x_user_id: int = Header(...),
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
        
    app.status = status
    db.commit()
    db.refresh(app)
    
    res = schemas.ApplicationResponse.model_validate(app)
    res.volunteer_name = app.volunteer.name
    res.shift.organization_name = app.shift.organization.name
    return res


@app.post("/api/applications/confirm-attendance", response_model=schemas.ApplicationResponse)
def confirm_attendance(
    payload: schemas.ConfirmAttendanceRequest,
    x_user_id: int = Header(...),
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
    res.shift.organization_name = app.shift.organization.name
    return res


@app.post("/api/applications/rate", response_model=schemas.ReviewResponse)
def rate_volunteer(
    review_data: schemas.ReviewCreate,
    x_user_id: int = Header(...),
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
