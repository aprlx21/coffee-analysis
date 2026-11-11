import importlib, menu_core, menu_db
importlib.reload(menu_core); importlib.reload(menu_db)     # thứ tự này quan trọng
from menu_core import *
from menu_db import *
print("Số món chuẩn trong từ điển:", len(CANON))