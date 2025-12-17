// Profile Completion Service
// Tracks and calculates profile completion percentage

import { supabase } from './supabaseClient';

export interface ProfileCompletionStatus {
    percentage: number;
    completedSections: string[];
    missingSections: string[];
    nextPrompt: QuestionnairePrompt | null;
}

export interface QuestionnairePrompt {
    id: string;
    section: string;
    questionOrder: number;
    questionText: string;
    questionType: 'multiple_choice' | 'multi_select' | 'text' | 'scale';
    options?: string[];
    weight: number;
}

export interface QuestionnaireAnswers {
    coreValues?: string[];
    relationshipTimeline?: string;
    idealPartnerTraits?: string[];
    communicationPreference?: string;
    conflictResolution?: string;
    activityLevel?: string;
    socialPreference?: string;
    travelFrequency?: string;
    absoluteDealbreakers?: string[];
    loveLanguagePrimary?: string;
    loveLanguageSecondary?: string;
    idealWeekend?: string;
    lifeGoals?: string;
    passionProject?: string;
    // New fields for enhanced questionnaire
    story_responses?: Record<string, string>;
    quick_list_selections?: string[];
    questionnaire_mode?: 'arcade' | 'story' | 'quicklist';
}

/**
 * Get user's profile completion status
 */
export async function getProfileCompletionStatus(userId: string): Promise<ProfileCompletionStatus> {
    try {
        // Calculate completion percentage
        const { data: completionData } = await supabase
            .rpc('calculate_profile_completion', { user_id_param: userId });

        const percentage = completionData || 0;

        // Get completed sections
        const { data: questionnaire } = await supabase
            .from('profile_questionnaire')
            .select('completed_sections')
            .eq('user_id', userId)
            .single();

        const completedSections = questionnaire?.completed_sections || [];

        // Determine missing sections
        const allSections = ['values', 'goals', 'communication', 'lifestyle', 'dealbreakers', 'personality', 'deep'];
        const missingSections = allSections.filter(s => !completedSections.includes(s));

        // Get next prompt
        let nextPrompt = null;
        if (missingSections.length > 0) {
            const { data: prompts } = await supabase
                .from('questionnaire_prompts')
                .select('*')
                .eq('section', missingSections[0])
                .order('question_order')
                .limit(1);

            if (prompts && prompts.length > 0) {
                const prompt = prompts[0];
                nextPrompt = {
                    id: prompt.id,
                    section: prompt.section,
                    questionOrder: prompt.question_order,
                    questionText: prompt.question_text,
                    questionType: prompt.question_type,
                    options: prompt.options ? JSON.parse(prompt.options) : undefined,
                    weight: prompt.weight
                };
            }
        }

        return {
            percentage,
            completedSections,
            missingSections,
            nextPrompt
        };
    } catch (error) {
        console.error('Error getting profile completion status:', error);
        return {
            percentage: 0,
            completedSections: [],
            missingSections: ['values', 'goals', 'communication', 'lifestyle', 'dealbreakers', 'personality', 'deep'],
            nextPrompt: null
        };
    }
}

/**
 * Get all questionnaire prompts for a section
 */
export async function getQuestionnairePrompts(section?: string): Promise<QuestionnairePrompt[]> {
    try {
        let query = supabase
            .from('questionnaire_prompts')
            .select('*')
            .order('question_order');

        if (section) {
            query = query.eq('section', section);
        }

        const { data } = await query;

        return (data || []).map(prompt => ({
            id: prompt.id,
            section: prompt.section,
            questionOrder: prompt.question_order,
            questionText: prompt.question_text,
            questionType: prompt.question_type,
            options: prompt.options ? JSON.parse(prompt.options) : undefined,
            weight: prompt.weight
        }));
    } catch (error) {
        console.error('Error getting questionnaire prompts:', error);
        return [];
    }
}

/**
 * Save questionnaire answers
 */
