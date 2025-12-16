// Unified Matching Service
// Routes to AI or Custom matching based on platform settings

import { findCustomMatches, getMatchingSettings } from './customMatchingService';
import { UserProfile } from '../types';

/**
 * Main matching function that routes to appropriate matching engine
 * @param userId - Current user's ID
 * @param limit - Number of matches to return
 * @returns Array of matched user profiles
 */
export async function findMatches(userId: string, limit: number = 20): Promise<UserProfile[]> {
    try {
        // Get platform matching settings
        const settings = await getMatchingSettings();

        if (settings.ai_enabled) {
            // Try AI matching first
            try {
                // TODO: Implement AI matching service
                // const aiMatches = await aiMatchingService.findMatches(userId, limit);
                // return aiMatches;

                // For now, fall through to custom matching
                console.log('AI matching not yet implemented, using custom matching');
                throw new Error('AI matching not implemented');
            } catch (aiError) {
                console.error('AI matching failed:', aiError);

                // Fallback to custom matching if enabled
                if (settings.fallback_to_custom) {
                    console.log('Falling back to custom matching');
                    return await findCustomMatches(userId, limit);
                }

                throw aiError;
            }
        } else {
            // Use custom matching
            return await findCustomMatches(userId, limit);
        }
    } catch (error) {
        console.error('Error in unified matching service:', error);
        // Last resort: try custom matching
        try {
            return await findCustomMatches(userId, limit);
        } catch (fallbackError) {
            console.error('Fallback matching also failed:', fallbackError);
            return [];
        }
    }
}

export { getMatchingSettings, updateMatchingSettings } from './customMatchingService';
