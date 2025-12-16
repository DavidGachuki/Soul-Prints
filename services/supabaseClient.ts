import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseProfile {
    id: string;
    name: string;
    age: number;
    bio: string | null;
    interests: string[];
    image_url: string | null;
    gallery: string[] | null;
    video_url: string | null;
    deep_answer_1: string;
    deep_answer_2: string;
    soul_analysis: string | null;
    settings: any | null;
    created_at: string;
}

export interface DatabaseMatch {
    id: string;
    profile_id_1: string;
    profile_id_2: string;
    compatibility_score: number | null;
    compatibility_reason: string | null;
    created_at: string;
}

export interface DatabaseMessage {
    id: string;
    match_id: string;
    sender_id: string;
    text: string;
    type: string;
    media_url: string | null;
    is_ai_generated: boolean;
    created_at: string;
}
