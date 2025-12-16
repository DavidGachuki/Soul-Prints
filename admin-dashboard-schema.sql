-- Enhanced Admin Dashboard Schema
-- Add these tables to support comprehensive analytics and moderation

-- ============================================
-- USER ACTIVITY TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'like', 'pass', 'message_sent', 'profile_view', 'match_created'
    metadata JSONB, -- Additional context (e.g., which profile was viewed)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_activity_created ON user_activity_log(created_at);

-- ============================================
-- USER REPORTS & MODERATION
-- ============================================
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'inappropriate_content', 'harassment', 'fake_profile', 'spam', 'other'
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed'
    reviewed_by VARCHAR(100), -- Admin who reviewed
    reviewed_at TIMESTAMP,
    action_taken VARCHAR(100), -- 'warning_sent', 'content_removed', 'user_banned', 'no_action'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON user_reports(status);
CREATE INDEX idx_reports_reported ON user_reports(reported_id);

-- ============================================
-- CONTENT FLAGS (AI + Manual)
-- ============================================
CREATE TABLE IF NOT EXISTS content_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(20) NOT NULL, -- 'profile_photo', 'profile_bio', 'message', 'profile_video'
    content_id UUID NOT NULL, -- ID of the flagged content
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    flag_reason VARCHAR(100) NOT NULL, -- 'nudity', 'violence', 'hate_speech', 'spam', 'fake'
    flagged_by VARCHAR(20) DEFAULT 'ai', -- 'ai', 'user', 'admin'
    confidence_score DECIMAL(3, 2), -- AI confidence (0.00 - 1.00)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'removed'
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flags_status ON content_flags(status);
CREATE INDEX idx_flags_user ON content_flags(user_id);
CREATE INDEX idx_flags_type ON content_flags(content_type);

-- ============================================
-- DAILY METRICS SNAPSHOT (for historical tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL UNIQUE,
    total_users INTEGER,
    active_users INTEGER, -- Users who logged in that day
    new_signups INTEGER,
    total_matches INTEGER,
    new_matches INTEGER,
    total_messages INTEGER,
    new_messages INTEGER,
    dau INTEGER, -- Daily Active Users
    mau INTEGER, -- Monthly Active Users (calculated)
    retention_rate_1d DECIMAL(5, 2), -- 1-day retention %
    retention_rate_7d DECIMAL(5, 2), -- 7-day retention %
    retention_rate_30d DECIMAL(5, 2), -- 30-day retention %
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_metrics_date ON daily_metrics(metric_date);

-- ============================================
-- USER VERIFICATION STATUS
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'; -- 'active', 'suspended', 'banned', 'deleted'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate DAU
CREATE OR REPLACE FUNCTION calculate_dau(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM user_activity_log
        WHERE DATE(created_at) = target_date
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate MAU
CREATE OR REPLACE FUNCTION calculate_mau(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM user_activity_log
        WHERE created_at >= target_date - INTERVAL '30 days'
        AND created_at < target_date + INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA POPULATION (for testing)
-- ============================================

-- Log some sample activities (run this after users exist)
-- INSERT INTO user_activity_log (user_id, activity_type)
-- SELECT id, 'login' FROM profiles LIMIT 10;

COMMENT ON TABLE user_activity_log IS 'Tracks all user activities for engagement analytics';
COMMENT ON TABLE user_reports IS 'User-generated reports for moderation';
COMMENT ON TABLE content_flags IS 'AI and manual content moderation flags';
COMMENT ON TABLE daily_metrics IS 'Daily snapshot of key platform metrics for trend analysis';
