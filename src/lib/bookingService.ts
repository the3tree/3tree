/**
 * Booking Service - Complete booking management for 3-3.com Counseling
 * Handles all booking operations with Supabase integration
 */

import { supabase, Booking, Therapist, User } from './supabase';

// ============================================
// Types
// ============================================

export interface ServiceType {
    id: string;
    name: string;
    description: string;
    duration: number; // minutes
    price: number;
    icon: string;
}

export interface TimeSlot {
    time: string;
    available: boolean;
    period: 'morning' | 'afternoon' | 'evening';
}

export interface TherapistWithDetails extends Therapist {
    user: User;
}

export interface BookingDetails {
    id: string;
    patient_id: string;
    therapist_id: string;
    service_type: string;
    scheduled_at: string;
    duration_minutes: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    meeting_link?: string;
    notes?: string;
    created_at: string;
    therapist?: TherapistWithDetails;
    patient?: User;
}

export interface CreateBookingData {
    patient_id: string;
    therapist_id: string;
    service_type: string;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string;
}

// ============================================
// Service Types Configuration
// ============================================

export const serviceTypes: ServiceType[] = [
    {
        id: 'individual',
        name: 'Individual Therapy',
        description: 'One-on-one sessions focused on your personal growth and mental well-being',
        duration: 50,
        price: 75,
        icon: 'User'
    },
    {
        id: 'couple',
        name: 'Couples Therapy',
        description: 'Strengthen your relationship with guided therapeutic conversations',
        duration: 60,
        price: 95,
        icon: 'Heart'
    },
    {
        id: 'family',
        name: 'Family Therapy',
        description: 'Improve family dynamics and communication patterns',
        duration: 75,
        price: 120,
        icon: 'Users'
    },
    {
        id: 'group',
        name: 'Group Session',
        description: 'Connect with others facing similar challenges in a supportive environment',
        duration: 90,
        price: 45,
        icon: 'Users'
    },
    {
        id: 'consultation',
        name: 'Initial Consultation',
        description: 'Free introductory session to discuss your needs and find the right approach',
        duration: 15,
        price: 0,
        icon: 'MessageCircle'
    }
];

// ============================================
// Mock Therapists Data (fallback when Supabase not configured)
// ============================================

