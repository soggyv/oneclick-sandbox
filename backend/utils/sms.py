import os
import json
import logging
import urllib.request
import urllib.error
import asyncio

try:
    from dotenv import load_dotenv
    # Load .env.local from workspace root first
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("uvicorn.error")

# Configuration from environment variables
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "mock").lower()
SMS_API_TOKEN = os.getenv("SMS_API_TOKEN", "")
SMS_SENDER = os.getenv("SMS_SENDER", "OneClick")

async def send_sms_via_urllib(url: str, headers: dict, payload: dict) -> dict:
    """Helper to send POST request using urllib in a separate thread to keep it async-safe."""
    def sync_send():
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8'))
    
    return await asyncio.to_thread(sync_send)

async def send_otp_sms(phone: str, code: str) -> bool:
    """
    Sends a 4-digit OTP code to the given Ukrainian phone number.
    Supports TurboSMS, SMS Club, and falls back to console logging (Mock).
    """
    # Clean phone number (needs to be in format 380XXXXXXXXX for UA operators)
    cleaned_phone = "".join(filter(str.isdigit, phone))
    if not cleaned_phone.startswith("380") and len(cleaned_phone) == 9:
        cleaned_phone = "380" + cleaned_phone
    
    message_text = f"OneClick: Ваш код підтвердження: {code}"

    # If mock or no token is provided, fall back to console print
    if SMS_PROVIDER == "mock" or not SMS_API_TOKEN:
        logger.info(f"\n========================================\n[SMS MOCK] Відправка SMS на {phone}:\nТекст: {message_text}\n========================================\n")
        return True

    try:
        if SMS_PROVIDER == "turbosms":
            url = "https://api.turbosms.ua/message/send.json"
            headers = {
                "Authorization": f"Bearer {SMS_API_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "recipients": [cleaned_phone],
                "sms": {
                    "sender": SMS_SENDER,
                    "text": message_text
                }
            }
            res = await send_sms_via_urllib(url, headers, payload)
            # TurboSMS returns response_code 0 or 800 on success
            if res.get("response_code") in [0, 800]:
                logger.info(f"SMS successfully sent to {phone} via TurboSMS")
                return True
            else:
                logger.error(f"TurboSMS returned error: {res}")
                return False

        elif SMS_PROVIDER == "smsclub":
            url = "https://im.smsclub.mobi/sms/send"
            headers = {
                "Authorization": f"Bearer {SMS_API_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "phone": [cleaned_phone],
                "message": message_text,
                "src_addr": SMS_SENDER
            }
            res = await send_sms_via_urllib(url, headers, payload)
            if "info" in res:
                logger.info(f"SMS successfully sent to {phone} via SMS Club")
                return True
            else:
                logger.error(f"SMS Club returned error: {res}")
                return False

        else:
            logger.warning(f"Unknown SMS provider: {SMS_PROVIDER}. Falling back to console mock.")
            logger.info(f"\n========================================\n[SMS MOCK] Відправка SMS на {phone}:\nТекст: {message_text}\n========================================\n")
            return True

    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else ""
        logger.error(f"HTTP error sending SMS via {SMS_PROVIDER}: {e.code} {e.reason} - {error_body}")
        return False
    except Exception as e:
        logger.error(f"Failed to send SMS via {SMS_PROVIDER}: {str(e)}")
        return False
