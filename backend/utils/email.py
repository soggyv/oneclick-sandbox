import os
import json
import logging
import urllib.request
import urllib.error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("uvicorn.error")

# Configuration from environment variables
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "mock").lower()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "OneClick <onboarding@resend.dev>")

# SMTP configuration (fallback option)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

async def send_email_via_urllib(url: str, headers: dict, payload: dict) -> dict:
    """Helper to send POST request using urllib in a threadpool to keep it async-safe."""
    def sync_send():
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            logger.error(f"HTTPError: {e.code} - {error_body}")
            raise Exception(f"Resend API error ({e.code}): {error_body}")
    
    return await asyncio.to_thread(sync_send)

def send_smtp_email_sync(to_email: str, subject: str, html_content: str):
    """Synchronous SMTP email sender."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email

    part = MIMEText(html_content, "html", "utf-8")
    msg.attach(part)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        if SMTP_PORT == 587:
            server.starttls()
        if SMTP_USERNAME and SMTP_PASSWORD:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())

async def send_otp_email(to_email: str, code: str) -> bool:
    """
    Sends a 4-digit email verification OTP code.
    Supports Resend API, SMTP, and falls back to console logging (Mock).
    """
    subject = "OneClick: Код підтвердження"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #FF5722; text-align: center;">OneClick Gig Platform</h2>
        <p style="font-size: 16px; color: #1f2937;">Вітаємо!</p>
        <p style="font-size: 16px; color: #1f2937;">Ви отримали цей лист, оскільки ініціювали вхід або реєстрацію в кабінеті роботодавця OneClick B2B.</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #4b5563; margin: 0 0 10px 0;">Ваш одноразовий код підтвердження:</p>
            <span style="font-size: 32px; font-weight: 800; color: #FF5722; letter-spacing: 4px;">{code}</span>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
            Якщо ви не здійснювали цей запит, просто проігноруйте цей лист.
        </p>
    </div>
    """

    # If mock or no credentials, log to terminal
    if EMAIL_PROVIDER == "mock" or (not RESEND_API_KEY and not SMTP_USERNAME):
        logger.info(f"\n========================================\n[EMAIL MOCK] Відправка листа на {to_email}:\nТема: {subject}\nКод: {code}\n========================================\n")
        return True

    try:
        if EMAIL_PROVIDER == "resend" and RESEND_API_KEY:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            payload = {
                "from": EMAIL_FROM,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            await send_email_via_urllib(url, headers, payload)
            logger.info(f"Email OTP successfully sent to {to_email} via Resend")
            return True

        elif EMAIL_PROVIDER == "smtp":
            await asyncio.to_thread(send_smtp_email_sync, to_email, subject, html_content)
            logger.info(f"Email OTP successfully sent to {to_email} via SMTP")
            return True

        else:
            logger.warning(f"Unknown email provider: {EMAIL_PROVIDER}. Falling back to console mock.")
            logger.info(f"\n========================================\n[EMAIL MOCK] Відправка листа на {to_email}:\nТема: {subject}\nКод: {code}\n========================================\n")
            return True

    except Exception as e:
        logger.error(f"Failed to send email OTP to {to_email}: {str(e)}")
        return False