const mockTherapists: TherapistWithDetails[] = [
    {
        id: 't1',
        user_id: 'u1',
        specialties: ['Anxiety', 'Depression', 'Stress Management'],
        credentials: 'Ph.D. Clinical Psychology',
        bio: 'With over 15 years of experience, I specialize in helping individuals overcome anxiety and depression through evidence-based approaches.',
        hourly_rate: 75,
        availability: {
            'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Tuesday': ['09:00', '10:00', '14:00', '15:00'],
            'Wednesday': ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
            'Thursday': ['09:00', '10:00', '11:00', '14:00'],
            'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00']
        },
        is_approved: true,
        rating: 4.9,
        total_sessions: 1250,
        user: {
            id: 'u1',
            email: 'sarah.johnson@3-3.com',
            full_name: 'Dr. Sarah Johnson',
            avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-01-15',
            updated_at: '2024-01-01'
        }
    },
    {
        id: 't2',
        user_id: 'u2',
        specialties: ['CBT', 'Trauma', 'PTSD'],
        credentials: 'Psy.D., Licensed Psychologist',
        bio: 'I am passionate about helping trauma survivors reclaim their lives using cognitive-behavioral techniques and EMDR therapy.',
        hourly_rate: 85,
        availability: {
            'Monday': ['10:00', '11:00', '13:00', '14:00', '15:00'],
            'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['09:00', '10:00', '14:00', '15:00'],
            'Thursday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
            'Friday': ['09:00', '10:00', '11:00']
        },
        is_approved: true,
        rating: 4.8,
        total_sessions: 980,
        user: {
            id: 'u2',
            email: 'michael.chen@3-3.com',
            full_name: 'Dr. Michael Chen',
            avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-03-20',
            updated_at: '2024-01-01'
        }
    },
    {
        id: 't3',
        user_id: 'u3',
        specialties: ['Relationship Issues', 'Marriage Counseling', 'Communication'],
        credentials: 'LMFT, Certified Gottman Therapist',
        bio: 'Helping couples build stronger, more fulfilling relationships through evidence-based methods and compassionate guidance.',
        hourly_rate: 90,
        availability: {
            'Monday': ['14:00', '15:00', '16:00', '17:00'],
            'Tuesday': ['10:00', '11:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
            'Thursday': ['14:00', '15:00', '16:00'],
            'Friday': ['10:00', '11:00', '14:00', '15:00']
        },
        is_approved: true,
        rating: 4.9,
        total_sessions: 856,
        user: {
            id: 'u3',
            email: 'emily.wright@3-3.com',
            full_name: 'Dr. Emily Wright',
            avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-02-10',
            updated_at: '2024-01-01'
        }
    },
    {
        id: 't4',
        user_id: 'u4',
        specialties: ['Child Psychology', 'ADHD', 'Learning Disabilities'],
        credentials: 'Ph.D., Board Certified Child Psychologist',
        bio: 'Dedicated to helping children and adolescents overcome challenges and reach their full potential through play therapy and family involvement.',
        hourly_rate: 80,
        availability: {
            'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
            'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['10:00', '11:00', '14:00', '15:00'],
            'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
            'Friday': ['09:00', '10:00', '11:00']
        },
        is_approved: true,
        rating: 4.7,
        total_sessions: 720,
        user: {
            id: 'u4',
            email: 'david.miller@3-3.com',
            full_name: 'Dr. David Miller',
            avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-04-05',
            updated_at: '2024-01-01'
        }
    },
    {
        id: 't5',
        user_id: 'u5',
        specialties: ['Mindfulness', 'Stress', 'Work-Life Balance'],
        credentials: 'LCSW, Certified Mindfulness Practitioner',
        bio: 'I integrate mindfulness-based approaches with traditional therapy to help clients find balance, reduce stress, and cultivate inner peace.',
        hourly_rate: 70,
        availability: {
            'Monday': ['08:00', '09:00', '10:00', '17:00', '18:00'],
            'Tuesday': ['08:00', '09:00', '17:00', '18:00'],
            'Wednesday': ['08:00', '09:00', '10:00', '17:00', '18:00', '19:00'],
            'Thursday': ['08:00', '09:00', '17:00', '18:00'],
            'Friday': ['08:00', '09:00', '10:00', '14:00', '15:00']
        },
        is_approved: true,
        rating: 4.8,
        total_sessions: 645,
        user: {
            id: 'u5',
            email: 'lisa.patel@3-3.com',
            full_name: 'Lisa Patel, LCSW',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-05-12',
            updated_at: '2024-01-01'
        }
    },
    {
        id: 't6',
        user_id: 'u6',
        specialties: ['Addiction', 'Recovery', 'Substance Abuse'],
        credentials: 'CADC, Licensed Addiction Counselor',
        bio: 'Having walked the path of recovery myself, I bring both professional expertise and personal understanding to help clients overcome addiction.',
        hourly_rate: 75,
        availability: {
            'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
            'Wednesday': ['09:00', '10:00', '14:00', '15:00', '16:00'],
            'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
            'Friday': ['09:00', '10:00', '11:00']
        },
        is_approved: true,
        rating: 4.9,
        total_sessions: 890,
        user: {
            id: 'u6',
            email: 'james.wilson@3-3.com',
            full_name: 'James Wilson, CADC',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            role: 'therapist',
            created_at: '2023-06-01',
            updated_at: '2024-01-01'
        }
    }
];

// Mock bookings storage
let mockBookings: BookingDetails[] = [];

// ============================================
// Helper Functions
// ============================================

/**
 * Get day name from date
 */
function getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

/**
 * Format time to 12-hour format
 */
function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get time period (morning/afternoon/evening)
 */
