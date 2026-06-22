from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import get_db, async_session
from backend.models import DisputeMessage, Shift, User, Transaction
from backend.schemas import DisputeMessageCreate, DisputeResolveRequest
import uuid
import datetime
import asyncio
import random
from typing import List

router = APIRouter(prefix="/disputes", tags=["disputes"])

async def resolve_dispute_internal(
    shift_id: str,
    resolution: str,
    decided_by: str,
    db: AsyncSession
):
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()
    if not shift:
        return

    # 1. Log chat messages
    log_text = ""
    if resolution == "pay_full":
        log_text = (
            "⚖️ Вердикт Арбітра: Фотозвіт підтверджує належне виконання роботи. Кошти виплачено виконавцю."
            if decided_by == "arbitrator"
            else "💸 Роботодавець підтвердив виконання та виплатив повну суму. Спір закрито."
        )
    elif resolution == "compromise":
        log_text = "🤝 Сторони дійшли компромісу (50% на 50%). Спір закрито."
    elif resolution == "refund_full":
        log_text = (
            "⚖️ Вердикт Арбітра: Роботу виконано незадовільно. Кошти повернуто роботодавцю."
            if decided_by == "arbitrator"
            else "↩️ Спір вирішено скасуванням зміни. Суму повернуто роботодавцю. Спір закрито."
        )

    time_now = datetime.datetime.now().strftime("%H:%M")
    
    msg1 = DisputeMessage(
        id=str(uuid.uuid4()),
        shift_id=shift_id,
        sender="system",
        text=log_text,
        timestamp=time_now
    )
    msg2 = DisputeMessage(
        id=str(uuid.uuid4()),
        shift_id=shift_id,
        sender="system",
        text="🔒 Спір вирішено. Чат закрито.",
        timestamp=time_now
    )
    db.add(msg1)
    db.add(msg2)

    # 2. Update shift & execute payouts
    if resolution == "pay_full":
        shift.status = "completed"
        shift.dispute_status = None
        if shift.worker_id:
            worker_stmt = select(User).where(User.id == shift.worker_id)
            w_res = await db.execute(worker_stmt)
            worker = w_res.scalar_one_or_none()
            if worker:
                # Deduct from employer
                if shift.employer_id:
                    employer_stmt = select(User).where(User.id == shift.employer_id)
                    emp_res = await db.execute(employer_stmt)
                    employer = emp_res.scalar_one_or_none()
                    if employer:
                        employer.employer_balance -= shift.price
                        emp_tx = Transaction(
                            id=str(uuid.uuid4()),
                            user_id=shift.employer_id,
                            title=f"Спір вирішено (Виплата): {shift.role} (виконавець {worker.name})",
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
                    title=f"Спір вирішено (Оплата): {shift.role} ({shift.company})",
                    amount=shift.price,
                    date="Сьогодні, щойно",
                    status="completed",
                    type="work"
                )
                db.add(tx)

    elif resolution == "compromise":
        shift.status = "completed"
        shift.dispute_status = None
        half = math_half = int(shift.price / 2)
        if shift.worker_id:
            worker_stmt = select(User).where(User.id == shift.worker_id)
            w_res = await db.execute(worker_stmt)
            worker = w_res.scalar_one_or_none()
            if worker:
                # Deduct from employer
                if shift.employer_id:
                    employer_stmt = select(User).where(User.id == shift.employer_id)
                    emp_res = await db.execute(employer_stmt)
                    employer = emp_res.scalar_one_or_none()
                    if employer:
                        employer.employer_balance -= half
                        emp_tx = Transaction(
                            id=str(uuid.uuid4()),
                            user_id=shift.employer_id,
                            title=f"🤝 Компроміс по спору (Списання): {shift.role} (виконавець {worker.name})",
                            amount=-half,
                            date="Сьогодні, щойно",
                            status="completed",
                            type="withdrawal"
                        )
                        db.add(emp_tx)

                # Pay worker
                worker.balance += (shift.price - half)
                tx = Transaction(
                    id=str(uuid.uuid4()),
                    user_id=shift.worker_id,
                    title=f"🤝 Компроміс по спору: {shift.role} ({shift.company})",
                    amount=shift.price - half,
                    date="Сьогодні, щойно",
                    status="completed",
                    type="work"
                )
                db.add(tx)

    elif resolution == "refund_full":
        # Reset shift to open
        shift.status = "open"
        shift.dispute_status = None
        shift.worker_id = None
        shift.work_photo = None
        shift.work_comment = None

    await db.commit()

