import re
with open('pipeline/sample_place.html', 'r', encoding='utf-8') as f:
    s = f.read()

print('Has APP_INITIALIZATION_STATE:', 'APP_INITIALIZATION_STATE' in s)
for m in re.finditer(r'https?://[^\",\s\\]+', s):
    url = m.group(0)
    if any(k in url for k in ['photo', 'image', 'ggpht', 'googleusercontent']):
        print(url)
