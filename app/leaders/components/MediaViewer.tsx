'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaViewerProps {
    type: 'image' | 'video';
    url: string;
    fileName?: string;
    onClose: () => void;
}

export default function MediaViewer({ type, url, fileName, onClose }: MediaViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || `download-${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
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

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="leaders-media-viewer"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="leaders-media-viewer-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Controls */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        position: 'absolute',
                        top: '-60px',
                        right: 0,
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                    }}
                >
                    {type === 'image' && (
                        <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={handleZoomOut}
                                    className="leaders-media-viewer-download"
                                    style={{ padding: '8px 12px' }}
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={handleZoomIn}
                                    className="leaders-media-viewer-download"
                                    style={{ padding: '8px 12px' }}
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        </>
                    )}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={handleDownload}
                            className="leaders-media-viewer-download"
                            disabled={downloading}
                        >
                            <Download className="w-4 h-4" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button onClick={onClose} className="leaders-media-viewer-close">
                            <X className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Media Content */}
                {type === 'image' ? (
                    <motion.img
                        src={url}
                        alt={fileName || 'Image'}
                        className="leaders-media-viewer-image"
                        style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        drag={zoom > 1}
                        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                        dragElastic={0.1}
                    />
                ) : (
                    <motion.video
                        src={url}
                        controls
                        autoPlay
                        className="leaders-media-viewer-video"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
