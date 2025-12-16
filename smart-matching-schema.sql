-- Smart Matching System Schema
-- Platform settings and location support

-- ============================================
-- PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Insert default matching settings
INSERT INTO platform_settings (setting_key, setting_value, updated_by)
VALUES (
    'matching_mode',
    '{"ai_enabled": true, "fallback_to_custom": true, "custom_weights": {"proximity": 0.3, "interests": 0.25, "age": 0.15, "completeness": 0.15, "activity": 0.15}}',
    'system'
) ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- ADD LOCATION SUPPORT TO PROFILES
-- ============================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP;

-- Add index for proximity queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lng) WHERE location_lat IS NOT NULL;

-- ============================================
-- MATCHING ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matching_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    matching_method VARCHAR(20) NOT NULL, -- 'ai' or 'custom'
    compatibility_score DECIMAL(5, 2),
    proximity_score DECIMAL(5, 2),
    interest_score DECIMAL(5, 2),
    age_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matching_analytics_user ON matching_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_analytics_method ON matching_analytics(matching_method);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    max_distance_km INTEGER DEFAULT 50,
    preferred_interests TEXT[],
    show_me VARCHAR(20) DEFAULT 'everyone', -- 'men', 'women', 'everyone'
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

COMMENT ON TABLE platform_settings IS 'Global platform configuration including matching mode';
COMMENT ON TABLE matching_analytics IS 'Track matching performance for AI vs custom algorithms';
COMMENT ON TABLE user_preferences IS 'User-specific matching preferences';
