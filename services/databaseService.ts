import { supabase, DatabaseProfile, DatabaseMatch, DatabaseMessage } from './supabaseClient';
import { UserProfile, MatchProfile, Message, AdminStats, RecentMessage } from '../types';

// Helper: Convert database profile to app profile
function dbProfileToAppProfile(dbProfile: DatabaseProfile): UserProfile {
    return {
        id: dbProfile.id,
        name: dbProfile.name,
        age: dbProfile.age,
        bio: dbProfile.bio || '',
        interests: dbProfile.interests || [],
        imageUrl: dbProfile.image_url || '',
        gallery: dbProfile.gallery || (dbProfile.image_url ? [dbProfile.image_url] : []),
        videoUrl: dbProfile.video_url || undefined,
        deepAnswer1: dbProfile.deep_answer_1,
        deepAnswer2: dbProfile.deep_answer_2,
        soulAnalysis: dbProfile.soul_analysis || undefined,
        settings: dbProfile.settings as any || undefined
    };
}

// Helper: Convert app profile to database profile
function appProfileToDbProfile(profile: Partial<UserProfile>) {
    return {
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        interests: profile.interests,
        image_url: profile.imageUrl || (profile.gallery && profile.gallery[0]),
        gallery: profile.gallery,
        video_url: profile.videoUrl,
        deep_answer_1: profile.deepAnswer1,
        deep_answer_2: profile.deepAnswer2,
        soul_analysis: profile.soulAnalysis,
        settings: profile.settings
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

export async function getAllUsers(): Promise<UserProfile[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(dbProfileToAppProfile);
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
}

export async function deleteUser(profileId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
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
    isAiGenerated: boolean = false,
    mediaType?: 'image' | 'video',
    mediaUrl?: string
): Promise<Message | null> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                match_id: matchId,
                sender_id: senderId,
                text: text || '',
                type: mediaType || 'text',
                media_url: mediaUrl,
                is_ai_generated: isAiGenerated
            }])
            .select()
            .single();

        if (error) throw error;

        return parseMessage(data);
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

function parseMessage(msg: DatabaseMessage): Message {
    return {
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.created_at).getTime(),
        isAiGenerated: msg.is_ai_generated,
        type: (msg.type as 'text' | 'image' | 'video') || 'text',
        mediaUrl: msg.media_url || undefined
    };
}

export async function getMessages(matchId: string): Promise<Message[]> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map(parseMessage);
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
                callback(parseMessage(msg));
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}

// === ADMIN STATS ===

