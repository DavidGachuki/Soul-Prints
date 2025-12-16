// Enhanced Custom Matching Service with Questionnaire Data
// Uses behavioral signals and profile questionnaire for intelligent matching

import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

interface EnhancedMatchScore {
    userId: string;
    totalScore: number;
    breakdown: {
        values: number;           // 30%
        relationshipGoals: number; // 25%
        lifestyle: number;        // 20%
        communication: number;    // 15%
        personality: number;      // 10%
    };
    reasons: string[];
}

// Calculate values alignment score (0-100)
function scoreValues(user1Values: string[], user2Values: string[]): number {
    if (!user1Values?.length || !user2Values?.length) return 50; // Neutral if missing

    const sharedValues = user1Values.filter(v => user2Values.includes(v));
    const totalValues = new Set([...user1Values, ...user2Values]).size;

    const overlapPercent = (sharedValues.length / totalValues) * 100;

    if (overlapPercent >= 60) return 100;
    if (overlapPercent >= 40) return 85;
    if (overlapPercent >= 20) return 65;
    return 40;
}

// Calculate relationship goals compatibility (0-100)
function scoreRelationshipGoals(user1Intent: string, user2Intent: string): number {
    if (!user1Intent || !user2Intent) return 50;

    // Exact match
    if (user1Intent === user2Intent) return 100;

    // Compatible intents
    const compatible: Record<string, string[]> = {
        'marriage_soon': ['long_term'],
        'long_term': ['marriage_soon', 'exploring'],
        'exploring': ['long_term', 'casual'],
        'casual': ['exploring']
    };

    if (compatible[user1Intent]?.includes(user2Intent)) return 70;

    // Incompatible
    return 20;
}

// Calculate lifestyle compatibility (0-100)
function scoreLifestyle(user1: any, user2: any): number {
    let score = 0;
    let factors = 0;

    // Activity level
    if (user1.activity_level && user2.activity_level) {
        const activityMatch = user1.activity_level === user2.activity_level;
        score += activityMatch ? 100 : 60;
        factors++;
    }

    // Social preference
    if (user1.social_preference && user2.social_preference) {
        const socialMatch = user1.social_preference === user2.social_preference;
        score += socialMatch ? 100 : 70;
        factors++;
    }

    // Travel frequency
    if (user1.travel_frequency && user2.travel_frequency) {
        const travelMatch = user1.travel_frequency === user2.travel_frequency;
        score += travelMatch ? 100 : 75;
        factors++;
    }

    return factors > 0 ? score / factors : 50;
}

// Calculate communication compatibility (0-100)
function scoreCommunication(user1: any, user2: any): number {
    let score = 0;
    let factors = 0;

    // Communication style
    if (user1.communication_preference && user2.communication_preference) {
        const styleMatch = user1.communication_preference === user2.communication_preference;
        score += styleMatch ? 100 : 65;
        factors++;
    }

    // Conflict resolution
    if (user1.conflict_resolution && user2.conflict_resolution) {
        const conflictMatch = user1.conflict_resolution === user2.conflict_resolution;
        score += conflictMatch ? 100 : 70;
        factors++;
    }

    return factors > 0 ? score / factors : 50;
}

// Calculate personality compatibility (0-100)
function scorePersonality(user1LoveLang: string, user2LoveLang: string): number {
    if (!user1LoveLang || !user2LoveLang) return 50;

    // Same love language is good
    if (user1LoveLang === user2LoveLang) return 90;

    // Complementary love languages
    const complementary: Record<string, string[]> = {
        'words': ['time', 'acts'],
        'time': ['words', 'touch'],
        'gifts': ['acts', 'words'],
        'acts': ['words', 'gifts'],
        'touch': ['time', 'words']
    };

    if (complementary[user1LoveLang]?.includes(user2LoveLang)) return 75;

    return 60;
}

// Check for deal-breaker conflicts
function hasDealBreakerConflict(user1: any, user2: any): boolean {
    const user1Dealbreakers = user1.absolute_dealbreakers || [];
    const user2Dealbreakers = user2.absolute_dealbreakers || [];

    // Check if either user's traits match the other's dealbreakers
    // This would require more profile data - for now, return false
    return false;
}

