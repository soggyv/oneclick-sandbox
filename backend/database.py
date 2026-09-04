import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import backend.core.config

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def auto_migrate_db(engine):
    if engine.url.drivername.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
                existing_user_cols = set(row[1] for row in res) if res else set()
                if existing_user_cols:
                    if "faculty" not in existing_user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN faculty VARCHAR DEFAULT 'ФКІТ'"))
                    if "company_id" not in existing_user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN company_id INTEGER"))
                    if "company_role" not in existing_user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN company_role VARCHAR DEFAULT 'member'"))
                    conn.commit()

                res_s = conn.execute(text("PRAGMA table_info(shifts)")).fetchall()
                existing_shift_cols = set(row[1] for row in res_s) if res_s else set()
                if existing_shift_cols:
                    if "target_faculty" not in existing_shift_cols:
                        conn.execute(text("ALTER TABLE shifts ADD COLUMN target_faculty VARCHAR DEFAULT 'ALL'"))
                    if "created_by_id" not in existing_shift_cols:
                        conn.execute(text("ALTER TABLE shifts ADD COLUMN created_by_id INTEGER"))
                    conn.commit()

                res_t = conn.execute(text("PRAGMA table_info(shift_templates)")).fetchall()
                existing_tpl_cols = set(row[1] for row in res_t) if res_t else set()
                if existing_tpl_cols:
                    if "created_by_id" not in existing_tpl_cols:
                        conn.execute(text("ALTER TABLE shift_templates ADD COLUMN created_by_id INTEGER"))
                    conn.commit()
        except Exception as e:
            print(f"Auto-migration info: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
