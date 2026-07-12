import urllib.request
import re
import sys

# Ensure UTF-8 output encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

url = "http://188.245.35.229/"
print(f"Fetching Hetzner home page: {url}")
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8')
        print(f"HTML Content-Length: {len(html)}")
        
        # Look for stylesheet links
        css_links = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', html)
        print("CSS Links found:", css_links)
        
        for css in css_links:
            css_url = url + css.lstrip('/')
            print(f"Fetching CSS asset: {css_url}")
            try:
                with urllib.request.urlopen(css_url, timeout=5) as css_res:
                    css_content = css_res.read().decode('utf-8')
                    print(f"CSS Status: 200, Content-Length: {len(css_content)}")
                    print("First 100 chars of CSS:")
                    print(css_content[:100])
            except Exception as css_err:
                print(f"Error fetching CSS asset: {css_err}")
except Exception as e:
    print(f"Error fetching Hetzner: {e}")
