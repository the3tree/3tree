/**
 * TherapistDashboard - Enhanced with real booking integration
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
    XCircle,
    MessageCircle,
    FileText,
    LogOut,
    RefreshCw,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Types for therapist bookings
interface TodaySession {
    id: string;
    patient: string;
    patientInitial: string;
    time: string;
    type: string;
    status: 'upcoming' | 'in-progress' | 'completed';
    duration: number;
}

interface TherapistStats {
    todaySessions: number;
    totalPatients: number;
    monthlyEarnings: number;
    avgRating: number;
    totalReviews: number;
}

// Mock data for therapist dashboard
const mockTodaySessions: TodaySession[] = [
    { id: 's1', patient: 'John D.', patientInitial: 'J', time: '9:00 AM', type: 'Individual', status: 'completed', duration: 50 },
    { id: 's2', patient: 'Sarah M.', patientInitial: 'S', time: '11:00 AM', type: 'Couples', status: 'completed', duration: 60 },
    { id: 's3', patient: 'Michael R.', patientInitial: 'M', time: '2:00 PM', type: 'Individual', status: 'upcoming', duration: 50 },
    { id: 's4', patient: 'Emily T.', patientInitial: 'E', time: '3:30 PM', type: 'Individual', status: 'upcoming', duration: 50 },
    { id: 's5', patient: 'David K.', patientInitial: 'D', time: '5:00 PM', type: 'Family', status: 'upcoming', duration: 75 },
];

const mockStats: TherapistStats = {
    todaySessions: 5,
    totalPatients: 48,
    monthlyEarnings: 4250,
    avgRating: 4.9,
    totalReviews: 156
};

// Availability schedule
const weeklyAvailability = [
    { day: 'Monday', hours: '9:00 AM - 5:00 PM', slots: 8 },
    { day: 'Tuesday', hours: '9:00 AM - 4:00 PM', slots: 6 },
    { day: 'Wednesday', hours: '10:00 AM - 6:00 PM', slots: 7 },
    { day: 'Thursday', hours: '9:00 AM - 5:00 PM', slots: 8 },
    { day: 'Friday', hours: '9:00 AM - 3:00 PM', slots: 5 },
];

export default function TherapistDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [sessions, setSessions] = useState<TodaySession[]>(mockTodaySessions);
    const [stats, setStats] = useState<TherapistStats>(mockStats);
    const [loading, setLoading] = useState(false);
    const [availabilityOpen, setAvailabilityOpen] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Animate on load
    useEffect(() => {
        if (!containerRef.current || authLoading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = containerRef.current.querySelectorAll('.dashboard-card');
        gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
    }, [authLoading]);

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

    const handleCompleteSession = (sessionId: string) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, status: 'completed' as const } : s
        ));
        toast({
            title: 'Session Completed',
            description: 'Session has been marked as completed.'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'upcoming':
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Upcoming</span>;
            case 'in-progress':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">In Progress</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Completed</span>;
            default:
                return null;
        }
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const completedToday = sessions.filter(s => s.status === 'completed').length;
    const upcomingToday = sessions.filter(s => s.status === 'upcoming').length;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
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
                            <img src="/logo.png" alt="Logo" className="h-10" />
                            <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full">
                                Therapist
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                                    {getTimeOfDay()}, Dr. {user?.full_name?.split(' ')[1] || 'Therapist'} 👋
                                </h1>
                                <p className="text-gray-500">
                                    You have <span className="font-semibold text-cyan-600">{upcomingToday} sessions</span> remaining today.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setAvailabilityOpen(!availabilityOpen)}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Availability
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
                                <span className="text-xs text-green-500">+3 this month</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                            <p className="text-sm text-gray-500">Total Patients</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <span className="text-xs text-green-500">+12% vs last month</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">${stats.monthlyEarnings.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">This Month</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                <span className="text-xs text-gray-400">{stats.totalReviews} reviews</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
                            <p className="text-sm text-gray-500">Avg Rating</p>
                        </div>
                    </div>

                    {/* Availability Panel */}
                    {availabilityOpen && (
                        <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Weekly Availability</h3>
                                <Button size="sm" variant="outline">
                                    Edit Schedule
                                </Button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {weeklyAvailability.map((day) => (
                                    <div key={day.day} className="p-4 bg-gray-50 rounded-xl">
                                        <p className="font-medium text-gray-900 mb-1">{day.day}</p>
                                        <p className="text-sm text-gray-500">{day.hours}</p>
                                        <p className="text-xs text-cyan-600 mt-2">{day.slots} slots available</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                                {session.patientInitial}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900">{session.patient}</p>
                                                    {getStatusBadge(session.status)}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {session.type} Therapy • {session.duration} min
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">{session.time}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                {session.status === 'upcoming' && (
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

                                {/* Session summary */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Total session time today: <span className="font-semibold text-gray-900">
                                            {sessions.reduce((acc, s) => acc + s.duration, 0)} minutes
                                        </span>
                                    </span>
                                    <Link to="/calendar" className="text-cyan-600 hover:underline flex items-center gap-1">
                                        View full calendar
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Next Session */}
                            {sessions.find(s => s.status === 'upcoming') && (
                                <div className="dashboard-card bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
                                    <p className="text-cyan-100 text-sm mb-2">Next Session</p>
                                    <p className="text-2xl font-bold mb-1">
                                        {sessions.find(s => s.status === 'upcoming')?.patient}
                                    </p>
                                    <p className="text-cyan-100 mb-4">
                                        {sessions.find(s => s.status === 'upcoming')?.time} • {sessions.find(s => s.status === 'upcoming')?.type}
                                    </p>
                                    <Button
                                        className="w-full bg-white text-cyan-600 hover:bg-cyan-50"
                                        onClick={() => handleStartSession(sessions.find(s => s.status === 'upcoming')?.id || '')}
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
                                        { label: 'Patient Records', href: '/patients', icon: Users },
                                        { label: 'Session Notes', href: '/notes', icon: FileText },
                                        { label: 'Messages', href: '/messages', icon: MessageCircle },
                                        { label: 'Earnings', href: '/earnings', icon: DollarSign },
                                        { label: 'Settings', href: '/settings', icon: Settings },
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

                            {/* Performance */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Sessions Completed</span>
                                            <span className="font-medium text-gray-900">18/22</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '82%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Patient Satisfaction</span>
                                            <span className="font-medium text-gray-900">96%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '96%' }} />
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
