// Questionnaire Type Definitions
// Research-backed question types and response formats

export type QuestionDimension = 'values' | 'goals' | 'lifestyle' | 'communication' | 'personality';

export interface OnboardingQuestion {
    id: string;
    question: string;
    type: 'single' | 'multi' | 'text';
    options?: string[];
    dimension: QuestionDimension | 'demographic';
    required: boolean;
    allowPreferNotToAnswer?: boolean;
    citation?: string;
}

export interface ArcadePrompt {
    id: string;
    text: string;
    type: 'tap' | 'swipe' | 'drag';
    dimension: QuestionDimension;
    weight: number;
    citation?: string;
}

export interface StoryPrompt {
    id: string;
    prompt: string;
    placeholder?: string;
    dimension: QuestionDimension;
    maxLength: number;
    sensitive?: boolean;
    citation?: string;
}

export interface QuickListItem {
    id: string;
    label: string;
    category: 'values' | 'personality' | 'lifestyle' | 'needs';
    dimension: QuestionDimension;
    citation?: string;
}

export interface QuestionnaireResponse {
    userId: string;
    onboarding?: Record<string, any>;
    arcade?: Record<string, any>;
    story?: Record<string, string>;
    quickList?: string[];
    completedAt?: Date;
}

export interface DimensionScore {
    values: number;
    goals: number;
    lifestyle: number;
    communication: number;
    personality: number;
}

// Inclusive identity types
export type GenderIdentity =
    | 'woman'
    | 'man'
    | 'non-binary'
    | 'self-describe'
    | 'prefer-not-to-answer';

export type SexualOrientation =
    | 'gay-lesbian'
    | 'bisexual'
    | 'straight'
    | 'pansexual'
    | 'queer'
    | 'asexual'
    | 'aromantic'
    | 'self-describe'
    | 'prefer-not-to-answer';

export type RelationshipStructure =
    | 'monogamous'
    | 'polyamorous'
    | 'open'
    | 'polyfidelity'
    | 'other'
    | 'prefer-not-to-answer';

export type AttachmentStyle =
    | 'secure'
    | 'anxious'
    | 'avoidant'
    | 'disorganized'
    | 'unknown';
