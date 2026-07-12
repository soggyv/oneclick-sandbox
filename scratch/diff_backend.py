import os
import difflib

dir_local = r"c:\Users\sogggyv\Desktop\OneClick"
dir_backup = r"c:\Users\sogggyv\Desktop\OneClick_Hetzner_Backup"

files_to_check = [
    "backend/alembic/env.py",
    "backend/alembic/script.py.mako"
]

def show_diff(file_rel_path):
    path_local = os.path.join(dir_local, file_rel_path)
    path_backup = os.path.join(dir_backup, file_rel_path)
    
    if not os.path.exists(path_backup):
        print(f"Only in local: {file_rel_path}")
        return
        
    with open(path_local, 'r', encoding='utf-8', errors='ignore') as f1:
        lines_local = f1.readlines()
    with open(path_backup, 'r', encoding='utf-8', errors='ignore') as f2:
        lines_backup = f2.readlines()
        
    diff = list(difflib.unified_diff(
        lines_backup, lines_local,
        fromfile=f"backup/{file_rel_path}",
        tofile=f"local/{file_rel_path}",
        n=2
    ))
    
    if diff:
        print(f"\nDiff for {file_rel_path}:")
        for line in diff:
            print(line.rstrip())

for f in files_to_check:
    show_diff(f)
