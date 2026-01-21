'use client';

import { motion } from 'framer-motion';

export default function TypingIndicator({ userName }: { userName?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="leaders-message"
            style={{ marginBottom: '12px' }}
        >
            <motion.div
                className="leaders-message-avatar"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400 }}
            >
                {userName?.charAt(0).toUpperCase() || 'U'}
            </motion.div>

            <div className="leaders-message-content">
                <div className="leaders-message-header">
                    <span className="leaders-message-sender">
                        {userName || 'Someone'}
                    </span>
                </div>

                <motion.div
                    className="leaders-message-bubble"
                    style={{
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--foreground-secondary)',
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
