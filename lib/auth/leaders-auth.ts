import { leadersSupabase } from '../supabase/leaders-supabase';

/**
 * Authentication helpers for Leaders Chat
 */

export interface LeadersAuthResult {
    user: any | null;
    error: Error | null;
}

/**
 * Sign in with email and password
 */
export async function leadersSignIn(email: string, password: string): Promise<LeadersAuthResult> {
    try {
        const { data, error } = await leadersSupabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { user: null, error };
        }

        // Update user online status
        if (data.user) {
            await leadersSupabase
                .from('leaders_users')
                .update({ is_online: true, last_seen: new Date().toISOString() })
                .eq('id', data.user.id);
        }

        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error: error as Error };
    }
}

/**
 * Sign out current user
 */
export async function leadersSignOut(): Promise<{ error: Error | null }> {
    try {
        const { data: { user } } = await leadersSupabase.auth.getUser();

        // Update user offline status before signing out
        if (user) {
            await leadersSupabase
                .from('leaders_users')
                .update({ is_online: false, last_seen: new Date().toISOString() })
                .eq('id', user.id);
        }

        const { error } = await leadersSupabase.auth.signOut();
        return { error };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get current authenticated user
 */
export async function getLeadersCurrentUser(): Promise<LeadersAuthResult> {
    try {
        const { data: { user }, error } = await leadersSupabase.auth.getUser();

        if (error) {
            return { user: null, error };
        }

        return { user, error: null };
    } catch (error) {
        return { user: null, error: error as Error };
    }
}

/**
 * Check if user is authenticated
 */
export async function isLeadersAuthenticated(): Promise<boolean> {
    const { user } = await getLeadersCurrentUser();
    return user !== null;
}

/**
 * Get user profile from leaders_users table
 */
export async function getLeadersUserProfile(userId: string) {
    try {
        const { data, error } = await leadersSupabase
            .from('leaders_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Update user online status
 */
export async function updateLeadersOnlineStatus(userId: string, isOnline: boolean) {
    try {
        const { error } = await leadersSupabase
            .from('leaders_users')
            .update({
                is_online: isOnline,
                last_seen: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating online status:', error);
        }
    } catch (error) {
        console.error('Error updating online status:', error);
    }
}

/**
 * Listen for auth state changes
 */
export function onLeadersAuthStateChange(callback: (user: any | null) => void) {
    return leadersSupabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
    });
}
