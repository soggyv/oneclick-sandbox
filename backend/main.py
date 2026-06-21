from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import engine, Base, get_db, async_session
from backend.models import User, Transaction, Review, Company
from backend.schemas import ReviewCreateRequest, WalletWithdrawalRequest
from backend.routers import auth, shifts, disputes
import uuid
import datetime
from typing import Optional
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize SQLite/Postgres tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed initial database states if empty
    async with async_session() as db:
        stmt = select(User).limit(1)
        res = await db.execute(stmt)
        if res.scalar_one_or_none() is None:
            # Seed default users
            worker = User(
                id="worker-alex",
                phone="+380 67 123 45 67",
                name="Олексій Коваленко",
                role="worker",
                rating=5.0,
                balance=0,
                is_verified=True
            )
            employer = User(
                id="employer-default",
                phone="+380 99 999 99 99",
                name="Aroma Kava Manager",
                role="employer",
                rating=5.0,
                balance=50000,
                is_verified=True
            )
            db.add(worker)
            db.add(employer)
            
            # Seed sample shifts
            from backend.models import Shift
            
            today_date = datetime.date.today()
            def get_relative_date_info(offset_days):
                d = today_date + datetime.timedelta(days=offset_days)
                uk_days = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
                day_index = int(d.strftime("%w"))
                return str(d.day), uk_days[day_index]

            date0, day0 = get_relative_date_info(0)
            date1, day1 = get_relative_date_info(1)
            date2, day2 = get_relative_date_info(2)

            db.add_all([
                Shift(
                    id="1",
                    company="Rozetka",
                    role="Комплектувальник",
                    date=date0,
                    day_name=day0,
                    time="08:00 — 20:00",
                    duration="12 год",
                    price=1800,
                    address="Київ, вул. Маршала Малиновського, 12",
                    status="open",
                    category="Склади",
                    details="Збір та пакування інтернет-замовлень за допомогою ТЗД на теплому складі.",
                    latitude=50.495,
                    longitude=30.505,
                    is_hot=True
                ),
                Shift(
                    id="2",
                    company="Aroma Kava",
                    role="Бариста",
                    date=date0,
                    day_name=day0,
                    time="09:00 — 21:00",
                    duration="12 год",
                    price=950,
                    address="Київ, Хрещатик, 24",
                    status="open",
                    category="Кава",
                    details="Приготування класичних кавових напоїв, робота з касою Poster, підтримання чистоти за баром.",
                    latitude=50.447,
                    longitude=30.522,
                    is_hot=False
                ),
                Shift(
                    id="3",
                    company="Glovo",
                    role="Кур'єр",
                    date=date1,
                    day_name=day1,
                    time="12:00 — 22:00",
                    duration="10 год",
                    price=1500,
                    address="Київ, Приморський бульвар, 1",
                    status="open",
                    category="Склади",
                    details="Доставка замовлень з ресторанів та супермаркетів у межах району на власному транспорті.",
                    latitude=50.455,
                    longitude=30.518,
                    is_hot=True
                ),
                Shift(
                    id="4",
                    company="Нова Пошта",
                    role="Вантажник",
                    date=date2,
                    day_name=day2,
                    time="18:00 — 02:00",
                    duration="8 год",
                    price=1100,
                    address="Київ, вул. Броварська, 15",
                    status="open",
                    category="Склади",
                    details="Розвантаження та завантаження автомобілів компанії, сортування посилок по напрямках.",
                    latitude=50.462,
                    longitude=30.597,
                    is_hot=False
                )
            ])
            await db.commit()
    yield

app = FastAPI(title="OneClick Gig Platform Sandbox API", lifespan=lifespan)

# Allow React application to query FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(shifts.router)
app.include_router(disputes.router)

@app.get("/")
def read_root():
    return {"status": "ok", "app": "OneClick API"}

@app.get("/users/{user_id}")
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    company_name = ""
    company_details = ""
    if hasattr(user, 'company_id') and user.company_id:
        comp_stmt = select(Company).where(Company.id == user.company_id)
        comp_res = await db.execute(comp_stmt)
        company = comp_res.scalar_one_or_none()
        if company:
            company_name = company.name
            company_details = f"ТОВ «{company.name}», ЄДРПОУ {company.edrpou}"

    return {
        "id": user.id,
        "phone": user.phone,
        "name": user.name,
        "avatar": getattr(user, 'avatar', None),
        "role": user.role,
        "rating": user.rating,
        "balance": user.balance,
        "is_verified": user.is_verified,
        "company_id": getattr(user, 'company_id', None),
        "company_name": company_name,
        "company_details": company_details
    }

@app.post("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in ["worker", "employer"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role
    await db.commit()
    return {"role": user.role}

@app.post("/users/{user_id}/balance")
async def update_user_balance(user_id: str, req: WalletWithdrawalRequest, is_deposit: bool = False, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    amount = req.amount
    if is_deposit:
        user.balance += amount
        tx_title = "Поповнення гаманця"
        tx_type = "work"
    else:
        if user.balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        user.balance -= amount
        tx_title = "Виведення коштів на карту"
        tx_type = "withdrawal"

    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=tx_title,
        amount=amount if is_deposit else -amount,
        date="Сьогодні, щойно",
        status="completed",
        type=tx_type
    )
    db.add(tx)
    await db.commit()
    return {"balance": user.balance}

@app.get("/users/{user_id}/transactions")
async def get_user_transactions(user_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@app.post("/reviews")
async def post_review(req: ReviewCreateRequest, db: AsyncSession = Depends(get_db)):
    # Verify shift exists
    from backend.models import Shift
    shift_stmt = select(Shift).where(Shift.id == req.shift_id)
    shift_res = await db.execute(shift_stmt)
    shift = shift_res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Add review
    review = Review(
        id=str(uuid.uuid4()),
        shift_id=req.shift_id,
        worker_name="Олексій К.",
        rating=req.rating,
        date=datetime.datetime.now().strftime("%d.%m.%Y"),
        comment=req.comment
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review

@app.get("/reviews/{shift_id}")
async def get_reviews_for_shift(shift_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Review).where(Review.shift_id == shift_id)
    res = await db.execute(stmt)
    return res.scalars().all()
