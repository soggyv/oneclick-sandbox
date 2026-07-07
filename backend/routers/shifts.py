from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/shifts", tags=["shifts"])

def auto_close_past_shifts(db: Session):
    today_str = datetime.now().strftime("%Y-%m-%d")
    past_shifts = db.query(models.Shift).filter(
        models.Shift.status == "open",
        models.Shift.date < today_str
    ).all()
    for s in past_shifts:
        s.status = "closed"
        
    # Also close any open shifts where all applications are already reviewed or rejected
    open_shifts = db.query(models.Shift).filter(models.Shift.status == "open").all()
    closed_any = False
    for s in open_shifts:
        if s.applications:
            if all(a.status in ["reviewed", "rejected"] for a in s.applications):
                s.status = "closed"
                closed_any = True
                
    if past_shifts or closed_any:
        db.commit()

@router.get("", response_model=List[schemas.ShiftResponse])
def get_shifts(
    date: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    auto_close_past_shifts(db)
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
        category=shift_data.category,
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
    return res

@router.get("/b2b", response_model=List[schemas.ShiftResponse])
def get_b2b_shifts(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    auto_close_past_shifts(db)
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        return []
    
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    if not org:
        return []
    
    # Filter shifts belonging to the user's company (data isolation)
    shifts = db.query(models.Shift).filter(models.Shift.organization_id == org.id).all()
    response_list = []
    for shift in shifts:
        res = schemas.ShiftResponse.model_validate(shift)
        res.organization_name = org.name
        res.approved_count = len([a for a in shift.applications if a.status in ['approved', 'attended', 'reviewed']])
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
    shift.category = shift_data.category
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