export async function saveQuestionnaireAnswers(userId: string, answers: Partial<QuestionnaireAnswers>): Promise<boolean> {
    try {
        // Check if questionnaire exists
        const { data: existing } = await supabase
            .from('profile_questionnaire')
            .select('id, completed_sections')
            .eq('user_id', userId)
            .single();

        // MAP CAMELCASE TO SNAKE_CASE FOR DATABASE
        const dbPayload: any = {
            last_updated: new Date().toISOString()
        };

        if (answers.coreValues !== undefined) dbPayload.core_values = answers.coreValues;
        if (answers.relationshipTimeline !== undefined) dbPayload.relationship_timeline = answers.relationshipTimeline;
        if (answers.idealPartnerTraits !== undefined) dbPayload.ideal_partner_traits = answers.idealPartnerTraits;
        if (answers.communicationPreference !== undefined) dbPayload.communication_preference = answers.communicationPreference;
        if (answers.conflictResolution !== undefined) dbPayload.conflict_resolution = answers.conflictResolution;
        if (answers.activityLevel !== undefined) dbPayload.activity_level = answers.activityLevel;
        if (answers.socialPreference !== undefined) dbPayload.social_preference = answers.socialPreference;
        if (answers.travelFrequency !== undefined) dbPayload.travel_frequency = answers.travelFrequency;
        if (answers.absoluteDealbreakers !== undefined) dbPayload.absolute_dealbreakers = answers.absoluteDealbreakers;
        if (answers.loveLanguagePrimary !== undefined) dbPayload.love_language_primary = answers.loveLanguagePrimary;
        if (answers.loveLanguageSecondary !== undefined) dbPayload.love_language_secondary = answers.loveLanguageSecondary;
        if (answers.idealWeekend !== undefined) dbPayload.ideal_weekend = answers.idealWeekend;
        if (answers.lifeGoals !== undefined) dbPayload.life_goals = answers.lifeGoals;
        if (answers.passionProject !== undefined) dbPayload.passion_project = answers.passionProject;

        // Update completed sections logic (keeps camelCase checks as 'answers' is camelCase)
        const completedSections = new Set(existing?.completed_sections || []);
        if (answers.coreValues) completedSections.add('values');
        if (answers.relationshipTimeline) completedSections.add('goals');
        if (answers.communicationPreference) completedSections.add('communication');
        if (answers.activityLevel) completedSections.add('lifestyle');
        if (answers.absoluteDealbreakers) completedSections.add('dealbreakers');
        if (answers.loveLanguagePrimary) completedSections.add('personality');
        if (answers.idealWeekend || answers.lifeGoals) completedSections.add('deep');

        dbPayload.completed_sections = Array.from(completedSections);

        // Calculate completion percentage
        dbPayload.completion_percentage = Math.round((completedSections.size / 7) * 100);

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('profile_questionnaire')
                .update(dbPayload)
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('profile_questionnaire')
                .insert({ user_id: userId, ...dbPayload });

            if (error) throw error;
        }

        // Also update profile completion score
        const { data: completionScore } = await supabase
            .rpc('calculate_profile_completion', { user_id_param: userId });

        await supabase
            .from('profiles')
            .update({ profile_completion_score: completionScore })
            .eq('id', userId);

        return true;
    } catch (error) {
        console.error('Error saving questionnaire answers:', error);
        return false;
    }
}

/**
 * Seed default questionnaire prompts
 */
