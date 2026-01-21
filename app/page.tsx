'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Info } from 'lucide-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    const router = useRouter();

    const goToLogin = () => {
        router.push('/login');
    };

    return (
        <main className="relative min-h-screen overflow-hidden">

            {/* Gradient Mesh Background */}
            <div
                className="fixed inset-0 opacity-30"
                style={{ background: 'var(--gradient-mesh)' }}
            />

            {/* Fixed Theme Toggle - Top Right Corner */}
            <div className="fixed top-3 right-3 md:top-4 md:right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
                <div className="container mx-auto text-center">
                    {/* Large Logo - FIRST (Boss feedback - MASSIVE 800x800!) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex justify-center"
                        style={{ marginBottom: '50px', marginTop: '20px' }}
                    >
                        <div className="relative animate-float">
                            <div className="absolute inset-0 blur-3xl opacity-50" style={{ background: 'var(--gradient-hero)' }} />
                            <Image
                                src="/bandhannova-logo-final.svg"
                                alt="BandhanNova Logo"
                                width={700}
                                height={700}
                                className="relative z-10"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Main Headline - MORE SPACE */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="display"
                        style={{ color: 'var(--foreground)', marginBottom: '30px', fontSize: 'clamp(2rem, 6vw, 4rem)' }}
                    >
                        Welcome to the
                        <br />
                        <span className="gradient-text">Leaders Community Hub</span>
                    </motion.h1>

                    {/* Subheadline - PERFECTLY HORIZONTAL CENTER (Boss feedback) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex justify-center items-center w-full"
                        style={{ marginBottom: '30px' }}
                    >
                        <p
                            className="body-large max-w-5xl text-center px-8"
                            style={{ color: 'var(--foreground-secondary)' }}
                        >
                            An exclusive communication hub designed for BandhanNova leaders and team members.
                            Collaborate, strategize, and stay connected with your leadership community in real-time.
                        </p>
                    </motion.div>

                    {/* CTA Buttons - WITH TOP SPACING */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                        style={{ marginTop: '0px', marginBottom: '40px' }}
                    >
                        <Button
                            onClick={goToLogin}
                            size="lg"
                            className="group relative px-14 py-5 rounded-2xl h-12 font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 min-w-[280px]"
                            style={{ background: 'var(--gradient-hero)' }}
                        >
                            <span className="relative z-10 flex items-center gap-2 justify-center text-sm md:text-xl">
                                Enter Leaders Hub
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                        </Button>

                        <Button
                            onClick={() => window.open('https://www.bandhannova.in', '_blank')}
                            variant="outline"
                            size="lg"
                            className="group px-14 py-5 rounded-2xl h-12 font-bold glass transition-all duration-300 hover:scale-105 hover:glass-strong min-w-[280px] flex items-center justify-center"
                        >
                            <span className="flex items-center gap-2 justify-center text-sm md:text-xl">
                                Visit BandhanNova
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </main>
    )
};