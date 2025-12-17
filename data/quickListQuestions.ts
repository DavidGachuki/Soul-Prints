import { QuickListItem } from '../types/questionnaire';

// Quick List: Structured Checklist for Rapid Profile Completion
// ~20 items across 4 categories

// ============================================
// CATEGORY 1: VALUES
// ============================================

export const VALUES_ITEMS: QuickListItem[] = [
    {
        id: 'family_community',
        label: 'Family & Community',
        category: 'values',
        dimension: 'values',
        citation: 'Shared core values predict satisfaction'
    },
    {
        id: 'personal_growth',
        label: 'Personal Growth & Learning',
        category: 'values',
        dimension: 'values',
        citation: 'Growth orientation fosters relationship development'
    },
    {
        id: 'adventure_novelty',
        label: 'Adventure & Novelty',
        category: 'values',
        dimension: 'values',
        citation: 'Openness to experience predicts compatibility'
    },
    {
        id: 'security_stability',
        label: 'Security & Stability',
        category: 'values',
        dimension: 'values',
        citation: 'Financial/emotional security preferences align'
    },
    {
        id: 'tradition_culture',
        label: 'Tradition & Culture',
        category: 'values',
        dimension: 'values',
        citation: 'Cultural heritage shared values'
    }
];

// ============================================
// CATEGORY 2: PERSONALITY TRAITS
// ============================================

export const PERSONALITY_ITEMS: QuickListItem[] = [
    {
        id: 'introverted',
        label: 'Introverted',
        category: 'personality',
        dimension: 'personality',
        citation: 'Big Five extraversion dimension'
    },
    {
        id: 'extroverted',
        label: 'Extroverted',
        category: 'personality',
        dimension: 'personality',
        citation: 'Big Five extraversion dimension'
    },
    {
        id: 'organized',
        label: 'Organized & Planned',
        category: 'personality',
        dimension: 'personality',
        citation: 'Conscientiousness predicts stability'
    },
    {
        id: 'spontaneous',
        label: 'Spontaneous & Flexible',
        category: 'personality',
        dimension: 'personality',
        citation: 'Low conscientiousness, high openness'
    },
    {
        id: 'emotional',
        label: 'Emotional & Expressive',
        category: 'personality',
        dimension: 'personality',
        citation: 'Neuroticism/emotional expression facet'
    },
    {
        id: 'logical',
        label: 'Logical & Analytical',
        category: 'personality',
        dimension: 'personality',
        citation: 'Thinking vs feeling preference'
    },
    {
        id: 'patient',
        label: 'Patient & Calm',
        category: 'personality',
        dimension: 'personality',
        citation: 'Low neuroticism, emotional stability'
    },
    {
        id: 'adventurous',
        label: 'Adventurous & Risk-taking',
        category: 'personality',
        dimension: 'personality',
        citation: 'High openness to experience'
    },
    {
        id: 'cautious',
        label: 'Cautious & Careful',
        category: 'personality',
        dimension: 'personality',
        citation: 'Risk aversion, conscientiousness'
    }
];

// ============================================
// CATEGORY 3: LIFESTYLE PREFERENCES
// ============================================

export const LIFESTYLE_ITEMS: QuickListItem[] = [
    {
        id: 'night_owl',
        label: 'Night Owl',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Circadian rhythm compatibility'
    },
    {
        id: 'early_bird',
        label: 'Early Bird',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Morning routine alignment'
    },
    {
        id: 'homebody',
        label: 'Homebody',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Links to introversion, lifestyle match'
    },
    {
        id: 'social_butterfly',
        label: 'Social Butterfly',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Extraversion, social energy'
    },
    {
        id: 'fitness_enthusiast',
        label: 'Fitness Enthusiast',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Activity level compatibility'
    },
    {
        id: 'laid_back',
        label: 'Laid-back Leisure',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Complementary energy levels'
    },
    {
        id: 'healthy_eater',
        label: 'Healthy Eater',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Diet/health habit alignment'
    },
    {
        id: 'comfort_food',
        label: 'Comfort Food Lover',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Food preferences impact cohabitation'
    },
    {
        id: 'pet_owner',
        label: 'Pet Owner/Animal Lover',
        category: 'lifestyle',
        dimension: 'lifestyle',
        citation: 'Lifestyle compatibility factor'
    }
];

// ============================================
// CATEGORY 4: RELATIONSHIP NEEDS
// ============================================

export const RELATIONSHIP_NEEDS_ITEMS: QuickListItem[] = [
    {
        id: 'open_communication',
        label: 'Open & Honest Communication',
        category: 'needs',
        dimension: 'communication',
        citation: 'Critical for conflict resolution (Gottman)'
    },
    {
        id: 'independence',
        label: 'Personal Space & Independence',
        category: 'needs',
        dimension: 'communication',
        citation: 'Autonomy needs in relationships'
    },
    {
        id: 'affection_support',
        label: 'Affection & Emotional Support',
        category: 'needs',
        dimension: 'communication',
        citation: 'Secure attachment indicator'
    },
    {
        id: 'shared_goals',
        label: 'Shared Life Goals',
        category: 'needs',
        dimension: 'goals',
        citation: 'Goal alignment predicts satisfaction'
    },
    {
        id: 'adventure_together',
        label: 'Trying New Things Together',
        category: 'needs',
        dimension: 'lifestyle',
        citation: 'Shared experiences bond couples'
    }
];

// ============================================
// COMBINED EXPORT
// ============================================

export const QUICK_LIST_ITEMS = {
    values: VALUES_ITEMS,
    personality: PERSONALITY_ITEMS,
    lifestyle: LIFESTYLE_ITEMS,
    needs: RELATIONSHIP_NEEDS_ITEMS
};

// Helper to get all items as flat array
export const getAllQuickListItems = (): QuickListItem[] => {
    return [
        ...VALUES_ITEMS,
        ...PERSONALITY_ITEMS,
        ...LIFESTYLE_ITEMS,
        ...RELATIONSHIP_NEEDS_ITEMS
    ];
};

// Get items by category
export const getItemsByCategory = (category: string): QuickListItem[] => {
    return getAllQuickListItems().filter(item => item.category === category);
};
