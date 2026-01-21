import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

const QUICK_EMOJIS = ['👍', '❤️', '😅', '😢', '🔥'];

const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Symbols': ['🔥', '⭐', '✨', '💫', '💥', '💢', '💯', '✅', '❌', '❗', '❓', '💬', '💭', '🎉', '🎊', '🎈'],
};

export default function EmojiPicker({ onEmojiSelect, onClose, position }: EmojiPickerProps) {
    const [showFullPicker, setShowFullPicker] = useState(false);

    // Adjust position to stay within screen bounds
    const adjustedPosition = () => {
        const isSmallScreen = window.innerWidth < 640;
        const pickerWidth = showFullPicker ? (isSmallScreen ? 280 : 320) : (isSmallScreen ? 320 : 400);
        const pickerHeight = showFullPicker ? (isSmallScreen ? 350 : 400) : (isSmallScreen ? 50 : 60);
        const padding = 16;

        let x = position.x;
        let y = position.y;

        // Adjust horizontal position
        if (x + pickerWidth > window.innerWidth - padding) {
            x = window.innerWidth - pickerWidth - padding;
        }
        if (x < padding) {
            x = padding;
        }

        // Adjust vertical position
        if (y + pickerHeight > window.innerHeight - padding) {
            y = window.innerHeight - pickerHeight - padding;
        }
        if (y < padding) {
            y = padding;
        }

        return { x, y };
    };

    const finalPosition = adjustedPosition();
    const isSmallScreen = window.innerWidth < 640;

    return (
        <>
            {/* Backdrop to close picker */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[9999]"
                style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            />

            {/* Emoji Picker */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed z-[10000] rounded-2xl shadow-2xl"
                style={{
                    left: `${finalPosition.x}px`,
                    top: `${finalPosition.y}px`,
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    maxHeight: showFullPicker ? (isSmallScreen ? '350px' : '400px') : 'auto',
                    overflowY: showFullPicker ? 'auto' : 'visible',
                    width: showFullPicker ? (isSmallScreen ? '280px' : '320px') : 'auto',
                }}
            >
                {!showFullPicker ? (
                    // Quick Emoji Bar
                    <div className="flex items-center gap-2">
                        {QUICK_EMOJIS.map((emoji) => (
                            <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    onEmojiSelect(emoji);
                                    onClose();
                                }}
                                className="text-2xl hover:bg-white/10 rounded-lg transition-all"
                                style={{
                                    width: isSmallScreen ? '36px' : '44px',
                                    height: isSmallScreen ? '36px' : '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: isSmallScreen ? '1.25rem' : '1.5rem',
                                }}
                            >
                                {emoji}
                            </motion.button>
                        ))}

                        {/* Plus Button */}
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowFullPicker(true)}
                            className="hover:bg-white/10 rounded-lg transition-all"
                            style={{
                                width: isSmallScreen ? '36px' : '44px',
                                height: isSmallScreen ? '36px' : '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Plus
                                className="w-5 h-5"
                                style={{ color: 'var(--foreground)' }}
                                strokeWidth={3}
                            />
                        </motion.button>
                    </div>
                ) : (
                    // Full Emoji Grid
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                            <div key={category} style={{ marginBottom: '16px' }}>
                                <div
                                    className="text-xs font-semibold mb-2"
                                    style={{ color: 'var(--foreground-secondary)' }}
                                >
                                    {category}
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: isSmallScreen ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)',
                                        gap: '4px',
                                    }}
                                >
                                    {emojis.map((emoji) => (
                                        <motion.button
                                            key={emoji}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                onEmojiSelect(emoji);
                                                onClose();
                                            }}
                                            className="text-xl hover:bg-white/10 rounded-lg transition-all"
                                            style={{
                                                width: isSmallScreen ? '28px' : '32px',
                                                height: isSmallScreen ? '28px' : '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: isSmallScreen ? '1rem' : '1.25rem',
                                            }}
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </>
    );
}
