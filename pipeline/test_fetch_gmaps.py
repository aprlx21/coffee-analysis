import urllib.request
import re

url = 'https://www.google.com/maps/place/?q=place_id:ChIJ-UNXmYkXQjERATCMkwXjcJE'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
req = urllib.request.Request(url, headers=headers)
try:
    res = urllib.request.urlopen(req)
    html = res.read().decode('utf-8', errors='ignore')
    with open('pipeline/sample_place.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Downloaded HTML, length:", len(html))
    links = re.findall(r'https://[^"\'\s<>]+', html)
    google_links = [l for l in links if 'googleusercontent' in l]
    print(f"Total googleusercontent links: {len(google_links)}")
    for l in set(google_links):
        print(" ->", l)
except Exception as e:
    print("Error:", e)
