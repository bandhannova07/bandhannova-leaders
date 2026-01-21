import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadersMessage } from '@/lib/supabase/leaders-supabase';

interface ReplyPreviewProps {
    replyToMessage: LeadersMessage;
    onCancel: () => void;
}

export default function ReplyPreview({ replyToMessage, onCancel }: ReplyPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass rounded-t-2xl"
            style={{
                padding: '12px 16px',
                borderTop: '3px solid var(--primary-purple)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: 'var(--primary-purple)' }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                        </svg>
                        <span className="text-sm font-semibold" style={{ color: 'var(--primary-purple)' }}>
                            Replying to {replyToMessage.user?.full_name || 'User'}
                        </span>
                    </div>
                    <p
                        className="text-sm truncate"
                        style={{ color: 'var(--foreground-secondary)' }}
                    >
                        {replyToMessage.content || 'Media message'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="flex-shrink-0 rounded-full"
                    style={{
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        minWidth: '32px',
                    }}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}
