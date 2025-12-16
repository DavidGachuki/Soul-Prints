// Behavioral Tracking Service
// Logs user interactions and learns preferences over time

import { supabase } from './supabaseClient';

export type InteractionType = 'view' | 'like' | 'pass' | 'message' | 'unmatch' | 'block';
export type MatchOutcome = 'met_offline' | 'dating' | 'relationship' | 'ghosted' | 'unmatched' | 'blocked';

/**
 * Log a user interaction
 */
export async function logInteraction(
    userId: string,
    targetUserId: string,
    actionType: InteractionType,
    durationSeconds?: number,
    context?: any
): Promise<boolean> {
    try {
        const { error } = await supabase.rpc('log_user_interaction', {
            p_user_id: userId,
            p_target_user_id: targetUserId,
            p_action_type: actionType,
            p_duration_seconds: durationSeconds,
            p_context: context
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error logging interaction:', error);
        return false;
    }
}

/**
 * Get user's interaction patterns
 */
export async function getUserInteractionPatterns(userId: string) {
    try {
        const { data: interactions } = await supabase
            .from('user_interactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (!interactions) return null;

        // Analyze patterns
        const likes = interactions.filter(i => i.action_type === 'like');
        const passes = interactions.filter(i => i.action_type === 'pass');
        const views = interactions.filter(i => i.action_type === 'view');

        const selectivityScore = likes.length > 0
            ? Math.round((likes.length / (likes.length + passes.length)) * 100)
            : 50;

        const avgViewDuration = views.length > 0
            ? Math.round(views.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / views.length)
            : 0;

        return {
            totalInteractions: interactions.length,
            likes: likes.length,
            passes: passes.length,
            views: views.length,
            selectivityScore,
            avgViewDuration
        };
    } catch (error) {
        console.error('Error getting interaction patterns:', error);
        return null;
    }
}

/**
 * Record match outcome
 */
export async function recordMatchOutcome(
    matchId: string,
    outcome: MatchOutcome,
    reportedBy: string,
    notes?: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('match_outcomes')
            .insert({
                match_id: matchId,
                outcome,
                reported_by: reportedBy,
                outcome_date: new Date().toISOString(),
                notes
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error recording match outcome:', error);
        return false;
    }
}

/**
 * Get conversation metrics for a match
 */
export async function getConversationMetrics(matchId: string) {
    try {
        const { data } = await supabase
            .from('conversation_metrics')
            .select('*')
            .eq('match_id', matchId)
            .single();

        return data;
    } catch (error) {
        console.error('Error getting conversation metrics:', error);
        return null;
    }
}

/**
 * Learn user preferences from behavior
 * Analyzes likes/passes to identify patterns
 */
export async function learnUserPreferences(userId: string): Promise<boolean> {
    try {
        // Get user's likes and passes
        const { data: interactions } = await supabase
            .from('user_interactions')
            .select(`
                *,
                target:profiles!user_interactions_target_user_id_fkey(*)
            `)
            .eq('user_id', userId)
            .in('action_type', ['like', 'pass'])
            .limit(50);

        if (!interactions || interactions.length < 10) {
            // Not enough data to learn
            return false;
        }

        const likes = interactions.filter(i => i.action_type === 'like');
        const passes = interactions.filter(i => i.action_type === 'pass');

        // Analyze liked profiles
        const likedAges = likes.map(l => l.target?.age).filter(Boolean);
        const likedInterests = likes.flatMap(l => l.target?.interests || []);
        const likedValues = likes.flatMap(l => l.target?.values || []);

        // Calculate preferences
        const preferredAgeMin = likedAges.length > 0 ? Math.min(...likedAges) : null;
        const preferredAgeMax = likedAges.length > 0 ? Math.max(...likedAges) : null;

        // Find most common interests in liked profiles
        const interestCounts: Record<string, number> = {};
        likedInterests.forEach(interest => {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
        const preferredInterests = Object.entries(interestCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([interest]) => interest);

        // Calculate selectivity
        const selectivityScore = Math.round((likes.length / interactions.length) * 100);

        // Save learned preferences
        const { error } = await supabase
            .from('learned_preferences')
            .upsert({
                user_id: userId,
                preferred_age_min: preferredAgeMin,
                preferred_age_max: preferredAgeMax,
                preferred_interests: preferredInterests,
                selectivity_score: selectivityScore,
                learning_confidence: Math.min(100, interactions.length * 2),
                last_updated: new Date().toISOString()
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error learning user preferences:', error);
        return false;
    }
}

/**
 * Get learned preferences for a user
 */
export async function getLearnedPreferences(userId: string) {
    try {
        const { data } = await supabase
            .from('learned_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        return data;
    } catch (error) {
        console.error('Error getting learned preferences:', error);
        return null;
    }
}