async def simulated_arbitration_flow(shift_id: str):
    # Phase 1: Review message after 4.5s
    await asyncio.sleep(4.5)
    async with async_session() as db:
        stmt = select(Shift).where(Shift.id == shift_id)
        res = await db.execute(stmt)
        shift = res.scalar_one_or_none()
        if not shift or shift.status != "disputed":
            return

        time_now = datetime.datetime.now().strftime("%H:%M")
        msg = DisputeMessage(
            id=str(uuid.uuid4()),
            shift_id=shift_id,
            sender="manager",
            text="🔍 Перевіряю відповідність фотозвіту вимогам та коментар закладу. Очікуйте остаточне рішення підтримки за кілька секунд...",
            timestamp=time_now
        )
        db.add(msg)
        await db.commit()

    # Phase 2: Arbitrator Verdict after another 5.0s (total 9.5s)
    await asyncio.sleep(5.0)
    async with async_session() as db:
        stmt = select(Shift).where(Shift.id == shift_id)
        res = await db.execute(stmt)
        shift = res.scalar_one_or_none()
        if not shift or shift.status != "disputed":
            return

        decision = "pay_full" if random.random() > 0.25 else "refund_full"
        await resolve_dispute_internal(shift_id, decision, "arbitrator", db)

@router.get("/{shift_id}/chat")
async def get_dispute_chat(shift_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(DisputeMessage).where(DisputeMessage.shift_id == shift_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/{shift_id}/message")
async def send_dispute_message(shift_id: str, req: DisputeMessageCreate, db: AsyncSession = Depends(get_db)):
    time_now = datetime.datetime.now().strftime("%H:%M")
    msg = DisputeMessage(
        id=str(uuid.uuid4()),
        shift_id=shift_id,
        sender=req.sender,
        text=req.text,
        timestamp=time_now
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

@router.post("/{shift_id}/summon-arbitrator")
async def summon_arbitrator(shift_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    stmt = select(Shift).where(Shift.id == shift_id)
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()

    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    shift.status = "disputed"
    shift.dispute_status = "under_review"

    time_now = datetime.datetime.now().strftime("%H:%M")
    msg1 = DisputeMessage(
        id=str(uuid.uuid4()),
        shift_id=shift_id,
        sender="system",
        text="⚖️ Справу передано до арбітражу OneClick. Менеджер спору підключається...",
        timestamp=time_now
    )
    msg2 = DisputeMessage(
        id=str(uuid.uuid4()),
        shift_id=shift_id,
        sender="manager",
        text="Вітаю! Я призначений менеджером для розгляду вашого спору. Перевіряю надісланий фотозвіт та опис претензії. Будь ласка, напишіть сюди будь-які додаткові аргументи.",
        timestamp=time_now
    )
    db.add(msg1)
    db.add(msg2)
    await db.commit()

    # Trigger async background verdict simulation
    background_tasks.add_task(simulated_arbitration_flow, shift_id)
    return {"message": "Arbitration process started"}

@router.post("/{shift_id}/resolve")
async def resolve_dispute(shift_id: str, req: DisputeResolveRequest, db: AsyncSession = Depends(get_db)):
    await resolve_dispute_internal(shift_id, req.resolution, req.decided_by, db)
    return {"message": "Dispute resolved successfully"}
