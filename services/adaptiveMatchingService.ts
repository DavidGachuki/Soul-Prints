// Adaptive Matching Service
// Combines questionnaire data + behavioral learning for continuously improving matches

import { supabase } from './supabaseClient';
import { UserProfile } from '../types';
import { findEnhancedMatches } from './enhancedMatchingService';
import { getLearnedPreferences, learnUserPreferences } from './behavioralTrackingService';

interface AdaptiveMatchScore {
    userId: string;
    baseScore: number; // From questionnaire matching
    behavioralBoost: number; // From learned preferences
    finalScore: number;
    reasons: string[];
}

/**
 * Adaptive matching that learns from user behavior
 * Week 1: Pure questionnaire matching
 * Week 2+: Blend questionnaire + observed behavior
 * Month 1+: Heavily weight behavioral patterns
 */
export async function findAdaptiveMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Get user's account age
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('id', userId)
            .single();

        if (!userProfile) return [];

        const accountAge = Math.floor(
            (Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get base matches from questionnaire
        const baseMatches = await findEnhancedMatches(userId, limit * 2);

        // If account is new (< 7 days), return pure questionnaire matches
        if (accountAge < 7) {
            return baseMatches.slice(0, limit);
        }

        // Learn from behavior
        await learnUserPreferences(userId);
        const learnedPrefs = await getLearnedPreferences(userId);

        if (!learnedPrefs || learnedPrefs.learning_confidence < 20) {
            // Not enough behavioral data yet
            return baseMatches.slice(0, limit);
        }

        // Calculate behavioral boost for each match
        const adaptiveScores: AdaptiveMatchScore[] = await Promise.all(
            baseMatches.map(async (match) => {
                const baseScore = match.compatibilityScore || 50;
                let behavioralBoost = 0;
                const boostReasons: string[] = [];

                // Get candidate's full profile
                const { data: candidate } = await supabase
                    .from('profiles')
                    .select('*, questionnaire:profile_questionnaire(*)')
                    .eq('id', match.id)
                    .single();

                if (!candidate) {
                    return {
                        userId: match.id,
                        baseScore,
                        behavioralBoost: 0,
                        finalScore: baseScore,
                        reasons: []
                    };
                }

                // Age preference match
                if (learnedPrefs.preferred_age_min && learnedPrefs.preferred_age_max) {
                    if (candidate.age >= learnedPrefs.preferred_age_min &&
                        candidate.age <= learnedPrefs.preferred_age_max) {
                        behavioralBoost += 10;
                        boostReasons.push('Matches your preferred age range');
                    }
                }

                // Interest overlap with learned preferences
                if (learnedPrefs.preferred_interests?.length > 0) {
                    const sharedInterests = candidate.interests?.filter((i: string) =>
                        learnedPrefs.preferred_interests.includes(i)
                    ) || [];

                    if (sharedInterests.length > 0) {
                        behavioralBoost += Math.min(15, sharedInterests.length * 5);
                        boostReasons.push(`Shares interests you typically like`);
                    }
                }

                // Communication style match (if learned)
                if (learnedPrefs.preferred_communication_style &&
                    candidate.questionnaire?.[0]?.communication_preference === learnedPrefs.preferred_communication_style) {
                    behavioralBoost += 10;
                    boostReasons.push('Communication style you prefer');
                }

                // Calculate weight based on account age and confidence
                const behavioralWeight = Math.min(0.4, (accountAge / 90) * 0.4); // Max 40% weight after 90 days
                const confidenceMultiplier = learnedPrefs.learning_confidence / 100;

                const finalBoost = behavioralBoost * behavioralWeight * confidenceMultiplier;
                const finalScore = Math.min(100, baseScore + finalBoost);

                return {
                    userId: match.id,
                    baseScore,
                    behavioralBoost: Math.round(finalBoost),
                    finalScore: Math.round(finalScore),
                    reasons: boostReasons
                };
            })
        );

        // Sort by final score
        adaptiveScores.sort((a, b) => b.finalScore - a.finalScore);

        // Get top matches and update their scores
        const topMatches = adaptiveScores.slice(0, limit);

        return topMatches.map(score => {
            const match = baseMatches.find(m => m.id === score.userId)!;
            return {
                ...match,
                compatibilityScore: score.finalScore,
                matchReasons: [
                    ...(match.matchReasons || []),
                    ...score.reasons
                ]
            } as any;
        });
    } catch (error) {
        console.error('Error in adaptive matching:', error);
        // Fallback to enhanced matching
        return findEnhancedMatches(userId, limit);
    }
}

/**
 * Get matching explanation for user
 */
export function getMatchingExplanation(accountAgeDays: number, learningConfidence: number): string {
    if (accountAgeDays < 7) {
        return "🎯 Matching based on your profile questionnaire";
    } else if (accountAgeDays < 30) {
        return `🧠 Matching based on questionnaire + early behavioral patterns (${learningConfidence}% confidence)`;
    } else {
        return `🚀 Adaptive matching using questionnaire + learned preferences (${learningConfidence}% confidence)`;
    }
}
