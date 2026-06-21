from pydantic import BaseModel
from typing import List, Optional

# Auth Schemas
class PhoneLoginRequest(BaseModel):
    phone: str
    name: str

class VerifySmsRequest(BaseModel):
    phone: str
    code: str
    name: str

class DiiaVerifyRequest(BaseModel):
    name: str
    phone: str

class RegisterCompanyRequest(BaseModel):
    id: str
    name: str
    edrpou: str
    address: str
    sphere: str

# Shift Schemas
class ShiftCreateRequest(BaseModel):
    company: str
    role: str
    date: str
    dayName: str
    time: str
    duration: str
    price: int
    address: str
    category: str
    details: str
    requires_screening: Optional[bool] = False
    template_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ShiftResponse(BaseModel):
    id: str
    company: str
    role: str
    date: str
    dayName: str
    time: str
    duration: str
    price: int
    address: str
    status: str
    category: str
    details: Optional[str] = ""
    work_photo: Optional[str] = None
    work_comment: Optional[str] = None
    dispute_reason: Optional[str] = None
    dispute_comment: Optional[str] = None
    dispute_status: Optional[str] = None
    volunteer_reward: Optional[str] = None
    worker_id: Optional[str] = None
    is_hot: Optional[bool] = False
    requires_screening: Optional[bool] = False
    template_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True

# Dispute Schemas
class DisputeCreateRequest(BaseModel):
    shift_id: str
    reason: str
    comment: str

class DisputeMessageCreate(BaseModel):
    text: str
    sender: str

class DisputeResolveRequest(BaseModel):
    resolution: str  # "pay_full", "compromise", "refund_full"
    decided_by: str = "employer"  # "employer", "arbitrator"

# Review Schemas
class ReviewCreateRequest(BaseModel):
    shift_id: str
    rating: int
    comment: str

# Wallet Schemas
class WalletWithdrawalRequest(BaseModel):
    amount: int

# B2B Auth Schemas
class B2BRegisterRequest(BaseModel):
    email: str
    password: Optional[str] = None
    contact_person: str
    company_name: str
    event_type: str
    auth_method: str  # "google" or "email"