function getTimePeriod(time: string): 'morning' | 'afternoon' | 'evening' {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

/**
 * Check if date is in the past
 */
function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Check if date is today
 */
function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Booking Service Functions
// ============================================

/**
 * Fetch all approved therapists
 */
export async function fetchTherapists(): Promise<TherapistWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                user:users(*)
            `)
            .eq('is_approved', true);

        if (error) throw error;

        if (data && data.length > 0) {
            return data as TherapistWithDetails[];
        }
    } catch (error) {
        console.log('Using mock therapist data');
    }

    // Return mock data as fallback
    return mockTherapists;
}

/**
 * Fetch single therapist by ID
 */
export async function fetchTherapistById(therapistId: string): Promise<TherapistWithDetails | null> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                user:users(*)
            `)
            .eq('id', therapistId)
            .single();

        if (error) throw error;
        return data as TherapistWithDetails;
    } catch (error) {
        console.log('Using mock therapist data');
    }

    // Return from mock data
    return mockTherapists.find(t => t.id === therapistId) || null;
}

/**
 * Get available time slots for a therapist on a specific date
 */
export async function getAvailableSlots(
    therapistId: string,
    date: Date
): Promise<TimeSlot[]> {
    // Get therapist availability
    const therapist = await fetchTherapistById(therapistId);
    if (!therapist) return [];

    const dayName = getDayName(date);
    const availableTimes = therapist.availability[dayName] || [];

    if (availableTimes.length === 0) return [];

    // Get existing bookings for this date
    const dateStr = date.toISOString().split('T')[0];
    let bookedTimes: string[] = [];

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('scheduled_at')
            .eq('therapist_id', therapistId)
            .gte('scheduled_at', `${dateStr}T00:00:00`)
            .lt('scheduled_at', `${dateStr}T23:59:59`)
            .neq('status', 'cancelled');

        if (!error && data) {
            bookedTimes = data.map(b => {
                const time = new Date(b.scheduled_at);
                return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            });
        }
    } catch (error) {
        // Check mock bookings
        bookedTimes = mockBookings
            .filter(b =>
                b.therapist_id === therapistId &&
                b.scheduled_at.startsWith(dateStr) &&
                b.status !== 'cancelled'
            )
            .map(b => {
                const time = new Date(b.scheduled_at);
                return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            });
    }

    // If today, filter out past times
    const now = new Date();
    const isDateToday = isToday(date);

    // Generate time slots
    return availableTimes
        .filter(time => {
            if (isDateToday) {
                const [hours, minutes] = time.split(':').map(Number);
                const slotTime = new Date(date);
                slotTime.setHours(hours, minutes, 0, 0);
                // Only show slots at least 1 hour in the future
                return slotTime.getTime() > now.getTime() + 60 * 60 * 1000;
            }
            return true;
        })
        .map(time => ({
            time: formatTime(time),
            available: !bookedTimes.includes(time),
            period: getTimePeriod(time)
        }));
}

/**
 * Get available dates for a therapist (next 30 days)
 */
