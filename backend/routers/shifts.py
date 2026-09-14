from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/shifts", tags=["shifts"])

def auto_close_past_shifts(db: Session):
    today_str = datetime.now().strftime("%Y-%m-%d")
    # Batch update expired open shifts directly in SQL without loading them into memory
    updated_past = db.query(models.Shift).filter(
        models.Shift.status == "open",
        models.Shift.date < today_str
    ).update({"status": "closed"}, synchronize_session=False)

    # Check open shifts where all applications are reviewed or rejected
    open_shifts = db.query(models.Shift).options(
        joinedload(models.Shift.applications)
    ).filter(models.Shift.status == "open").all()
    closed_any = False
    for s in open_shifts:
        if s.applications:
            if all(a.status in ["reviewed", "rejected"] for a in s.applications) and any(a.status == "reviewed" for a in s.applications):
                s.status = "closed"
                closed_any = True

    if updated_past or closed_any:
        db.commit()

def get_approved_count_subquery():
    return (
        select(func.count(models.Application.id))
        .where(
            models.Application.shift_id == models.Shift.id,
            models.Application.status.in_(["approved", "attended", "reviewed"])
        )
        .scalar_subquery()
    )

@router.get("", response_model=List[schemas.ShiftResponse])
def get_shifts(
    date: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    # Safely handle direct Python calls where default Query parameter is passed
    if not isinstance(limit, int):
        limit = getattr(limit, "default", 20)
    if not isinstance(offset, int):
        offset = getattr(offset, "default", 0)

    approved_count_sub = get_approved_count_subquery().label("approved_count")

    query = db.query(
        models.Shift,
        approved_count_sub
    ).options(
        joinedload(models.Shift.organization),
        joinedload(models.Shift.creator)
    ).filter(models.Shift.status == "open")

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

    results = (
        query.order_by(models.Shift.date.asc(), models.Shift.time.asc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    response_list = []
    for shift, approved_count in results:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = shift.organization.name if shift.organization else ""
        res.approved_count = approved_count or 0
        res.contact_phone = (
            shift.creator.phone if shift.creator
            else (shift.organization.coordinator.phone if (shift.organization and shift.organization.coordinator) else None)
        )
        response_list.append(res)
    return response_list

@router.post("", response_model=schemas.ShiftResponse)
def create_shift(
    shift_data: schemas.ShiftCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
    
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    if not org:
        raise HTTPException(status_code=400, detail="Організація не знайдена")
    
    new_shift = models.Shift(
        title=shift_data.title,
        category=shift_data.category or "Захід",
        target_faculty=shift_data.target_faculty or "ALL",
        date=shift_data.date,
        time=shift_data.time,
        location=shift_data.location,
        address=shift_data.address,
        description=shift_data.description,
        organization_id=org.id,
        created_by_id=user.id,  # Audit shift creator
        status="open",
        max_volunteers=shift_data.max_volunteers or 5
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    
    res = schemas.ShiftResponse.model_validate(new_shift)
    res.organization_name = org.name
    res.approved_count = 0
    res.contact_phone = new_shift.creator.phone if new_shift.creator else (org.coordinator.phone if org.coordinator else None)
    return res

@router.get("/b2b", response_model=List[schemas.ShiftResponse])
def get_b2b_shifts(
    limit: Optional[int] = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if limit is not None and not isinstance(limit, int):
        limit = getattr(limit, "default", None)
    if not isinstance(offset, int):
        offset = getattr(offset, "default", 0)

    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        return []
    
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    if not org:
        return []
    
    approved_count_sub = get_approved_count_subquery().label("approved_count")

    query = db.query(
        models.Shift,
        approved_count_sub
    ).options(
        joinedload(models.Shift.creator)
    ).filter(models.Shift.organization_id == org.id).order_by(models.Shift.date.desc())

    if limit is not None:
        query = query.limit(limit).offset(offset)

    results = query.all()
    response_list = []
    for shift, approved_count in results:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = org.name
        res.approved_count = approved_count or 0
        res.contact_phone = shift.creator.phone if shift.creator else (org.coordinator.phone if org.coordinator else None)
        response_list.append(res)
    return response_list


@router.put("/{shift_id}", response_model=schemas.ShiftResponse)
def update_shift(
    shift_id: int,
    shift_data: schemas.ShiftCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
    
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Смену не знайдено")
        
    if shift.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Ви не маєте доступу до цієї смени")

    shift.title = shift_data.title
    shift.category = shift_data.category or "Захід"
    shift.target_faculty = shift_data.target_faculty or "ALL"
    shift.date = shift_data.date
    shift.time = shift_data.time
    shift.location = shift_data.location
    shift.address = shift_data.address
    shift.description = shift_data.description
    if shift_data.max_volunteers is not None:
        shift.max_volunteers = shift_data.max_volunteers

    db.commit()
    db.refresh(shift)
    
    res = schemas.ShiftResponse.model_validate(shift)
    res.organization_name = shift.organization.name
    res.approved_count = len([a for a in shift.applications if a.status in ['approved', 'attended', 'reviewed']])
    res.contact_phone = shift.creator.phone if shift.creator else (shift.organization.coordinator.phone if shift.organization.coordinator else None)
    return res


@router.delete("/{shift_id}")
def delete_shift(
    shift_id: int,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
        
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Смену не знайдено")
        
    if shift.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Ви не маєте доступу до цієї смени")

    # If there are no applications, delete completely
    if not shift.applications:
        db.delete(shift)
        db.commit()
        return {"status": "deleted", "message": "Смену успішно видалено"}
    else:
        # If there are applications, cancel the shift and reject/cancel applications
        shift.status = "cancelled"
        for app in shift.applications:
            if app.status in ["pending", "approved"]:
                app.status = "rejected"
        db.commit()
        return {"status": "cancelled", "message": "Смену скасовано, оскільки на неї вже були відгуки"}
