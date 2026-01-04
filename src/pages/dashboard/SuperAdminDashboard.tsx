import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { gsap } from "gsap";
import {
    Users,
    Calendar,
    DollarSign,
    Shield,
    UserCheck,
    UserX,
    Activity,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface TherapistData {
    id: string;
    user_id: string;
    is_approved: boolean;
    specialties: string[];
    rating: number;
    total_sessions: number;
    users: {
        full_name: string;
        email: string;
    };
}

interface BookingData {
    id: string;
    service_type: string;
    scheduled_at: string;
    status: string;
    amount: number;
    payment_status: string;
}

interface Stats {
    totalUsers: number;
    totalTherapists: number;
    pendingApprovals: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
}

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalTherapists: 0,
        pendingApprovals: 0,
        totalBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
    });
    const [users, setUsers] = useState<UserData[]>([]);
    const [therapists, setTherapists] = useState<TherapistData[]>([]);
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "therapists" | "bookings">("overview");
    const [searchQuery, setSearchQuery] = useState("");

    // Check if user is super_admin
    useEffect(() => {
        if (user && user.role !== "super_admin") {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    // Fetch data
    useEffect(() => {
        if (user?.role === "super_admin") {
            fetchAllData();
        }
    }, [user]);

    // Animations
    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".admin-card",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );
        }
    }, [loading, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch users
            const { data: usersData } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false });

            // Fetch therapists with user info
            const { data: therapistsData } = await supabase
                .from("therapists")
                .select("*, users(full_name, email)")
                .order("created_at", { ascending: false });

            // Fetch bookings
            const { data: bookingsData } = await supabase
                .from("bookings")
                .select("*")
                .order("scheduled_at", { ascending: false })
                .limit(50);

            if (usersData) setUsers(usersData);
            if (therapistsData) setTherapists(therapistsData as any);
            if (bookingsData) setBookings(bookingsData);

            // Calculate stats
            setStats({
                totalUsers: usersData?.length || 0,
                totalTherapists: therapistsData?.length || 0,
                pendingApprovals: therapistsData?.filter((t: any) => !t.is_approved).length || 0,
                totalBookings: bookingsData?.length || 0,
                completedBookings: bookingsData?.filter((b) => b.status === "completed").length || 0,
                totalRevenue: bookingsData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveTherapist = async (therapistId: string, approve: boolean) => {
        try {
            await supabase
                .from("therapists")
                .update({ is_approved: approve })
                .eq("id", therapistId);
            fetchAllData();
        } catch (error) {
            console.error("Error updating therapist:", error);
        }
    };

    const handleToggleUserActive = async (userId: string, isActive: boolean) => {
        try {
            await supabase
                .from("users")
                .update({ is_active: isActive })
                .eq("id", userId);
            fetchAllData();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (user?.role !== "super_admin") {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Super Admin Dashboard | The 3 Tree</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-gradient-to-r from-[#1a2744] to-[#2d3a54] text-white sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <BackButton to="/dashboard" label="Back to Dashboard" className="text-white/80 hover:text-white hover:bg-white/10" />
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-cyan-400" />
                                        Super Admin
                                    </h1>
                                    <p className="text-sm text-white/70">Full system oversight and management</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm bg-cyan-500/20 px-3 py-1 rounded-full text-cyan-300">
                                    {user?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {[
                            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
                            { label: "Therapists", value: stats.totalTherapists, icon: UserCheck, color: "bg-emerald-500" },
                            { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "bg-amber-500" },
                            { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "bg-purple-500" },
                            { label: "Completed", value: stats.completedBookings, icon: CheckCircle, color: "bg-green-500" },
                            { label: "Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: "bg-cyan-500" },
                        ].map((stat) => (
                            <div key={stat.label} className="admin-card bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[
                            { id: "overview", label: "Overview", icon: Activity },
                            { id: "users", label: "Users", icon: Users },
                            { id: "therapists", label: "Therapists", icon: UserCheck },
                            { id: "bookings", label: "Bookings", icon: Calendar },
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "default" : "outline"}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 ${activeTab === tab.id
                                        ? "bg-[#1a2744] text-white"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {/* Search */}
                    {(activeTab === "users" || activeTab === "therapists") && (
                        <div className="admin-card bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Users Tab */}
                            {activeTab === "users" && (
                                <div className="admin-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Role</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined</th>
                                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredUsers.map((u) => (
                                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{u.full_name || "No name"}</p>
                                                                <p className="text-sm text-gray-500">{u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "super_admin"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : u.role === "admin"
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : u.role === "therapist"
                                                                                ? "bg-emerald-100 text-emerald-700"
                                                                                : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                            >
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className={`flex items-center gap-1 text-sm ${u.is_active ? "text-green-600" : "text-red-600"
                                                                    }`}
                                                            >
                                                                {u.is_active ? (
                                                                    <>
                                                                        <CheckCircle className="w-4 h-4" /> Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserX className="w-4 h-4" /> Disabled
                                                                    </>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-500">
                                                            {new Date(u.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleToggleUserActive(u.id, !u.is_active)}
                                                                    className={u.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                                                >
                                                                    {u.is_active ? "Disable" : "Enable"}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Therapists Tab */}
                            {activeTab === "therapists" && (
                                <div className="admin-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Therapist</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Specialties</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rating</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Sessions</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {therapists.map((t) => (
                                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{t.users?.full_name || "No name"}</p>
                                                                <p className="text-sm text-gray-500">{t.users?.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex flex-wrap gap-1">
                                                                {t.specialties?.slice(0, 2).map((s) => (
                                                                    <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                                {t.specialties?.length > 2 && (
                                                                    <span className="text-xs text-gray-400">+{t.specialties.length - 2}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-amber-500 font-semibold">{t.rating?.toFixed(1) || "0.0"}</span>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600">{t.total_sessions}</td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_approved
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-amber-100 text-amber-700"
                                                                    }`}
                                                            >
                                                                {t.is_approved ? "Approved" : "Pending"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!t.is_approved ? (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleApproveTherapist(t.id, true)}
                                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleApproveTherapist(t.id, false)}
                                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    >
                                                                        Revoke
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Bookings Tab */}
                            {activeTab === "bookings" && (
                                <div className="admin-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Booking ID</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Service</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Scheduled</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Payment</th>
                                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bookings.map((b) => (
                                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <span className="font-mono text-sm text-gray-600">{b.id.slice(0, 8)}...</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="capitalize font-medium text-gray-900">{b.service_type}</span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">
                                                            {new Date(b.scheduled_at).toLocaleString()}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === "completed"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : b.status === "confirmed"
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : b.status === "cancelled"
                                                                                ? "bg-red-100 text-red-700"
                                                                                : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                            >
                                                                {b.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${b.payment_status === "paid"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : b.payment_status === "refunded"
                                                                            ? "bg-amber-100 text-amber-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                            >
                                                                {b.payment_status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-semibold text-gray-900">
                                                            ${b.amount?.toFixed(2) || "0.00"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Overview Tab */}
                            {activeTab === "overview" && (
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Recent Users */}
                                    <div className="admin-card bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-500" />
                                            Recent Users
                                        </h3>
                                        <div className="space-y-3">
                                            {users.slice(0, 5).map((u) => (
                                                <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{u.full_name || u.email}</p>
                                                        <p className="text-xs text-gray-500">{u.role}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pending Approvals */}
                                    <div className="admin-card bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                            Pending Therapist Approvals
                                        </h3>
                                        <div className="space-y-3">
                                            {therapists
                                                .filter((t) => !t.is_approved)
                                                .slice(0, 5)
                                                .map((t) => (
                                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{t.users?.full_name || "Unknown"}</p>
                                                            <p className="text-xs text-gray-500">{t.users?.email}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApproveTherapist(t.id, true)}
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs"
                                                        >
                                                            Approve
                                                        </Button>
                                                    </div>
                                                ))}
                                            {therapists.filter((t) => !t.is_approved).length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">No pending approvals</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