export async function getAvailableDates(therapistId: string): Promise<Date[]> {
    const therapist = await fetchTherapistById(therapistId);
    if (!therapist) return [];

    const availableDays = Object.keys(therapist.availability);
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayName = getDayName(date);

        if (availableDays.includes(dayName)) {
            // Check if there are any available slots for this day
            const availability = therapist.availability[dayName];
            if (availability && availability.length > 0) {
                dates.push(date);
            }
        }
    }

    return dates;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<{ booking: BookingDetails | null; error: string | null }> {
    // Validate data
    if (!data.patient_id || !data.therapist_id || !data.service_type || !data.scheduled_at) {
        return { booking: null, error: 'Missing required booking information' };
    }

    // Check if slot is still available
    const scheduledDate = new Date(data.scheduled_at);
    const slots = await getAvailableSlots(data.therapist_id, scheduledDate);
    const timeStr = formatTime(
        `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`
    );

    const slot = slots.find(s => s.time === timeStr);
    if (slot && !slot.available) {
        return { booking: null, error: 'This time slot is no longer available' };
    }

    // Generate meeting link
    const meetingLink = `https://meet.3-3.com/session/${generateId()}`;

    try {
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert({
                ...data,
                status: 'confirmed',
                meeting_link: meetingLink
            })
            .select()
            .single();

        if (error) throw error;
        return { booking: booking as BookingDetails, error: null };
    } catch (error) {
        console.log('Using mock booking storage');
    }

    // Create mock booking
    const mockBooking: BookingDetails = {
        id: generateId(),
        ...data,
        status: 'confirmed',
        meeting_link: meetingLink,
        created_at: new Date().toISOString()
    };

    mockBookings.push(mockBooking);
    return { booking: mockBooking, error: null };
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string): Promise<BookingDetails[]> {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                therapist:therapists(
                    *,
                    user:users(*)
                )
            `)
            .eq('patient_id', userId)
            .order('scheduled_at', { ascending: false });

        if (error) throw error;
        if (data) return data as BookingDetails[];
    } catch (error) {
        console.log('Using mock bookings data');
    }

    // Return mock bookings for user
    return mockBookings.filter(b => b.patient_id === userId);
}

/**
 * Get therapist's bookings
 */
export async function getTherapistBookings(therapistId: string): Promise<BookingDetails[]> {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                patient:users!patient_id(*)
            `)
            .eq('therapist_id', therapistId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        if (data) return data as BookingDetails[];
    } catch (error) {
        console.log('Using mock bookings data');
    }

    return mockBookings.filter(b => b.therapist_id === therapistId);
}

/**
 * Get upcoming bookings for a user
 */
export async function getUpcomingBookings(userId: string): Promise<BookingDetails[]> {
    const now = new Date().toISOString();

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                therapist:therapists(
                    *,
                    user:users(*)
                )
            `)
            .eq('patient_id', userId)
            .gte('scheduled_at', now)
            .in('status', ['pending', 'confirmed'])
            .order('scheduled_at', { ascending: true })
            .limit(5);

        if (error) throw error;
        if (data) return data as BookingDetails[];
    } catch (error) {
        console.log('Using mock bookings data');
    }

    return mockBookings
        .filter(b =>
            b.patient_id === userId &&
            new Date(b.scheduled_at) >= new Date() &&
            ['pending', 'confirmed'].includes(b.status)
        )
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true, error: null };
    } catch (error) {
        console.log('Using mock booking cancellation');
    }

    // Update mock booking
    const booking = mockBookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = 'cancelled';
        return { success: true, error: null };
    }

    return { success: false, error: 'Booking not found' };
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
    bookingId: string,
    newScheduledAt: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ scheduled_at: newScheduledAt })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true, error: null };
    } catch (error) {
        console.log('Using mock booking reschedule');
    }

    // Update mock booking
    const booking = mockBookings.find(b => b.id === bookingId);
    if (booking) {
        booking.scheduled_at = newScheduledAt;
        return { success: true, error: null };
    }

    return { success: false, error: 'Booking not found' };
}

/**
 * Get booking statistics
 */
export async function getBookingStats(userId?: string): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
}> {
    const now = new Date().toISOString();

    try {
        let query = supabase.from('bookings').select('status, scheduled_at');

        if (userId) {
            query = query.eq('patient_id', userId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
            return {
                total: data.length,
                completed: data.filter(b => b.status === 'completed').length,
                upcoming: data.filter(b =>
                    ['pending', 'confirmed'].includes(b.status) &&
                    new Date(b.scheduled_at) >= new Date()
                ).length,
                cancelled: data.filter(b => b.status === 'cancelled').length
            };
        }
    } catch (error) {
        console.log('Using mock booking stats');
    }

    // Calculate from mock bookings
    const bookings = userId
        ? mockBookings.filter(b => b.patient_id === userId)
        : mockBookings;

    return {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        upcoming: bookings.filter(b =>
            ['pending', 'confirmed'].includes(b.status) &&
            new Date(b.scheduled_at) >= new Date()
        ).length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
}

export default {
    serviceTypes,
    fetchTherapists,
    fetchTherapistById,
    getAvailableSlots,
    getAvailableDates,
    createBooking,
    getUserBookings,
    getTherapistBookings,
    getUpcomingBookings,
    cancelBooking,
    rescheduleBooking,
    getBookingStats
};
