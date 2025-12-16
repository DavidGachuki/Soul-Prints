// Smart Custom Matching Service
// Proximity-based, interest-driven matching algorithm

import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

interface MatchScore {
    userId: string;
    totalScore: number;
    proximityScore: number;
    interestScore: number;
    ageScore: number;
    completenessScore: number;
    activityScore: number;
}

interface UserPreferences {
    ageMin: number;
    ageMax: number;
    maxDistanceKm: number;
    preferredInterests?: string[];
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Score proximity (0-100)
function scoreProximity(distance: number | null, maxDistance: number): number {
    if (distance === null) return 50; // Neutral score if no location
    if (distance <= 5) return 100; // Very close
    if (distance <= 25) return 80;
    if (distance <= maxDistance) return 60;
    if (distance <= maxDistance * 2) return 30;
    return 10; // Too far
}

// Score interest overlap (0-100)
function scoreInterests(userInterests: string[], candidateInterests: string[]): number {
    if (!userInterests?.length || !candidateInterests?.length) return 40; // Neutral

    const commonInterests = userInterests.filter(i =>
        candidateInterests.some(ci => ci.toLowerCase() === i.toLowerCase())
    );

    const overlapPercent = (commonInterests.length / Math.max(userInterests.length, candidateInterests.length)) * 100;

    if (overlapPercent >= 50) return 100;
    if (overlapPercent >= 30) return 80;
    if (overlapPercent >= 15) return 60;
    if (overlapPercent > 0) return 40;
    return 20;
}

// Score age compatibility (0-100)
function scoreAge(userAge: number, candidateAge: number, preferences: UserPreferences): number {
    // Check if candidate is within user's preferred age range
    if (candidateAge < preferences.ageMin || candidateAge > preferences.ageMax) {
        return 0; // Outside preferences
    }

    const ageDiff = Math.abs(userAge - candidateAge);

    if (ageDiff <= 2) return 100;
    if (ageDiff <= 5) return 90;
    if (ageDiff <= 10) return 70;
    if (ageDiff <= 15) return 50;
    return 30;
}

// Score profile completeness (0-100)
function scoreCompleteness(profile: any): number {
    let score = 0;

    if (profile.bio && profile.bio.length > 50) score += 25;
    if (profile.gallery && profile.gallery.length >= 3) score += 25;
    if (profile.soul_analysis) score += 25;
    if (profile.interests && profile.interests.length >= 3) score += 25;

    return score;
}

// Score activity level (0-100)
function scoreActivity(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

    // Newer profiles get higher scores (more likely to be active)
    if (daysSinceCreation <= 7) return 100;
    if (daysSinceCreation <= 30) return 80;
    if (daysSinceCreation <= 90) return 60;
    if (daysSinceCreation <= 180) return 40;
    return 20;
}

export async function findCustomMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Get current user's profile and preferences
        const { data: currentUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!currentUser) throw new Error('User not found');

        // Get user preferences (or use defaults)
        const { data: prefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        const preferences: UserPreferences = {
            ageMin: prefs?.age_min || 18,
            ageMax: prefs?.age_max || 99,
            maxDistanceKm: prefs?.max_distance_km || 50,
            preferredInterests: prefs?.preferred_interests
        };

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

        // Get potential candidates
        const { data: candidates } = await supabase
            .from('profiles')
            .select('*')
            .not('id', 'in', `(${Array.from(excludedIds).join(',')})`)
            .gte('age', preferences.ageMin)
            .lte('age', preferences.ageMax)
            .limit(100); // Get more candidates for better scoring

        if (!candidates || candidates.length === 0) return [];

        // Get matching weights from platform settings
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('setting_value')
            .eq('setting_key', 'matching_mode')
            .single();

        const weights = settings?.setting_value?.custom_weights || {
            proximity: 0.3,
            interests: 0.25,
            age: 0.15,
            completeness: 0.15,
            activity: 0.15
        };

        // Score each candidate
        const scoredCandidates: MatchScore[] = candidates.map(candidate => {
            // Calculate distance if both have location
            let distance: number | null = null;
            if (currentUser.location_lat && currentUser.location_lng &&
                candidate.location_lat && candidate.location_lng) {
                distance = calculateDistance(
                    currentUser.location_lat,
                    currentUser.location_lng,
                    candidate.location_lat,
                    candidate.location_lng
                );
            }

            // Calculate individual scores
            const proximityScore = scoreProximity(distance, preferences.maxDistanceKm);
            const interestScore = scoreInterests(currentUser.interests || [], candidate.interests || []);
            const ageScore = scoreAge(currentUser.age, candidate.age, preferences);
            const completenessScore = scoreCompleteness(candidate);
            const activityScore = scoreActivity(candidate.created_at);

            // Calculate weighted total score
            const totalScore =
                (proximityScore * weights.proximity) +
                (interestScore * weights.interests) +
                (ageScore * weights.age) +
                (completenessScore * weights.completeness) +
                (activityScore * weights.activity);

            return {
                userId: candidate.id,
                totalScore,
                proximityScore,
                interestScore,
                ageScore,
                completenessScore,
                activityScore
            };
        });

        // Sort by total score (highest first)
        scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

        // Get top matches
        const topMatches = scoredCandidates.slice(0, limit);

        // Convert back to UserProfile format
        const matchedProfiles = topMatches.map(score => {
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
                soulAnalysis: candidate.soul_analysis
            };
        });

        return matchedProfiles;
    } catch (error) {
        console.error('Error in custom matching:', error);
        return [];
    }
}

// Get platform matching settings
export async function getMatchingSettings() {
    const { data } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'matching_mode')
        .single();

    return data?.setting_value || { ai_enabled: true, fallback_to_custom: true };
}

// Update platform matching settings
export async function updateMatchingSettings(settings: any) {
    const { error } = await supabase
        .from('platform_settings')
        .update({
            setting_value: settings,
            updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'matching_mode');

    if (error) throw error;
    return true;
}