export async function getAdminStats(): Promise<AdminStats | null> {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Parallel fetching for performance
        const [
            usersCount,
            matchesCount,
            messagesCount,
            recentProfilesData,
            soulData,
            recentMessagesData,
            allProfiles,
            allMatches,
            messagesLast24h,
            newUsersToday,
            newUsersWeek,
            newUsersMonth
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('matches').select('*', { count: 'exact', head: true }),
            supabase.from('messages').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
            supabase.from('profiles').select('soul_analysis, bio, gallery'),
            supabase.from('messages')
                .select('*, sender:profiles(name, image_url)')
                .order('created_at', { ascending: false })
                .limit(50),
            supabase.from('profiles').select('id, created_at'),
            supabase.from('matches').select('id, created_at'),
            supabase.from('messages').select('id, created_at, match_id').gte('created_at', yesterday.toISOString()),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString())
        ]);

        // ============================================
        // ENGAGEMENT METRICS
        // ============================================

        // Calculate DAU (users active in last 24h) - using last_active_at if available
        const activeProfiles = allProfiles.data || [];
        const dau = activeProfiles.filter(p => {
            if (!p.last_active_at) return false;
            const lastActive = new Date(p.last_active_at);
            return lastActive >= yesterday;
        }).length;

        // Calculate MAU (users active in last 30 days)
        const mau = activeProfiles.filter(p => {
            if (!p.last_active_at) return false;
            const lastActive = new Date(p.last_active_at);
            return lastActive >= monthAgo;
        }).length;

        const dauMauRatio = mau > 0 ? (dau / mau) * 100 : 0;

        // Active conversations (matches with messages in last 24h)
        const activeMatchIds = new Set((messagesLast24h.data || []).map(m => m.match_id));
        const activeConversations = activeMatchIds.size;

        const engagement = {
            dau,
            mau,
            dauMauRatio: Math.round(dauMauRatio * 100) / 100,
            avgSessionDuration: 0, // Placeholder - would need session tracking
            avgSessionsPerUser: 0, // Placeholder - would need session tracking
            activeConversations
        };

        // ============================================
        // RETENTION METRICS
        // ============================================

        // Calculate retention (simplified - would need user_activity_log for accuracy)
        const totalUsers = usersCount.count || 0;
        const activeUsersLast7Days = activeProfiles.filter(p => {
            if (!p.last_active_at) return false;
            const lastActive = new Date(p.last_active_at);
            return lastActive >= weekAgo;
        }).length;

        const retention = {
            retention1Day: 0, // Placeholder - needs activity log
            retention7Day: totalUsers > 0 ? Math.round((activeUsersLast7Days / totalUsers) * 100) : 0,
            retention30Day: totalUsers > 0 ? Math.round((mau / totalUsers) * 100) : 0,
            churnRate: totalUsers > 0 ? Math.round(((totalUsers - mau) / totalUsers) * 100) : 0,
            newSignupsToday: newUsersToday.count || 0,
            newSignupsThisWeek: newUsersWeek.count || 0,
            newSignupsThisMonth: newUsersMonth.count || 0
        };

        // ============================================
        // MATCHMAKING METRICS
        // ============================================

        const totalMatches = matchesCount.count || 0;
        const matchesData = allMatches.data || [];
        const matchesLast24h = matchesData.filter(m => {
            const matchDate = new Date(m.created_at);
            return matchDate >= yesterday;
        }).length;

        // Calculate match success rate (matches with at least 1 message)
        const { data: matchesWithMessages } = await supabase
            .from('messages')
            .select('match_id')
            .limit(1000); // Sample

        const uniqueMatchesWithMessages = new Set((matchesWithMessages || []).map(m => m.match_id)).size;
        const matchSuccessRate = totalMatches > 0 ? Math.round((uniqueMatchesWithMessages / totalMatches) * 100) : 0;

        // Calculate conversation rate (matches with 3+ messages)
        const { data: messagesByMatch } = await supabase
            .from('messages')
            .select('match_id');

        const messageCounts: Record<string, number> = {};
        (messagesByMatch || []).forEach(m => {
            messageCounts[m.match_id] = (messageCounts[m.match_id] || 0) + 1;
        });

        const conversationsCount = Object.values(messageCounts).filter(count => count >= 3).length;
        const conversationRate = totalMatches > 0 ? Math.round((conversationsCount / totalMatches) * 100) : 0;

        const totalMessages = messagesCount.count || 0;
        const avgMessagesPerMatch = totalMatches > 0 ? Math.round(totalMessages / totalMatches) : 0;

        const matchmaking = {
            totalMatches,
            matchesLast24h,
            matchSuccessRate,
            avgTimeToFirstMatch: 0, // Placeholder - needs match timing data
            conversationRate,
            avgMessagesPerMatch,
            responseRate: 0 // Placeholder - needs message response tracking
        };

        // ============================================
        // CONTENT METRICS
        // ============================================

        const profiles = soulData.data || [];
        const profilesWithBio = profiles.filter(p => p.bio && p.bio.length > 10).length;
        const profilesWithSoulAnalysis = profiles.filter(p => p.soul_analysis).length;
        const totalPhotos = profiles.reduce((sum, p) => sum + (p.gallery?.length || 0), 0);

        const content = {
            profileCompletionRate: totalUsers > 0 ? Math.round((profilesWithBio / totalUsers) * 100) : 0,
            avgPhotosPerUser: totalUsers > 0 ? Math.round((totalPhotos / totalUsers) * 10) / 10 : 0,
            bioCompletionRate: totalUsers > 0 ? Math.round((profilesWithBio / totalUsers) * 100) : 0,
            soulAnalysisCompletionRate: totalUsers > 0 ? Math.round((profilesWithSoulAnalysis / totalUsers) * 100) : 0,
            totalMediaUploads: totalPhotos
        };

        // ============================================
        // MODERATION METRICS
        // ============================================

        // Get moderation data (these tables may not exist yet, so handle gracefully)
        let pendingReports = 0;
        let totalReports = 0;
        let reportsLast24h = 0;
        let flaggedContent = 0;

        try {
            const { count: reportsCount } = await supabase
                .from('user_reports')
                .select('*', { count: 'exact', head: true });
            totalReports = reportsCount || 0;

            const { count: pendingCount } = await supabase
                .from('user_reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            pendingReports = pendingCount || 0;

            const { count: recentCount } = await supabase
                .from('user_reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', yesterday.toISOString());
            reportsLast24h = recentCount || 0;

            const { count: flagsCount } = await supabase
                .from('content_flags')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            flaggedContent = flagsCount || 0;
        } catch (e) {
            // Tables don't exist yet, use defaults
            console.log('Moderation tables not yet created');
        }

        const moderation = {
            pendingReports,
            totalReports,
            reportsLast24h,
            flaggedContent,
            bannedUsers: 0, // Placeholder - account_status column doesn't exist yet
            verifiedUsers: 0, // Placeholder - verification columns don't exist yet
            emailVerificationRate: 0,
            photoVerificationRate: 0
        };

        // ============================================
        // LEGACY DATA (for backward compatibility)
        // ============================================

        // Process soul analysis distribution
        const soulDistribution: Record<string, number> = {};
        profiles.forEach((profile: { soul_analysis: string | null }) => {
            if (profile.soul_analysis) {
                const type = "Analyzed Souls";
                soulDistribution[type] = (soulDistribution[type] || 0) + 1;
            } else {
                soulDistribution['Pending'] = (soulDistribution['Pending'] || 0) + 1;
            }
        });

        // Process messages
        const recentMessages = (recentMessagesData.data || []).map((msg: any) => ({
            ...parseMessage(msg),
            senderName: msg.sender?.name || 'Unknown',
            senderAvatar: msg.sender?.image_url
        }));

        // Collect recent media
        const media: any[] = [];
        recentMessages.forEach(msg => {
            if (msg.mediaUrl) {
                media.push({
                    url: msg.mediaUrl,
                    type: msg.type === 'video' ? 'video' : 'image',
                    uploadedBy: msg.senderName,
                    timestamp: msg.timestamp
                });
            }
        });

        const stats: AdminStats = {
            totalUsers,
            totalMatches,
            totalMessages,
            engagement,
            retention,
            matchmaking,
            content,
            moderation,
            recentProfiles: (recentProfilesData.data || []).map(dbProfileToAppProfile),
            recentMessages,
            recentMedia: media,
            soulDistribution
        };

        return stats;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return null;
    }
}

export const getMessagesForUser = async (userId: string): Promise<RecentMessage[]> => {
    // 1. Find matches for this user to get context
    const { data: matches } = await supabase
        .from('matches')
        .select('id')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (!matches || matches.length === 0) return [];

    const matchIds = matches.map(m => m.id);

    // 2. Fetch messages for these matches
    const { data: messages } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles(name, image_url)
        `)
        .in('match_id', matchIds)
        .order('created_at', { ascending: false });

    return messages?.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender?.name || (msg.sender_id === userId ? 'User' : 'Match'),
        senderAvatar: msg.sender?.image_url,
        text: msg.content,
        timestamp: msg.created_at,
        isAiGenerated: msg.is_ai_generated,
        type: msg.media_type || 'text',
        mediaUrl: msg.media_url
    })) || [];
};
