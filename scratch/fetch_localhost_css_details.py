import urllib.request
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

url = "http://localhost:5173/src/index.css"
print(f"Fetching {url}...")
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
        content = response.read().decode('utf-8')
        print(f"Content-Length: {len(content)}")
        print("First 1000 characters:")
        print(content[:1000])
        print("...")
        print("Last 500 characters:")
        print(content[-500:])
except Exception as e:
    print(f"Error: {e}")
