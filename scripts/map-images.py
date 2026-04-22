import re
import sys

html = open(r'C:\Users\asoha\AppData\Local\Temp\aso-home.html', encoding='utf-8', errors='ignore').read()
pat1 = re.compile(r'<img[^>]*?(?:src|data-src|srcset)="(https://static\.wixstatic\.com/media/[^"\s,]+)"[^>]*?alt="([^"]*)"', re.IGNORECASE|re.DOTALL)
pat2 = re.compile(r'<img[^>]*?alt="([^"]*)"[^>]*?(?:src|data-src)="(https://static\.wixstatic\.com/media/[^"\s,]+)"', re.IGNORECASE|re.DOTALL)
seen = {}
for m in pat1.finditer(html):
    url, alt = m.group(1), m.group(2).strip()
    base = url.split('/v1/')[0].split('/fill/')[0].split('?')[0]
    seen.setdefault(base, alt[:80])
for m in pat2.finditer(html):
    alt, url = m.group(1).strip(), m.group(2)
    base = url.split('/v1/')[0].split('/fill/')[0].split('?')[0]
    seen.setdefault(base, alt[:80])
for u, a in seen.items():
    sys.stdout.write(a + " ||| " + u + "\n")
