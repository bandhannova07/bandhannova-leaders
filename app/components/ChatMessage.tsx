'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Download, Image as ImageIcon, Video as VideoIcon, Reply } from 'lucide-react';
import { LeadersMessage } from '@/lib/supabase/leaders-supabase';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmojiPicker from './EmojiPicker';

interface ChatMessageProps {
    message: LeadersMessage & {
        reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
        replyTo?: LeadersMessage;
    };
    isOwn: boolean;
    onMediaClick: (url: string, type: 'image' | 'video', fileName?: string) => void;
    onReact: (messageId: string, emoji: string) => void;
    onReply: (message: LeadersMessage) => void;
}

export default function ChatMessage({ message, isOwn, onMediaClick, onReact, onReply }: ChatMessageProps) {
    const [downloading, setDownloading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [showReactionDetails, setShowReactionDetails] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<any>(null);

    const messageRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
    const replyIconOpacity = useTransform(
        x,
        isOwn ? [0, -80] : [0, 80],
        [0, 1]
    );

    const handleDownload = async (url: string, fileName: string) => {
        try {
            setDownloading(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Long press detection
    const handleTouchStart = (e: React.TouchEvent) => {
        const timer = setTimeout(() => {
            const touch = e.touches[0];
            const rect = messageRef.current?.getBoundingClientRect();
            if (rect) {
                setEmojiPickerPosition({
                    x: touch.clientX - 200,
                    y: rect.top - 60,
                });
                setShowEmojiPicker(true);
            }
        }, 500); // 500ms long press
        setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // Mouse long press for desktop
    const handleMouseDown = (e: React.MouseEvent) => {
        const timer = setTimeout(() => {
            const rect = messageRef.current?.getBoundingClientRect();
            if (rect) {
                setEmojiPickerPosition({
                    x: e.clientX - 200,
                    y: rect.top - 60,
                });
                setShowEmojiPicker(true);
            }
        }, 500);
        setLongPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // Swipe to reply
    const handleDragEnd = () => {
        const currentX = x.get();
        if (Math.abs(currentX) > 80) {
            onReply(message);
        }
        // Smooth spring back to original position
        animate(x, 0, {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        });
    };

    return (
        <>
            <div className="relative">
                {/* Reply icon that appears during swipe */}
                <motion.div
                    style={{
                        opacity: replyIconOpacity,
                        position: 'absolute',
                        [isOwn ? 'right' : 'left']: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                    }}
                >
                    <Reply className="w-5 h-5" style={{ color: 'var(--primary-purple)' }} />
                </motion.div>

                <motion.div
                    ref={messageRef}
                    drag="x"
                    dragConstraints={{ left: isOwn ? -100 : 0, right: isOwn ? 0 : 100 }}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    style={{ x, opacity }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`leaders-message ${isOwn ? 'own' : ''}`}
                >
                    {!isOwn && (
                        <motion.div
                            className="leaders-message-avatar"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            {message.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </motion.div>
                    )}

                    <div className="leaders-message-content">
                        <div className="leaders-message-header">
                            {!isOwn && (
                                <span className="leaders-message-sender">
                                    {message.user?.full_name || 'Unknown User'}
                                </span>
                            )}
                            <span className="leaders-message-time">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        <motion.div
                            className="leaders-message-bubble"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            {/* Text Content with Reply Detection */}
                            {message.content && (() => {
                                // Check if message starts with "Replying to"
                                const replyMatch = message.content.match(/^Replying to (.+?): "(.+?)"\n\n([\s\S]*)$/);

                                if (replyMatch) {
                                    const [, userName, originalMsg, userReply] = replyMatch;
                                    return (
                                        <>
                                            {/* Reply Header - Styled differently */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-2 p-3 rounded-sm"
                                                style={{
                                                    background: 'rgba(168, 85, 247, 0.1)',
                                                    borderLeft: '3px solid var(--primary-purple)',
                                                }}
                                            >
                                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary-purple)', paddingLeft: '2px', paddingTop: '3px' }}>
                                                    {userName}
                                                </p>
                                                <p className="text-xs" style={{
                                                    color: 'var(--foreground-secondary)',
                                                    fontStyle: 'italic',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    paddingLeft: '2px',
                                                    paddingBottom: '3px'
                                                }}>
                                                    {originalMsg}
                                                </p>
                                            </motion.div>
                                            {/* User's Reply */}
                                            <div className="leaders-message-text">{userReply}</div>
                                        </>
                                    );
                                }

                                // Regular message without reply
                                return <div className="leaders-message-text">{message.content}</div>;
                            })()}

                            {/* Image Message */}
                            {message.message_type === 'image' && message.file_url && (
                                <div className="leaders-message-media">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <img
                                            src={message.file_url}
                                            alt={message.file_name || 'Image'}
                                            className="leaders-message-image"
                                            onClick={() => onMediaClick(message.file_url!, 'image', message.file_name)}
                                            style={{ maxWidth: '100%', maxHeight: '400px', cursor: 'pointer', borderRadius: '12px' }}
                                        />
                                    </motion.div>
                                    {message.file_name && (
                                        <motion.div
                                            className="leaders-message-file-info"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <ImageIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="leaders-message-file-name truncate">
                                                    {message.file_name}
                                                </span>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {formatFileSize(message.file_size)}
                                                </Badge>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDownload(message.file_url!, message.file_name!)}
                                                    className="leaders-message-download-btn"
                                                    disabled={downloading}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {downloading ? 'Saving...' : 'Save'}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Video Message */}
                            {message.message_type === 'video' && message.file_url && (
                                <div className="leaders-message-media">
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="relative"
                                    >
                                        <video
                                            src={message.file_url}
                                            controls
                                            className="leaders-message-video"
                                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px' }}
                                            preload="metadata"
                                        />
                                    </motion.div>
                                    {message.file_name && (
                                        <motion.div
                                            className="leaders-message-file-info"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <VideoIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="leaders-message-file-name truncate">
                                                    {message.file_name}
                                                </span>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {formatFileSize(message.file_size)}
                                                </Badge>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDownload(message.file_url!, message.file_name!)}
                                                    className="leaders-message-download-btn"
                                                    disabled={downloading}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {downloading ? 'Saving...' : 'Save'}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Reactions Display */}
                        {message.reactions && message.reactions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-wrap gap-1 mt-2"
                            >
                                {message.reactions.map((reaction: any, idx: number) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedReaction(reaction);
                                            setShowReactionDetails(true);
                                        }}
                                        className="glass h-8 w-12 rounded-full flex items-center justify-center gap-1 cursor-pointer"
                                        title={reaction.users?.join(', ') || ''}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '0.875rem',
                                            background: reaction.userReacted
                                                ? 'rgba(168, 85, 247, 0.2)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>
                                            {reaction.emoji}
                                        </span>
                                        <span className="text-xs">{reaction.count}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {isOwn && (
                        <motion.div
                            className="leaders-message-avatar"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            {message.user?.full_name?.charAt(0).toUpperCase() || 'Y'}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Emoji Picker */}
            <AnimatePresence>
                {showEmojiPicker && (
                    <EmojiPicker
                        onEmojiSelect={(emoji) => onReact(message.id, emoji)}
                        onClose={() => setShowEmojiPicker(false)}
                        position={emojiPickerPosition}
                    />
                )}
            </AnimatePresence>

            {/* Reaction Details Modal - WhatsApp Style */}
            <AnimatePresence>
                {showReactionDetails && selectedReaction && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReactionDetails(false)}
                            className="fixed inset-0 z-[9999]"
                            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[10000] rounded-t-3xl shadow-2xl"
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-primary)',
                                borderBottom: 'none',
                                maxHeight: window.innerWidth < 640 ? '50vh' : '70vh',
                                overflowY: 'auto',
                            }}
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center" style={{ paddingTop: window.innerWidth < 640 ? '8px' : '12px', paddingBottom: window.innerWidth < 640 ? '4px' : '8px' }}>
                                <div
                                    style={{
                                        width: window.innerWidth < 640 ? '32px' : '40px',
                                        height: window.innerWidth < 640 ? '3px' : '4px',
                                        borderRadius: '2px',
                                        background: 'var(--foreground-tertiary)',
                                        opacity: 0.3,
                                    }}
                                />
                            </div>

                            {/* Header */}
                            <div className="flex items-center border-b" style={{
                                gap: window.innerWidth < 640 ? '10px' : '12px',
                                padding: window.innerWidth < 640 ? '10px 14px' : '16px 24px',
                                borderColor: 'var(--border-primary)'
                            }}>
                                <span style={{ fontSize: '1.75rem' }}>{selectedReaction.emoji}</span>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--foreground)', fontSize: window.innerWidth < 640 ? '0.85rem' : '1.1rem' }}>
                                        {selectedReaction.count} {selectedReaction.count === 1 ? 'reaction' : 'reactions'}
                                    </h3>
                                </div>
                            </div>

                            {/* User List */}
                            <div style={{ padding: window.innerWidth < 640 ? '6px 14px' : '8px 24px' }}>
                                {selectedReaction.users?.map((userName: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center border-b"
                                        style={{
                                            gap: window.innerWidth < 640 ? '10px' : '12px',
                                            padding: window.innerWidth < 640 ? '8px 0' : '12px 0',
                                            borderColor: 'rgba(255, 255, 255, 0.05)'
                                        }}
                                    >
                                        <div
                                            className="rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{
                                                width: window.innerWidth < 640 ? '30px' : '40px',
                                                height: window.innerWidth < 640 ? '30px' : '40px',
                                                background: 'var(--gradient-hero)'
                                            }}
                                        >
                                            <span className="text-white font-semibold" style={{ fontSize: window.innerWidth < 640 ? '0.8rem' : '1rem' }}>
                                                {userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--foreground)', fontSize: window.innerWidth < 640 ? '0.8rem' : '0.95rem' }}>{userName}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom padding for safe area */}
                            <div style={{ height: window.innerWidth < 640 ? '12px' : '20px' }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
