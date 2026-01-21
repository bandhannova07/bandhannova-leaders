import { createClient } from '@supabase/supabase-js';

/**
 * Dedicated Supabase client for Leaders Chat
 * Uses a separate Supabase project for data isolation
 */

// Environment variables - to be configured by admin
const supabaseUrl = process.env.NEXT_PUBLIC_LEADERS_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_LEADERS_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Leaders Supabase credentials not configured. Please set NEXT_PUBLIC_LEADERS_SUPABASE_URL and NEXT_PUBLIC_LEADERS_SUPABASE_ANON_KEY in .env.local');
}

export const leadersSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Types for Leaders Chat
export interface LeadersUser {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen: string;
    created_at: string;
    role?: string;
    bio?: string;
    about?: string;
    social_links?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
}

export interface LeadersMessage {
    id: string;
    user_id: string;
    content?: string;
    message_type: 'text' | 'image' | 'video';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    created_at: string;
    updated_at: string;
    user?: LeadersUser;
}

export interface LeadersReadReceipt {
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}

export interface LeadersTypingStatus {
    user_id: string;
    is_typing: boolean;
    updated_at: string;
}
