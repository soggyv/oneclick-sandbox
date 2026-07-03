import uuid
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id, create_access_token

router = APIRouter(prefix="/api/organizations", tags=["organizations"])

@router.post("/invitations", response_model=schemas.InvitationResponse)
def create_invitation(
    payload: schemas.InvitationCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=403, detail="Ви не належите до жодної організації")
    
    # Check permission (only owners or managers can generate invite links)
    if user.company_role not in ["owner", "manager"]:
        raise HTTPException(status_code=403, detail="У вас немає прав для запрошення нових співробітников")
    
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=48)
    
    new_invitation = models.CompanyInvitation(
        organization_id=user.company_id,
        token=token,
        role=payload.role or "member",
        created_by_id=user.id,
        expires_at=expires_at,
        is_used=False
    )
    db.add(new_invitation)
    db.commit()
    db.refresh(new_invitation)
    return new_invitation

@router.get("/invitations/validate/{token}")
def validate_invitation(token: str, db: Session = Depends(get_db)):
    invitation = db.query(models.CompanyInvitation).filter(models.CompanyInvitation.token == token).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Запрошення не знайдено або недійсне")
        
    if invitation.is_used:
        raise HTTPException(status_code=400, detail="Це запрошення вже було використано")
        
    # Check expiration date
    if datetime.utcnow() > invitation.expires_at:
        raise HTTPException(status_code=400, detail="Термін дії цього запрошення закінчився")
        
    return {
        "valid": True,
        "organization_name": invitation.organization.name,
        "role": invitation.role
    }

