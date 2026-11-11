import json, os
print("Thư mục hiện tại:", os.getcwd())      # nên là /content/drive/MyDrive/menu_ocr
if not os.path.exists("extra_aliases.json"): # chỉ tạo lần đầu, không ghi đè bản bạn đã sửa
    extra = {
     "ca_phe_den":   {"aliases": ["phin den", "den phin", "cf den da", "cafe den da"]},
     "ca_phe_sua":   {"aliases": ["phin sua", "cf sua da", "nau"]},
     "ca_phe_sua_tuoi": {"display": "Cà phê sữa tươi", "aliases": ["ca phe sua tuoi", "cafe sua tuoi"]},
     "mocha":        {"display": "Mocha", "aliases": ["mocha", "cafe mocha", "ca phe mocha"]},
     "caramel_macchiato": {"display": "Caramel macchiato", "aliases": ["caramel macchiato", "macchiato caramel"]},
     "tra_chanh":    {"display": "Trà chanh", "aliases": ["tra chanh", "lemon tea", "tra chanh da"]},
     "tra_tac":      {"display": "Trà tắc", "aliases": ["tra tac", "tra quat", "kumquat tea"]},
     "tra_sua_tran_chau": {"display": "Trà sữa trân châu", "aliases": ["tra sua tran chau", "tra sua", "milk tea", "bubble tea"]},
     "tra_sen_vang": {"display": "Trà sen vàng", "aliases": ["tra sen vang"]},
     "hong_tra":     {"display": "Hồng trà", "aliases": ["hong tra", "black tea"]},
     "tra_xanh":     {"display": "Trà xanh", "aliases": ["tra xanh", "green tea"]},
     "cacao":        {"display": "Cacao", "aliases": ["cacao", "cacao da", "cocoa"]},
     "sua_chua":     {"display": "Sữa chua", "aliases": ["sua chua", "yaourt", "yogurt"]},
     "sinh_to_xoai": {"display": "Sinh tố xoài", "aliases": ["sinh to xoai", "mango smoothie"]},
     "sinh_to_dau":  {"display": "Sinh tố dâu", "aliases": ["sinh to dau", "strawberry smoothie"]},
     "soda_chanh":   {"display": "Soda chanh", "aliases": ["soda chanh", "chanh soda", "lemon soda"]},
     "nuoc_dua":     {"display": "Nước dừa", "aliases": ["nuoc dua", "dua tuoi", "coconut water"]},
     "chanh_day":    {"display": "Chanh dây", "aliases": ["chanh day", "nuoc chanh day", "passion fruit juice"]},
    }
    json.dump(extra, open("extra_aliases.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("OK, file có:", os.path.exists("extra_aliases.json"))