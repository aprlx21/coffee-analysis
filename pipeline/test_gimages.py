import urllib.request
import urllib.parse
import re

url = 'https://www.google.com/search?tbm=isch&q=' + urllib.parse.quote('VUN coffee Ngo Thi Si Da Nang')
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
matches = re.findall(r'https://encrypted-tbn0\.gstatic\.com/images\?q=tbn:[^\s"\'\\]+', html)
print('matches count:', len(matches))
for m in matches[:5]:
    print('img:', m)
