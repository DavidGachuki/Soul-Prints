-- Enhanced Profile Schema with Questionnaire Fields
-- Adds comprehensive profile completion tracking

-- ============================================
-- PROFILE ENHANCEMENTS
-- ============================================

-- Add new profile fields for intelligent matching
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS values JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relationship_intent VARCHAR(50),
ADD COLUMN IF NOT EXISTS communication_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS deal_breakers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS lifestyle JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personality_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS love_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS conflict_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;

-- ============================================
-- PROFILE QUESTIONNAIRE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profile_questionnaire (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Core Values (Question 1)
    core_values TEXT[], -- ['family', 'career', 'adventure', 'spirituality', 'community']
    
    -- Relationship Goals (Question 2)
    relationship_timeline VARCHAR(50), -- 'marriage_soon', 'long_term', 'exploring', 'casual'
    ideal_partner_traits TEXT[], -- ['honest', 'ambitious', 'caring', 'adventurous', 'funny']
    
    -- Communication & Conflict (Question 3-4)
    communication_preference VARCHAR(50), -- 'direct', 'emotional', 'reserved', 'balanced'
    conflict_resolution VARCHAR(50), -- 'discuss_immediately', 'need_space', 'avoid', 'compromise'
    
    -- Lifestyle (Question 5-7)
    activity_level VARCHAR(50), -- 'very_active', 'moderately_active', 'relaxed', 'homebody'
    social_preference VARCHAR(50), -- 'extroverted', 'introverted', 'ambivert'
    travel_frequency VARCHAR(50), -- 'frequent', 'occasional', 'rare', 'never'
    
    -- Deal Breakers (Question 8)
    absolute_dealbreakers TEXT[], -- ['smoking', 'no_kids', 'different_religion', 'long_distance']
    
    -- Personality & Love (Question 9-10)
    personality_traits JSONB, -- Big Five scores
    love_language_primary VARCHAR(50), -- 'words', 'time', 'gifts', 'acts', 'touch'
    love_language_secondary VARCHAR(50),
    
    -- Additional Deep Questions
    ideal_weekend TEXT,
    life_goals TEXT,
    passion_project TEXT,
    
    -- Completion tracking
    completed_sections TEXT[] DEFAULT '{}',
    completion_percentage INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_user ON profile_questionnaire(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_completion ON profile_questionnaire(completion_percentage);

-- ============================================
-- QUESTIONNAIRE PROMPTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS questionnaire_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(50) NOT NULL, -- 'values', 'goals', 'communication', 'lifestyle', 'personality'
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- 'multiple_choice', 'multi_select', 'text', 'scale'
    options JSONB, -- For multiple choice questions
    weight INTEGER DEFAULT 10, -- How much this affects matching (0-100)
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default questionnaire prompts
INSERT INTO questionnaire_prompts (section, question_order, question_text, question_type, options, weight) VALUES
-- Section 1: Core Values
('values', 1, 'What matters most to you in life? (Select up to 5)', 'multi_select', 
 '["Family & Relationships", "Career & Success", "Adventure & Travel", "Spirituality & Faith", "Community & Service", "Health & Wellness", "Creativity & Arts", "Financial Security", "Personal Growth", "Fun & Entertainment"]', 30),

-- Section 2: Relationship Goals
('goals', 2, 'What are you looking for?', 'multiple_choice',
 '["Marriage within 2 years", "Long-term committed relationship", "Exploring possibilities", "Casual dating", "Not sure yet"]', 25),

('goals', 3, 'What qualities are most important in a partner? (Select top 5)', 'multi_select',
 '["Honest & Trustworthy", "Ambitious & Driven", "Kind & Caring", "Adventurous", "Funny & Playful", "Intelligent", "Emotionally Available", "Family-Oriented", "Independent", "Romantic"]', 20),

-- Section 3: Communication Style
('communication', 4, 'How do you prefer to communicate?', 'multiple_choice',
 '["Direct and straightforward", "Warm and emotional", "Thoughtful and reserved", "Balanced approach"]', 15),

('communication', 5, 'How do you handle disagreements?', 'multiple_choice',
 '["Discuss immediately and resolve", "Need time alone to think first", "Prefer to avoid conflict", "Find compromise together"]', 15),

-- Section 4: Lifestyle
('lifestyle', 6, 'How would you describe your activity level?', 'multiple_choice',
 '["Very active - gym, sports, outdoor activities", "Moderately active - regular walks, occasional sports", "Relaxed - prefer calm activities", "Homebody - enjoy indoor activities"]', 10),

('lifestyle', 7, 'Your social energy?', 'multiple_choice',
 '["Extroverted - love being around people", "Introverted - prefer small groups or alone time", "Ambivert - depends on mood", "Selective - close friends only"]', 10),

('lifestyle', 8, 'How often do you like to travel?', 'multiple_choice',
 '["Frequently - multiple trips per year", "Occasionally - few times a year", "Rarely - once a year or less", "Prefer staying local"]', 10),

-- Section 5: Deal Breakers
('dealbreakers', 9, 'What are your absolute deal-breakers? (Select all that apply)', 'multi_select',
 '["Smoking", "Wants kids (if you don''t)", "Doesn''t want kids (if you do)", "Different religion", "Long distance", "Different political views", "Pets (if allergic)", "Workaholic lifestyle", "Party lifestyle"]', 20),

-- Section 6: Personality & Love
('personality', 10, 'What''s your primary love language?', 'multiple_choice',
 '["Words of Affirmation", "Quality Time", "Receiving Gifts", "Acts of Service", "Physical Touch"]', 10),

-- Section 7: Deep Questions
('deep', 11, 'Describe your ideal weekend', 'text', NULL, 5),
('deep', 12, 'What are your life goals for the next 5 years?', 'text', NULL, 5),
('deep', 13, 'What are you most passionate about?', 'text', NULL, 5);

-- ============================================
-- PROFILE COMPLETION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Basic profile fields (40 points total)
    SELECT 
        CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 50 THEN 10 ELSE 0 END +
        CASE WHEN gallery IS NOT NULL AND array_length(gallery, 1) >= 3 THEN 10 ELSE 0 END +
        CASE WHEN interests IS NOT NULL AND array_length(interests, 1) >= 3 THEN 10 ELSE 0 END +
        CASE WHEN soul_analysis IS NOT NULL THEN 10 ELSE 0 END
    INTO completion_score
    FROM profiles
    WHERE id = user_id_param;
    
    -- Questionnaire completion (60 points total)
    IF EXISTS (SELECT 1 FROM profile_questionnaire WHERE user_id = user_id_param) THEN
        SELECT 
            completion_score +
            CASE WHEN core_values IS NOT NULL AND array_length(core_values, 1) >= 3 THEN 10 ELSE 0 END +
            CASE WHEN relationship_timeline IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN communication_preference IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN lifestyle IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN absolute_dealbreakers IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN love_language_primary IS NOT NULL THEN 10 ELSE 0 END
        INTO completion_score
        FROM profile_questionnaire
        WHERE user_id = user_id_param;
    END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE profile_questionnaire IS 'Comprehensive questionnaire for intelligent matching';
COMMENT ON TABLE questionnaire_prompts IS 'Question bank for profile completion';
COMMENT ON FUNCTION calculate_profile_completion IS 'Calculate profile completion percentage (0-100)';
