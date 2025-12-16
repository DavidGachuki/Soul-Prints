import { Coffee, Moon, Sun, Map, Book, Users, Heart, Briefcase, Smile, Mic, Home, Globe } from 'lucide-react';
import { QuestionnaireAnswers } from '../services/profileCompletionService';

export interface GameScenarioOption {
    id: string;
    text: string;
    description?: string;
    icon: any; // Lucide icon
    mappedAnswers: Partial<QuestionnaireAnswers>;
    visualTheme?: string;
}

export interface GameScenario {
    id: string;
    title: string;
    scenario: string;
    backgroundClass: string; // Tailwind class for background gradient/color
    options: GameScenarioOption[];
}

export const SOUL_JOURNEY_SCENARIOS: GameScenario[] = [
    {
        id: 'friday_night',
        title: 'The Friday Vibe',
        scenario: "It's Friday night after a long week. The city is buzzing with energy, but your living room looks incredibly cozy. What's your move?",
        backgroundClass: 'bg-gradient-to-br from-indigo-900 to-purple-800',
        options: [
            {
                id: 'out_town',
                text: 'Hit the Town',
                description: 'Dinner, drinks, and meeting new people.',
                icon: Users,
                mappedAnswers: {
                    socialPreference: 'extroverted',
                    activityLevel: 'social_butterfly'
                }
            },
            {
                id: 'cozy_in',
                text: 'Cozy Night In',
                description: 'Takeout, a movie, and total relaxation.',
                icon: Home,
                mappedAnswers: {
                    socialPreference: 'introverted',
                    activityLevel: 'homebody'
                }
            },
            {
                id: 'adventure',
                text: 'Late Night Drive',
                description: 'Exploring somewhere new spontaneously.',
                icon: Map,
                mappedAnswers: {
                    socialPreference: 'ambivert',
                    activityLevel: 'adventurous'
                }
            }
        ]
    },
    {
        id: 'dream_vacation',
        title: 'The Ticket',
        scenario: "You just won a free ticket to anywhere. Where are you booking your flight?",
        backgroundClass: 'bg-gradient-to-br from-blue-400 to-teal-300',
        options: [
            {
                id: 'nature_hike',
                text: 'Hiking in Patagonia',
                description: 'Mountains, backpacks, and pure nature.',
                icon: Sun,
                mappedAnswers: {
                    coreValues: ['Nature', 'Adventure'],
                    travelFrequency: 'frequent'
                }
            },
            {
                id: 'city_culture',
                text: 'Art in Paris',
                description: 'Museums, cafes, and history.',
                icon: Coffee,
                mappedAnswers: {
                    coreValues: ['Creativity', 'Culture'],
                    idealWeekend: 'Exploring a new city and finding hidden gems.'
                }
            },
            {
                id: 'beach_relax',
                text: 'Beach in Bali',
                description: 'Sun, reading, and doing absolutely nothing.',
                icon: Book,
                mappedAnswers: {
                    coreValues: ['Health & Wellness', 'Peace'],
                    idealWeekend: 'Reading a book by the ocean with zero stress.'
                }
            }
        ]
    },
    {
        id: 'conflict_style',
        title: 'The Disagreement',
        scenario: "You and a close friend disagree on something important. The tension is rising. How do you react?",
        backgroundClass: 'bg-gradient-to-br from-orange-400 to-red-400',
        options: [
            {
                id: 'talk_now',
                text: 'Talk it Out Now',
                description: 'Address it immediately to clear the air.',
                icon: Mic,
                mappedAnswers: {
                    conflictResolution: 'discuss_immediately',
                    communicationPreference: 'direct'
                }
            },
            {
                id: 'cool_off',
                text: 'Cool Off First',
                description: 'Take space to think before speaking.',
                icon: Moon,
                mappedAnswers: {
                    conflictResolution: 'needs_space',
                    communicationPreference: 'thoughtful'
                }
            },
            {
                id: 'smooth_over',
                text: 'Keep the Peace',
                description: 'Change the subject to avoid a fight.',
                icon: Smile,
                mappedAnswers: {
                    conflictResolution: 'avoid_conflict',
                    communicationPreference: 'balanced'
                }
            }
        ]
    },
    {
        id: 'future_vision',
        title: 'The Time Capsule',
        scenario: "You're writing a letter to your future self 5 years from now. What is the headline of your life?",
        backgroundClass: 'bg-gradient-to-br from-emerald-600 to-green-400',
        options: [
            {
                id: 'career_focused',
                text: 'CEO of My Life',
                description: 'Career success and building an empire.',
                icon: Briefcase,
                mappedAnswers: {
                    lifeGoals: 'Advancing my career and building financial freedom.',
                    coreValues: ['Career & Success', 'Financial Security']
                }
            },
            {
                id: 'family_focused',
                text: 'Happy Home',
                description: 'Starting a family and settling down.',
                icon: Heart,
                mappedAnswers: {
                    relationshipTimeline: 'marriage_soon',
                    lifeGoals: 'Building a loving family and a stable home.',
                    coreValues: ['Family & Relationships']
                }
            },
            {
                id: 'growth_focused',
                text: 'World Traveler',
                description: 'Seen half the world and learned 3 languages.',
                icon: Globe,
                mappedAnswers: {
                    relationshipTimeline: 'exploring',
                    lifeGoals: 'Traveling the world and experiencing new cultures.',
                    coreValues: ['Adventure & Travel', 'Personal Growth']
                }
            }
        ]
    }
];
