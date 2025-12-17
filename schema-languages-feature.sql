-- Add languages field to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for language searches
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING GIN(languages);

-- Update completion function to include languages
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Basic profile fields (25 points total)
    SELECT 
        CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 50 THEN 6 ELSE 0 END +
        CASE WHEN gallery IS NOT NULL AND array_length(gallery, 1) >= 3 THEN 6 ELSE 0 END +
        CASE WHEN interests IS NOT NULL AND array_length(interests, 1) >= 3 THEN 6 ELSE 0 END +
        CASE WHEN soul_analysis IS NOT NULL THEN 7 ELSE 0 END
    INTO completion_score
    FROM profiles
    WHERE id = user_id_param;
    
    -- Identity & Inclusivity (15 points)
    SELECT completion_score +
        CASE WHEN gender_identity IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN sexual_orientation IS NOT NULL AND array_length(sexual_orientation, 1) > 0 THEN 5 ELSE 0 END +
        CASE WHEN languages IS NOT NULL AND array_length(languages, 1) > 0 THEN 5 ELSE 0 END
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

COMMENT ON COLUMN profiles.languages IS 'Array of ISO language codes user speaks (e.g. [en, fr, de])';
