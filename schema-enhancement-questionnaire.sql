-- Enhanced Questionnaire Schema Migration
-- Adds inclusive identity fields, attachment styles, and enhanced personality storage
-- Execute this in Supabase SQL Editor AFTER existing schemas

-- ============================================
-- ADD NEW PROFILE FIELDS
-- ============================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender_identity VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender_self_describe TEXT,
ADD COLUMN IF NOT EXISTS sexual_orientation TEXT[], -- Multi-select
ADD COLUMN IF NOT EXISTS orientation_self_describe TEXT,
ADD COLUMN IF NOT EXISTS relationship_structure VARCHAR(50),
ADD COLUMN IF NOT EXISTS attachment_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS big_five_traits JSONB DEFAULT '{}'; -- Stores OCEAN scores

-- ============================================
-- ADD NEW QUESTIONNAIRE FIELDS
-- ============================================

ALTER TABLE profile_questionnaire
ADD COLUMN IF NOT EXISTS self_description TEXT[], -- Onboarding Q5
ADD COLUMN IF NOT EXISTS story_responses JSONB DEFAULT '{}', -- Story mode answers
ADD COLUMN IF NOT EXISTS quick_list_selections TEXT[], -- Quick list checked items
ADD COLUMN IF NOT EXISTS questionnaire_mode VARCHAR(20); -- 'arcade', 'story', or 'quicklist'

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender_identity);
CREATE INDEX IF NOT EXISTS idx_profiles_orientation ON profiles USING GIN(sexual_orientation);
CREATE INDEX IF NOT EXISTS idx_profiles_structure ON profiles(relationship_structure);
CREATE INDEX IF NOT EXISTS idx_profiles_attachment ON profiles(attachment_style);
CREATE INDEX IF NOT EXISTS idx_questionnaire_mode ON profile_questionnaire(questionnaire_mode);

-- ============================================
-- UPDATE COMPLETION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Basic profile fields (30 points total)
    SELECT 
        CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 50 THEN 8 ELSE 0 END +
        CASE WHEN gallery IS NOT NULL AND array_length(gallery, 1) >= 3 THEN 8 ELSE 0 END +
        CASE WHEN interests IS NOT NULL AND array_length(interests, 1) >= 3 THEN 7 ELSE 0 END +
        CASE WHEN soul_analysis IS NOT NULL THEN 7 ELSE 0 END
    INTO completion_score
    FROM profiles
    WHERE id = user_id_param;
    
    -- Identity & Inclusivity (10 points)
    SELECT completion_score +
        CASE WHEN gender_identity IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN sexual_orientation IS NOT NULL AND array_length(sexual_orientation, 1) > 0 THEN 5 ELSE 0 END
    INTO completion_score
    FROM profiles
    WHERE id = user_id_param;
    
    -- Questionnaire completion (60 points total)
    IF EXISTS (SELECT 1 FROM profile_questionnaire WHERE user_id = user_id_param) THEN
        SELECT 
            completion_score +
            CASE WHEN core_values IS NOT NULL AND array_length(core_values, 1) >= 3 THEN 12 ELSE 0 END +
            CASE WHEN relationship_timeline IS NOT NULL THEN 12 ELSE 0 END +
            CASE WHEN communication_preference IS NOT NULL THEN 8 ELSE 0 END +
            CASE WHEN activity_level IS NOT NULL THEN 8 ELSE 0 END +
            CASE WHEN absolute_dealbreakers IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN love_language_primary IS NOT NULL THEN 10 ELSE 0 END
        INTO completion_score
        FROM profile_questionnaire
        WHERE user_id = user_id_param;
    END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA MIGRATION FOR EXISTING USERS
-- ============================================

-- Set default values for existing users (prefer-not-to-answer for sensitive fields)
UPDATE profiles 
SET 
    gender_identity = 'prefer-not-to-answer',
    sexual_orientation = ARRAY['prefer-not-to-answer'],
    relationship_structure = NULL,
    attachment_style = 'unknown'
WHERE gender_identity IS NULL;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN profiles.gender_identity IS 'User gender identity: woman, man, non-binary, self-describe, prefer-not-to-answer';
COMMENT ON COLUMN profiles.sexual_orientation IS 'Multi-select sexual orientation/attraction';
COMMENT ON COLUMN profiles.relationship_structure IS 'Preferred relationship structure: monogamous, polyamorous, open, polyfidelity, other';
COMMENT ON COLUMN profiles.attachment_style IS 'Attachment style: secure, anxious, avoidant, disorganized, unknown';
COMMENT ON COLUMN profiles.big_five_traits IS 'OCEAN personality traits as JSON {openness, conscientiousness, extraversion, agreeableness, neuroticism}';
COMMENT ON COLUMN profile_questionnaire.story_responses IS 'Story mode narrative responses as JSON {prompt_id: response_text}';
COMMENT ON COLUMN profile_questionnaire.quick_list_selections IS 'Quick list checked item IDs';
COMMENT ON COLUMN profile_questionnaire.questionnaire_mode IS 'Which mode user completed: arcade, story, or quicklist';
