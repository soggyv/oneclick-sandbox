import socket
import time
import subprocess
import os

DOMAIN = "oneclick.kyiv.ua"
WWW_DOMAIN = "www.oneclick.kyiv.ua"
IP = "188.245.35.229"
EMAIL = "crakudssemmou3408@gmail.com"

print("Starting background DNS poll for domain:", DOMAIN)

while True:
    try:
        resolved_ip = socket.gethostbyname(DOMAIN)
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Resolved {DOMAIN} to {resolved_ip}")
        if resolved_ip == IP:
            print("DNS matched! Installing certbot and issuing SSL certificate...")
            
            # Install certbot
            subprocess.run(["apt-get", "update"], check=True)
            subprocess.run(["apt-get", "install", "-y", "certbot", "python3-certbot-nginx"], check=True)
            
            # Request SSL certificate
            cmd = [
                "certbot", "--nginx", 
                "-d", DOMAIN, 
                "-d", WWW_DOMAIN, 
                "--non-interactive", 
                "--agree-tos", 
                "-m", EMAIL, 
                "--redirect"
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            print("Certbot Output:", res.stdout)
            print("Certbot Error:", res.stderr)
            
            if res.returncode == 0:
                print("SSL certificate configured successfully!")
                break
            else:
                print("Certbot returned non-zero code. Retrying in 60s...")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Resolution failed: {e}")
        
    time.sleep(30)
