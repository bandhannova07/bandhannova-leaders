'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leadersSupabase } from '@/lib/supabase/leaders-supabase';
import Image from 'next/image';

interface ProfilePictureUploadProps {
    currentAvatarUrl?: string;
    userId: string;
    onUploadComplete: (url: string) => void;
}

export default function ProfilePictureUpload({ currentAvatarUrl, userId, onUploadComplete }: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        try {
            setUploading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            const { data, error } = await leadersSupabase.storage
                .from('leaders-profiles')
                .upload(fileName, file, { upsert: true });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = leadersSupabase.storage
                .from('leaders-profiles')
                .getPublicUrl(fileName);

            onUploadComplete(urlData.publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUploadComplete('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Preview */}
            <div className="relative">
                {previewUrl ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                            <Image
                                src={previewUrl}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2"
                        >
                            <X className="w-4 h-4 text-white" />
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white" />
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <motion.div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                    w-full max-w-md p-6 rounded-2xl border-2 border-dashed cursor-pointer
                    transition-all duration-200
                    ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500/50'}
                `}
                style={{ background: dragActive ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8" style={{ color: 'var(--primary-purple)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {uploading ? 'Uploading...' : 'Click or drag image here'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                        PNG, JPG up to 5MB
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
