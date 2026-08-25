from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(
    role: Optional[str] = Query(None),
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    query = db.query(models.Notification)
    target_role = role or user.role
    if target_role == 'B2B' and user.company_id:
        query = query.filter(models.Notification.organization_id == user.company_id)
    else:
        query = query.filter(models.Notification.user_id == x_user_id)
        
    return query.order_by(models.Notification.created_at.desc()).limit(50).all()

@router.post("/read-all")
def mark_all_read(
    role: Optional[str] = Query(None),
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    query = db.query(models.Notification)
    target_role = role or user.role
    if target_role == 'B2B' and user.company_id:
        query = query.filter(models.Notification.organization_id == user.company_id)
    else:
        query = query.filter(models.Notification.user_id == x_user_id)
        
    query.update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "Усі сповіщення позначено як прочитані"}

@router.delete("/clear")
def clear_notifications(
    role: Optional[str] = Query(None),
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    query = db.query(models.Notification)
    target_role = role or user.role
    if target_role == 'B2B' and user.company_id:
        query = query.filter(models.Notification.organization_id == user.company_id)
    else:
        query = query.filter(models.Notification.user_id == x_user_id)
        
    query.delete(synchronize_session=False)
    db.commit()
    return {"message": "Усі сповіщення очищено"}
