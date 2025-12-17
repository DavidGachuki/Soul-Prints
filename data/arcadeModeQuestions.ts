import { Heart, Compass, Home, Briefcase, Sparkles, DollarSign, Palette, GraduationCap, Shield, Users } from 'lucide-react';
import { ArcadePrompt } from '../types/questionnaire';

// ============================================
// POP YOUR VALUES - Value Bubble Game
// ============================================

export const VALUE_BUBBLES = [
    {
        id: 'honesty',
        value: 'Honesty',
        label: 'HONEST',
        icon: Shield,
        dimension: 'values' as const,
        weight: 10,
        citation: 'Trust/honesty strongly predicts commitment'
    },
    {
        id: 'adventure',
        value: 'Adventure',
        label: 'ADVENTURE',
        icon: Compass,
        dimension: 'values' as const,
        weight: 10,
        citation: 'Openness and adventure predict synergy'
    },
    {
        id: 'family',
        value: 'Family',
        label: 'FAMILY',
        icon: Home,
        dimension: 'values' as const,
        weight: 10,
        citation: 'Family focus predicts long-term harmony'
    },
    {
        id: 'career',
        value: 'Career',
        label: 'CAREER',
        icon: Briefcase,
        dimension: 'values' as const,
        weight: 8,
        citation: 'Work-life values prevent clashes'
    },
    {
        id: 'spirituality',
        value: 'Spirituality',
        label: 'FAITH',
        icon: Sparkles,
        dimension: 'values' as const,
        weight: 10,
        citation: 'Religious alignment reduces conflict'
    },
    {
        id: 'financial_security',
        value: 'Financial Security',
        label: 'SECURITY',
        icon: DollarSign,
        dimension: 'values' as const,
        weight: 8,
        citation: 'Financial priorities can be deal-breakers'
    },
    {
        id: 'creativity',
        value: 'Creativity',
        label: 'CREATIVE',
        icon: Palette,
        dimension: 'values' as const,
        weight: 7,
        citation: 'Shared creative pursuits bond partners'
    },
    {
        id: 'growth',
        value: 'Personal Growth',
        label: 'GROWTH',
        icon: GraduationCap,
        dimension: 'values' as const,
        weight: 8,
        citation: 'Learning values foster growth relationships'
    },
    {
        id: 'loyalty',
        value: 'Loyalty',
        label: 'LOYAL',
        icon: Heart,
        dimension: 'values' as const,
        weight: 9,
        citation: 'Loyalty vs freedom indicates trust values'
    },
    {
        id: 'community',
        value: 'Community Impact',
        label: 'IMPACT',
        icon: Users,
        dimension: 'values' as const,
        weight: 7,
        citation: 'Prosocial values encourage empathy'
    }
];

// ============================================
// VIBE CHECK - Lifestyle Swipe Scenarios
// ============================================

export const LIFESTYLE_CARDS = [
    {
        id: 'friday_night',
        text: 'Friday night: Would you rather go to a big party or stay home with a book?',
        yesValue: { social_preference: 'extroverted' },
        noValue: { social_preference: 'introverted' },
        dimension: 'lifestyle' as const,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    },
    {
        id: 'travel_style',
        text: 'Travel: I plan every detail vs. I go wherever the day takes me',
        yesValue: { travel_style: 'spontaneous' },
        noValue: { travel_style: 'planned' },
        dimension: 'lifestyle' as const,
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'
    },
    {
        id: 'social_openness',
        text: 'Meeting someone new: I open up quickly vs. I stay reserved at first',
        yesValue: { openness: 'high' },
        noValue: { openness: 'low' },
        dimension: 'personality' as const,
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400'
    },
    {
        id: 'hosting',
        text: 'Out of town guest: You love hosting and making them happy',
        yesValue: { hospitality: 'high' },
        noValue: { hospitality: 'independent' },
        dimension: 'lifestyle' as const,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
    },
    {
        id: 'surprises',
        text: 'I like to plan surprises (birthdays, trips) for people I care about',
        yesValue: { acts_of_service: 'high' },
        noValue: { acts_of_service: 'low' },
        dimension: 'communication' as const,
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400'
    },
    {
        id: 'routine',
        text: 'I prefer a fixed weekly schedule vs. my plans change week by week',
        yesValue: { conscientiousness: 'high' },
        noValue: { conscientiousness: 'low' },
        dimension: 'personality' as const,
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'
    },
    {
        id: 'conflict_timing',
        text: 'When upset, I prefer to talk immediately vs. take time to cool off',
        yesValue: { conflict_resolution: 'discuss_immediately' },
        noValue: { conflict_resolution: 'need_space' },
        dimension: 'communication' as const,
        image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400'
    },
    {
        id: 'evening_activity',
        text: 'Which sounds more fun: a night out dancing vs. cozy movie night in?',
        yesValue: { activity_level: 'very_active' },
        noValue: { activity_level: 'relaxed' },
        dimension: 'lifestyle' as const,
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
    },
    {
        id: 'planning_preference',
        text: 'I make to-do lists for fun vs. I feel constrained by too many plans',
        yesValue: { organization: 'high' },
        noValue: { organization: 'low' },
        dimension: 'personality' as const,
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'
    },
    {
        id: 'change_reaction',
        text: 'If faced with a surprise life change (e.g. moving cities), I feel excited vs. anxious',
        yesValue: { emotional_stability: 'high', openness_to_change: 'high' },
        noValue: { emotional_stability: 'low', openness_to_change: 'low' },
        dimension: 'personality' as const,
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
    }
];

