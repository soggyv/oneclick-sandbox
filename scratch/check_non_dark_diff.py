import subprocess
import re

def main():
    print("Analyzing git diff to see if there are any non-dark-theme differences...")
    # Get git diff
    result = subprocess.run(["git", "diff"], capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if result.returncode != 0:
        print("Git diff failed:", result.stderr)
        return
        
    diff_output = result.stdout
    
    # We want to parse the diff and find blocks that don't look like they are just adding dark mode.
    # A dark mode line usually contains: "dark:", "theme", "toggleTheme", "Moon", "Sun", "dark-bg", "dark-card", "dark-text", "dark-border"
    dark_pattern = re.compile(r'(dark:|theme|toggleTheme|Moon|Sun|dark-bg|dark-card|dark-text|dark-border|dark-card-hover)', re.IGNORECASE)
    
    lines = diff_output.split('\n')
    current_file = ""
    changed_blocks = []
    current_block = []
    
    for line in lines:
        if line.startswith('diff --git'):
            if current_block:
                changed_blocks.append((current_file, current_block))
                current_block = []
            current_file = line.split(' ')[-1]
        elif line.startswith('+ ') or line.startswith('- '):
            content = line[2:]
            # If the change does not contain any dark theme keywords
            if not dark_pattern.search(content) and content.strip():
                current_block.append(line)
                
    if current_block:
        changed_blocks.append((current_file, current_block))
        
    print(f"Found {len(changed_blocks)} files with potential non-dark-theme differences:")
    for file, block in changed_blocks:
        if len(block) > 0:
            print(f"\n--- File: {file} ---")
            for l in block[:20]:
                print(l)
            if len(block) > 20:
                print(f"... and {len(block) - 20} more lines")

if __name__ == "__main__":
    main()
