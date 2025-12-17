import { OnboardingQuestion } from '../types/questionnaire';

// Research-backed onboarding questions for inclusive profiling
// Citations from Northeastern Univ., Psychology Today, relationship research

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
    {
        id: 'gender_identity',
        question: 'What is your gender identity?',
        type: 'single',
        options: [
            'Woman',
            'Man',
            'Non-binary',
            'Prefer to self-describe',
            'Prefer not to answer'
        ],
        dimension: 'demographic',
        required: false,
        allowPreferNotToAnswer: true,
        citation: 'Northeastern Univ. guidelines on inclusive gender options'
    },

    {
        id: 'sexual_orientation',
        question: 'What is your sexual orientation or the gender(s) you\'re attracted to?',
        type: 'multi',
        options: [
            'Gay/Lesbian',
            'Bisexual',
            'Straight/Heterosexual',
            'Pansexual',
            'Queer',
            'Asexual',
            'Aromantic',
            'Prefer to self-describe',
            'Prefer not to answer'
        ],
        dimension: 'demographic',
        required: false,
        allowPreferNotToAnswer: true,
        citation: 'Inclusivity for LGBTQ+ users (Northeastern research)'
    },

    {
        id: 'relationship_structure',
        question: 'Which relationship structure do you prefer?',
        type: 'single',
        options: [
            'Monogamous (one partner)',
            'Polyamorous (multiple partners)',
            'Open (non-monogamous with transparency)',
            'Polyfidelity',
            'Other',
            'Prefer not to say'
        ],
        dimension: 'lifestyle',
        required: false,
        allowPreferNotToAnswer: true,
        citation: 'Psychology Today research on non-monogamy compatibility'
    },

    {
        id: 'relationship_goals',
        question: 'What are you looking for right now?',
        type: 'single',
        options: [
            'Long-term commitment/marriage',
            'Serious relationship',
            'Casual dating/friendship',
            'Marriage eventually',
            'Unsure/Exploring'
        ],
        dimension: 'goals',
        required: true,
        citation: 'Goal alignment predicts satisfaction (r=.61, relationship research)'
    },

    {
        id: 'self_description',
        question: 'Which of these best describes you? (Select up to 3)',
        type: 'multi',
        options: [
            'Ambitious/Career-focused',
            'Family-oriented',
            'Free-spirited/Adventurous',
            'Homebody/Coziness',
            'Socially active/Extroverted',
            'Reflective/Introverted',
            'Creative/Artistic',
            'Logical/Analytical'
        ],
        dimension: 'values',
        required: true,
        citation: 'Shared values predict marital satisfaction (0.61 correlation)'
    },

    {
        id: 'love_language',
        question: "What's your primary love language?",
        type: 'single',
        options: [
            'Quality Time',
            'Words of Affirmation',
            'Acts of Service',
            'Physical Touch',
            'Gifts'
        ],
        dimension: 'communication',
        required: true,
        citation: 'Quality Time & Words most predictive of feeling loved (NCBI research)'
    }
];

// Helper to get onboarding question by ID
export const getOnboardingQuestion = (id: string): OnboardingQuestion | undefined => {
    return ONBOARDING_QUESTIONS.find(q => q.id === id);
};

// Get required onboarding questions
export const getRequiredOnboardingQuestions = (): OnboardingQuestion[] => {
    return ONBOARDING_QUESTIONS.filter(q => q.required);
};