export async function seedQuestionnairePrompts(): Promise<boolean> {
    try {
        const DEFAULT_PROMPTS = [
            // Section 1: Core Values
            {
                section: 'values', question_order: 1, question_text: 'What matters most to you in life? (Select up to 5)',
                question_type: 'multi_select',
                options: JSON.stringify(["Family & Relationships", "Career & Success", "Adventure & Travel", "Spirituality & Faith", "Community & Service", "Health & Wellness", "Creativity & Arts", "Financial Security", "Personal Growth", "Fun & Entertainment"]),
                weight: 30
            },
            // Section 2: Relationship Goals
            {
                section: 'goals', question_order: 2, question_text: 'What are you looking for?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Marriage within 2 years", "Long-term committed relationship", "Exploring possibilities", "Casual dating", "Not sure yet"]),
                weight: 25
            },
            {
                section: 'goals', question_order: 3, question_text: 'What qualities are most important in a partner? (Select top 5)',
                question_type: 'multi_select',
                options: JSON.stringify(["Honest & Trustworthy", "Ambitious & Driven", "Kind & Caring", "Adventurous", "Funny & Playful", "Intelligent", "Emotionally Available", "Family-Oriented", "Independent", "Romantic"]),
                weight: 20
            },
            // Section 3: Communication Style
            {
                section: 'communication', question_order: 4, question_text: 'How do you prefer to communicate?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Direct and straightforward", "Warm and emotional", "Thoughtful and reserved", "Balanced approach"]),
                weight: 15
            },
            {
                section: 'communication', question_order: 5, question_text: 'How do you handle disagreements?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Discuss immediately and resolve", "Need time alone to think first", "Prefer to avoid conflict", "Find compromise together"]),
                weight: 15
            },
            // Section 4: Lifestyle
            {
                section: 'lifestyle', question_order: 6, question_text: 'How would you describe your activity level?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Very active - gym, sports, outdoor activities", "Moderately active - regular walks, occasional sports", "Relaxed - prefer calm activities", "Homebody - enjoy indoor activities"]),
                weight: 10
            },
            {
                section: 'lifestyle', question_order: 7, question_text: 'Your social energy?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Extroverted - love being around people", "Introverted - prefer small groups or alone time", "Ambivert - depends on mood", "Selective - close friends only"]),
                weight: 10
            },
            {
                section: 'lifestyle', question_order: 8, question_text: 'How often do you like to travel?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Frequently - multiple trips per year", "Occasionally - few times a year", "Rarely - once a year or less", "Prefer staying local"]),
                weight: 10
            },
            // Section 5: Deal Breakers
            {
                section: 'dealbreakers', question_order: 9, question_text: 'What are your absolute deal-breakers? (Select all that apply)',
                question_type: 'multi_select',
                options: JSON.stringify(["Smoking", "Wants kids (if you don't)", "Doesn't want kids (if you do)", "Different religion", "Long distance", "Different political views", "Pets (if allergic)", "Workaholic lifestyle", "Party lifestyle"]),
                weight: 20
            },
            // Section 6: Personality & Love
            {
                section: 'personality', question_order: 10, question_text: 'What\'s your primary love language?',
                question_type: 'multiple_choice',
                options: JSON.stringify(["Words of Affirmation", "Quality Time", "Receiving Gifts", "Acts of Service", "Physical Touch"]),
                weight: 10
            },
            // Section 7: Deep Questions
            { section: 'deep', question_order: 11, question_text: 'Describe your ideal weekend', question_type: 'text', options: null, weight: 5 },
            { section: 'deep', question_order: 12, question_text: 'What are your life goals for the next 5 years?', question_type: 'text', options: null, weight: 5 },
            { section: 'deep', question_order: 13, question_text: 'What are you most passionate about?', question_type: 'text', options: null, weight: 5 }
        ];

        const { error } = await supabase
            .from('questionnaire_prompts')
            .upsert(DEFAULT_PROMPTS, { onConflict: 'question_order' }); // Use question_order as rough duplicate check if id not present

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error seeding questions:', error);
        return false;
    }
}

/**
 * Update a questionnaire prompt (Admin only)
 */
export async function updateQuestionnairePrompt(id: string, updates: Partial<QuestionnairePrompt>): Promise<boolean> {
    try {
        const updateData: any = {
            question_text: updates.questionText,
            question_type: updates.questionType,
            weight: updates.weight,
            options: updates.options ? JSON.stringify(updates.options) : undefined
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const { error } = await supabase
            .from('questionnaire_prompts')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating questionnaire prompt:', error);
        return false;
    }
}

/**
 * Get motivational message based on completion percentage
 */
export function getCompletionMessage(percentage: number): string {
    if (percentage === 100) {
        return "🎉 Perfect! Your profile is complete and optimized for the best matches!";
    } else if (percentage >= 80) {
        return "🌟 Almost there! Complete your profile to unlock perfect matches!";
    } else if (percentage >= 60) {
        return "💫 Great progress! Answer a few more questions for better matches!";
    } else if (percentage >= 40) {
        return "✨ You're halfway there! Keep going to find your perfect match!";
    } else if (percentage >= 20) {
        return "🚀 Good start! Complete your profile to get matched intelligently!";
    } else {
        return "💝 Welcome! Answer these questions to find your perfect match!";
    }
}
