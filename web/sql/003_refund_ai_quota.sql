-- =====================================================================
-- 003_refund_ai_quota.sql
-- Hoàn lại 1 lượt hỏi AI khi model lỗi trước khi trả lời được (idempotent).
-- Chỉ hoàn trong chu kỳ 24h hiện tại, không bao giờ xuống dưới 0.
-- =====================================================================

CREATE OR REPLACE FUNCTION refund_ai_quota(
    p_identifier TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE ai_rate_limits
    SET questions_used = GREATEST(0, questions_used - 1)
    WHERE identifier = p_identifier
      AND reset_at > now();
END;
$$;

-- Chỉ server (kết nối DB trực tiếp) được gọi; chặn gọi qua PostgREST bằng anon key để không ai tự cộng lượt.
REVOKE ALL ON FUNCTION refund_ai_quota(TEXT) FROM PUBLIC, anon, authenticated;
