import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session


# Ensure backend directory is in the import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Load config (runs load_env_local from .env.local on import)
import backend.core.config

# 2. Setup database and migrations
from backend.database import engine, Base, SessionLocal, auto_migrate_db
from backend import models

# Create tables (fallback for rapid local setup, Alembic handles migrations)
Base.metadata.create_all(bind=engine)
auto_migrate_db(engine)

# 3. Initialize FastAPI App
app = FastAPI(title="OneClick Volunteering API")

# Configure CORS strictly
default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://188.245.35.229,https://oneclick.kyiv.ua,https://www.oneclick.kyiv.ua"
origins_str = os.getenv("ALLOWED_ORIGINS", default_origins)
origins = [o.strip() for o in origins_str.split(",") if o.strip() and o.strip() != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; "
        "img-src 'self' data: blob: https:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://accounts.google.com; "
        "frame-src 'self' https://accounts.google.com;"
    )
    return response

# Mount static files for serving uploads (create directory first)
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
uploads_dir = os.path.join(static_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 4. Import and register routers
from backend.routers import auth, users, shifts, applications, organizations, shift_templates, notifications

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(shifts.router)
app.include_router(applications.router)
app.include_router(organizations.router)
app.include_router(shift_templates.router)
app.include_router(notifications.router)



# 5. Seed initial data if the database is empty
def seed_data(db: Session):
    user_count = db.query(models.User).count()
    if user_count == 0:
        # Create a Coordinator User
        coordinator = models.User(
            name="Ілля",
            email="admin@coffee.ua",
            phone="+380931112233",
            role="B2B",
            company_role="owner"
        )
        db.add(coordinator)
        db.commit()
        db.refresh(coordinator)

        # Create a Volunteer User
        volunteer = models.User(
            name="Дмитро",
            email="dima@student.ua",
            phone="+380931234567",
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

        # LINK coordinator user to this organization
        coordinator.company_id = org.id
        db.commit()

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
            created_by_id=coordinator.id,
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
            created_by_id=coordinator.id,
            status="open"
        )
        shift3 = models.Shift(
            title="Помічник у приймальну комісію",
            category="Рітейл",
            date=tomorrow_str,
            time="10:00 - 19:00",
            location="IT-відділ",
            address="вул. Генуезька, 24",
            description="Консультації абітурієнтів щодо вступу, видажа брошур.",
            organization_id=org2.id,
            created_by_id=coordinator.id,
            status="open"
        )
        db.add_all([shift1, shift2, shift3])
        db.commit()

        # Create a sample completed app and review for the volunteer
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
