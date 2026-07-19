import sys
import os

# Ensure backend directory is in the import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set env var for testing to use SQLite
os.environ["DATABASE_URL"] = "sqlite:///./test_database.db"

from backend.database import engine, Base, SessionLocal
from backend import models
from backend.routers.shifts import auto_close_past_shifts

# Create a clean test database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # 1. Create a B2B user and an organization
    coordinator = models.User(
        name="Test Coordinator",
        email="test_admin@test.ua",
        phone="+380931112233",
        role="B2B",
        company_role="owner"
    )
    db.add(coordinator)
    db.commit()
    db.refresh(coordinator)

    org = models.Organization(
        name="Test Org",
        coordinator_id=coordinator.id,
        description="Test Desc",
        address="Test Address"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    coordinator.company_id = org.id
    db.commit()

    # 2. Create an open shift in the future
    from datetime import datetime, timedelta
    future_date = (datetime.today() + timedelta(days=2)).strftime('%Y-%m-%d')
    shift = models.Shift(
        title="Test Shift Future",
        category="Test Category",
        date=future_date,
        time="10:00 - 12:00",
        location="Test Location",
        address="Test Address",
        description="Test Description",
        organization_id=org.id,
        created_by_id=coordinator.id,
        status="open",
        max_volunteers=5
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)

    # 3. Create two volunteer users
    volunteer1 = models.User(name="Volunteer 1", email="v1@test.ua", role="B2C")
    volunteer2 = models.User(name="Volunteer 2", email="v2@test.ua", role="B2C")
    db.add_all([volunteer1, volunteer2])
    db.commit()
    db.refresh(volunteer1)
    db.refresh(volunteer2)

    # 4. Create two applications, both rejected
    app1 = models.Application(
        shift_id=shift.id,
        volunteer_id=volunteer1.id,
        status="rejected",
        check_in_code="CODE1"
    )
    app2 = models.Application(
        shift_id=shift.id,
        volunteer_id=volunteer2.id,
        status="rejected",
        check_in_code="CODE2"
    )
    db.add_all([app1, app2])
    db.commit()

    print(f"Initial shift status: {shift.status}")
    print(f"Shift applications count: {len(shift.applications)}")
    print(f"Shift application statuses: {[a.status for a in shift.applications]}")

    # Run the auto_close_past_shifts logic
    auto_close_past_shifts(db)
    
    db.refresh(shift)
    print(f"Shift status after auto_close_past_shifts run: {shift.status}")
    assert shift.status == "open", f"Bug not fixed! Shift was closed: {shift.status}"
    print("SUCCESS: Shift stayed OPEN when all applications were rejected!")

    # 5. Let's test a case where it should close: one reviewed, one rejected
    # Change app1 to reviewed
    app1.status = "reviewed"
    db.commit()
    
    print("\nSimulating one reviewed and one rejected application...")
    auto_close_past_shifts(db)
    db.refresh(shift)
    print(f"Shift status after auto_close_past_shifts run: {shift.status}")
    assert shift.status == "closed", f"Shift should have been closed, but was: {shift.status}"
    print("SUCCESS: Shift was correctly CLOSED when at least one app is reviewed and all are processed!")

finally:
    db.close()
    # Clean up the test database file
    if os.path.exists("./test_database.db"):
        os.remove("./test_database.db")
