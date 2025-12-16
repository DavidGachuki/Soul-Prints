-- Behavioral Tracking Schema
-- Tracks user interactions to improve matching over time

-- ============================================
-- USER INTERACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'pass', 'message', 'unmatch', 'block'
    duration_seconds INTEGER, -- Time spent viewing profile
    context JSONB, -- Additional context (which section viewed, etc.)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_target ON user_interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_action ON user_interactions(action_type);

-- ============================================
-- CONVERSATION METRICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
    message_count INTEGER DEFAULT 0,
    user1_message_count INTEGER DEFAULT 0,
    user2_message_count INTEGER DEFAULT 0,
    avg_response_time_minutes INTEGER,
    conversation_depth_score INTEGER DEFAULT 0, -- 0-100 based on message quality
    last_message_at TIMESTAMP,
    first_message_at TIMESTAMP,
    conversation_status VARCHAR(50) DEFAULT 'active', -- 'active', 'stale', 'ghosted', 'thriving'
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_match ON conversation_metrics(match_id);
CREATE INDEX IF NOT EXISTS idx_conversation_status ON conversation_metrics(conversation_status);

-- ============================================
-- MATCH OUTCOMES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS match_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    outcome VARCHAR(50) NOT NULL, -- 'met_offline', 'dating', 'relationship', 'ghosted', 'unmatched', 'blocked'
    reported_by UUID REFERENCES profiles(id),
    outcome_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcomes_match ON match_outcomes(match_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_type ON match_outcomes(outcome);

-- ============================================
-- USER PREFERENCE LEARNING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS learned_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Learned from behavior
    preferred_age_min INTEGER,
    preferred_age_max INTEGER,
    preferred_distance_km INTEGER,
    preferred_values TEXT[],
    preferred_interests TEXT[],
    preferred_communication_style VARCHAR(50),
    
    -- Success patterns
    successful_match_traits JSONB, -- Common traits in successful matches
    unsuccessful_match_traits JSONB, -- Traits to avoid
    
    -- Engagement patterns
    avg_time_on_profiles INTEGER, -- Seconds
    selectivity_score INTEGER, -- 0-100, how selective user is
    response_rate INTEGER, -- % of messages responded to
    
    -- Last updated
    learning_confidence INTEGER DEFAULT 0, -- 0-100, how much data we have
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learned_user ON learned_preferences(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update conversation metrics when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_metrics()
RETURNS TRIGGER AS $$
DECLARE
    match_record RECORD;
    msg_count INTEGER;
    user1_count INTEGER;
    user2_count INTEGER;
BEGIN
    -- Get match details
    SELECT * INTO match_record FROM matches WHERE id = NEW.match_id;
    
    -- Count messages
    SELECT COUNT(*) INTO msg_count FROM messages WHERE match_id = NEW.match_id;
    SELECT COUNT(*) INTO user1_count FROM messages WHERE match_id = NEW.match_id AND sender_id = match_record.user_id_1;
    SELECT COUNT(*) INTO user2_count FROM messages WHERE match_id = NEW.match_id AND sender_id = match_record.user_id_2;
    
    -- Calculate conversation depth (based on message count and balance)
    DECLARE
        depth_score INTEGER;
        balance_factor DECIMAL;
    BEGIN
        balance_factor := LEAST(user1_count::DECIMAL / NULLIF(user2_count, 0), user2_count::DECIMAL / NULLIF(user1_count, 0));
        depth_score := LEAST(100, (msg_count * 5) * COALESCE(balance_factor, 0.5));
        
        -- Upsert conversation metrics
        INSERT INTO conversation_metrics (
            match_id,
            message_count,
            user1_message_count,
            user2_message_count,
            conversation_depth_score,
            last_message_at,
            first_message_at,
            conversation_status,
            updated_at
        ) VALUES (
            NEW.match_id,
            msg_count,
            user1_count,
            user2_count,
            depth_score,
            NEW.created_at,
            NEW.created_at,
            CASE 
                WHEN msg_count >= 10 THEN 'thriving'
                WHEN msg_count >= 3 THEN 'active'
                ELSE 'new'
            END,
            NOW()
        )
        ON CONFLICT (match_id) DO UPDATE SET
            message_count = msg_count,
            user1_message_count = user1_count,
            user2_message_count = user2_count,
            conversation_depth_score = depth_score,
            last_message_at = NEW.created_at,
            conversation_status = CASE 
                WHEN msg_count >= 10 THEN 'thriving'
                WHEN msg_count >= 3 THEN 'active'
                ELSE 'new'
            END,
            updated_at = NOW();
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message insertion
DROP TRIGGER IF EXISTS trigger_update_conversation_metrics ON messages;
CREATE TRIGGER trigger_update_conversation_metrics
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_metrics();

-- Log user interaction
CREATE OR REPLACE FUNCTION log_user_interaction(
    p_user_id UUID,
    p_target_user_id UUID,
    p_action_type VARCHAR,
    p_duration_seconds INTEGER DEFAULT NULL,
    p_context JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    interaction_id UUID;
BEGIN
    INSERT INTO user_interactions (
        user_id,
        target_user_id,
        action_type,
        duration_seconds,
        context
    ) VALUES (
        p_user_id,
        p_target_user_id,
        p_action_type,
        p_duration_seconds,
        p_context
    ) RETURNING id INTO interaction_id;
    
    RETURN interaction_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_interactions IS 'Tracks all user interactions for behavioral learning';
COMMENT ON TABLE conversation_metrics IS 'Aggregated conversation quality metrics';
COMMENT ON TABLE match_outcomes IS 'Real-world outcomes of matches';
COMMENT ON TABLE learned_preferences IS 'Machine-learned user preferences from behavior';
