import subprocess
import os
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def main():
    print("Finding differences between current branch and dark-theme branch...")
    # Get the diff file list between current HEAD and dark-theme branch
    result = subprocess.run(["git", "diff", "--name-only", "HEAD", "dark-theme"], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if result.returncode != 0:
        print("Git diff failed:", result.stderr)
        return
        
    files = result.stdout.strip().split('\n')
    files = [f.strip() for f in files if f.strip()]
    
    if not files:
        print("No differences found between current branch and dark-theme branch.")
        return
        
    print(f"Applying dark-theme version of {len(files)} files directly to disk...")
    for file_path in files:
        # Avoid modifying .gitignore, database files, env files, or anything outside of source code unless needed
        if file_path.startswith("backend/venv") or file_path.startswith("node_modules") or file_path == "database.db":
            continue
            
        git_path = file_path.replace(os.sep, '/')
        print(f"Writing dark-theme version of: {file_path}")
        
        # Get content from dark-theme branch
        show_result = subprocess.run(["git", "show", f"dark-theme:{git_path}"], capture_output=True)
        if show_result.returncode == 0:
            # Ensure directories exist
            dir_name = os.path.dirname(file_path)
            if dir_name and not os.path.exists(dir_name):
                os.makedirs(dir_name, exist_ok=True)
                
            # Write to disk
            with open(file_path, "wb") as f:
                f.write(show_result.stdout)
        else:
            print(f"Error fetching {file_path} from dark-theme branch: {show_result.stderr.decode('utf-8', errors='ignore')}")
            
    print("\nDark theme files successfully applied to your local disk files!")

if __name__ == "__main__":
    main()
