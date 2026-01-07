/**
 * TherapistDashboard - Real data from Supabase database
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { gsap } from 'gsap';
import {
    Calendar,
    Users,
    DollarSign,
    Clock,
    Video,
    Settings,
    Bell,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    MessageCircle,
    FileText,
    LogOut,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Types for therapist bookings
interface SessionData {
    id: string;
    patient_name: string;
    patient_initial: string;
    scheduled_at: string;
    service_type: string;
    status: string;
    duration_minutes: number;
    patient_id: string;
}

interface TherapistStats {
    todaySessions: number;
    totalPatients: number;
    monthlyEarnings: number;
    avgRating: number;
    totalReviews: number;
    completedSessions: number;
    upcomingSessions: number;
}

export default function TherapistDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [stats, setStats] = useState<TherapistStats>({
        todaySessions: 0,
        totalPatients: 0,
        monthlyEarnings: 0,
        avgRating: 0,
        totalReviews: 0,
        completedSessions: 0,
        upcomingSessions: 0
    });
    const [loading, setLoading] = useState(true);
    const [therapistProfile, setTherapistProfile] = useState<any>(null);
    const [availabilityOpen, setAvailabilityOpen] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Load real data from database
    useEffect(() => {
        if (user) {
            loadTherapistData();
        }
    }, [user]);

    // Animate on load
    useEffect(() => {
        if (!containerRef.current || loading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = containerRef.current.querySelectorAll('.dashboard-card');
        gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
    }, [loading]);

    const loadTherapistData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Get therapist profile
            const { data: therapist } = await supabase
                .from('therapists')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setTherapistProfile(therapist);

            if (!therapist) {
                console.log('No therapist profile found');
                setLoading(false);
                return;
            }

            // Get today's date range
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

            // Get start of month for monthly stats
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

            // Fetch today's sessions
            const { data: todayBookings } = await supabase
                .from('bookings')
                .select(`
                    id,
                    scheduled_at,
                    service_type,
                    status,
                    duration_minutes,
                    patient_id,
                    users!bookings_patient_id_fkey (
                        full_name
                    )
                `)
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfDay)
                .lt('scheduled_at', endOfDay)
                .order('scheduled_at', { ascending: true });

            // Transform sessions data
            const sessionsData: SessionData[] = (todayBookings || []).map((booking: any) => ({
                id: booking.id,
                patient_name: booking.users?.full_name || 'Patient',
                patient_initial: (booking.users?.full_name || 'P').charAt(0).toUpperCase(),
                scheduled_at: booking.scheduled_at,
                service_type: booking.service_type,
                status: booking.status,
                duration_minutes: booking.duration_minutes || 50,
                patient_id: booking.patient_id
            }));

            setSessions(sessionsData);

            // Fetch all-time stats
            const { data: allBookings } = await supabase
                .from('bookings')
                .select('id, status, amount, scheduled_at')
                .eq('therapist_id', therapist.id);

            // Fetch this month's bookings for earnings
            const { data: monthBookings } = await supabase
                .from('bookings')
                .select('amount, status')
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfMonth)
                .eq('status', 'completed');

            // Get unique patients
            const { data: uniquePatients } = await supabase
                .from('bookings')
                .select('patient_id')
                .eq('therapist_id', therapist.id);

            const uniquePatientIds = new Set((uniquePatients || []).map(b => b.patient_id));

            // Calculate stats
            const completed = (allBookings || []).filter(b => b.status === 'completed').length;
            const upcoming = (allBookings || []).filter(b => b.status === 'confirmed' || b.status === 'pending').length;
            const monthlyTotal = (monthBookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);

            setStats({
                todaySessions: sessionsData.length,
                totalPatients: uniquePatientIds.size,
                monthlyEarnings: monthlyTotal,
                avgRating: therapist.rating || 0,
                totalReviews: therapist.total_reviews || 0,
                completedSessions: completed,
                upcomingSessions: upcoming
            });

        } catch (error) {
            console.error('Error loading therapist data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleStartSession = (sessionId: string) => {
        toast({
            title: 'Session Starting',
            description: 'Redirecting to video call...'
        });
        navigate(`/call/${sessionId}`);
    };

    const handleCompleteSession = async (sessionId: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'completed' })
                .eq('id', sessionId);

            if (error) throw error;

            // Update local state
            setSessions(prev => prev.map(s =>
                s.id === sessionId ? { ...s, status: 'completed' } : s
            ));

            toast({
                title: 'Session Completed',
                description: 'Session has been marked as completed.'
            });
        } catch (error) {
            console.error('Error completing session:', error);
            toast({
                title: 'Error',
                description: 'Failed to complete session',
                variant: 'destructive'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Upcoming</span>;
            case 'in_progress':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">In Progress</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Cancelled</span>;
            default:
                return null;
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatServiceType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const completedToday = sessions.filter(s => s.status === 'completed').length;
    const upcomingToday = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Check if therapist profile exists at all
    if (!therapistProfile) {
        return (
            <>
                <Helmet>
                    <title>Complete Your Profile | 3-3.com Counseling</title>
                </Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Therapist!</h1>
                        <p className="text-gray-600 mb-6">
                            To start accepting clients, please complete your therapist profile with your credentials and specialties.
                        </p>
                        <div className="space-y-3">
                            <Link to="/complete-profile">
                                <Button className="w-full btn-icy">
                                    Complete Your Profile
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleSignOut} className="w-full">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Check if therapist is verified
    if (!therapistProfile.is_verified) {
        return (
            <>
                <Helmet>
                    <title>Pending Verification | 3-3.com Counseling</title>
                </Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Verification</h1>
                        <p className="text-gray-600 mb-6">
                            Your therapist account is being reviewed by our admin team.
                            You'll receive an email once your account is verified and you can start accepting clients.
                        </p>
                        <div className="space-y-3">
                            <Link to="/complete-profile">
                                <Button className="w-full btn-icy">
                                    Complete Your Profile
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleSignOut} className="w-full">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Therapist Dashboard | 3-3.com Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                    <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full">
                                Therapist
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                    {user?.full_name?.charAt(0) || 'T'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user?.full_name || 'Therapist'}
                                </span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Welcome */}
                    <div className="dashboard-card mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-serif text-gray-900 mb-2">
                                    {getTimeOfDay()}, Dr. {user?.full_name?.split(' ')[0] || 'Therapist'} 👋
                                </h1>
                                <p className="text-gray-500">
                                    {upcomingToday > 0 ? (
                                        <>You have <span className="font-semibold text-cyan-600">{upcomingToday} sessions</span> remaining today.</>
                                    ) : (
                                        <>No sessions scheduled for today.</>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setAvailabilityOpen(!availabilityOpen)}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Availability
                                </Button>
                                <Button variant="outline" onClick={loadTherapistData}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="dashboard-card grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <Calendar className="w-5 h-5 text-cyan-200" />
                                <span className="text-xs text-cyan-200">{completedToday} completed</span>
                            </div>
                            <p className="text-3xl font-bold">{stats.todaySessions}</p>
                            <p className="text-sm text-cyan-100">Today's Sessions</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <Users className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                            <p className="text-sm text-gray-500">Total Patients</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">${stats.monthlyEarnings.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">This Month</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                <span className="text-xs text-gray-400">{stats.totalReviews} reviews</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.avgRating || '-'}</p>
                            <p className="text-sm text-gray-500">Avg Rating</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Today's Schedule */}
                        <div className="lg:col-span-2">
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                                        {completedToday}/{sessions.length} completed
                                    </div>
                                </div>

                                {sessions.length > 0 ? (
                                    <div className="space-y-4">
                                        {sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl transition-colors ${session.status === 'completed'
                                                    ? 'bg-gray-50 opacity-75'
                                                    : 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${session.status === 'completed'
                                                    ? 'bg-gray-200 text-gray-500'
                                                    : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                                    }`}>
                                                    {session.patient_initial}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900">{session.patient_name}</p>
                                                        {getStatusBadge(session.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {formatServiceType(session.service_type)} • {session.duration_minutes} min
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">{formatTime(session.scheduled_at)}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {(session.status === 'confirmed' || session.status === 'pending') && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="btn-icy text-xs"
                                                                onClick={() => handleStartSession(session.id)}
                                                            >
                                                                <Video className="w-3 h-3 mr-1" />
                                                                Start
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCompleteSession(session.id)}
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {session.status === 'completed' && (
                                                        <Button size="sm" variant="ghost" className="text-xs">
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            Notes
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 mb-2">No sessions scheduled for today</p>
                                        <p className="text-sm text-gray-400">Your upcoming appointments will appear here</p>
                                    </div>
                                )}

                                {/* Session summary */}
                                {sessions.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Total session time today: <span className="font-semibold text-gray-900">
                                                {sessions.reduce((acc, s) => acc + s.duration_minutes, 0)} minutes
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Next Session */}
                            {sessions.find(s => s.status === 'confirmed' || s.status === 'pending') && (
                                <div className="dashboard-card bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
                                    <p className="text-cyan-100 text-sm mb-2">Next Session</p>
                                    <p className="text-2xl font-bold mb-1">
                                        {sessions.find(s => s.status === 'confirmed' || s.status === 'pending')?.patient_name}
                                    </p>
                                    <p className="text-cyan-100 mb-4">
                                        {formatTime(sessions.find(s => s.status === 'confirmed' || s.status === 'pending')?.scheduled_at || '')} • {formatServiceType(sessions.find(s => s.status === 'confirmed' || s.status === 'pending')?.service_type || '')}
                                    </p>
                                    <Button
                                        className="w-full bg-white text-cyan-600 hover:bg-cyan-50"
                                        onClick={() => handleStartSession(sessions.find(s => s.status === 'confirmed' || s.status === 'pending')?.id || '')}
                                    >
                                        <Video className="w-4 h-4 mr-2" />
                                        Start Session
                                    </Button>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'My Patients', href: '/patients', icon: Users },
                                        { label: 'Session Notes', href: '/notes', icon: FileText },
                                        { label: 'Messages', href: '/messages', icon: MessageCircle },
                                        { label: 'My Profile', href: '/profile', icon: Settings },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <link.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-500" />
                                            <span className="text-gray-700 group-hover:text-gray-900">{link.label}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-cyan-500" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Overview */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Completed Sessions</span>
                                            <span className="font-medium text-gray-900">{stats.completedSessions}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((stats.completedSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Upcoming Sessions</span>
                                            <span className="font-medium text-gray-900">{stats.upcomingSessions}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((stats.upcomingSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