// Generate match reasons
function generateMatchReasons(user1: any, user2: any, scores: any): string[] {
    const reasons: string[] = [];

    // Values
    if (scores.values >= 80) {
        const sharedValues = user1.core_values?.filter((v: string) =>
            user2.core_values?.includes(v)
        ) || [];
        if (sharedValues.length > 0) {
            reasons.push(`Both value ${sharedValues.slice(0, 2).join(' and ')}`);
        }
    }

    // Relationship goals
    if (scores.relationshipGoals >= 80) {
        reasons.push(`Both seeking ${user1.relationship_timeline?.replace('_', ' ')}`);
    }

    // Communication
    if (scores.communication >= 80) {
        reasons.push(`Similar communication styles`);
    }

    // Lifestyle
    if (scores.lifestyle >= 80) {
        reasons.push(`Compatible lifestyles and activity levels`);
    }

    // Personality
    if (scores.personality >= 75) {
        reasons.push(`Complementary love languages`);
    }

    return reasons;
}

/**
 * Enhanced matching with questionnaire data
 */
export async function findEnhancedMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Get current user's profile and questionnaire
        const [{ data: currentUser }, { data: currentQuestionnaire }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('profile_questionnaire').select('*').eq('user_id', userId).single()
        ]);

        if (!currentUser) throw new Error('User not found');

        // Get existing matches to exclude
        const { data: existingMatches } = await supabase
            .from('matches')
            .select('user_id_1, user_id_2')
            .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

        const excludedIds = new Set([userId]);
        existingMatches?.forEach(m => {
            excludedIds.add(m.user_id_1);
            excludedIds.add(m.user_id_2);
        });

        // Get potential candidates with questionnaire data
        const { data: candidates } = await supabase
            .from('profiles')
            .select(`
                *,
                questionnaire:profile_questionnaire(*)
            `)
            .not('id', 'in', `(${Array.from(excludedIds).join(',')})`)
            .gte('profile_completion_score', 40) // Only match with reasonably complete profiles
            .limit(100);

        if (!candidates || candidates.length === 0) return [];

        // Score each candidate
        const scoredCandidates: EnhancedMatchScore[] = candidates.map(candidate => {
            const candidateQ = candidate.questionnaire?.[0] || {};

            // Calculate individual scores
            const valuesScore = scoreValues(
                currentQuestionnaire?.core_values || [],
                candidateQ.core_values || []
            );

            const goalsScore = scoreRelationshipGoals(
                currentQuestionnaire?.relationship_timeline,
                candidateQ.relationship_timeline
            );

            const lifestyleScore = scoreLifestyle(currentQuestionnaire, candidateQ);
            const communicationScore = scoreCommunication(currentQuestionnaire, candidateQ);
            const personalityScore = scorePersonality(
                currentQuestionnaire?.love_language_primary,
                candidateQ.love_language_primary
            );

            // Check for deal-breakers
            if (hasDealBreakerConflict(currentQuestionnaire, candidateQ)) {
                return {
                    userId: candidate.id,
                    totalScore: 0,
                    breakdown: { values: 0, relationshipGoals: 0, lifestyle: 0, communication: 0, personality: 0 },
                    reasons: []
                };
            }

            // Calculate weighted total score
            const totalScore =
                (valuesScore * 0.30) +
                (goalsScore * 0.25) +
                (lifestyleScore * 0.20) +
                (communicationScore * 0.15) +
                (personalityScore * 0.10);

            const breakdown = {
                values: valuesScore,
                relationshipGoals: goalsScore,
                lifestyle: lifestyleScore,
                communication: communicationScore,
                personality: personalityScore
            };

            const reasons = generateMatchReasons(currentQuestionnaire, candidateQ, breakdown);

            return {
                userId: candidate.id,
                totalScore: Math.round(totalScore),
                breakdown,
                reasons
            };
        });

        // Sort by total score
        scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

        // Get top matches
        const topMatches = scoredCandidates.slice(0, limit);

        // Convert to UserProfile format
        const matchedProfiles = topMatches
            .filter(score => score.totalScore >= 50) // Minimum compatibility threshold
            .map(score => {
                const candidate = candidates.find(c => c.id === score.userId)!;
                return {
                    id: candidate.id,
                    name: candidate.name,
                    age: candidate.age,
                    bio: candidate.bio || '',
                    interests: candidate.interests || [],
                    imageUrl: candidate.image_url || '',
                    gallery: candidate.gallery || [],
                    videoUrl: candidate.video_url,
                    deepAnswer1: candidate.deep_answer_1,
                    deepAnswer2: candidate.deep_answer_2,
                    soulAnalysis: candidate.soul_analysis,
                    // Add compatibility info
                    compatibilityScore: score.totalScore,
                    matchReasons: score.reasons
                } as any;
            });

        return matchedProfiles;
    } catch (error) {
        console.error('Error in enhanced matching:', error);
        return [];
    }
}
