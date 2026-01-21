'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Users, Send as SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { leadersSupabase, LeadersMessage, LeadersUser, LeadersTypingStatus } from '@/lib/supabase/leaders-supabase';
import { getLeadersCurrentUser, leadersSignOut, updateLeadersOnlineStatus } from '@/lib/auth/leaders-auth';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import MediaViewer from './components/MediaViewer';
import { LeadersChatSkeleton } from './components/LeadersSkeleton';
import TypingIndicator from './components/TypingIndicator';

// Import CSS
import '../leaders-dark.css';
import '../leaders-light.css';

export default function LeadersPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<LeadersUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<LeadersMessage[]>([]);
    const [users, setUsers] = useState<LeadersUser[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video'; fileName?: string } | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState<LeadersMessage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [typingUsers, setTypingUsers] = useState<Array<{ user_id: string; user_name: string }>>([])

    // Track desktop/mobile state and set initial sidebar state
    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            // Only auto-open sidebar on initial load for desktop
            if (desktop && !sidebarOpen) {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check authentication
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { user, error } = await getLeadersCurrentUser();
        if (!user || error) {
            router.push('/login');
            return;
        }
        setCurrentUser(user);

        // Fetch user profile from database
        const { data: profile } = await leadersSupabase
            .from('leaders_users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            setUserProfile(profile);
        }

        setLoading(false);

        // Update online status
        updateLeadersOnlineStatus(user.id, true);

        // Set up beforeunload to update offline status
        const handleBeforeUnload = () => {
            updateLeadersOnlineStatus(user.id, false);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            updateLeadersOnlineStatus(user.id, false);
        };
    };

    // Load messages
    useEffect(() => {
        if (!currentUser) return;

        loadMessages();
        loadUsers();

        // Subscribe to new messages
        const messagesSubscription = leadersSupabase
            .channel('leaders_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaders_messages' }, (payload) => {
                loadMessages(); // Reload to get user info
            })
            .subscribe();

        // Subscribe to user status changes
        const usersSubscription = leadersSupabase
            .channel('leaders_users')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leaders_users' }, () => {
                loadUsers();
            })
            .subscribe();

        // Subscribe to reaction changes
        const reactionsSubscription = leadersSupabase
            .channel('leaders_message_reactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leaders_message_reactions' }, () => {
                loadMessages(); // Reload to get updated reactions
            })
            .subscribe();

        // Subscribe to typing status changes
        const typingSubscription = leadersSupabase
            .channel('leaders_typing_status')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leaders_typing_status' }, async (payload) => {
                const typingStatus = payload.new as LeadersTypingStatus;

                // Don't show current user's typing status
                if (typingStatus.user_id === currentUser.id) return;

                // Get user info
                const { data: userData } = await leadersSupabase
                    .from('leaders_users')
                    .select('full_name')
                    .eq('id', typingStatus.user_id)
                    .single();

                if (typingStatus.is_typing) {
                    setTypingUsers(prev => {
                        const exists = prev.find(u => u.user_id === typingStatus.user_id);
                        if (exists) return prev;
                        return [...prev, { user_id: typingStatus.user_id, user_name: userData?.full_name || 'Someone' }];
                    });
                } else {
                    setTypingUsers(prev => prev.filter(u => u.user_id !== typingStatus.user_id));
                }
            })
            .subscribe();

        return () => {
            messagesSubscription.unsubscribe();
            usersSubscription.unsubscribe();
            reactionsSubscription.unsubscribe();
            typingSubscription.unsubscribe();
        };
    }, [currentUser]);

    // Auto-scroll to bottom when new messages arrive (only if already at bottom)
    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [messages]);

    // Track scroll position
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const atBottom = scrollHeight - scrollTop - clientHeight < 100;
            setIsAtBottom(atBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const loadMessages = async () => {
        // Load messages with user and reply data
        const { data: messagesData, error: messagesError } = await leadersSupabase
            .from('leaders_messages')
            .select(`
                *,
                user:leaders_users(*),
                replyTo:leaders_messages!reply_to_id(
                    id,
                    content,
                    user:leaders_users(full_name)
                )
            `)
            .order('created_at', { ascending: true });

        if (messagesError || !messagesData) {
            console.error('Error loading messages:', messagesError);
            return;
        }

        // Load all reactions with user data
        const { data: reactionsData } = await leadersSupabase
            .from('leaders_message_reactions')
            .select('*, user:leaders_users(full_name)');

        // Process messages with reactions
        const processedMessages = messagesData.map((message: any) => {
            const messageReactions = reactionsData?.filter(r => r.message_id === message.id) || [];

            // Group reactions by emoji
            const reactionsByEmoji = messageReactions.reduce((acc: any, reaction: any) => {
                if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = {
                        emoji: reaction.emoji,
                        count: 0,
                        userReacted: false,
                        users: [],
                    };
                }
                acc[reaction.emoji].count++;
                acc[reaction.emoji].users.push(reaction.user?.full_name || 'Unknown');
                if (reaction.user_id === currentUser?.id) {
                    acc[reaction.emoji].userReacted = true;
                }
                return acc;
            }, {});

            return {
                ...message,
                reactions: Object.values(reactionsByEmoji),
            };
        });

        setMessages(processedMessages);
    };

    const loadUsers = async () => {
        const { data, error } = await leadersSupabase
            .from('leaders_users')
            .select('*')
            .order('full_name', { ascending: true });

        if (!error && data) {
            setUsers(data);
            setOnlineCount(data.filter(u => u.is_online).length);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSignOut = async () => {
        if (currentUser) {
            await updateLeadersOnlineStatus(currentUser.id, false);
        }
        await leadersSignOut();
        router.push('/login');
    };

    const handleMediaClick = (url: string, type: 'image' | 'video', fileName?: string) => {
        setMediaViewer({ url, type, fileName });
    };

    const handleReact = async (messageId: string, emoji: string) => {
        if (!currentUser) return;

        try {
            // Check if user already reacted with this emoji
            const { data: existing, error: checkError } = await leadersSupabase
                .from('leaders_message_reactions')
                .select('*')
                .eq('message_id', messageId)
                .eq('user_id', currentUser.id)
                .eq('emoji', emoji)
                .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking reaction:', checkError);
                return;
            }

            if (existing) {
                // Remove reaction
                await leadersSupabase
                    .from('leaders_message_reactions')
                    .delete()
                    .eq('id', existing.id);
            } else {
                // Add reaction
                await leadersSupabase
                    .from('leaders_message_reactions')
                    .insert({
                        message_id: messageId,
                        user_id: currentUser.id,
                        emoji,
                    });
            }

            // Reload messages to get updated reactions
            loadMessages();
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    const handleReply = (message: LeadersMessage) => {
        setReplyToMessage(message);
    };

    const handleCancelReply = () => {
        setReplyToMessage(null);
    };

    if (loading) {
        return <LeadersChatSkeleton />;
    }

    return (
        <div className="leaders-container">
            {/* Sidebar with Animation */}
            <motion.aside
                initial={false}
                animate={{ x: isDesktop ? 0 : (sidebarOpen ? 0 : '-100%') }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="leaders-sidebar"
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    zIndex: 100,
                    width: isDesktop ? '20%' : '75%',
                }}
            >
                <div className="leaders-sidebar-header">
                    {/* Logo */}
                    <div style={{ marginBottom: '20px', marginTop: '50px' }}>
                        <Image
                            src="/bandhannova-logo-final.svg"
                            alt="BandhanNova AI Hub"
                            width={240}
                            height={80}
                            style={{ marginBottom: '8px' }}
                        />
                        <p className="sidebar-subtitle" style={{ color: 'var(--foreground-tertiary)', fontSize: '18px' }}>
                            Leaders Community Hub
                        </p>
                    </div>

                    {/* Online Count Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mt-3"
                    >
                        <Badge className="glass" style={{ padding: '8px 12px' }}>
                            <Users className="w-4 h-4 mr-2" />
                            {onlineCount} Online
                        </Badge>
                    </motion.div>
                </div>

                {/* User List */}
                <UserList users={users} currentUserId={currentUser?.id} />

                {/* Sidebar Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: 'auto', padding: '16px' }}
                >
                    {/* Theme Toggle */}
                    <div style={{ marginBottom: '8px' }}>
                        <ThemeToggle variant="full" />
                    </div>

                    {/* Settings Button */}
                    <Button
                        onClick={() => router.push('/settings')}
                        variant="ghost"
                        className="flex items-center gap-3 rounded-xl transition-all hover:scale-105 justify-start"
                        style={{
                            padding: '14px 16px',
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            marginBottom: '8px'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="body font-medium">Settings</span>
                    </Button>

                    {/* Sign Out Button */}
                    <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="flex items-center gap-3 rounded-xl transition-all hover:scale-105 text-red-500 justify-start"
                        style={{
                            padding: '14px 16px',
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="body font-medium">Sign Out</span>
                    </Button>
                </motion.div>
            </motion.aside>

            {/* Sidebar Toggle - Mobile Only */}
            {!isDesktop && (
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed top-4 left-4 z-[150] glass rounded-2xl"
                    style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <AnimatePresence mode="wait">
                        {sidebarOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu className="w-6 h-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            )}

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div
                className="leaders-chat-area"
                style={{
                    marginLeft: isDesktop ? '20%' : '0',
                    width: isDesktop ? '80%' : '100%'
                }}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="leaders-chat-header"
                    style={{
                        paddingLeft: isDesktop ? undefined : '65px',
                    }}
                >
                    <h1 className="leaders-chat-title" style={{ marginTop: '10px' }}>
                        Welcome, <span className="gradient-text">{userProfile?.full_name?.split(' ')[0] || 'User'}</span>! 👋
                    </h1>
                </motion.div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="leaders-messages-container">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                                style={{ padding: '48px', color: 'var(--foreground-tertiary)' }}
                            >
                                <SendIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="body-large">No messages yet. Start the conversation!</p>
                            </motion.div>
                        ) : (
                            messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        damping: 25,
                                        stiffness: 300,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <ChatMessage
                                        message={message}
                                        isOwn={message.user_id === currentUser?.id}
                                        onMediaClick={handleMediaClick}
                                        onReact={handleReact}
                                        onReply={handleReply}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>

                    {/* Typing Indicators */}
                    <AnimatePresence>
                        {typingUsers.map((typingUser) => (
                            <TypingIndicator key={typingUser.user_id} userName={typingUser.user_name} />
                        ))}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                    {!isAtBottom && messages.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToBottom}
                            className="fixed bottom-32 right-8 glass rounded-full p-3 shadow-lg"
                            style={{ zIndex: 10 }}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Input */}
                <MessageInput
                    userId={currentUser?.id}
                    onMessageSent={loadMessages}
                    replyToMessage={replyToMessage}
                    onCancelReply={handleCancelReply}
                />
            </div>

            {/* Media Viewer */}
            <AnimatePresence>
                {mediaViewer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <MediaViewer
                            type={mediaViewer.type}
                            url={mediaViewer.url}
                            fileName={mediaViewer.fileName}
                            onClose={() => setMediaViewer(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
