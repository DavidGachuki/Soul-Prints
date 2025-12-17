export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  imageUrl: string;
  gallery: string[]; // Up to 5 images
  videoUrl?: string; // 30s-1m video
  // Soul Print specific
  deepAnswer1: string; // "What keeps you up at night?"
  deepAnswer2: string; // "What is your perfect Sunday?"
  soulAnalysis?: string; // AI generated persona
  // Inclusive identity fields
  genderIdentity?: 'woman' | 'man' | 'non-binary' | 'self-describe' | 'prefer-not-to-answer';
  genderSelfDescribe?: string;
  sexualOrientation?: string[]; // Multi-select
  orientationSelfDescribe?: string;
  relationshipStructure?: 'monogamous' | 'polyamorous' | 'open' | 'polyfidelity' | 'other' | 'prefer-not-to-answer';
  relationshipGoals?: string; // Long-term, exploring, etc.
  selfDescription?: string[]; // Up to 3 trait selections
  loveLanguage?: string; // Primary love language
  attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | 'unknown';
  languages?: string[]; // Language codes (e.g., ['en', 'es', 'fr'])
  // Enhanced personality data
  bigFiveTraits?: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
  settings?: UserSettings;
}

export interface UserSettings {
  discovery: DiscoverySettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface DiscoverySettings {
  ageMin: number;
  ageMax: number;
  maxDistance: number; // in miles
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface NotificationSettings {
  newMatches: boolean;
  messages: boolean;
  dailyEditorial: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showDistance: boolean;
}

export interface MatchProfile extends UserProfile {
  compatibilityScore?: number;
  compatibilityReason?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isAiGenerated?: boolean;
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export interface ChatSession {
  matchId: string;
  messages: Message[];
}

export enum AppView {
  LANDING = 'LANDING',
  PROFILE_CREATION = 'PROFILE_CREATION',
  DISCOVERY = 'DISCOVERY',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN'
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface RecentMessage extends Message {
  senderName: string;
  senderAvatar?: string;
}

export interface RecentMedia {
  url: string;
  type: 'image' | 'video';
  uploadedBy: string;
  timestamp: number;
}

// ============================================
// ADMIN ANALYTICS & STATS
// ============================================

export interface EngagementMetrics {
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  dauMauRatio: number; // Stickiness metric (DAU/MAU)
  avgSessionDuration: number; // In minutes
  avgSessionsPerUser: number;
  activeConversations: number; // Conversations with messages in last 24h
}

export interface RetentionMetrics {
  retention1Day: number; // % of users who return after 1 day
  retention7Day: number; // % of users who return after 7 days
  retention30Day: number; // % of users who return after 30 days
  churnRate: number; // % of users who stopped using the app
  newSignupsToday: number;
  newSignupsThisWeek: number;
  newSignupsThisMonth: number;
}

export interface MatchmakingMetrics {
  totalMatches: number;
  matchesLast24h: number;
  matchSuccessRate: number; // % of matches that lead to conversation
  avgTimeToFirstMatch: number; // In hours
  conversationRate: number; // % of matches with 3+ messages
  avgMessagesPerMatch: number;
  responseRate: number; // % of messages that get a response
}

export interface ContentMetrics {
  profileCompletionRate: number; // % of users with complete profiles
  avgPhotosPerUser: number;
  bioCompletionRate: number;
  soulAnalysisCompletionRate: number;
  totalMediaUploads: number;
}

export interface ModerationMetrics {
  pendingReports: number;
  totalReports: number;
  reportsLast24h: number;
  flaggedContent: number;
  bannedUsers: number;
  verifiedUsers: number;
  emailVerificationRate: number;
  photoVerificationRate: number;
}

export interface AdminStats {
  // Basic Counts
  totalUsers: number;
  totalMatches: number;
  totalMessages: number;

  // Enhanced Analytics
  engagement: EngagementMetrics;
  retention: RetentionMetrics;
  matchmaking: MatchmakingMetrics;
  content: ContentMetrics;
  moderation: ModerationMetrics;

  // Legacy fields (keep for backward compatibility)
  recentProfiles: UserProfile[];
  recentMessages: RecentMessage[];
  recentMedia: RecentMedia[];
  soulDistribution: Record<string, number>;
}

// User Report interface
export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportType: 'inappropriate_content' | 'harassment' | 'fake_profile' | 'spam' | 'other';
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
  actionTaken?: string;
}

// Content Flag interface
export interface ContentFlag {
  id: string;
  contentType: 'profile_photo' | 'profile_bio' | 'message' | 'profile_video';
  contentId: string;
  userId: string;
  userName: string;
  flagReason: string;
  flaggedBy: 'ai' | 'user' | 'admin';
  confidenceScore?: number;
  status: 'pending' | 'approved' | 'removed';
  createdAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
}