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
    print("Obtaining list of modified files in working directory...")
    # Run git status to see which files are modified
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if result.returncode != 0:
        print("Git status failed:", result.stderr)
        return
        
    lines = result.stdout.strip().split('\n')
    modified_files = []
    for line in lines:
        if line.startswith(' M') or line.startswith('M '):
            # Get the path (strip status characters)
            path = line[3:].strip().strip('"')
            # Normalize path separators
            path = os.path.normpath(path)
            # Only restore files inside src/ and core configuration files (like index.css, config files)
            # Ignore .env or database.db to avoid resetting credentials/data
            if path.startswith("src") or path.endswith("index.css") or path.endswith("useStore.js"):
                modified_files.append(path)
                
    if not modified_files:
        print("No modified frontend files to restore.")
        return
        
    print(f"Found {len(modified_files)} frontend files to restore from HEAD (dark theme):")
    for file_path in modified_files:
        print(f"Restoring {file_path} from HEAD...")
        # Get content from git HEAD using git show
        git_path = file_path.replace(os.sep, '/')
        show_result = subprocess.run(["git", "show", f"HEAD:{git_path}"], capture_output=True)
        if show_result.returncode == 0:
            # Write to disk
            with open(file_path, "wb") as f:
                f.write(show_result.stdout)
            print(f"Successfully restored: {file_path}")
        else:
            print(f"Failed to restore {file_path}: {show_result.stderr.decode('utf-8', errors='ignore')}")

if __name__ == "__main__":
    main()
