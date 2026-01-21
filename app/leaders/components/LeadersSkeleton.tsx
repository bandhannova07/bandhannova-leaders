'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function LeadersChatSkeleton() {
    return (
        <div className="leaders-container">
            {/* Sidebar Skeleton */}
            <aside className="leaders-sidebar" style={{ transform: 'translateX(0)' }}>
                <div className="leaders-sidebar-header">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* User List Skeleton */}
                <div className="leaders-user-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="leaders-user-item">
                            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                            <div className="leaders-user-info">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer Skeleton */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Skeleton className="h-12 w-full mb-3 rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </aside>

            {/* Chat Area Skeleton */}
            <div className="leaders-chat-area">
                {/* Header Skeleton */}
                <div className="leaders-chat-header">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-48" />
                </div>

                {/* Messages Skeleton */}
                <div className="leaders-messages-container">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`leaders-message ${i % 2 === 0 ? 'own' : ''}`}>
                            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className="leaders-message-content" style={{ flex: 1 }}>
                                <div className="leaders-message-header">
                                    <Skeleton className="h-3 w-20 mb-2" />
                                </div>
                                <div className="leaders-message-bubble">
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Skeleton */}
                <div className="leaders-input-area">
                    <div className="leaders-input-container">
                        <Skeleton className="flex-1 h-12 rounded-3xl" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LeadersLoginSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md glass rounded-3xl p-8 md:p-12">
                {/* Logo Skeleton */}
                <div className="flex justify-center mb-8">
                    <Skeleton className="h-20 w-48" />
                </div>

                {/* Title Skeleton */}
                <div className="text-center mb-8">
                    <Skeleton className="h-10 w-48 mx-auto mb-3" />
                    <Skeleton className="h-5 w-64 mx-auto" />
                </div>

                {/* Form Skeleton */}
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-5 w-16 mb-2" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>

                {/* Footer Skeleton */}
                <div className="mt-8 text-center">
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>
            </div>
        </div>
    );
}
