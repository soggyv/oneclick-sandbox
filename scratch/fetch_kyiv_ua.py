import urllib.request
import re
import sys
import ssl

# Disable SSL verification for testing if there's a cert issue
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

url = "https://oneclick.kyiv.ua/"
print(f"Fetching: {url}")
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode('utf-8')
        print(f"HTML Length: {len(html)}")
        # Look for CSS
        css_links = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', html)
        print("CSS Links found:", css_links)
        for css in css_links:
            css_url = url + css.lstrip('/')
            print(f"Fetching CSS: {css_url}")
            try:
                with urllib.request.urlopen(css_url, context=ctx, timeout=5) as css_res:
                    css_content = css_res.read().decode('utf-8')
                    print(f"CSS Length: {len(css_content)}")
                    print("CSS Start:")
                    print(css_content[:150])
            except Exception as e:
                print(f"Error fetching CSS {css_url}: {e}")
except Exception as e:
    print(f"Error fetching {url}: {e}")
