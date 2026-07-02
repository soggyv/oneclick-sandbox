from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str  # 'B2C' or 'B2B'
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    org_name: Optional[str] = None
    org_address: Optional[str] = None
    org_description: Optional[str] = None
    password: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    access_token: str
    role: Optional[str] = "B2C"
    org_name: Optional[str] = None
    org_address: Optional[str] = None
    org_description: Optional[str] = None

class UserResponse(UserBase):
    id: int
    company_id: Optional[int] = None
    company_role: Optional[str] = None
    rating: Optional[float] = None  # average rating calculated dynamically
    token: Optional[str] = None  # JWT token if newly logged in
    completed_shifts_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# --- ORGANIZATION SCHEMAS ---
class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    coordinator_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- SHIFT SCHEMAS ---
class ShiftBase(BaseModel):
    title: str
    category: str
    date: str
    time: str
    location: str
    address: str
    description: Optional[str] = None
    max_volunteers: Optional[int] = 5

class ShiftCreate(ShiftBase):
    pass

class ShiftResponse(ShiftBase):
    id: int
    organization_id: int
    status: str
    organization_name: Optional[str] = None
    approved_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# --- APPLICATION SCHEMAS ---
class ApplicationCreate(BaseModel):
    shift_id: int

class ApplicationResponse(BaseModel):
    id: int
    shift_id: int
    volunteer_id: int
    status: str
    check_in_code: str
    shift: ShiftResponse
    volunteer_name: Optional[str] = None
    volunteer_avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ConfirmAttendanceRequest(BaseModel):
    code: str

# --- REVIEW SCHEMAS ---
class ReviewCreate(BaseModel):
    application_id: int
    rating: int  # 1 to 5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    application_id: int
    author_id: int
    author_name: Optional[str] = ""
    target_id: int
    rating: int
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    name: str
    phone: Optional[str] = None
    org_name: Optional[str] = None
    org_address: Optional[str] = None
    org_description: Optional[str] = None

# --- INVITATION SCHEMAS ---
class InvitationCreate(BaseModel):
    role: Optional[str] = "member"

class InvitationResponse(BaseModel):
    id: int
    organization_id: int
    token: str
    role: str
    expires_at: datetime
    is_used: bool

    model_config = ConfigDict(from_attributes=True)


class MemberRoleUpdate(BaseModel):
    role: str  # 'owner' | 'manager' | 'member'

