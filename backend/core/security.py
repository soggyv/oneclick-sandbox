import os
import datetime
import jwt
import bcrypt
import secrets
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend import models
from backend.database import get_db

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    # Generate secure random secret per instance if not provided in environment
    JWT_SECRET = secrets.token_hex(32)

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer(auto_error=False)

class PasswordContext:
    @staticmethod
    def hash(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def verify(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

pwd_context = PasswordContext()

def create_access_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_id(
    request: Request,
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> int:
    token = None
    # 1. Try extracting token from httpOnly cookie
    if request and request.cookies and "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    # 2. Try extracting token from Bearer Authorization header
    elif authorization and authorization.credentials:
        token = authorization.credentials

    if token:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
            if user_id is not None:
                user = db.query(models.User).filter(models.User.id == user_id).first()
                if user:
                    return user.id
        except jwt.PyJWTError:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Необхідна авторизація (недійсний або прострочений токен)"
    )

def normalize_phone(phone: str) -> str:
    if not phone:
        return phone
    # Strip non-digits
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) == 12 and digits.startswith("380"):
        return "+" + digits
    if len(digits) == 10 and digits.startswith("0"):
        return "+38" + digits
    if len(digits) == 9:
        return "+380" + digits
    return "+" + digits if digits else ""

