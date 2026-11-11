import asyncio
from playwright.async_api import async_playwright

async def test_fetch():
    url = "https://www.google.com/maps/place/VUN/data=!4m7!3m6!1s0x31421789995743f9:0x9170e305938c3001!8m2!3d16.0506677!4d108.244274!16s%2Fg%2F11sstn61jy!19sChIJ-UNXmYkXQjERATCMkwXjcJE?authuser=0&hl=en"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        # intercept image responses
        captured_images = []
        page.on("response", lambda res: captured_images.append(res.url) if "googleusercontent.com" in res.url else None)
        
        print("Navigating...")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(4000)
        
        # Let's inspect images in DOM
        img_srcs = await page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img, button[jsaction*="pane.heroHeaderImage"] img, div[role="img"]'));
            return imgs.map(el => el.src || el.style.backgroundImage).filter(Boolean);
        }""")
        
        print(f"Captured network images ({len(captured_images)}):")
        for u in set(captured_images)[:5]:
            print("  NET:", u)
            
        print(f"DOM Image elements ({len(img_srcs)}):")
        for s in set(img_srcs)[:10]:
            print("  DOM:", s)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_fetch())
