// Collaborative Filtering Service
// "Users like you also liked..." - Pattern-based matching for new users

import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

/**
 * Find similar users based on shared characteristics
 * Used for collaborative filtering recommendations
 */
async function findSimilarUsers(userId: string, limit: number = 10): Promise<string[]> {
    try {
        // Get current user's profile and questionnaire
        const { data: currentUser } = await supabase
            .from('profiles')
            .select(`
                *,
                questionnaire:profile_questionnaire(*)
            `)
            .eq('id', userId)
            .single();

        if (!currentUser) return [];

        const currentQ = currentUser.questionnaire?.[0];
        if (!currentQ) return [];

        // Find users with similar characteristics
        const { data: similarUsers } = await supabase
            .from('profile_questionnaire')
            .select('user_id')
            .neq('user_id', userId)
            .limit(100);

        if (!similarUsers) return [];

        // Score similarity
        const scoredUsers = await Promise.all(
            similarUsers.map(async (user) => {
                const { data: userData } = await supabase
                    .from('profile_questionnaire')
                    .select('*')
                    .eq('user_id', user.user_id)
                    .single();

                if (!userData) return { userId: user.user_id, score: 0 };

                let similarityScore = 0;

                // Same core values
                const sharedValues = currentQ.core_values?.filter((v: string) =>
                    userData.core_values?.includes(v)
                ) || [];
                similarityScore += sharedValues.length * 10;

                // Same relationship intent
                if (currentQ.relationship_timeline === userData.relationship_timeline) {
                    similarityScore += 20;
                }

                // Same communication style
                if (currentQ.communication_preference === userData.communication_preference) {
                    similarityScore += 15;
                }

                // Same lifestyle
                if (currentQ.activity_level === userData.activity_level) {
                    similarityScore += 10;
                }

                // Same love language
                if (currentQ.love_language_primary === userData.love_language_primary) {
                    similarityScore += 10;
                }

                return { userId: user.user_id, score: similarityScore };
            })
        );

        // Sort by similarity and return top matches
        return scoredUsers
            .filter(u => u.score >= 30) // Minimum similarity threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(u => u.userId);
    } catch (error) {
        console.error('Error finding similar users:', error);
        return [];
    }
}

/**
 * Collaborative filtering: Find matches based on what similar users liked
 * Perfect for new users with no behavioral data
 */
export async function findCollaborativeMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Find users similar to current user
        const similarUserIds = await findSimilarUsers(userId, 20);

        if (similarUserIds.length === 0) {
            return [];
        }

        // Get who these similar users liked
        const { data: similarUsersLikes } = await supabase
            .from('user_interactions')
            .select('target_user_id')
            .in('user_id', similarUserIds)
            .eq('action_type', 'like')
            .limit(200);

        if (!similarUsersLikes || similarUsersLikes.length === 0) {
            return [];
        }

        // Count how many similar users liked each profile
        const likeCounts: Record<string, number> = {};
        similarUsersLikes.forEach(like => {
            likeCounts[like.target_user_id] = (likeCounts[like.target_user_id] || 0) + 1;
        });

        // Sort by popularity among similar users
        const popularProfiles = Object.entries(likeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([profileId]) => profileId);

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

        // Filter out already matched users
        const availableProfiles = popularProfiles.filter(id => !excludedIds.has(id));

        // Get full profiles
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', availableProfiles);

        if (!profiles) return [];

        // Convert to UserProfile format with collaborative score
        return profiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio || '',
            interests: profile.interests || [],
            imageUrl: profile.image_url || '',
            gallery: profile.gallery || [],
            videoUrl: profile.video_url,
            deepAnswer1: profile.deep_answer_1,
            deepAnswer2: profile.deep_answer_2,
            soulAnalysis: profile.soul_analysis,
            compatibilityScore: Math.min(100, likeCounts[profile.id] * 10),
            matchReasons: [`${likeCounts[profile.id]} users like you also liked this profile`]
        } as any));
    } catch (error) {
        console.error('Error in collaborative filtering:', error);
        return [];
    }
}

/**
 * Hybrid matching: Combines collaborative filtering with questionnaire matching
 * Best for users with some data but not enough for full behavioral learning
 */
export async function findHybridMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Get both types of matches
        const [collaborativeMatches, questionnaireMatches] = await Promise.all([
            findCollaborativeMatches(userId, limit),
            // Import and use enhanced matching
            import('./enhancedMatchingService').then(m => m.findEnhancedMatches(userId, limit))
        ]);

        // Merge and deduplicate
        const allMatches = new Map<string, any>();

        // Add questionnaire matches (base)
        questionnaireMatches.forEach(match => {
            allMatches.set(match.id, {
                ...match,
                sources: ['questionnaire']
            });
        });

        // Boost or add collaborative matches
        collaborativeMatches.forEach(match => {
            if (allMatches.has(match.id)) {
                // Profile appears in both - boost score
                const existing = allMatches.get(match.id);
                existing.compatibilityScore = Math.min(100, existing.compatibilityScore + 15);
                existing.matchReasons = [
                    ...existing.matchReasons,
                    'Popular among users like you'
                ];
                existing.sources.push('collaborative');
            } else {
                // New profile from collaborative filtering
                allMatches.set(match.id, {
                    ...match,
                    sources: ['collaborative']
                });
            }
        });

        // Sort by score and return top matches
        return Array.from(allMatches.values())
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, limit);
    } catch (error) {
        console.error('Error in hybrid matching:', error);
        return [];
    }
}
