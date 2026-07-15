import os
import sys
import stat
import paramiko

# Ensure UTF-8 output encoding for Windows console to prevent UnicodeEncodeError
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

IP = "188.245.35.229"
USER = "root"
PASSWORD = "OneClick@2026!Password"

IGNORE_LIST = {
    "node_modules",
    "venv",
    "__pycache__",
    ".git",
    ".pytest_cache",
    "database.db"
}

def connect_ssh(ip, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ip, username=user, password=password, timeout=15)
    return client

def ensure_remote_dir(sftp, remote_path):
    dirs = []
    parts = remote_path.split('/')
    for i in range(1, len(parts) + 1):
        p = '/'.join(parts[:i])
        if p and p != '/':
            dirs.append(p)
            
    for d in dirs:
        try:
            sftp.stat(d)
        except IOError:
            print(f"Creating remote directory: {d}")
            sftp.mkdir(d)

def upload_dir(sftp, local_path, remote_path):
    ensure_remote_dir(sftp, remote_path)
    
    for item in os.listdir(local_path):
        if item in IGNORE_LIST:
            continue
            
        local_item = os.path.join(local_path, item)
        remote_item = remote_path.rstrip('/') + '/' + item
        
        if os.path.isdir(local_item):
            upload_dir(sftp, local_item, remote_item)
        else:
            print(f"Uploading: {local_item} -> {remote_item}")
            try:
                sftp.put(local_item, remote_item)
            except Exception as e:
                print(f"Failed to upload {local_item}: {e}")

def main():
    print("Connecting to the Hetzner server...")
    try:
        client = connect_ssh(IP, USER, PASSWORD)
        print("Successfully connected via SSH!")
    except Exception as e:
        print(f"Could not connect to server: {e}")
        sys.exit(1)
        
    sftp = client.open_sftp()
    
    # 1. Upload built frontend dist
    print("\n--- Uploading Frontend Dist ---")
    local_dist = r"c:\Users\sogggyv\Desktop\OneClick\dist"
    remote_dist = "/var/www/oneclick/dist"
    if os.path.exists(local_dist):
        upload_dir(sftp, local_dist, remote_dist)
    else:
        print("Warning: local 'dist' folder not found. Run npm run build first!")
        
    # 2. Upload backend folder
    print("\n--- Uploading Backend ---")
    local_backend = r"c:\Users\sogggyv\Desktop\OneClick\backend"
    remote_backend = "/var/www/oneclick/backend"
    if os.path.exists(local_backend):
        upload_dir(sftp, local_backend, remote_backend)
        
    sftp.close()
    
    # 3. Run migrations and restart service
    print("\n--- Running post-upload commands on host ---")
    commands = [
        "cd /var/www/oneclick/backend && venv/bin/alembic upgrade head",
        "systemctl restart oneclick-backend",
        "systemctl status oneclick-backend --no-pager"
    ]
    
    for cmd in commands:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out)
        if err:
            print("STDERR:", err)
            
    client.close()
    print("\nDeployment completed successfully!")

if __name__ == "__main__":
    main()
