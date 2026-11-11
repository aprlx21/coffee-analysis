import numpy as np, cv2, time, json, os, re, requests, pandas as pd
from concurrent.futures import ThreadPoolExecutor
from menu_core import *
from menu_db import *

class PaddleEngine:
    def __init__(self, langs=("vi", "latin", "en")):
        from paddleocr import PaddleOCR
        last = None
        for lang in langs:
            try:
                try:   # 3.x
                    self.ocr = PaddleOCR(lang=lang, use_doc_orientation_classify=True,
                                         use_doc_unwarping=False, use_textline_orientation=False)
                except TypeError:   # 2.x
                    self.ocr = PaddleOCR(lang=lang, use_angle_cls=True)
                self.lang = lang; print("PaddleOCR lang =", lang); return
            except Exception as e:
                last = e
        raise last

    @staticmethod
    def _box(poly, text, conf):
        p = np.asarray(poly, dtype=float).reshape(-1, 2)
        return dict(text=str(text), conf=float(conf), x0=p[:,0].min(), y0=p[:,1].min(), x1=p[:,0].max(), y1=p[:,1].max())

    def __call__(self, bgr):
        boxes = []
        if hasattr(self.ocr, "predict"):                         # PaddleOCR 3.x
            for r in self.ocr.predict(bgr):
                texts, scores = r["rec_texts"], r["rec_scores"]
                polys = r["rec_polys"] if "rec_polys" in r else r["dt_polys"]
                boxes += [self._box(p, t, s) for p, t, s in zip(polys, texts, scores)]
        else:                                                    # PaddleOCR 2.x
            res = self.ocr.ocr(bgr, cls=True)
            for line in (res[0] or []):
                boxes.append(self._box(line[0], line[1][0], line[1][1]))
        return boxes

engine = PaddleEngine()