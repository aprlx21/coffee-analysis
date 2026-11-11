os.makedirs("cache", exist_ok=True)
HDR = {"User-Agent": "Mozilla/5.0"}

def fetch_image(url, timeout=15):
    cands = [re.sub(r"=[wsh]\d+.*$", "=s2000", url), url]
    for u in dict.fromkeys(cands):
        try:
            r = requests.get(u, headers=HDR, timeout=timeout)
            if r.ok:
                img = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_COLOR)
                if img is not None: return img
        except requests.RequestException:
            pass
    return None

def ocr_image(url):
    """-> (boxes, status, seconds). Cache theo sha1(url)."""
    cp = f"cache/{sha1(url)}.json"
    if os.path.exists(cp):
        d = json.load(open(cp)); return d["boxes"], d["status"], d["seconds"]
    t = time.time()
    img = fetch_image(url)
    if img is None:
        return [], "download_failed", time.time() - t
    try:
        boxes = engine(preprocess(img, 1800))
        status = "ok"
    except Exception as e:
        print("OCR lỗi:", e); boxes, status = [], "ocr_failed"
    sec = time.time() - t
    json.dump(dict(boxes=boxes, status=status, seconds=sec), open(cp, "w"))
    return boxes, status, sec

def shop_images(row):
    def j(x):
        try: return json.loads(x)
        except Exception: return []
    imgs = j(row.get("menu_photos"))
    imgs.sort(key=lambda p: 0 if re.search(r"menu|menyu|thuc don|thực đơn", p.get("about",""), re.I) else 1)
    return imgs

def process_shop(row, con=None, max_images=8, want_pages=3, budget_s=60):
    t0, pages, all_items = time.time(), 0, []
    for p in shop_images(row)[:max_images]:
        if pages >= want_pages or time.time() - t0 > budget_s: break
        url = p["link"]
        iid = register_image(con, row["place_id"], url, p.get("about"), p.get("published_at_date"))[0] if con else None
        boxes, status, sec = ocr_image(url)
        if status != "ok":
            if con: save_image_result(con, iid, row["place_id"], status, 0, [], sec)
            continue
        bare_k = decide_bare_is_k(boxes)
        items, _ = extract_items(boxes, bare_is_k=bare_k)
        items = finalize(items)
        ok = is_menu_like(boxes, items)
        if con: save_image_result(con, iid, row["place_id"], "ok" if ok else "not_menu", len(boxes), items if ok else [], sec, int(ok))
        if ok:
            pages += 1
            for it in items: it.update(image_url=url, photo_date=p.get("published_at_date"))
            all_items += items
    # gộp trùng giữa các trang
    best = {}
    for it in all_items:
        k = (it["name_norm"], tuple(it["prices"]))
        if k not in best or it["ocr_conf"] > best[k]["ocr_conf"]: best[k] = it
    return list(best.values()), pages, time.time() - t0