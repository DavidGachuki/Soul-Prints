import { supabase, DatabaseProfile, DatabaseMatch, DatabaseMessage } from './supabaseClient';
import { UserProfile, MatchProfile, Message } from '../types';

// Helper: Convert database profile to app profile
function dbProfileToAppProfile(dbProfile: DatabaseProfile): UserProfile {
    return {
        id: dbProfile.id,
        name: dbProfile.name,
        age: dbProfile.age,
        bio: dbProfile.bio || '',
        interests: dbProfile.interests || [],
        imageUrl: dbProfile.image_url || '',
        deepAnswer1: dbProfile.deep_answer_1,
        deepAnswer2: dbProfile.deep_answer_2,
        soulAnalysis: dbProfile.soul_analysis || undefined
    };
}

// Helper: Convert app profile to database profile
function appProfileToDbProfile(profile: Partial<UserProfile>) {
    return {
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        interests: profile.interests,
        image_url: profile.imageUrl,
        deep_answer_1: profile.deepAnswer1,
        deep_answer_2: profile.deepAnswer2,
        soul_analysis: profile.soulAnalysis
    };
}

// === PROFILE OPERATIONS ===

export async function createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([appProfileToDbProfile(profile)])
            .select()
            .single();

        if (error) throw error;
        return dbProfileToAppProfile(data);
    } catch (error) {
        console.error('Error creating profile:', error);
        return null;
    }
}

export async function getProfile(profileId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) throw error;
        return dbProfileToAppProfile(data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

export async function updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(appProfileToDbProfile(updates))
            .eq('id', profileId)
            .select()
            .single();

        if (error) throw error;
        return dbProfileToAppProfile(data);
    } catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
}

// === MATCH OPERATIONS ===

export async function getPotentialMatches(currentUserId: string): Promise<MatchProfile[]> {
    try {
        // Get all profiles except current user and already matched profiles
        const { data: matchedIds, error: matchError } = await supabase
            .from('matches')
            .select('profile_id_1, profile_id_2')
            .or(`profile_id_1.eq.${currentUserId},profile_id_2.eq.${currentUserId}`);

        if (matchError) throw matchError;

        // Extract IDs of already matched profiles
        const excludeIds = [currentUserId];
        matchedIds?.forEach(match => {
            if (match.profile_id_1 !== currentUserId) excludeIds.push(match.profile_id_1);
            if (match.profile_id_2 !== currentUserId) excludeIds.push(match.profile_id_2);
        });

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .not('id', 'in', `(${excludeIds.join(',')})`)
            .limit(10);

        if (error) throw error;
        return data.map(dbProfileToAppProfile);
    } catch (error) {
        console.error('Error fetching potential matches:', error);
        return [];
    }
}

export async function createMatch(
    userId1: string,
    userId2: string,
    compatibilityScore?: number,
    compatibilityReason?: string
): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('matches')
            .insert([{
                profile_id_1: userId1,
                profile_id_2: userId2,
                compatibility_score: compatibilityScore,
                compatibility_reason: compatibilityReason
            }])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating match:', error);
        return null;
    }
}

export async function getMatches(userId: string): Promise<MatchProfile[]> {
    try {
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .or(`profile_id_1.eq.${userId},profile_id_2.eq.${userId}`);

        if (matchError) throw matchError;
        if (!matches || matches.length === 0) return [];

        // Get all matched profile IDs
        const matchedProfileIds = matches.map(match =>
            match.profile_id_1 === userId ? match.profile_id_2 : match.profile_id_1
        );

        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', matchedProfileIds);

        if (profileError) throw profileError;

        // Combine profiles with compatibility data
        return profiles.map(profile => {
            const match = matches.find(m =>
                m.profile_id_1 === profile.id || m.profile_id_2 === profile.id
            );
            return {
                ...dbProfileToAppProfile(profile),
                compatibilityScore: match?.compatibility_score || undefined,
                compatibilityReason: match?.compatibility_reason || undefined
            };
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
    }
}

// === MESSAGE OPERATIONS ===

export async function sendMessage(
    matchId: string,
    senderId: string,
    text: string,
    isAiGenerated: boolean = false
): Promise<Message | null> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                match_id: matchId,
                sender_id: senderId,
                text,
                is_ai_generated: isAiGenerated
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            senderId: data.sender_id,
            text: data.text,
            timestamp: new Date(data.created_at).getTime(),
            isAiGenerated: data.is_ai_generated
        };
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

export async function getMessages(matchId: string): Promise<Message[]> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            text: msg.text,
            timestamp: new Date(msg.created_at).getTime(),
            isAiGenerated: msg.is_ai_generated
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getMatchIdForProfiles(userId1: string, userId2: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('matches')
            .select('id')
            .or(`and(profile_id_1.eq.${userId1},profile_id_2.eq.${userId2}),and(profile_id_1.eq.${userId2},profile_id_2.eq.${userId1})`)
            .single();

        if (error) throw error;
        return data?.id || null;
    } catch (error) {
        console.error('Error fetching match ID:', error);
        return null;
    }
}

// === REAL-TIME SUBSCRIPTIONS ===

export function subscribeToMessages(matchId: string, callback: (message: Message) => void) {
    const subscription = supabase
        .channel(`messages:${matchId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `match_id=eq.${matchId}`
            },
            (payload) => {
                const msg = payload.new as DatabaseMessage;
                callback({
                    id: msg.id,
                    senderId: msg.sender_id,
                    text: msg.text,
                    timestamp: new Date(msg.created_at).getTime(),
                    isAiGenerated: msg.is_ai_generated
                });
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}
