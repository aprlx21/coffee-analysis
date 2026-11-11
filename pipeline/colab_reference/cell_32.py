import re
DRINK_KW = ["ca phe", "cafe", "caphe", "cf", "coffee", "espresso", "americano", "latte", "cappuccino",
            "capuchino", "macchiato", "mocha", "cold brew", "coldbrew", "flat white", "bac xiu", "bac siu",
            "tra", "tea", "matcha", "sinh to", "smoothie", "nuoc", "juice", "soda", "sua", "milk",
            "da xay", "frappe", "freeze", "cacao", "cocoa", "chocolate", "yaourt", "yogurt", "ep",
            "cocktail", "mojito", "beer", "bia", "ruou", "wine", "detox"]

FOOD_KW = ["com", "bun", "pho", "mi", "mien", "hu tieu", "banh", "goi", "xoi", "chao", "lau", "nuong",
           "chien", "xao", "kho", "hap", "luoc", "ga", "vit", "heo", "bo", "tom", "muc", "suon", "cha",
           "nem", "cuon", "xuc xich", "khoai tay", "khoai lang", "pizza", "pasta", "spaghetti", "burger",
           "hamburger", "sandwich", "salad", "steak", "hot dog", "op la", "trung chien", "bit tet",
           "sushi", "ramen", "dim sum", "dimsum", "snack", "sup", "soup", "canh", "dau hu", "oc", "ech"]

def _pat(words):
    ws = sorted(set(words), key=len, reverse=True)
    return re.compile(r"(?<![a-z0-9])(?:" + "|".join(re.escape(w) for w in ws) + r")(?![a-z0-9])")

DRINK_RE, FOOD_RE = _pat(DRINK_KW), _pat(FOOD_KW)

def loai(name_norm, canonical_id, score):
    if DRINK_RE.search(name_norm): return "drink"
    if canonical_id and (score or 0) >= 90: return "drink"
    if FOOD_RE.search(name_norm): return "food"
    if canonical_id: return "drink"          # khớp từ điển điểm thấp, không có từ khoá món ăn
    return "unknown"