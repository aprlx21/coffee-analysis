-- =====================================================================
-- 002_ai_rate_limits.sql (issue #12)
-- Bảng và hàm rate limit giới hạn lượt hỏi AI (mặc định 5 lượt / 24h).
-- Idempotent, an toàn khi chạy lại nhiều lần.
-- =====================================================================

CREATE TABLE IF NOT EXISTS ai_rate_limits (
    identifier TEXT PRIMARY KEY,
    questions_used INT NOT NULL DEFAULT 0,
    max_questions INT NOT NULL DEFAULT 5,
    first_asked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_asked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 HOURS')
);

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_reset_at ON ai_rate_limits(reset_at);

-- Hàm nguyên tử (Atomic) kiểm tra và trừ quota
CREATE OR REPLACE FUNCTION check_and_consume_ai_quota(
    p_identifier TEXT,
    p_max_limit INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- 1. Khởi tạo bản ghi nếu chưa tồn tại
    INSERT INTO ai_rate_limits (identifier, questions_used, max_questions, first_asked_at, last_asked_at, reset_at)
    VALUES (p_identifier, 0, p_max_limit, v_now, v_now, v_now + INTERVAL '24 HOURS')
    ON CONFLICT (identifier) DO NOTHING;

    -- 2. Khóa dòng bản ghi để tránh race conditions
    SELECT * INTO v_record FROM ai_rate_limits WHERE identifier = p_identifier FOR UPDATE;

    -- 3. Nếu đã qua chu kỳ 24h thì reset lại số câu về 0
    IF v_record.reset_at <= v_now THEN
        UPDATE ai_rate_limits 
        SET questions_used = 0,
            reset_at = v_now + INTERVAL '24 HOURS',
            last_asked_at = v_now
        WHERE identifier = p_identifier;
        v_record.questions_used := 0;
        v_record.reset_at := v_now + INTERVAL '24 HOURS';
    END IF;

    -- 4. Kiểm tra xem đã hết lượt chưa
    IF v_record.questions_used >= p_max_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'remaining', 0,
            'used', v_record.questions_used,
            'max', p_max_limit,
            'reset_at', v_record.reset_at
        );
    END IF;

    -- 5. Tăng số câu đã hỏi
    UPDATE ai_rate_limits
    SET questions_used = questions_used + 1,
        last_asked_at = v_now
    WHERE identifier = p_identifier;

    RETURN jsonb_build_object(
        'allowed', true,
        'remaining', p_max_limit - (v_record.questions_used + 1),
        'used', v_record.questions_used + 1,
        'max', p_max_limit,
        'reset_at', v_record.reset_at
    );
END;
$$;

-- Hàm chỉ đọc quota hiện tại (không tăng lượt)
CREATE OR REPLACE FUNCTION get_ai_quota_status(
    p_identifier TEXT,
    p_max_limit INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := now();
BEGIN
    SELECT * INTO v_record FROM ai_rate_limits WHERE identifier = p_identifier;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', true,
            'remaining', p_max_limit,
            'used', 0,
            'max', p_max_limit,
            'reset_at', v_now + INTERVAL '24 HOURS'
        );
    END IF;

    IF v_record.reset_at <= v_now THEN
        RETURN jsonb_build_object(
            'allowed', true,
            'remaining', p_max_limit,
            'used', 0,
            'max', p_max_limit,
            'reset_at', v_now + INTERVAL '24 HOURS'
        );
    END IF;

    RETURN jsonb_build_object(
        'allowed', (v_record.questions_used < p_max_limit),
        'remaining', GREATEST(0, p_max_limit - v_record.questions_used),
        'used', v_record.questions_used,
        'max', p_max_limit,
        'reset_at', v_record.reset_at
    );
END;
$$;
