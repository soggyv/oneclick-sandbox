import os
import sys
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
PASSWORD = "OneClick@2026!Password"  # the password from deploy.py

IGNORE_LIST = {
    "node_modules",
    "venv",
    "__pycache__",
    ".git",
    "dist",
    "database.db"
}

def connect_ssh(ip, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ip, username=user, password=password, timeout=15)
    return client

def download_dir(sftp, remote_path, local_path):
    try:
        os.makedirs(local_path, exist_ok=True)
    except Exception as e:
        pass
        
    try:
        for item in sftp.listdir_attr(remote_path):
            name = item.filename
            if name in IGNORE_LIST:
                continue
            
            remote_item = remote_path + "/" + name
            local_item = os.path.join(local_path, name)
            
            # Check if directory
            import stat
            if stat.S_ISDIR(item.st_mode):
                download_dir(sftp, remote_item, local_item)
            else:
                print(f"Downloading: {name} from {remote_item}")
                sftp.get(remote_item, local_item)
    except Exception as e:
        print(f"Error listing/downloading {remote_path}: {e}")

def main():
    print("Connecting to the Hetzner server...")
    try:
        client = connect_ssh(IP, USER, PASSWORD)
        print("Successfully connected!")
    except Exception as e:
        print(f"Could not connect: {e}")
        sys.exit(1)
        
    sftp = client.open_sftp()
    remote_dir = "/var/www/oneclick"
    local_dir = r"c:\Users\sogggyv\Desktop\OneClick_Hetzner_Backup"
    
    print(f"Starting download from {remote_dir} to {local_dir}...")
    download_dir(sftp, remote_dir, local_dir)
    sftp.close()
    client.close()
    print("Download completed successfully!")

if __name__ == "__main__":
    main()
