from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
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


def send_b2b_notification_email(to_email: str, coordinator_name: str, volunteer_name: str, shift_title: str, event_type: str):
    from backend.core.utils import send_smtp_email
    
    if event_type == "cancellation":
        subject = f"OneClick: Волонтер скасував запис на зміну '{shift_title}'"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
            <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
            <p>Вітаємо, <b>{coordinator_name}</b>!</p>
            <p>Волонтер <b>{volunteer_name}</b> скасував(-ла) свій запис на зміну <b>{shift_title}</b>.</p>
            <div style="font-size: 14px; padding: 15px; background-color: #fff0eb; border-left: 4px solid #FF5522; border-radius: 8px; margin: 20px 0;">
              Місце на зміну знову звільнилося у вашому кабінеті B2B.
            </div>
            <p style="font-size: 13px; color: #555555;">Ви можете переглянути оновлений список учасників у кабінеті OneClick.</p>
          </div>
        </body>
        </html>
        """
    else:
        subject = f"OneClick: Новий відгук на зміну '{shift_title}'"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f7; padding: 20px; color: #111111;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #e5e5e7;">
            <h2 style="color: #FF5522; margin-top: 0;">OneClick</h2>
            <p>Вітаємо, <b>{coordinator_name}</b>!</p>
            <p>Волонтер <b>{volunteer_name}</b> подав(-ла) нову заявку на зміну <b>{shift_title}</b>.</p>
            <p style="font-size: 13px; color: #555555;">Перевірте та розгляньте кандидатів у вашому кабінеті OneClick.</p>
          </div>
        </body>
        </html>
        """
        
    success = send_smtp_email(to_email, subject, html)
    if not success:
        print(f"\n[LOCAL DEV EMAIL SIMULATION] To: {to_email}\nSubject: {subject}\nBody: {html}\n")


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
    apps = db.query(models.Application).options(
        joinedload(models.Application.volunteer),
        joinedload(models.Application.shift).joinedload(models.Shift.organization)
    ).filter(models.Application.volunteer_id == x_user_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name if app.volunteer else ""
        res.volunteer_avatar_url = app.volunteer.avatar_url if app.volunteer else None
        res.volunteer_faculty = getattr(app.volunteer, 'faculty', 'ФКІТ') if app.volunteer else 'ФКІТ'
        if app.shift and app.shift.organization:
            res.shift.organization_name = app.shift.organization.name
        response_list.append(res)
    return response_list

@router.get("/b2b", response_model=List[schemas.ApplicationResponse])
def get_b2b_applications(x_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.company_id:
        return []
    
    # Filter applications belonging to the user's company shifts (data isolation)
    apps = db.query(models.Application).options(
        joinedload(models.Application.volunteer),
        joinedload(models.Application.shift).joinedload(models.Shift.organization)
    ).join(models.Shift).filter(models.Shift.organization_id == user.company_id).all()
    response_list = []
    for app in apps:
        res = schemas.ApplicationResponse.model_validate(app)
        res.volunteer_name = app.volunteer.name if app.volunteer else ""
        res.volunteer_avatar_url = app.volunteer.avatar_url if app.volunteer else None
        res.volunteer_faculty = getattr(app.volunteer, 'faculty', 'ФКІТ') if app.volunteer else 'ФКІТ'
        if app.shift and app.shift.organization:
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
                db.add(models.Notification(
                    user_id=p_app.volunteer_id,
                    title="Заявку відхилено",
                    message=f"На жаль, всі місця на зміну \"{p_app.shift.title}\" вже зайняті.",
                    type="rejection"
                ))
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

    # Create notification for volunteer
    notif_title = "Заявку схвалено!" if status == "approved" else "Заявку відхилено"
    notif_msg = (
        f"Вашу заявку на зміну \"{app.shift.title}\" схвалено. Ваш код відвідування: {app.check_in_code}."
        if status == "approved"
        else f"На жаль, вашу заявку на зміну \"{app.shift.title}\" відхилено."
    )
    notif_type = "approval" if status == "approved" else "rejection"

    db.add(models.Notification(
        user_id=app.volunteer_id,
        title=notif_title,
        message=notif_msg,
        type=notif_type
    ))

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

    # Create notification for volunteer
    db.add(models.Notification(
        user_id=app.volunteer_id,
        title="Новий відгук від організації",
        message=f"Організація \"{app.shift.organization.name}\" залишила вам оцінку ({review_data.rating}/5) за зміну \"{app.shift.title}\".",
        type="review"
    ))
    
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


@router.delete("/{app_id}")
def cancel_application(
    app_id: int,
    background_tasks: BackgroundTasks,
    x_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.volunteer_id == x_user_id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Заявку не знайдено")
        
    if app.status in ["attended", "reviewed"]:
        raise HTTPException(status_code=400, detail="Неможливо скасувати запис на вже відвідану або завершену зміну")

    vol_name = app.volunteer.name if app.volunteer else "Волонтер"
    shift_title = app.shift.title if app.shift else "Зміна"
    org_id = app.shift.organization_id if app.shift else None
    
    # Notification for B2C volunteer addressing them directly as 'Ви'
    db.add(models.Notification(
        user_id=x_user_id,
        title="Скасування запису",
        message=f"Ви успішно скасували свій запис на зміну \"{shift_title}\".",
        type="cancellation"
    ))

    # Notification for B2B organization
    if org_id:
        notif = models.Notification(
            organization_id=org_id,
            title="Скасування запису",
            message=f"Волонтер {vol_name} скасував(-ла) запис на зміну \"{shift_title}\".",
            type="cancellation"
        )
        db.add(notif)

    if app.shift and app.shift.organization and app.shift.organization.coordinator and app.shift.organization.coordinator.email:
        background_tasks.add_task(
            send_b2b_notification_email,
            app.shift.organization.coordinator.email,
            app.shift.organization.coordinator.name,
            vol_name,
            shift_title,
            "cancellation"
        )

    db.delete(app)
    db.commit()
    return {"message": "Ви успішно скасували запис на зміну"}

