import { Zap, Heart, Star, Cloud, Sun, Coffee, Music, Book, Smile, Globe, Camera, Briefcase, Home, Map } from 'lucide-react';
import { QuestionnaireAnswers } from '../../services/profileCompletionService';

// Level 1: Value Hunter (Bubbles)
export const VALUE_BUBBLES = [
    { id: 'nature', label: 'Nature', icon: Sun, value: 'Nature' },
    { id: 'creativity', label: 'Creativity', icon: Zap, value: 'Creativity' },
    { id: 'family', label: 'Family', icon: Heart, value: 'Family & Relationships' },
    { id: 'growth', label: 'Growth', icon: Star, value: 'Personal Growth' },
    { id: 'wealth', label: 'Wealth', icon: Briefcase, value: 'Financial Security' },
    { id: 'travel', label: 'Travel', icon: Globe, value: 'Adventure & Travel' },
    { id: 'peace', label: 'Peace', icon: Cloud, value: 'Health & Wellness' },
    { id: 'community', label: 'Community', icon: Home, value: 'Community' },
];

// Level 2: Vibe Check (Swipe Deck)
export const LIFESTYLE_CARDS = [
    {
        id: 'outdoors',
        text: 'I prefer mountains over malls.',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop', // Placeholder - in real app use assets
        yesValue: { coreValues: ['Nature'], idealWeekend: 'Hiking and exploring nature.' },
        noValue: { idealWeekend: 'Shopping and city vibes.' } // Implicit
    },
    {
        id: 'party',
        text: 'Friday night is for partying.',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
        yesValue: { socialPreference: 'extroverted', activityLevel: 'social_butterfly' },
        noValue: { socialPreference: 'introverted' }
    },
    {
        id: 'pets',
        text: 'Must love dogs.',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop',
        yesValue: { absoluteDealbreakers: 'Must love animals' },
        noValue: {}
    }
];

// Level 3: Dealbreaker Defender (Smash items)
export const DEALBREAKER_ITEMS = [
    { id: 'smoker', label: 'Smoking', value: 'Smoking' },
    { id: 'arrogance', label: 'Arrogance', value: 'Arrogance' },
    { id: 'messy', label: 'Messiness', value: 'Poor Hygiene' },
    { id: 'bad_communicator', label: 'Silent Treatment', value: 'Poor Communication' },
    { id: 'negativity', label: 'Pessimism', value: 'Negativity' },
    { id: 'controlling', label: 'Controlling', value: 'Controlling Behavior' },
];

// Level 4: Priority Pyramid (Ranking)
export const PRIORITY_ITEMS = [
    { id: 'career', label: 'Career Success' },
    { id: 'family', label: 'Family & Kids' },
    { id: 'travel', label: 'World Travel' },
    { id: 'creativity', label: 'Artistic Expression' },
    { id: 'social_impact', label: 'Helping Others' },
];
