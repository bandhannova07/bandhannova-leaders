'use client';

import { motion } from 'framer-motion';
import { LeadersUser } from '@/lib/supabase/leaders-supabase';
import { formatDistanceToNow } from 'date-fns';

interface UserListProps {
    users: LeadersUser[];
    currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
    return (
        <div className="leaders-user-list">
            {users.map((user, index) => (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        delay: index * 0.05,
                        type: 'spring',
                        damping: 20,
                        stiffness: 300,
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="leaders-user-item"
                >
                    <motion.div
                        className="leaders-user-avatar"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        {user.full_name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className="leaders-user-info">
                        <div className="leaders-user-name">
                            {user.full_name}
                            {user.id === currentUserId && ' (You)'}
                        </div>
                        <motion.div
                            className="leaders-user-last-seen"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                        >
                            {user.is_online ? (
                                <span className="flex items-center gap-1">
                                    <motion.span
                                        className="inline-block w-2 h-2 rounded-full bg-green-500"
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    Online
                                </span>
                            ) : (
                                `Last seen ${formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}`
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
