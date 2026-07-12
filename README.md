# OneClick — Платформа Швидкого Волонтерства

**OneClick** — це сучасна двостороння платформа (B2C + B2B) для швидкого пошуку та координації волонтерської допомоги.

*   **Для волонтерів (B2C):** Пошук разових змін, відгуки в один клік, підтвердження присутності на місці за допомогою унікальних QR-кодів або 6-значних кодів та накопичення рейтингу.
*   **Для організаторів (B2B):** Створення та керування змінами, відбір кандидатів, фіксація явки волонтерів, оцінювання їхньої роботи та командна співпраця всередині організації.

---

## 🚀 Швидкий запуск в розробці (Local Development)

### 1. Вимоги (Prerequisites)
*   **Node.js** (версії 18+)
*   **Python** (версії 3.10+)

### 2. Налаштування Бекенду (FastAPI)
1. Перейдіть до папки `backend`:
   ```bash
   cd backend
   ```
2. Створіть та активуйте віртуальне середовище:
   ```bash
   python -m venv venv
   # Для Windows:
   .\venv\Scripts\activate
   # Для macOS/Linux:
   source venv/bin/activate
   ```
3. Встановіть залежності:
   ```bash
   pip install -r requirements.txt
   ```
4. Налаштуйте конфігурацію. Створіть `.env.local` у корені проекту (див. розділ "Конфігурація").
5. Запустіть міграції бази даних (SQLite за замовчуванням у розробці):
   ```bash
   alembic upgrade head
   ```
6. Запустіть сервер розробки:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Налаштування Фронтенду (React + Vite)
1. Поверніться до кореня проекту та встановіть npm-пакети:
   ```bash
   npm install
   ```
2. Запустіть Vite dev-сервер:
   ```bash
   npm run dev
   ```
3. Фронтенд буде доступний за адресою `http://localhost:5173`. Він автоматично надсилатиме запити на локальний бекенд `http://localhost:8000/api`.

---

## ⚙️ Конфігурація (Environment Variables)

Створіть файл `.env.local` у корені проекту для локальної розробки та `.env` для продакшну (Docker). Приклад конфігурації міститься у `.env.example`:

```env
# Google OAuth Client ID для реєстрації та входу
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Налаштування Email для відправки OTP кодів (SMTP)
EMAIL_PROVIDER=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=OneClick <your_gmail@gmail.com>

# Безпека
JWT_SECRET=super-secret-key-12345
ALLOWED_ORIGINS=http://localhost,http://localhost:5173,http://localhost:8000

# Для продакшн бази даних PostgreSQL (використовується в Docker Compose)
DB_USER=oneclick_user
DB_PASSWORD=secure_password_here
DB_NAME=oneclick_prod
```

> [!NOTE]
> Якщо змінні SMTP не налаштовані, бекенд симулюватиме відправку OTP-кодів та виводитиме їх безпосередньо у консоль (stdout), що спрощує локальне тестування.

---

## 🐳 Деплой та запуск на продакшні (Docker Compose)

Проект повністю контейнеризований та готовий до деплою на будь-який VPS/VDS за допомогою Docker Compose. Архітектура складається з трьох сервісів:
1.  **db** — база даних PostgreSQL 15 з персистентним томом.
2.  **backend** — FastAPI додаток, що виконує міграції при старті та обслуговує API.
3.  **frontend** — React додаток, зібраний для продакшну та запущений під керуванням Nginx, який також проксіює запити `/api/` та `/static/` на бекенд (що вирішує будь-які проблеми з CORS).

### Команди для запуску:

1. Переконайтеся, що ви налаштували змінні оточення у файлі `.env` у корені проекту.
2. Запустіть збірку та старт усіх контейнерів у фоновому режимі:
   ```bash
   docker compose up -d --build
   ```
3. Перевірити статус контейнерів:
   ```bash
   docker compose ps
   ```
4. Перегляд логів (наприклад, для отримання OTP-кодів при відсутності SMTP):
   ```bash
   docker compose logs -f backend
   ```
5. Зупинка сервісів:
   ```bash
   docker compose down
   ```

---

## 🛠️ Робота з міграціями (Alembic)

У проекті налаштовано декларативне керування базою даних за допомогою Alembic.

*   **Створення нової міграції** (після зміни моделей у `backend/models.py`):
    ```bash
    cd backend
    alembic revision --autogenerate -m "опис_змін"
    ```
*   **Застосування останніх міграцій**:
    ```bash
    alembic upgrade head
    ```
*   **Відкат останньої міграції**:
    ```bash
    alembic downgrade -1
    ```
