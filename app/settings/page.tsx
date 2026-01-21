'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leadersSupabase } from '@/lib/supabase/leaders-supabase';
import { getLeadersCurrentUser } from '@/lib/auth/leaders-auth';
import ProfilePictureUpload from './components/ProfilePictureUpload';
import SocialLinksManager from './components/SocialLinksManager';
import { ThemeToggle } from '@/components/theme-toggle';

// Import CSS
import '../leaders-dark.css';
import '../leaders-light.css';
import './settings-dark.css';
import './settings-light.css';

export default function LeadersSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        role: '',
        bio: '',
        about: '',
        avatar_url: '',
        social_links: {},
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const { user, error } = await getLeadersCurrentUser();
        if (!user || error) {
            router.push('/login');
            return;
        }

        // Load full user profile
        const { data: userData } = await leadersSupabase
            .from('leaders_users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userData) {
            setCurrentUser(userData);
            setFormData({
                full_name: userData.full_name || '',
                role: userData.role || '',
                bio: userData.bio || '',
                about: userData.about || '',
                avatar_url: userData.avatar_url || '',
                social_links: userData.social_links || {},
            });
        }

        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentUser) return;

        try {
            setSaving(true);

            const { error } = await leadersSupabase
                .from('leaders_users')
                .update({
                    full_name: formData.full_name,
                    role: formData.role,
                    bio: formData.bio,
                    about: formData.about,
                    avatar_url: formData.avatar_url,
                    social_links: formData.social_links,
                })
                .eq('id', currentUser.id);

            if (error) throw error;

            alert('Profile updated successfully!');
            router.push('/');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-purple)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="sticky top-0 z-40 glass">
                <div className="w-full flex justify-center px-4 py-4">
                    <div className="w-full max-w-4xl flex items-center justify-between">
                        {/* Back Button - Round Circle */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/')}
                                className="rounded-full w-10 h-10 glass"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </motion.div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold gradient-text">Profile Settings</h1>

                        {/* Theme Toggle - Smaller Size */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="scale-75"
                        >
                            <ThemeToggle />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full flex justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 w-full max-w-4xl"
                >
                    {/* Profile Picture */}
                    <div className="glass rounded-3xl p-8" style={{ margin: '16px' }}>
                        <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)', padding: '20px' }}>
                            Profile Picture
                        </h2>
                        <ProfilePictureUpload
                            currentAvatarUrl={formData.avatar_url}
                            userId={currentUser?.id}
                            onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="glass rounded-3xl p-8 space-y-6" style={{ padding: '12px', margin: '16px' }}>
                        <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)', padding: '20px' }}>
                            Basic Information
                        </h2>

                        <div className="flex justify-center w-full">
                            <div className="space-y-6 w-full max-w-2xl">
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground-secondary)' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="settings-input"
                                        placeholder="Your full name"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground-secondary)' }}>
                                        Role / Position
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="settings-input"
                                        placeholder="e.g., CEO, CTO, Founder"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground-secondary)' }}>
                                        Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="settings-input"
                                        placeholder="A short bio about yourself..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground-secondary)' }}>
                                        About You
                                    </label>
                                    <textarea
                                        value={formData.about}
                                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                        className="settings-input"
                                        placeholder="Tell us more about yourself, your experience, achievements..."
                                        rows={6}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="glass rounded-3xl p-8" style={{ margin: '16px' }}>
                        <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
                            Social Links
                        </h2>
                        <SocialLinksManager
                            initialLinks={formData.social_links}
                            onChange={(links) => setFormData({ ...formData, social_links: links })}
                        />
                    </div>

                    {/* Save Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4" style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '24px' }}>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-6 rounded-2xl text-lg font-semibold focus-visible:outline-none focus-visible:ring-0"
                            style={{
                                background: 'var(--gradient-hero)',
                                color: 'white',
                                paddingBottom: '16px'
                            }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
