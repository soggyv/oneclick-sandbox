import sys
import asyncio
import os
from sqlalchemy.future import select

# Adjust sys.path to resolve backend package correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import async_session
from backend.models import User, Company

async def delete_user(email: str):
    async with async_session() as db:
        # Find user
        stmt = select(User).where(User.email == email)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            print(f"❌ Користувача з email '{email}' не знайдено.")
            return

        # If user has a company, delete it too
        if hasattr(user, 'company_id') and user.company_id:
            comp_stmt = select(Company).where(Company.id == user.company_id)
            comp_res = await db.execute(comp_stmt)
            company = comp_res.scalar_one_or_none()
            if company:
                await db.delete(company)
                print(f"🗑️ Компанію '{company.name}' видалено.")

        await db.delete(user)
        await db.commit()
        print(f"🗑️ Користувача '{user.name}' ({email}) успішно видалено з бази даних!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Використання: python delete_user.py <email>")
        sys.exit(1)
    
    email_to_delete = sys.argv[1]
    asyncio.run(delete_user(email_to_delete))
