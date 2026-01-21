'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { leadersSignIn } from '@/lib/auth/leaders-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadersLoginSkeleton } from '../components/LeadersSkeleton';

// Import CSS
import '../leaders-dark.css';
import '../leaders-light.css';

export default function LeadersLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useState(() => {
        setMounted(true);
    });

    // Detect small screen
    useEffect(() => {
        const checkScreen = () => setIsSmallScreen(window.innerWidth <= 400);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { user, error: authError } = await leadersSignIn(email, password);

            if (authError || !user) {
                setError(authError?.message || 'Invalid email or password');
                setLoading(false);
                return;
            }

            // Success - redirect to leaders chat
            router.push('/leaders');
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (!mounted) {
        return <LeadersLoginSkeleton />;
    }

    return (
        <main className="relative min-h-screen overflow-hidden flex items-center justify-center">

            {/* Gradient Mesh Background */}
            <div
                className="fixed inset-0 opacity-30"
                style={{ background: 'var(--gradient-mesh)' }}
            />

            {/* Main Content */}
            <div className="relative z-10 w-full" style={{ padding: '48px 4px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto max-w-md"
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-12">
                        <Link href="/">
                            <Image
                                src="/bandhannova-logo-final.svg"
                                alt="BandhanNova Logo"
                                width={350}
                                height={350}
                                className="cursor-pointer hover:scale-105 transition-transform"
                                style={{ padding: '20px' }}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Login Card */}
                    <Card className="glass-strong border-0" style={{ padding: '32px' }}>
                        <CardHeader style={{ padding: '0 0 24px 0' }}>
                            <CardTitle className="h1 text-center" style={{ color: 'var(--foreground)', marginBottom: '8px' }}>
                                Leaders Community Hub
                            </CardTitle>
                            <CardDescription className="body text-center" style={{ color: 'var(--foreground-secondary)' }}>
                                Sign in to access the communication hub
                            </CardDescription>
                        </CardHeader>

                        <CardContent style={{ padding: '0' }}>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-lg"
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <p className="small text-red-500">{error}</p>
                                    </motion.div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="body" style={{ color: 'var(--foreground)' }}>
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 auth-icon" style={{ color: 'var(--foreground-secondary)' }} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 body"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'var(--foreground)'
                                            }}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="body" style={{ color: 'var(--foreground)' }}>
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 auth-icon" style={{ color: 'var(--foreground-secondary)' }} />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={isSmallScreen ? "Password..." : "Enter your password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 body"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'var(--foreground)'
                                            }}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5 auth-icon" style={{ color: 'var(--foreground-secondary)' }} />
                                            ) : (
                                                <Eye className="w-5 h-5 auth-icon" style={{ color: 'var(--foreground-secondary)' }} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Sign In Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                                    style={{ background: 'var(--gradient-hero)', marginTop: '24px' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 justify-center">
                                            Sign In
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>


                            </form>
                        </CardContent>
                    </Card>

                    {/* Back to Home */}
                    <div className="flex flex items-center justify-center mt-8" style={{ padding: '20px' }}>
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="w-50 h-12 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 px-8 auth-back-button"
                                style={{
                                    color: 'var(--foreground)'
                                }}
                            >
                                ← Back to Home
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
