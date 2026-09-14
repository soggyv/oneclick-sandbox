import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from backend.main import lifespan, app
from backend.database import SessionLocal, engine
from backend.routers.shifts import get_shifts, get_b2b_shifts
from sqlalchemy import text

async def main():
    print("1. Checking database indexes...")
    with engine.connect() as conn:
        indexes = conn.execute(text("PRAGMA index_list('shifts')")).fetchall()
        print("Indexes on shifts table:")
        for idx in indexes:
            print(" -", idx[1])
            
        app_indexes = conn.execute(text("PRAGMA index_list('applications')")).fetchall()
        print("Indexes on applications table:")
        for idx in app_indexes:
            print(" -", idx[1])

    print("\n2. Testing lifespan context and query performance...")
    async with lifespan(app):
        with SessionLocal() as db:
            res = get_shifts(limit=5, offset=0, db=db)
            print(f"get_shifts (limit=5, offset=0) executed successfully! Found: {len(res)}")
            
            b2b_res = get_b2b_shifts(limit=5, offset=0, x_user_id=1, db=db)
            print(f"get_b2b_shifts executed successfully! Found: {len(b2b_res)}")

    print("\nAll verification checks passed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