// ============================================
// DEFEND YOUR HEART - Dealbreakers
// ============================================

export const DEALBREAKER_ITEMS = [
    {
        id: 'hygiene',
        value: 'Poor hygiene',
        label: 'Poor Hygiene',
        citation: 'Top deal-breaker (Psychology Today research)',
        sensitive: false
    },
    {
        id: 'smoking',
        value: 'Smoking',
        label: 'Smoking',
        citation: 'Substance habits rank high on deal-breaker lists',
        sensitive: false
    },
    {
        id: 'abuse_history',
        value: 'History of abuse',
        label: 'Abuse History',
        citation: 'Safety is paramount; handle with sensitivity',
        sensitive: true
    },
    {
        id: 'religion_clash',
        value: 'Major religion clash',
        label: 'Religion Clash',
        citation: 'Religious incompatibility ranked highly',
        sensitive: false
    },
    {
        id: 'kids_disagreement',
        value: 'Conflicting views on children',
        label: 'Kids Conflict',
        citation: 'Kids/no-kids is a classic dealbreaker',
        sensitive: false
    },
    {
        id: 'jealousy',
        value: 'Excessive jealousy',
        label: 'Jealousy',
        citation: 'Controlling behavior erodes trust',
        sensitive: false
    },
    {
        id: 'dishonesty',
        value: 'Dishonesty',
        label: 'Dishonest',
        citation: 'Honesty at heart of trust',
        sensitive: false
    },
    {
        id: 'political_clash',
        value: 'Major political conflicts',
        label: 'Politics',
        citation: 'Extreme value mismatches cause disagreements',
        sensitive: false
    },
    {
        id: 'previous_marriage',
        value: 'Previously married or has children',
        label: 'Past Ties',
        citation: 'Pre-commitments affect timeline',
        sensitive: false
    },
    {
        id: 'unhealthy_lifestyle',
        value: 'Unhealthy lifestyle',
        label: 'Unhealthy',
        citation: 'Health/lifestyle top concerns',
        sensitive: false
    },
    {
        id: 'anger_issues',
        value: 'Aggressive behavior',
        label: 'Aggression',
        citation: 'Anger risks safety; top disqualifier',
        sensitive: true
    },
    {
        id: 'incompatible_priorities',
        value: 'Different life priorities',
        label: 'Priorities',
        citation: 'Core priority clashes are deal-breakers',
        sensitive: false
    }
];

// ============================================
// PRIORITY PYRAMID - Life Goals Ranking
// ============================================

export const PRIORITY_ITEMS = [
    { id: 'family', label: 'Building a Family', dimension: 'goals' as const },
    { id: 'career', label: 'Career Success', dimension: 'goals' as const },
    { id: 'adventure', label: 'Travel & Adventure', dimension: 'values' as const },
    { id: 'stability', label: 'Financial Stability', dimension: 'values' as const },
    { id: 'creativity', label: 'Creative Pursuits', dimension: 'values' as const },
    { id: 'health', label: 'Health & Wellness', dimension: 'lifestyle' as const },
    { id: 'community', label: 'Community Impact', dimension: 'values' as const },
    { id: 'learning', label: 'Lifelong Learning', dimension: 'values' as const }
];
