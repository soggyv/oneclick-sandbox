from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Text
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=True)
    name = Column(String)
    avatar = Column(String, nullable=True)
    role = Column(String, default="worker")  # "worker", "employer"
    rating = Column(Float, default=5.0)
    balance = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    company_id = Column(String, ForeignKey("companies.id"), nullable=True)

class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    edrpou = Column(String, nullable=True)
    address = Column(String, nullable=True)
    sphere = Column(String, nullable=True)

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(String, primary_key=True, index=True)
    company = Column(String)
    role = Column(String)
    date = Column(String)  # Day number, e.g. "21"
    day_name = Column(String)  # "Пн", "Вт", etc.
    time = Column(String)  # "08:00 — 17:00"
    duration = Column(String)  # "9 год"
    price = Column(Integer)
    address = Column(String)
    status = Column(String, default="open")  # "open", "booked", "in_progress", "pending_approval", "disputed", "completed"
    category = Column(String)  # "Кава", "Рітейл", "Склади", "University Event / Volunteer"
    details = Column(Text, nullable=True)
    work_photo = Column(String, nullable=True)
    work_comment = Column(String, nullable=True)
    dispute_reason = Column(String, nullable=True)
    dispute_comment = Column(String, nullable=True)
    dispute_status = Column(String, nullable=True)  # "under_review", "pending_settlement"
    volunteer_reward = Column(String, nullable=True)
    worker_id = Column(String, ForeignKey("users.id"), nullable=True)
    is_hot = Column(Boolean, default=False)
    requires_screening = Column(Boolean, default=False)
    template_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    @property
    def dayName(self) -> str:
        return self.day_name

    @dayName.setter
    def dayName(self, value: str):
        self.day_name = value

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True)
    shift_id = Column(String, ForeignKey("shifts.id"), index=True)
    worker_id = Column(String, ForeignKey("users.id"))
    status = Column(String, default="pending")  # "pending", "approved", "declined"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    title = Column(String)
    amount = Column(Integer)
    date = Column(String)
    status = Column(String, default="completed")  # "completed", "processing"
    type = Column(String)  # "work", "withdrawal"

class DisputeMessage(Base):
    __tablename__ = "dispute_messages"

    id = Column(String, primary_key=True, index=True)
    shift_id = Column(String, ForeignKey("shifts.id"), index=True)
    sender = Column(String)  # "system", "manager", "employer", "worker"
    text = Column(Text)
    timestamp = Column(String)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    shift_id = Column(String, ForeignKey("shifts.id"), index=True)
    worker_name = Column(String)
    rating = Column(Integer)
    date = Column(String)
    comment = Column(Text)
