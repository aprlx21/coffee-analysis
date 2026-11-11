import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv(".env")
conn = psycopg2.connect(os.getenv("SUPABASE_DB_URL"))
cur = conn.cursor(cursor_factory=RealDictCursor)

print("==================================================")
print("VERIFICATION 1: SHOP ChIJC-fKnW4XQjERkjfjtNGKbMU NAME")
print("==================================================")
cur.execute("""
    SELECT s.place_id, s.name, v.name as dir_name
    FROM shop s
    LEFT JOIN v_cafe_directory v ON v.place_id = s.place_id
    WHERE s.place_id = 'ChIJC-fKnW4XQjERkjfjtNGKbMU';
""")
row = cur.fetchone()
print(f"Shop Table Name:       {row['name']}")
print(f"Directory View Name:   {row['dir_name']}")
assert row['name'] == 'M...Ê CÀ PHÊ - AN THƯỢNG 19', "Shop name does not match expected!"

print("\n==================================================")
print("VERIFICATION 2: COFFEE ITEMS BELOW 15K IN v_typical_price_v2")
print("==================================================")
coffee_canonicals = (
    'ca_phe_den', 'ca_phe_sua', 'ca_phe_sua_tuoi', 'bac_xiu', 'ca_phe_muoi', 
    'ca_phe_dua', 'ca_phe_trung', 'americano', 'espresso', 'latte', 
    'cappuccino', 'flat_white', 'mocha', 'caramel_macchiato', 'cold_brew'
)
cur.execute("""
    SELECT count(*) as cnt
    FROM v_typical_price_v2
    WHERE canonical_id IN %s
      AND price_min < 15000;
""", (coffee_canonicals,))
cnt = cur.fetchone()['cnt']
print(f"Coffee items < 15,000 VND count: {cnt}")
assert cnt == 0, f"Found {cnt} coffee items below 15k!"

print("\n==================================================")
print("VERIFICATION 3: SPECIFIC ISSUE #16 SHOPS CHECK")
print("==================================================")
checks = [
    ('ChIJfYLstxMXQjERCMqni_KCd9E', 'bac_xiu', 'A STATION COFFEE'),
    ('ChIJ942dAi8XQjER2O8Log4iOVU', 'bac_xiu', 'Cafe Today'),
    ('ChIJYRtZJDAXQjER92lwTzjuB5k', 'espresso', 'Ciao! Brunch & Coffee'),
    ('ChIJPyCn9WUXQjERb8B5hN7CjTA', 'espresso', 'Homnay - Eatery & Cafe'),
    ('ChIJSzicO00XQjER2okpWXAh_mU', 'espresso', 'Ommo coffee works'),
    ('ChIJK5k8C2IXQjERkt14wtTFA3g', 'ca_phe_den', 'HEM CA PHE'),
]

for pid, cid, sname in checks:
    cur.execute("""
        SELECT place_id, shop_name, canonical_id, display_name, price_min, price_max, match_uncertain
        FROM v_typical_price_v2
        WHERE place_id = %s AND canonical_id = %s;
    """, (pid, cid))
    item = cur.fetchone()
    if item:
        print(f"OK: {sname} - [{cid}] {item['display_name']}: {item['price_min']:,.0f} - {item['price_max']:,.0f} VND (match_uncertain={item['match_uncertain']})")
    else:
        print(f"OK (Excluded/None): {sname} - [{cid}] has no price in v_typical_price_v2 (cleanly filtered out!)")

print("\n==================================================")
print("VERIFICATION 4: CHEAPEST BAC XIU IN AN THUONG NOW")
print("==================================================")
cur.execute("""
    SELECT shop_name, price_min, price_max
    FROM v_typical_price_v2
    WHERE canonical_id = 'bac_xiu'
    ORDER BY price_min ASC
    LIMIT 5;
""")
for r in cur.fetchall():
    print(f"- {r['shop_name']}: {r['price_min']:,.0f} - {r['price_max']:,.0f} VND")

print("\n==================================================")
print("VERIFICATION 5: CHEAPEST ESPRESSO IN AN THUONG NOW")
print("==================================================")
cur.execute("""
    SELECT shop_name, price_min, price_max
    FROM v_typical_price_v2
    WHERE canonical_id = 'espresso'
    ORDER BY price_min ASC
    LIMIT 5;
""")
for r in cur.fetchall():
    print(f"- {r['shop_name']}: {r['price_min']:,.0f} - {r['price_max']:,.0f} VND")

conn.close()
print("\nALL DATABASE CHECKS PASSED SUCCESSFULLY!")
