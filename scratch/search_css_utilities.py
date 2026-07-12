import urllib.request
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

url = "http://localhost:5175/src/index.css"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
        content = response.read().decode('utf-8')
        
        # Look for some common tailwind v4 utility definitions
        search_terms = [
            ".bg-white",
            ".text-gray-900",
            ".flex",
            ".fixed",
            ".shadow-xl",
            ".animate-fadeIn"
        ]
        
        print("Checking for utility classes in CSS:")
        for term in search_terms:
            found = term in content
            print(f"Contains '{term}': {found}")
            
except Exception as e:
    print(f"Error: {e}")
