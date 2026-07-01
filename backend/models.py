from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=False)  # 'B2C' (volunteer) or 'B2B' (coordinator)
    password = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Relationships
    organizations = relationship("Organization", back_populates="coordinator", foreign_keys="Organization.coordinator_id")
    applications = relationship("Application", back_populates="volunteer")
    reviews_written = relationship("Review", back_populates="author", foreign_keys="Review.author_id")
    reviews_received = relationship("Review", back_populates="target", foreign_keys="Review.target_id")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    coordinator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Relationships
    coordinator = relationship("User", back_populates="organizations", foreign_keys=[coordinator_id])
    shifts = relationship("Shift", back_populates="organization", cascade="all, delete-orphan")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)  # ISO string or YYYY-MM-DD
    time = Column(String, nullable=False)  # e.g., "09:00 - 18:00"
    location = Column(String, nullable=False)  # e.g., "Актова зала"
    address = Column(String, nullable=False)  # e.g., "вул. Канатна, 15"
    description = Column(String, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    status = Column(String, default="open")  # 'open' or 'closed'
    max_volunteers = Column(Integer, default=1, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="shifts")
    applications = relationship("Application", back_populates="shift", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # 'pending' | 'approved' | 'rejected' | 'attended' | 'reviewed'
    check_in_code = Column(String, unique=True, index=True, nullable=False)

    # Relationships
    shift = relationship("Shift", back_populates="applications")
    volunteer = relationship("User", back_populates="applications")
    review = relationship("Review", uselist=False, back_populates="application", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Organization coordinator
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Volunteer
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(String, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="review")
    author = relationship("User", back_populates="reviews_written", foreign_keys=[author_id])
    target = relationship("User", back_populates="reviews_received", foreign_keys=[target_id])
