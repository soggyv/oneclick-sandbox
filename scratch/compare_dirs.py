import os
import filecmp

dir1 = r"c:\Users\sogggyv\Desktop\OneClick"
dir2 = r"c:\Users\sogggyv\Desktop\OneClick_Hetzner_Backup"

ignore = {
    ".git",
    "node_modules",
    "venv",
    "__pycache__",
    "dist",
    "database.db",
    "scratch",
    "tsconfig.tsbuildinfo"
}

def compare_dirs(d1, d2):
    dcmp = filecmp.dircmp(d1, d2, ignore=list(ignore))
    
    # Files only in local workspace
    for name in dcmp.left_only:
        print(f"Only in local workspace: {os.path.join(d1, name)}")
        
    # Files only in Hetzner backup
    for name in dcmp.right_only:
        print(f"Only on Hetzner: {os.path.join(d2, name)}")
        
    # Differing files
    for name in dcmp.diff_files:
        print(f"File differs: {name}")
        
    # Recurse into common directories
    for name, sub_dcmp in dcmp.subdirs.items():
        compare_sub_dirs(os.path.join(d1, name), os.path.join(d2, name), sub_dcmp)

def compare_sub_dirs(d1, d2, dcmp):
    for name in dcmp.left_only:
        print(f"Only in local workspace: {os.path.join(d1, name)}")
    for name in dcmp.right_only:
        print(f"Only on Hetzner: {os.path.join(d2, name)}")
    for name in dcmp.diff_files:
        print(f"File differs: {os.path.join(d1, name)}")
    for name, sub_dcmp in dcmp.subdirs.items():
        compare_sub_dirs(os.path.join(d1, name), os.path.join(d2, name), sub_dcmp)

print("Comparing local workspace with Hetzner backup...")
compare_dirs(dir1, dir2)
print("Comparison done.")
