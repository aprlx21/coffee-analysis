import urllib.request
import re

url = "https://www.google.com/maps/place/data=!3m1!4b1!4m2!3m1!1s0x31421789995743f9:0x9170e305938c3001"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")
found = re.findall(r"https://lh\d\.googleusercontent\.com/[^\s\"\'\\]+", html)
print("Found count:", len(found))
for f in found[:5]:
    print("Link:", f)
