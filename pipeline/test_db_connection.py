# -*- coding: utf-8 -*-
"""test_db_connection.py - Kiểm tra kết nối tới Supabase PostgreSQL.
Đọc connection string từ file .env (ở thư mục gốc hoặc pipeline/.env).
"""
import os
import sys
import time
from pathlib import Path

# Load .env
try:
    from dotenv import load_dotenv
    # Tìm .env ở root hoặc trong pipeline/
    root_env = Path(__file__).resolve().parent.parent / ".env"
    pipeline_env = Path(__file__).resolve().parent / ".env"
    
    if root_env.exists():
        load_dotenv(root_env)
        print(f"Loaded environment from: {root_env}")
    elif pipeline_env.exists():
        load_dotenv(pipeline_env)
        print(f"Loaded environment from: {pipeline_env}")
    else:
        load_dotenv()
except ImportError:
    pass

import psycopg

def test_connection():
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    
    if not db_url:
        print("\n❌ LỖI: Không tìm thấy SUPABASE_DB_URL hoặc DATABASE_URL trong môi trường hoặc file .env!")
        print("Hướng dẫn: Tạo file .env tại thư mục gốc với nội dung:")
        print("SUPABASE_DB_URL=postgresql://postgres:[MẬT_KHẨU]@db.[PROJECT_REF].supabase.co:5432/postgres\n")
        return False

    # Masking password for safe display
    masked_url = db_url
    if "@" in db_url and "://" in db_url:
        prefix, rest = db_url.split("://", 1)
        user_pass, host_db = rest.split("@", 1)
        user = user_pass.split(":")[0]
        masked_url = f"{prefix}://{user}:****@{host_db}"

    print(f"\n🔄 Đang thử kết nối tới Supabase...")
    print(f"📍 Connection target: {masked_url}")

    t0 = time.time()
    try:
        with psycopg.connect(db_url, connect_timeout=10, sslmode="require") as conn:
            latency = (time.time() - t0) * 1000
            print(f"✅ KẾT NỐI THÀNH CÔNG! (Độ trễ: {latency:.1f} ms)")
            
            with conn.cursor() as cur:
                # 1. Version
                cur.execute("SELECT version();")
                pg_version = cur.fetchone()[0]
                print(f"🐘 PostgreSQL Engine: {pg_version.split(',')[0]}")
                
                # 2. Database Name & Current User
                cur.execute("SELECT current_database(), current_user;")
                db_name, db_user = cur.fetchone()
                print(f"👤 User: {db_user} | Database: {db_name}")
                
                # 3. Existing Tables
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """)
                tables = [r[0] for r in cur.fetchall()]
                print(f"\n📊 Bảng hiện có trong schema 'public' ({len(tables)} bảng):")
                if tables:
                    for t in tables:
                        cur.execute(f"SELECT COUNT(*) FROM public.\"{t}\";")
                        cnt = cur.fetchone()[0]
                        print(f"   • {t} ({cnt} bản ghi)")
                else:
                    print("   (Chưa có bảng nào được tạo)")
                    
                # 4. Existing Views
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.views 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """)
                views = [r[0] for r in cur.fetchall()]
                if views:
                    print(f"\n👁️ Views hiện có ({len(views)} views):")
                    for v in views:
                        print(f"   • {v}")

        print("\n🎉 Supabase đã sẵn sàng phục vụ pipeline!")
        return True

    except psycopg.OperationalError as e:
        print(f"\n❌ LỖI KẾT NỐI (OperationalError):")
        print(f"Chi tiết: {e}")
        print("\n💡 Các nguyên nhân phổ biến:")
        print(" 1. Sai mật khẩu database.")
        print(" 2. Supabase project đang ở chế độ Paused (vào dashboard bấm Unpause/Restore).")
        print(" 3. Nếu mạng chặn port 5432, hãy dùng Connection Pooler port 6543 (Transaction Mode).")
        return False
    except Exception as e:
        print(f"\n❌ LỖI KHÔNG XÁC ĐỊNH: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
