'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Video, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leadersSupabase, LeadersMessage } from '@/lib/supabase/leaders-supabase';

interface MessageInputProps {
    userId: string;
    onMessageSent: () => void;
    replyToMessage?: LeadersMessage | null;
    onCancelReply?: () => void;
}

export default function MessageInput({ userId, onMessageSent, replyToMessage, onCancelReply }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update typing status
    const updateTypingStatus = async (isTyping: boolean) => {
        try {
            await leadersSupabase
                .from('leaders_typing_status')
                .upsert({
                    user_id: userId,
                    is_typing: isTyping,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id'
                });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    // Clear typing status on unmount
    useEffect(() => {
        return () => {
            updateTypingStatus(false);
        };
    }, []);

    // Auto-copy original message when replying
    useEffect(() => {
        if (replyToMessage) {
            const originalContent = replyToMessage.content || 'Media message';
            const replyHeader = `Replying to ${replyToMessage.user?.full_name || 'User'}: "${originalContent}"\n\n`;
            setMessage(replyHeader);
            // Focus on textarea and move cursor to end
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(replyHeader.length, replyHeader.length);
                }
            }, 100);
        }
    }, [replyToMessage]);

    const handleSend = async () => {
        if (!message.trim() && !selectedFile) return;

        try {
            setUploading(true);

            let fileUrl = null;
            let fileName = null;
            let fileSize = null;
            let messageType: 'text' | 'image' | 'video' = 'text';

            // Upload file if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const filePath = `${userId}/${Date.now()}.${fileExt}`;
                const bucket = selectedFile.type.startsWith('image/') ? 'leaders-images' : 'leaders-videos';
                messageType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

                // Set upload progress to indeterminate
                setUploadProgress(50);

                const { data, error } = await leadersSupabase.storage
                    .from(bucket)
                    .upload(filePath, selectedFile);

                if (error) throw error;

                // Complete progress
                setUploadProgress(100);

                // Get public URL
                const { data: urlData } = leadersSupabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);

                fileUrl = urlData.publicUrl;
                fileName = selectedFile.name;
                fileSize = selectedFile.size;
            }

            // Insert message (reply content is already in message text)
            const { error: insertError } = await leadersSupabase
                .from('leaders_messages')
                .insert({
                    user_id: userId,
                    content: message.trim() || null,
                    message_type: messageType,
                    file_url: fileUrl,
                    file_name: fileName,
                    file_size: fileSize,
                });

            if (insertError) throw insertError;

            // Clear typing status
            updateTypingStatus(false);

            // Reset form
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setUploadProgress(0);
            if (onCancelReply) onCancelReply();
            onMessageSent();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Update typing status
        if (e.target.value.trim()) {
            updateTypingStatus(true);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to clear typing status after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                updateTypingStatus(false);
            }, 2000);
        } else {
            updateTypingStatus(false);
        }
    };

    const handleFileSelect = (file: File, type: 'image' | 'video') => {
        // Validate file size (max 10MB for images, 50MB for videos)
        const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`File too large. Maximum size is ${type === 'image' ? '10MB' : '50MB'}`);
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file, 'image');
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file, 'video');
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    return (
        <div className="leaders-input-area">
            {/* Upload Progress */}
            <AnimatePresence>
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="leaders-upload-progress"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Upload className="w-4 h-4 animate-pulse" />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--foreground-secondary)' }}>
                                Uploading... {Math.round(uploadProgress)}%
                            </span>
                        </div>
                        {/* Simple progress bar */}
                        <div
                            style={{
                                width: '100%',
                                height: '4px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${uploadProgress}%`,
                                    height: '100%',
                                    background: 'var(--primary-purple)',
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Preview */}
            <AnimatePresence>
                {previewUrl && selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        style={{ marginBottom: '12px', position: 'relative' }}
                    >
                        {selectedFile.type.startsWith('image/') ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    borderRadius: '12px',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <video
                                src={previewUrl}
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    borderRadius: '12px',
                                }}
                            />
                        )}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                size="sm"
                                onClick={clearSelectedFile}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    padding: 0,
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Container */}
            <div className="leaders-input-container">
                <div className="leaders-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="leaders-input"
                        disabled={uploading}
                    />
                </div>

                <div className="leaders-input-actions">
                    {/* Image Upload */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => imageInputRef.current?.click()}
                        className="leaders-action-btn"
                        disabled={uploading || !!selectedFile}
                        title="Upload Image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </motion.button>

                    {/* Video Upload */}
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        style={{ display: 'none' }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => videoInputRef.current?.click()}
                        className="leaders-action-btn"
                        disabled={uploading || !!selectedFile}
                        title="Upload Video"
                    >
                        <Video className="w-5 h-5" />
                    </motion.button>

                    {/* Send Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className="leaders-action-btn leaders-send-btn"
                        disabled={(!message.trim() && !selectedFile) || uploading}
                        title="Send Message (Enter)"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
