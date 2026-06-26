from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str  # 'B2C' or 'B2B'

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    rating: Optional[float] = None  # average rating calculated dynamically

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
    coordinator_id: int

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

class ShiftCreate(ShiftBase):
    pass

class ShiftResponse(ShiftBase):
    id: int
    organization_id: int
    status: str
    organization_name: Optional[str] = None

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
    author_name: str
    target_id: int
    rating: int
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
