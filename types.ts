export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  imageUrl: string;
  // Soul Print specific
  deepAnswer1: string; // "What keeps you up at night?"
  deepAnswer2: string; // "What is your perfect Sunday?"
  soulAnalysis?: string; // AI generated persona
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
}

export interface ChatSession {
  matchId: string;
  messages: Message[];
}

export enum AppView {
  LANDING = 'LANDING',
  PROFILE_CREATION = 'PROFILE_CREATION',
  DISCOVERY = 'DISCOVERY',
  CHAT = 'CHAT'
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}