from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id

router = APIRouter(prefix="/api/shift-templates", tags=["shift-templates"])

@router.get("", response_model=List[schemas.ShiftTemplateResponse])
def get_templates(
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        return []
    
    templates = db.query(models.ShiftTemplate).filter(
        models.ShiftTemplate.organization_id == user.company_id
    ).all()
    return templates

@router.post("", response_model=schemas.ShiftTemplateResponse)
def create_template(
    template_data: schemas.ShiftTemplateCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
    
    org = db.query(models.Organization).filter(models.Organization.id == user.company_id).first()
    if not org:
        raise HTTPException(status_code=400, detail="Організація не знайдена")
    
    new_template = models.ShiftTemplate(
        name=template_data.name,
        title=template_data.title,
        category=template_data.category,
        time=template_data.time,
        location=template_data.location,
        address=template_data.address,
        description=template_data.description,
        organization_id=org.id,
        created_by_id=user.id
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template

@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
        
    template = db.query(models.ShiftTemplate).filter(models.ShiftTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не знайдено")
        
    if template.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Ви не маєте доступу до цього шаблону")
        
    db.delete(template)
    db.commit()
    return {"status": "deleted", "message": "Шаблон успішно видалено"}

@router.put("/{template_id}", response_model=schemas.ShiftTemplateResponse)
def update_template(
    template_id: int,
    template_data: schemas.ShiftTemplateCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=400, detail="У вас немає зареєстрованої організації")
        
    template = db.query(models.ShiftTemplate).filter(models.ShiftTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не знайдено")
        
    if template.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Ви не маєте доступу до цього шаблону")
        
    template.name = template_data.name
    template.title = template_data.title
    template.category = template_data.category
    template.time = template_data.time
    template.location = template_data.location
    template.address = template_data.address
    template.description = template_data.description
    
    db.commit()
    db.refresh(template)
    return template

