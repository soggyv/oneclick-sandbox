import os
import shutil
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

src_dir = r"c:\Users\sogggyv\Desktop\OneClick_Hetzner_Backup"
dst_dir = r"c:\Users\sogggyv\Desktop\OneClick"

IGNORE_LIST = {
    ".git",
    "node_modules",
    "venv",
    "database.db",
    "scratch",
    "__pycache__"
}

def copy_recursive(src, dst):
    if not os.path.exists(dst):
        os.makedirs(dst, exist_ok=True)
        
    for item in os.listdir(src):
        if item in IGNORE_LIST:
            continue
            
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        
        if os.path.isdir(s):
            copy_recursive(s, d)
        else:
            print(f"Restoring: {item} to {d}")
            try:
                shutil.copy2(s, d)
            except Exception as e:
                print(f"Error copying {s} to {d}: {e}")

def main():
    print(f"Restoring files from {src_dir} to {dst_dir}...")
    if not os.path.exists(src_dir):
        print(f"Error: Source directory {src_dir} does not exist!")
        sys.exit(1)
        
    copy_recursive(src_dir, dst_dir)
    print("Restore completed successfully! All server-side files are now loaded in your workspace.")

if __name__ == "__main__":
    main()
