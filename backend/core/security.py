import os
import datetime
import jwt
import bcrypt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend import models
from backend.database import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345")
JWT_ALGORITHM = "HS256"

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
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_id(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> int:
    if authorization and authorization.credentials:
        token = authorization.credentials
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
        detail="Необхідна авторизація (недійсний або відсутній токен)"
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

