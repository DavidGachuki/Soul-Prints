import { StoryPrompt } from '../types/questionnaire';

// Story Mode: Narrative & Reflective Prompts
// Designed for deep self-discovery and qualitative AI matching

export const STORY_PROMPTS: StoryPrompt[] = [
    {
        id: 'disappointment',
        prompt: 'Think of a time a partner or loved one disappointed you. What happened, and how did you cope or respond?',
        placeholder: 'Describe the situation and your response...',
        dimension: 'communication',
        maxLength: 500,
        sensitive: false,
        citation: 'Reveals conflict style and resilience'
    },

    {
        id: 'future_celebration',
        prompt: 'Imagine your ideal long-term commitment celebration (e.g., 10-year anniversary). Describe what that day is like.',
        placeholder: 'Paint a picture of your ideal anniversary...',
        dimension: 'goals',
        maxLength: 500,
        sensitive: false,
        citation: 'Envisioning future reveals core values'
    },

    {
        id: 'budget_compromise',
        prompt: 'Suppose you and your partner both love travel, but you have different budgets. How would you handle planning a vacation together?',
        placeholder: 'Describe your approach to compromise...',
        dimension: 'lifestyle',
        maxLength: 500,
        sensitive: false,
        citation: 'Uncovers compromise style and priorities'
    },

    {
        id: 'conflict_instinct',
        prompt: 'When you feel angry or upset with someone you care about, what is your instinct? Do you talk it out right away, or take space until you cool off? Give an example.',
        placeholder: 'Share your conflict management style...',
        dimension: 'communication',
        maxLength: 500,
        sensitive: false,
        citation: 'Directly probes conflict management compatibility'
    },

    {
        id: 'sacrifice',
        prompt: 'Describe a sacrifice you made for a past relationship or friendship. Why was it important to you?',
        placeholder: 'Tell us about a meaningful sacrifice...',
        dimension: 'values',
        maxLength: 500,
        sensitive: false,
        citation: 'Reveals altruism, loyalty, and priorities'
    },

    {
        id: 'role_model',
        prompt: 'Think of someone you admire (fictional or real) for how they handle relationships. What do they do that inspires you?',
        placeholder: 'Describe what you admire...',
        dimension: 'values',
        maxLength: 500,
        sensitive: false,
        citation: 'Identifies aspirational traits'
    },

    {
        id: 'society_change',
        prompt: 'If you could change one thing about how society dates or starts relationships, what would it be?',
        placeholder: 'Share what you would change and why...',
        dimension: 'values',
        maxLength: 500,
        sensitive: false,
        citation: 'Gets at meta-values and deal-breakers'
    },

    {
        id: 'perfect_weekend',
        prompt: 'Describe your perfect weekend. Who are you with and what are you doing?',
        placeholder: 'Paint a picture of your ideal weekend...',
        dimension: 'lifestyle',
        maxLength: 500,
        sensitive: false,
        citation: 'Summarizes daily-life values and preferences'
    }
];

// Helper to get story prompt by ID
export const getStoryPrompt = (id: string): StoryPrompt | undefined => {
    return STORY_PROMPTS.find(p => p.id === id);
};

// Get all non-sensitive prompts
export const getNonSensitivePrompts = (): StoryPrompt[] => {
    return STORY_PROMPTS.filter(p => !p.sensitive);
};

// Get prompts by dimension
export const getPromptsByDimension = (dimension: string): StoryPrompt[] => {
    return STORY_PROMPTS.filter(p => p.dimension === dimension);
};