@router.post("/accept-invitation/{token}", response_model=schemas.UserResponse)
def accept_invitation(
    token: str,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # 1. Verify invitation token
    invitation = db.query(models.CompanyInvitation).filter(models.CompanyInvitation.token == token).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Запрошення не знайдено")
        
    if invitation.is_used:
        raise HTTPException(status_code=400, detail="Це запрошення вже використано")
        
    # Check expiration
    if datetime.utcnow() > invitation.expires_at:
        raise HTTPException(status_code=400, detail="Термін дії запрошення закінчився")
         
    # 2. Get user
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    if user.company_id and user.company_role == "owner":
        raise HTTPException(
            status_code=400,
            detail="Власник не може вийти з організації. Спочатку видаліть організацію або передайте права власника."
        )
        
    # 3. Accept user into organization
    user.role = "B2B"
    user.company_id = invitation.organization_id
    user.company_role = invitation.role or "member"
    
    # Mark invitation as used
    invitation.is_used = True
    
    db.commit()
    db.refresh(user)
    db.refresh(invitation)
    
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
    response.token = create_access_token(user.id)
    return response

@router.get("/members", response_model=List[schemas.UserResponse])
def get_organization_members(
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=403, detail="Ви не належите до жодної організації")
    
    # Return all members of this organization
    members = db.query(models.User).filter(models.User.company_id == user.company_id).all()
    
    response_list = []
    for m in members:
        # Calculate rating
        ratings = db.query(models.Review.rating).filter(models.Review.target_id == m.id).all()
        avg_rating = sum(r[0] for r in ratings) / len(ratings) if ratings else 0.0
        
        # Calculate completed shifts
        completed_count = db.query(models.Application).filter(
            models.Application.volunteer_id == m.id,
            models.Application.status.in_(["attended", "reviewed"])
        ).count()
        
        res = schemas.UserResponse.model_validate(m)
        res.rating = round(avg_rating, 1) if ratings else None
        res.completed_shifts_count = completed_count
        response_list.append(res)
        
    return response_list

@router.post("/leave", response_model=schemas.UserResponse)
def leave_organization(
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    if not user.company_id:
        raise HTTPException(status_code=400, detail="Ви не належите до жодної організації")
    if user.company_role == "owner":
        raise HTTPException(
            status_code=400, 
            detail="Власник не може вийти з організації. Спочатку видаліть організацію або передайте права власника."
        )
        
    user.company_id = None
    user.company_role = None
    user.role = "B2C"
    db.commit()
    db.refresh(user)
    
    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = sum(r[0] for r in ratings) / len(ratings) if ratings else 0.0
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.token = create_access_token(user.id)
    return response

@router.put("/members/{member_id}/role", response_model=schemas.UserResponse)
def update_member_role(
    member_id: int,
    payload: schemas.MemberRoleUpdate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if payload.role not in ["owner", "manager", "member"]:
        raise HTTPException(status_code=400, detail="Некоректна роль")

    current_user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not current_user or not current_user.company_id:
        raise HTTPException(status_code=403, detail="Ви не належите до жодної організації")
        
    # Check permissions: only owners can change roles
    if current_user.company_role != "owner":
        raise HTTPException(status_code=403, detail="Тільки власник організації може змінювати ролі")
        
    target_member = db.query(models.User).filter(
        models.User.id == member_id, 
        models.User.company_id == current_user.company_id
    ).first()
    
    if not target_member:
        raise HTTPException(status_code=404, detail="Співробітника не знайдено в цій організації")
        
    if target_member.id == current_user.id:
        raise HTTPException(status_code=400, detail="Ви не можете змінити власну роль")
        
    target_member.company_role = payload.role
    db.commit()
    db.refresh(target_member)
    
    return schemas.UserResponse.model_validate(target_member)

@router.delete("/members/{member_id}")
def remove_member(
    member_id: int,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    current_user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not current_user or not current_user.company_id:
        raise HTTPException(status_code=403, detail="Ви не належите до жодної організації")
        
    # Only owners and managers can remove members
    if current_user.company_role not in ["owner", "manager"]:
        raise HTTPException(status_code=403, detail="У вас немає прав для видалення співробітників")
        
    target_member = db.query(models.User).filter(
        models.User.id == member_id,
        models.User.company_id == current_user.company_id
    ).first()
    
    if not target_member:
        raise HTTPException(status_code=404, detail="Співробітника не знайдено в цій організації")
        
    if target_member.id == current_user.id:
        raise HTTPException(status_code=400, detail="Ви не можете видалити самого себе")
        
    # Prevent managers from deleting owner or other managers
    if current_user.company_role == "manager" and target_member.company_role in ["owner", "manager"]:
        raise HTTPException(status_code=403, detail="Менеджери не можуть видаляти власників або інших менеджерів")
        
    # Reset target user company membership and role
    target_member.company_id = None
    target_member.company_role = "member"
    target_member.role = "B2C" # Revert back to volunteer / individual role
    
    db.commit()
    return {"success": True, "detail": "Співробітника успішно видалено з організації"}

@router.delete("", response_model=schemas.UserResponse)
def delete_organization(
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    if not user.company_id:
        raise HTTPException(status_code=400, detail="Ви не належите до жодної організації")
    if user.company_role != "owner":
        raise HTTPException(status_code=403, detail="Тільки власник може видалити організацію")
        
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Організацію не знайдено")
        
    # Delete all invitations for this organization
    db.query(models.CompanyInvitation).filter(models.CompanyInvitation.organization_id == org.id).delete()
    
    # Set all members of this organization back to B2C role
    members = db.query(models.User).filter(models.User.company_id == org.id).all()
    for m in members:
        m.company_id = None
        m.company_role = None
        m.role = "B2C"
        
    # Set coordinator_id to None to avoid foreign key violations in some DBs during delete
    org.coordinator_id = None
    db.flush()
    
    db.delete(org)
    db.commit()
    
    # Return updated current user
    db.refresh(user)
    
    # Calculate average rating
    ratings = db.query(models.Review.rating).filter(models.Review.target_id == user.id).all()
    avg_rating = sum(r[0] for r in ratings) / len(ratings) if ratings else 0.0
    
    response = schemas.UserResponse.model_validate(user)
    response.rating = round(avg_rating, 1) if ratings else None
    response.token = create_access_token(user.id)
    return response
