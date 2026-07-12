import urllib.request
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

urls = [
    "http://localhost:5173/src/index.css",
    "http://localhost:5175/src/index.css"
]

for url in urls:
    print(f"\nFetching {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            content = response.read().decode('utf-8')
            print(f"Content-Length: {len(content)}")
            print("First 200 chars:")
            print(content[:200])
            print("Contains @import 'tailwindcss'?:", "@import \"tailwindcss\"" in content or "@import 'tailwindcss'" in content)
    except Exception as e:
        print(f"Error: {e}")
