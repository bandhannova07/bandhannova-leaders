'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Linkedin, Globe } from 'lucide-react';

interface SocialLinksManagerProps {
    initialLinks?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
    onChange: (links: any) => void;
}

export default function SocialLinksManager({ initialLinks = {}, onChange }: SocialLinksManagerProps) {
    const [links, setLinks] = useState(initialLinks);

    const handleChange = (platform: string, value: string) => {
        const updated = { ...links, [platform]: value };
        setLinks(updated);
        onChange(updated);
    };

    const socialPlatforms = [
        { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
        { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
        { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username' },
        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
        { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
    ];

    return (
        <div className="flex justify-center w-full">
            <div className="space-y-4 w-full max-w-2xl">
                {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                        <motion.div
                            key={platform.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--gradient-hero)' }}
                            >
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--foreground-secondary)' }}>
                                    {platform.label}
                                </label>
                                <input
                                    type="url"
                                    value={(links as any)[platform.key] || ''}
                                    onChange={(e) => handleChange(platform.key, e.target.value)}
                                    placeholder={platform.placeholder}
                                    className="w-full px-4 py-2 rounded-xl border transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--foreground)',
                                    }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
