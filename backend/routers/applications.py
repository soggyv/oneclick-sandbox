from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.core.security import get_current_user_id
from backend.core.utils import generate_check_in_code

router = APIRouter(prefix="/api/applications", tags=["applications"])

def send_candidate_notification_email(email: str, volunteer_name: str, shift_title: str, status: str, check_in_code: str = None):
    from backend.core.utils import send_smtp_email
    
    if status == "approved":
        subject = f"OneClick: Вашу заявку на зміну '{shift_title}' схвалено!"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
            <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
            <p>Вітаємо, <b>{volunteer_name}</b>!</p>
            <p>Організатор схвалив вашу кандидатуру на участь у події <b>{shift_title}</b>.</p>
            <p>Ваш персональний код для позначки відвідування (check-in):</p>
            <div style="font-size: 24px; font-weight: bold; color: #FF5522; padding: 15px; background-color: #fff0eb; border-radius: 10px; text-align: center; letter-spacing: 2px; margin: 20px 0;">
              {check_in_code}
            </div>
            <p style="font-size: 13px; color: #555555;">Будь ласка, повідомте цей код координатору під час початку зміни.</p>
          </div>
        </body>
        </html>
        """
    else:
        subject = f"OneClick: Статус вашої заявки на зміну '{shift_title}'"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
            <h2 style="color: #666666; margin-top: 0;">OneClick</h2>
            <p>Вітаємо, <b>{volunteer_name}</b>!</p>
            <p>На жаль, організатор відхилив вашу заявку на подію <b>{shift_title}</b> цього разу.</p>
            <p>Не засмучуйтесь, у стрічці пошуку є ще багато інших цікавих змін!</p>
          </div>
        </body>
        </html>
        """
        
    success = send_smtp_email(email, subject, html)
    if not success:
        print(f"\n[LOCAL DEV EMAIL SIMULATION] To: {email}\nSubject: {subject}\nBody: {html}\n")


@router.post("/apply", response_model=schemas.ApplicationResponse)
def apply_to_shift(
    app_data: schemas.ApplicationCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.shift_id == app_data.shift_id,
        models.Application.volunteer_id == x_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ви вже відгукнулися на цю зміну")

    # Check shift spots limit
    shift = db.query(models.Shift).filter(models.Shift.id == app_data.shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Зміну не знайдено")
        
    approved_count = db.query(models.Application).filter(
        models.Application.shift_id == app_data.shift_id,
        models.Application.status.in_(["approved", "attended", "reviewed"])
    ).count()
    
    if approved_count >= shift.max_volunteers:
        raise HTTPException(status_code=400, detail="На жаль, усі місця на цю зміну вже зайняті")
    
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
    res.volunteer_avatar_url = new_app.volunteer.avatar_url
    res.shift.organization_name = new_app.shift.organization.name
    return res

@router.get("/my", response_model=List[schemas.ApplicationResponse])
def get_my_applications(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.volunteer_id == x_user_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.volunteer_avatar_url = app.volunteer.avatar_url
        res.shift.organization_name = app.shift.organization.name
        response_list.append(res)
    return response_list

@router.get("/b2b", response_model=List[schemas.ApplicationResponse])
def get_b2b_applications(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        return []
    
    # Filter applications belonging to the user's company shifts (data isolation)
    apps = db.query(models.Application).join(models.Shift).filter(models.Shift.organization_id == user.company_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name
        res.volunteer_avatar_url = app.volunteer.avatar_url
        res.shift.organization_name = app.shift.organization.name
        response_list.append(res)
    return response_list

@router.post("/{app_id}/review-candidate", response_model=schemas.ApplicationResponse)
def review_candidate(
    app_id: int,
    status: str,  # 'approved' or 'rejected'
    background_tasks: BackgroundTasks,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Некоректний статус")
        
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Заявку не знайдено")
        
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=403, detail="Немає доступу до керування цією заявкою")
        
    # Verify the shift belongs to the coordinator's company (data isolation check)
    if app.shift.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Немає доступу")
        
    if status == "approved":
        # Check spots limit before approving
        approved_count = db.query(models.Application).filter(
            models.Application.shift_id == app.shift_id,
            models.Application.status.in_(["approved", "attended", "reviewed"])
        ).count()
        if approved_count >= app.shift.max_volunteers:
            raise HTTPException(status_code=400, detail="Досягнуто ліміт волонтерів на цю зміну")

        # If this approval fills the shift, reject all other pending applications
        if approved_count + 1 >= app.shift.max_volunteers:
            pending_apps = db.query(models.Application).filter(
                models.Application.shift_id == app.shift_id,
                models.Application.id != app.id,
                models.Application.status == "pending"
            ).all()
            for p_app in pending_apps:
                p_app.status = "rejected"
                if p_app.volunteer.email:
                    background_tasks.add_task(
                        send_candidate_notification_email,
                        p_app.volunteer.email,
                        p_app.volunteer.name,
                        p_app.shift.title,
                        "rejected",
                        p_app.check_in_code
                    )

    app.status = status
    db.commit()
    db.refresh(app)
    
    if app.volunteer.email:
        background_tasks.add_task(
            send_candidate_notification_email,
            app.volunteer.email,
            app.volunteer.name,
            app.shift.title,
            status,
            app.check_in_code
        )
        
    res = schemas.ApplicationResponse.model_validate(app)
    res.volunteer_name = app.volunteer.name
    res.volunteer_avatar_url = app.volunteer.avatar_url
    res.shift.organization_name = app.shift.organization.name
    return res

@router.post("/confirm-attendance", response_model=schemas.ApplicationResponse)
def confirm_attendance(
    payload: schemas.ConfirmAttendanceRequest,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(models.Application.check_in_code == payload.code).first()
    if not app:
        raise HTTPException(status_code=404, detail="Невірний код або користувача не знайдено")
        
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=403, detail="Немає доступу")
        
    # Verify the shift belongs to the coordinator's company (data isolation check)
    if app.shift.organization_id != user.company_id:
        raise HTTPException(status_code=403, detail="Ви не є організатором цієї зміни")
        
    if app.status != "approved":
        raise HTTPException(status_code=400, detail="Кандидатура волонтера на цю зміну не була підтверджена")
        
    app.status = "attended"
    db.commit()
    db.refresh(app)
    
    res = schemas.ApplicationResponse.model_validate(app)
    res.volunteer_name = app.volunteer.name
    res.volunteer_avatar_url = app.volunteer.avatar_url
    res.shift.organization_name = app.shift.organization.name
    return res

@router.post("/rate", response_model=schemas.ReviewResponse)
def rate_volunteer(
    review_data: schemas.ReviewCreate,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(models.Application.id == review_data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Заявку не знайдено")
        
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        raise HTTPException(status_code=403, detail="Немає доступу")
        
    # Verify the shift belongs to the coordinator's company (data isolation check)
    if app.shift.organization_id != user.company_id:
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
    
    # Auto-close shift if all applications for this shift are fully processed (reviewed or rejected),
    # but only if there is at least one reviewed (completed) application.
    all_apps = db.query(models.Application).filter(models.Application.shift_id == app.shift_id).all()
    if all_apps and all(a.status in ["reviewed", "rejected"] for a in all_apps) and any(a.status == "reviewed" for a in all_apps):
        app.shift.status = "closed"
        
    db.commit()
    db.refresh(review)
    
    res = schemas.ReviewResponse.model_validate(review)
    res.author_name = app.shift.organization.name
    return res
