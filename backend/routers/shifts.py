from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import get_db
from backend.models import Shift, User, Transaction, Booking
from backend.schemas import ShiftCreateRequest, ShiftResponse
import uuid
import math
from typing import List, Optional

router = APIRouter(prefix="/shifts", tags=["shifts"])

# Haversine distance calculator
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("", response_model=List[ShiftResponse])
async def get_shifts(
    category: Optional[str] = "Всі",
    search: Optional[str] = "",
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Shift)
    res = await db.execute(stmt)
    all_shifts = res.scalars().all()

    filtered_shifts = []
    for s in all_shifts:
        # Category filter
        if category != "Всі" and s.category != category:
            continue
        
        # Search filter
        if search:
            search_lower = search.lower()
            if (search_lower not in s.role.lower() and 
                search_lower not in s.company.lower() and 
                search_lower not in s.address.lower()):
                continue

        # Distance calculation
        if lat is not None and lng is not None and s.latitude is not None and s.longitude is not None:
            s.distance_km = calculate_distance(lat, lng, s.latitude, s.longitude)
        else:
            s.distance_km = None

        filtered_shifts.append(s)

    return filtered_shifts

@router.post("", response_model=ShiftResponse)
async def create_shift(req: ShiftCreateRequest, employer_id: str, db: AsyncSession = Depends(get_db)):
    # Check employer
    stmt = select(User).where(User.id == employer_id)
    res = await db.execute(stmt)
    employer = res.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    # Geolocation fallback (Kyiv center offsets if coordinates not passed)
    lat = req.latitude or (50.45 + (hash(req.address) % 100) / 1500.0)
    lng = req.longitude or (30.52 + (hash(req.address + "lng") % 100) / 1500.0)

    shift = Shift(
        id=str(uuid.uuid4()),
        company=req.company,
        role=req.role,
        date=req.date,
        day_name=req.dayName,
        time=req.time,
        duration=req.duration,
        price=req.price,
        address=req.address,
        category=req.category,
        details=req.details,
        status="open",
        requires_screening=req.requires_screening,
        template_name=req.template_name,
        latitude=lat,
        longitude=lng,
        is_hot=False,
        employer_id=employer_id
    )
    db.add(shift)
    await db.commit()
    await db.refresh(shift)
    return shift

@router.post("/{shift_id}/book")
async def book_shift(shift_id: str, worker_id: str, db: AsyncSession = Depends(get_db)):
    # Concurrency safe row-locking
    # Query shift with explicit write lock to block concurrent updates
    stmt = select(Shift).where(Shift.id == shift_id).with_for_update()
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    if shift.status != "open":
        raise HTTPException(status_code=400, detail="Shift is no longer available for booking")

    # Assign worker
    shift.status = "booked"
    shift.worker_id = worker_id
    await db.commit()
    await db.refresh(shift)
    return {"message": "Shift booked successfully", "shift": shift}

@router.post("/{shift_id}/cancel")
async def cancel_shift(shift_id: str, is_late: bool, db: AsyncSession = Depends(get_db)):
    # Find shift
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    worker_id = shift.worker_id
    shift.status = "open"
    shift.worker_id = None

    if is_late and worker_id:
        # Fine worker 250 ₴ and compensate employer
        worker_stmt = select(User).where(User.id == worker_id)
        worker_res = await db.execute(worker_stmt)
        worker = worker_res.scalar_one_or_none()

        if worker:
            worker.balance = max(0, worker.balance - 250)
            
            # Log transaction
            tx = Transaction(
                id=str(uuid.uuid4()),
                user_id=worker_id,
                title=f"Штраф за пізнє скасування: {shift.role} ({shift.company})",
                amount=-250,
                date="Сьогодні, щойно",
                status="completed",
                type="withdrawal"
            )
            db.add(tx)

    await db.commit()
    return {"message": "Shift cancelled successfully"}

@router.post("/{shift_id}/checkin")
async def checkin_shift(shift_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    shift.status = "in_progress"
    await db.commit()
    return {"message": "Checked in successfully", "status": shift.status}

@router.post("/{shift_id}/checkout")
async def checkout_shift(shift_id: str, photo_url: str, comment: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    shift.status = "pending_approval"
    shift.work_photo = photo_url
    shift.work_comment = comment
    await db.commit()
    return {"message": "Report submitted successfully"}

@router.post("/{shift_id}/approve")
async def approve_shift(shift_id: str, employer_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Verify employer has sufficient funds
    employer_stmt = select(User).where(User.id == employer_id)
    emp_res = await db.execute(employer_stmt)
    employer = emp_res.scalar_one_or_none()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    if employer.employer_balance < shift.price:
        raise HTTPException(status_code=400, detail="Недостатньо коштів на балансі підприємства")

    shift.status = "completed"

    # Execute payout
    if shift.worker_id:
        worker_stmt = select(User).where(User.id == shift.worker_id)
        worker_res = await db.execute(worker_stmt)
        worker = worker_res.scalar_one_or_none()
        if worker:
            # Deduct from employer
            employer.employer_balance -= shift.price
            emp_tx = Transaction(
                id=str(uuid.uuid4()),
                user_id=employer_id,
                title=f"Виплата за зміну: {shift.role} (виконавець {worker.name})",
                amount=-shift.price,
                date="Сьогодні, щойно",
                status="completed",
                type="withdrawal"
            )
            db.add(emp_tx)

            # Pay worker
            worker.balance += shift.price
            tx = Transaction(
                id=str(uuid.uuid4()),
                user_id=shift.worker_id,
                title=f"Оплата зміни: {shift.role} ({shift.company})",
                amount=shift.price,
                date="Сьогодні, щойно",
                status="completed",
                type="work"
            )
            db.add(tx)

    await db.commit()
    return {"message": "Payout approved successfully"}
