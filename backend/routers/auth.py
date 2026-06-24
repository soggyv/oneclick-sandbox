from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import get_db
from backend.models import User, Company
from backend.schemas import PhoneLoginRequest, VerifySmsRequest, DiiaVerifyRequest, RegisterCompanyRequest, B2BRegisterRequest, B2BLoginRequest, GoogleLoginRequest
import uuid
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = "604999474013-vbn98u78alve3m054hcavkl6u8trkm1k.apps.googleusercontent.com"


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google")
async def google_auth(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        id_info = id_token.verify_oauth2_token(
            req.id_token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        email = id_info.get("email")
        name = id_info.get("name")
        avatar = id_info.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            phone="",
            name=name,
            avatar=avatar,
            role="worker",
            is_verified=True,
            balance=0,
            employer_balance=0
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "isLoggedIn": True,
        "user_id": user.id,
        "email": user.email,
        "phone": user.phone,
        "name": user.name,
        "role": user.role,
        "is_verified": user.is_verified,
        "balance": user.balance,
        "employer_balance": getattr(user, 'employer_balance', 0),
        "avatar": user.avatar
    }

@router.post("/b2b-google")
async def b2b_google(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        id_info = id_token.verify_oauth2_token(
            req.id_token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        email = id_info.get("email")
        name = id_info.get("name")
        avatar = id_info.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user:
        company_name = ""
        company_details = ""
        if user.company_id:
            comp_stmt = select(Company).where(Company.id == user.company_id)
            comp_res = await db.execute(comp_stmt)
            company = comp_res.scalar_one_or_none()
            if company:
                company_name = company.name
                company_details = f"ТОВ «{company.name}», ЄДРПОУ {company.edrpou or '00000000'}"

        return {
            "exists": True,
            "isLoggedIn": True,
            "user_id": user.id,
            "phone": user.phone or "",
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_verified": user.is_verified,
            "balance": user.balance,
            "employer_balance": getattr(user, 'employer_balance', 0),
            "avatar": user.avatar or avatar,
            "company_name": company_name,
            "company_details": company_details
        }
    else:
        return {
            "exists": False,
            "email": email,
            "name": name,
            "avatar": avatar
        }

@router.post("/login-phone")
async def login_phone(req: PhoneLoginRequest):
    # Simulated SMS OTP Code
    code = "4815"
    return {"message": "OTP code sent via SMS", "code": code}

@router.post("/verify-sms")
async def verify_sms(req: VerifySmsRequest, db: AsyncSession = Depends(get_db)):
    if req.code != "4815":
        raise HTTPException(status_code=400, detail="Invalid verification code")

    stmt = select(User).where(User.phone == req.phone)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            phone=req.phone,
            name=req.name,
            role="worker",
            is_verified=False,
            balance=0
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "isLoggedIn": True,
        "user_id": user.id,
        "phone": user.phone,
        "name": user.name,
        "role": user.role,
        "is_verified": user.is_verified,
        "balance": user.balance,
        "employer_balance": getattr(user, 'employer_balance', 0),
        "avatar": user.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    }

@router.post("/verify-diia")
async def verify_diia(req: DiiaVerifyRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.phone == req.phone)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            phone=req.phone,
            name=req.name,
            role="worker",
            is_verified=True,
            balance=0
        )
        db.add(user)
    else:
        user.is_verified = True
        user.name = req.name

    await db.commit()
    await db.refresh(user)

    return {
        "isLoggedIn": True,
        "user_id": user.id,
        "phone": user.phone,
        "name": user.name,
        "role": user.role,
        "is_verified": user.is_verified,
        "balance": user.balance,
        "employer_balance": getattr(user, 'employer_balance', 0),
        "avatar": user.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    }

@router.post("/register-company")
async def register_company(req: RegisterCompanyRequest, user_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    if req.edrpou and (not req.edrpou.isdigit() or len(req.edrpou) != 8):
        raise HTTPException(status_code=400, detail="Код ЄДРПОУ має складатися з 8 цифр")
    # Create or fetch Company
    stmt = select(Company).where(Company.id == req.id)
    res = await db.execute(stmt)
    company = res.scalar_one_or_none()

    if not company:
        company = Company(
            id=req.id,
            name=req.name,
            edrpou=req.edrpou,
            address=req.address,
            sphere=req.sphere
        )
        db.add(company)

    # Link user to company and shift role to employer
    if user_id:
        user_stmt = select(User).where(User.id == user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if user:
            user.role = "employer"
            user.company_id = company.id

    await db.commit()
    return company

@router.post("/b2b-register")
async def b2b_register(req: B2BRegisterRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check if user already exists
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user:
        # User already exists, fetch their company info
        company_name = ""
        company_details = ""
        if user.company_id:
            comp_stmt = select(Company).where(Company.id == user.company_id)
            comp_res = await db.execute(comp_stmt)
            company = comp_res.scalar_one_or_none()
            if company:
                company_name = company.name
                company_details = f"ТОВ «{company.name}», ЄДРПОУ {company.edrpou or '00000000'}"
        return {
            "isLoggedIn": True,
            "user_id": user.id,
            "phone": user.phone or "",
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_verified": user.is_verified,
            "balance": user.balance,
            "employer_balance": getattr(user, 'employer_balance', 0),
            "avatar": user.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            "company_name": company_name,
            "company_details": company_details
        }

    # 2. Create a new Company
    company_id = f"company-{uuid.uuid4()}"
    company = Company(
        id=company_id,
        name=req.company_name,
        edrpou="12345678", # Dummy EDRPOU for sandbox
        address="Київ, Хрещатик, 24", # Dummy address
        sphere=req.event_type
    )
    db.add(company)

    # 3. Create a new User (employer role)
    user_id = f"b2b-user-{uuid.uuid4()}"
    user = User(
        id=user_id,
        phone=None,
        email=req.email,
        password=req.password,
        name=req.contact_person,
        role="employer",
        is_verified=True,
        balance=0,
        employer_balance=50000, # starting balance
        company_id=company_id,
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    )
    db.add(user)

    await db.commit()
    await db.refresh(user)

    company_details = f"ТОВ «{company.name}», ЄДРПОУ {company.edrpou}"

    return {
        "isLoggedIn": True,
        "user_id": user.id,
        "phone": user.phone or "",
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_verified": user.is_verified,
        "balance": user.balance,
        "employer_balance": user.employer_balance,
        "avatar": user.avatar,
        "company_name": company.name,
        "company_details": company_details
    }

@router.post("/b2b-login")
async def b2b_login(req: B2BLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Користувача з такою електронною поштою не знайдено")

    if req.auth_method == "email" and req.password:
        if user.password and user.password != req.password:
            raise HTTPException(status_code=400, detail="Неправильний пароль")

    company_name = ""
    company_details = ""
    if user.company_id:
        comp_stmt = select(Company).where(Company.id == user.company_id)
        comp_res = await db.execute(comp_stmt)
        company = comp_res.scalar_one_or_none()
        if company:
            company_name = company.name
            company_details = f"ТОВ «{company.name}», ЄДРПОУ {company.edrpou or '00000000'}"

    return {
        "isLoggedIn": True,
        "user_id": user.id,
        "phone": user.phone or "",
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_verified": user.is_verified,
        "balance": user.balance,
        "employer_balance": getattr(user, 'employer_balance', 0),
        "avatar": user.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        "company_name": company_name,
        "company_details": company_details
    }

