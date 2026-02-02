/**
 * PatientDashboard - Enhanced with real booking integration
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { gsap } from 'gsap';
import {
    Calendar,
    MessageCircle,
    Video,
    FileText,
    Settings,
    User,
    Clock,
    ArrowRight,
    Bell,
    BookOpen,
    X,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    LogOut,
    ChevronRight,
    Copy,
    Key,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    getUpcomingBookings,
    getUserBookings,
    cancelBooking,
    getBookingStats,
    type BookingDetails
} from '@/lib/bookingService';

const quickActions = [
    { icon: Calendar, label: 'Book Session', href: '/booking', color: 'bg-slate-800' },
    { icon: MessageCircle, label: 'Messages', href: '/messages', color: 'bg-slate-700' },
    { icon: FileText, label: 'Assessments', href: '/assessments', color: 'bg-slate-600' },
    { icon: BookOpen, label: 'Resources', href: '/guides', color: 'bg-slate-500' },
];

export default function PatientDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [upcomingBookings, setUpcomingBookings] = useState<BookingDetails[]>([]);
    const [bookingHistory, setBookingHistory] = useState<BookingDetails[]>([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Load bookings
    useEffect(() => {
        if (user) {
            loadBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const loadBookings = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [upcoming, history, bookingStats] = await Promise.all([
                getUpcomingBookings(user.id),
                getUserBookings(user.id),
                getBookingStats(user.id)
            ]);

            setUpcomingBookings(upcoming);
            setBookingHistory(history);
            setStats(bookingStats);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        setCancellingId(bookingId);
        try {
            console.log('Attempting to cancel booking:', bookingId);
            const result = await cancelBooking(bookingId);
            console.log('Cancel booking result:', result);

            if (result.success) {
                toast({
                    title: 'Booking Cancelled',
                    description: result.refundEligible
                        ? 'Your appointment has been cancelled. Refund will be processed within 5-7 business days.'
                        : 'Your appointment has been cancelled successfully.'
                });
                loadBookings(); // Reload bookings
            } else {
                console.error('Cancel booking failed:', result.error);
                toast({
                    title: 'Unable to Cancel',
                    description: result.error || 'Failed to cancel booking. Please try again.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Cancel booking exception:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to cancel booking. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setCancellingId(null);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const formatBookingDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatBookingTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

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
                <title>Dashboard | 3-3.com Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="The 3 Tree"
                                className="h-10 w-auto"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <div className="hidden sm:flex flex-col">
                                <span className="font-serif text-lg font-bold text-slate-800">The 3 Tree</span>
                                <span className="text-[10px] text-slate-500 -mt-0.5">Mental Wellness</span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                        {user?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user?.full_name || 'User'}
                                    </span>
                                </button>
                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <>
                                        {/* Backdrop to close on outside click */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setProfileMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-medium text-gray-900">{user?.full_name}</p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">Profile Settings</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">Account Settings</span>
                                            </Link>
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="dashboard-card mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-serif text-gray-900 mb-2">
                                    Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
                                </h1>
                                <p className="text-gray-500">Here's what's happening with your wellness journey.</p>
                            </div>
                            <Button asChild className="btn-icy sm:w-auto">
                                <Link to="/booking" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Book New Session
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="dashboard-card grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800 rounded-2xl p-5 text-white">
                            <p className="text-slate-300 text-sm mb-1">Total Sessions</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-200">
                            <p className="text-slate-500 text-sm mb-1">Completed</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-200">
                            <p className="text-slate-500 text-sm mb-1">Upcoming</p>
                            <p className="text-3xl font-bold text-slate-600">{stats.upcoming}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-200">
                            <p className="text-slate-500 text-sm mb-1">Cancelled</p>
                            <p className="text-3xl font-bold text-slate-400">{stats.cancelled}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-card grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                to={action.href}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
                            >
                                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                                    {action.label}
                                </p>
                            </Link>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Upcoming Sessions */}
                        <div className="lg:col-span-2">
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                                    <button
                                        onClick={loadBookings}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : upcomingBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingBookings.map((booking) => {
                                            const isExpanded = expandedSessionId === booking.id;
                                            // Access meeting credentials from the booking object
                                            const meetingId = (booking as any).zoom_meeting_id;
                                            const passcode = (booking as any).zoom_passcode;

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                                >
                                                    {/* Main session info */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                            {booking.therapist?.user?.full_name?.charAt(0) || 'T'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {booking.therapist?.user?.full_name || 'Therapist'}
                                                            </p>
                                                            <p className="text-sm text-slate-500 capitalize">
                                                                {booking.session_mode?.replace(/_/g, ' ') || 'Video Session'} • {booking.duration_minutes} min
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900">
                                                                    {formatBookingDate(booking.scheduled_at)}
                                                                </p>
                                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatBookingTime(booking.scheduled_at)}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 flex-wrap">
                                                                <Button
                                                                    size="sm"
                                                                    className="btn-icy text-xs px-4"
                                                                    asChild
                                                                >
                                                                    <Link to={`/call/${booking.id}`}>
                                                                        <Video className="w-4 h-4 mr-1" />
                                                                        Join
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                                    onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                                                >
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    Google Meet
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setExpandedSessionId(isExpanded ? null : booking.id)}
                                                                    className="text-xs"
                                                                >
                                                                    <Key className="w-3 h-3 mr-1" />
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expandable meeting details */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                                                            <div className="flex flex-wrap gap-4">
                                                                {/* Meeting ID */}
                                                                <div className="flex-1 min-w-[200px] bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-500 mb-1">Meeting ID</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900">
                                                                            {meetingId || 'Not available'}
                                                                        </p>
                                                                        {meetingId && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(meetingId);
                                                                                    toast({ title: 'Copied!', description: 'Meeting ID copied to clipboard' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                                            >
                                                                                <Copy className="w-4 h-4 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Passcode */}
                                                                <div className="flex-1 min-w-[150px] bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-500 mb-1">Passcode</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900">
                                                                            {passcode || 'Not set'}
                                                                        </p>
                                                                        {passcode && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(passcode);
                                                                                    toast({ title: 'Copied!', description: 'Passcode copied to clipboard' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                                            >
                                                                                <Copy className="w-4 h-4 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Meeting Link */}
                                                                <div className="w-full bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-500 mb-1">Meeting Link</p>
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <p className="font-mono text-sm text-gray-600 truncate flex-1">
                                                                            {booking.meeting_link || booking.meeting_url || `${window.location.origin}/call/${booking.id}`}
                                                                        </p>
                                                                        <button
                                                                            onClick={() => {
                                                                                const link = booking.meeting_link || booking.meeting_url || `${window.location.origin}/call/${booking.id}`;
                                                                                navigator.clipboard.writeText(link);
                                                                                toast({ title: 'Copied!', description: 'Meeting link copied to clipboard' });
                                                                            }}
                                                                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                                                        >
                                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action buttons */}
                                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                    disabled={cancellingId === booking.id}
                                                                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                >
                                                                    {cancellingId === booking.id ? (
                                                                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                                                    ) : (
                                                                        <X className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    Cancel Session
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="btn-icy"
                                                                    asChild
                                                                >
                                                                    <Link to={`/call/${booking.id}`}>
                                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                                        Join Session
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 mb-4">No upcoming sessions</p>
                                        <Button asChild className="btn-icy">
                                            <Link to="/booking">Book Your First Session</Link>
                                        </Button>
                                    </div>
                                )}

                                {/* View History Link */}
                                {bookingHistory.length > 0 && (
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="w-full mt-4 py-3 text-center text-cyan-600 hover:text-cyan-700 font-medium flex items-center justify-center gap-1 border-t border-gray-100"
                                    >
                                        {showHistory ? 'Hide' : 'View'} Booking History
                                        <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                                    </button>
                                )}

                                {/* Booking History */}
                                {showHistory && bookingHistory.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                        <h3 className="font-medium text-gray-700 mb-3">Recent History</h3>
                                        {bookingHistory.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-medium flex-shrink-0">
                                                    {booking.therapist?.user?.full_name?.charAt(0) || 'T'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {booking.therapist?.user?.full_name || 'Therapist'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatBookingDate(booking.scheduled_at)}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Progress Card */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Sessions Completed</span>
                                            <span className="font-medium text-gray-900">{stats.completed}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-slate-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((stats.completed / Math.max(stats.total, 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Consistency Score</span>
                                            <span className="font-medium text-gray-900">
                                                {stats.total > 0 ? Math.round((1 - stats.cancelled / stats.total) * 100) : 100}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-slate-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.total > 0 ? Math.round((1 - stats.cancelled / stats.total) * 100) : 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Profile Settings', href: '/profile', icon: User },
                                        { label: 'Account Settings', href: '/settings', icon: Settings },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <link.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-500" />
                                            <span className="text-gray-700 group-hover:text-gray-900">{link.label}</span>
                                            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Support Card */}
                            <div className="dashboard-card bg-slate-800 rounded-2xl p-6 text-white">
                                <h3 className="font-semibold mb-2">Need Help?</h3>
                                <p className="text-slate-300 text-sm mb-4">
                                    Our support team is here for you 24/7
                                </p>
                                <Button
                                    asChild
                                    className="w-full bg-white text-cyan-600 hover:bg-cyan-50"
                                >
                                    <Link to="/contact">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Contact Support
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
