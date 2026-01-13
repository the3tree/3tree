/**
 * BookingPage - Complete premium booking experience
 * 5-step booking flow with beautiful UI and animations
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Booking Components
import {
    BookingStepIndicator,
    ServiceSelector,
    TherapistCard,
    TherapistCardSkeleton,
    BookingCalendar,
    TimeSlotPicker,
    BookingConfirmation,
    BookingSuccess
} from '@/components/booking';

// Booking Service
import {
    serviceTypes,
    fetchTherapists,
    getAvailableSlots,
    getAvailableDates,
    createBooking,
    type ServiceType,
    type TherapistWithDetails,
    type TimeSlot
} from '@/lib/bookingService';

// Booking Automation
import {
    sendBookingConfirmation,
    scheduleBookingReminders,
    generateMeetingUrl,
    sendMeetingLink
} from '@/lib/services/bookingAutomation';

// Razorpay Payment
import { openPaymentModal, type RazorpayPaymentResult } from '@/lib/services/razorpayService';

// Steps configuration
const STEPS = [
    { number: 1, label: 'Service' },
    { number: 2, label: 'Therapist' },
    { number: 3, label: 'Date' },
    { number: 4, label: 'Time' },
    { number: 5, label: 'Confirm' }
];

export default function BookingPage() {
    const { therapistId } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<string | null>(therapistId || null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Data state
    const [therapists, setTherapists] = useState<TherapistWithDetails[]>([]);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // Loading states
    const [loadingTherapists, setLoadingTherapists] = useState(true);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Booking result
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingId, setBookingId] = useState<string>('');
    const [meetingLink, setMeetingLink] = useState<string>('');

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);

    // Refs
    const contentRef = useRef<HTMLDivElement>(null);

    // Get current therapist and service
    const currentTherapist = therapists.find(t => t.id === selectedTherapist);
    const currentService = serviceTypes.find(s => s.id === selectedService);

    // Load therapists on mount
    useEffect(() => {
        loadTherapists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load available dates when therapist is selected
    useEffect(() => {
        if (selectedTherapist) {
            loadAvailableDates(selectedTherapist);
        }
    }, [selectedTherapist]);

    // Load time slots when date is selected
    useEffect(() => {
        if (selectedTherapist && selectedDate) {
            loadTimeSlots(selectedTherapist, selectedDate);
        }
    }, [selectedTherapist, selectedDate]);

    // Skip to step 2 if therapist is pre-selected
    useEffect(() => {
        if (therapistId && therapists.length > 0) {
            const therapist = therapists.find(t => t.id === therapistId);
            if (therapist) {
                setSelectedTherapist(therapistId);
                // Don't auto-advance, let user select service first
            }
        }
    }, [therapistId, therapists]);

    // Animate step transitions
    useEffect(() => {
        if (!contentRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        gsap.fromTo(contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
    }, [currentStep, bookingComplete]);

    // Load functions
    const loadTherapists = async () => {
        setLoadingTherapists(true);
        try {
            const data = await fetchTherapists();
            setTherapists(data);
        } catch (error) {
            console.error('Failed to load therapists:', error);
            toast({
                title: 'Error',
                description: 'Failed to load therapists. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setLoadingTherapists(false);
        }
    };

    const loadAvailableDates = async (therapistId: string) => {
        setLoadingDates(true);
        try {
            const dates = await getAvailableDates(therapistId);
            setAvailableDates(dates);
        } catch (error) {
            console.error('Failed to load available dates:', error);
        } finally {
            setLoadingDates(false);
        }
    };

    const loadTimeSlots = async (therapistId: string, date: Date) => {
        setLoadingSlots(true);
        try {
            const slots = await getAvailableSlots(therapistId, date);
            setTimeSlots(slots);
        } catch (error) {
            console.error('Failed to load time slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Navigation functions
    const goToStep = (step: number) => {
        if (step < 1 || step > 5) return;

        // Validate navigation
        if (step >= 2 && !selectedService) return;
        if (step >= 3 && !selectedTherapist) return;
        if (step >= 4 && !selectedDate) return;
        if (step >= 5 && !selectedTime) return;

        setCurrentStep(step);
    };

    const goNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle booking submission
    const handleConfirmBooking = async () => {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please log in to book an appointment.',
                variant: 'destructive'
            });
            return;
        }

        if (!currentTherapist || !currentService || !selectedDate || !selectedTime) {
            toast({
                title: 'Missing Information',
                description: 'Please complete all steps before confirming.',
                variant: 'destructive'
            });
            return;
        }

        // Parse time to create scheduled_at
        const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) {
            toast({ title: 'Error', description: 'Invalid time format', variant: 'destructive' });
            return;
        }

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const scheduledAt = new Date(selectedDate);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Helper function to complete booking
        const completeBooking = async () => {
            const result = await createBooking({
                client_id: user.id,
                therapist_id: currentTherapist.id,
                service_category_id: currentService.id,
                session_mode: 'video',
                scheduled_at: scheduledAt.toISOString(),
                duration_minutes: currentService.duration,
                client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            if (result.error) throw new Error(result.error);

            if (result.booking) {
                setBookingId(result.booking.id);
                let meetingUrl = result.booking.meeting_url || result.booking.room_id || '';
                if (!meetingUrl) {
                    try { meetingUrl = await generateMeetingUrl(result.booking.id); } catch { }
                }
                setMeetingLink(meetingUrl);
                setBookingComplete(true);
                toast({ title: 'Booking Confirmed!', description: 'Your appointment has been scheduled successfully.' });
            }
        };

        // For PAID services - open Razorpay payment modal
        if (currentService.price > 0) {
            setSubmitting(true);

            openPaymentModal(
                {
                    bookingId: `pending_${Date.now()}`,
                    amount: currentService.price,
                    currency: 'INR',
                    customerName: user.email?.split('@')[0] || 'Customer',
                    customerEmail: user.email || '',
                    customerPhone: '',
                    serviceName: currentService.name,
                    therapistName: currentTherapist.user.full_name,
                },
                // On Payment Success
                async (paymentResult: RazorpayPaymentResult) => {
                    console.log('Payment successful:', paymentResult);
                    try {
                        await completeBooking();
                    } catch (error) {
                        console.error('Booking after payment failed:', error);
                        toast({
                            title: 'Booking Failed',
                            description: 'Payment successful but booking failed. Please contact support.',
                            variant: 'destructive'
                        });
                    } finally {
                        setSubmitting(false);
                    }
                },
                // On Payment Failure/Cancel
                (error: string) => {
                    console.log('Payment failed:', error);
                    setSubmitting(false);
                    if (error !== 'Payment cancelled') {
                        toast({ title: 'Payment Failed', description: error, variant: 'destructive' });
                    }
                }
            );
        } else {
            // For FREE services - create booking directly
            setSubmitting(true);
            try {
                await completeBooking();
            } catch (error) {
                console.error('Booking failed:', error);
                toast({
                    title: 'Booking Failed',
                    description: error instanceof Error ? error.message : 'Please try again.',
                    variant: 'destructive'
                });
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Filter therapists
    const filteredTherapists = therapists.filter(therapist => {
        const matchesSearch = searchQuery === '' ||
            therapist.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            therapist.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSpecialty = !specialtyFilter ||
            therapist.specialties.includes(specialtyFilter);

        return matchesSearch && matchesSpecialty;
    });

    // Get all unique specialties
    const allSpecialties = [...new Set(therapists.flatMap(t => t.specialties))].sort();

    // Check if can proceed to next step
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!selectedService;
            case 2: return !!selectedTherapist;
            case 3: return !!selectedDate;
            case 4: return !!selectedTime;
            default: return false;
        }
    };

    // Render success screen
    if (bookingComplete && currentTherapist && currentService && selectedDate && selectedTime) {
        return (
            <>
                <Helmet>
                    <title>Booking Confirmed | 3-3.com Counseling</title>
                </Helmet>
                <Layout>
                    <section className="min-h-screen bg-gradient-subtle py-20 pt-28">
                        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
                            <div ref={contentRef}>
                                <BookingSuccess
                                    bookingId={bookingId}
                                    therapist={currentTherapist}
                                    service={currentService}
                                    selectedDate={selectedDate}
                                    selectedTime={selectedTime}
                                    meetingLink={meetingLink}
                                />
                            </div>
                        </div>
                    </section>
                </Layout>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Book Appointment | 3-3.com Counseling</title>
                <meta name="description" content="Book a therapy session with our licensed counselors. Easy online scheduling, video sessions, and personalized care." />
            </Helmet>
            <Layout>
                <section className="min-h-screen bg-gradient-subtle py-20 pt-28">
                    <div className="container mx-auto px-4 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">
                                Book Your Session
                            </h1>
                            <p className="text-gray-500 text-lg">
                                Schedule a session with one of our experienced therapists
                            </p>
                        </div>

                        {/* Step Indicator */}
                        <BookingStepIndicator currentStep={currentStep} steps={STEPS} />

                        {/* Step Content */}
                        <div ref={contentRef} className="max-w-4xl mx-auto">
                            {/* Step 1: Select Service */}
                            {currentStep === 1 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Select a Service
                                        </h2>
                                        <p className="text-gray-500">
                                            Choose the type of therapy session that best fits your needs
                                        </p>
                                    </div>

                                    <ServiceSelector
                                        services={serviceTypes}
                                        selectedService={selectedService}
                                        onSelect={setSelectedService}
                                    />

                                    <div className="flex justify-end mt-8">
                                        <Button
                                            onClick={goNext}
                                            disabled={!selectedService}
                                            className="btn-icy px-8"
                                        >
                                            Continue
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Therapist */}
                            {currentStep === 2 && (
                                <div>
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Choose Your Therapist
                                        </h2>
                                        <p className="text-gray-500">
                                            Find the perfect therapist to support your journey
                                        </p>
                                    </div>

                                    {/* Search and Filter */}
                                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or specialty..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setFilterOpen(!filterOpen)}
                                            className={`px-4 rounded-xl border-2 ${filterOpen || specialtyFilter ? 'border-cyan-500 text-cyan-600' : ''}`}
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                            {specialtyFilter && (
                                                <span className="ml-2 w-2 h-2 bg-cyan-500 rounded-full" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Filter Panel */}
                                    {filterOpen && (
                                        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-medium text-gray-900">Filter by Specialty</span>
                                                {specialtyFilter && (
                                                    <button
                                                        onClick={() => setSpecialtyFilter(null)}
                                                        className="text-sm text-cyan-600 hover:underline"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {allSpecialties.map(specialty => (
                                                    <button
                                                        key={specialty}
                                                        onClick={() => setSpecialtyFilter(
                                                            specialtyFilter === specialty ? null : specialty
                                                        )}
                                                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${specialtyFilter === specialty
                                                            ? 'bg-cyan-500 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {specialty}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Therapist Grid */}
                                    {loadingTherapists ? (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[1, 2, 3, 4].map(i => (
                                                <TherapistCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : filteredTherapists.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                            <p className="text-gray-500">No therapists found matching your criteria.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSpecialtyFilter(null);
                                                }}
                                                className="mt-4 text-cyan-600 hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {filteredTherapists.map((therapist, index) => (
                                                <TherapistCard
                                                    key={therapist.id}
                                                    therapist={therapist}
                                                    isSelected={selectedTherapist === therapist.id}
                                                    onSelect={() => setSelectedTherapist(therapist.id)}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-8">
                                        <Button variant="outline" onClick={goBack} className="px-6">
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={goNext}
                                            disabled={!selectedTherapist}
                                            className="btn-icy px-8"
                                        >
                                            Continue
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Select Date */}
                            {currentStep === 3 && currentTherapist && (
                                <div className="max-w-lg mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Select a Date
                                        </h2>
                                        <p className="text-gray-500">
                                            Choose a date for your session with {currentTherapist.user.full_name}
                                        </p>
                                    </div>

                                    <BookingCalendar
                                        selectedDate={selectedDate}
                                        onDateSelect={(date) => {
                                            setSelectedDate(date);
                                            setSelectedTime(null); // Reset time when date changes
                                        }}
                                        availableDates={availableDates}
                                    />

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-8">
                                        <Button variant="outline" onClick={goBack} className="px-6">
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={goNext}
                                            disabled={!selectedDate}
                                            className="btn-icy px-8"
                                        >
                                            Continue
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Select Time */}
                            {currentStep === 4 && currentTherapist && selectedDate && (
                                <div className="max-w-lg mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Select a Time
                                        </h2>
                                        <p className="text-gray-500">
                                            {selectedDate.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <TimeSlotPicker
                                        slots={timeSlots}
                                        selectedTime={selectedTime}
                                        onTimeSelect={setSelectedTime}
                                        loading={loadingSlots}
                                    />

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-8">
                                        <Button variant="outline" onClick={goBack} className="px-6">
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={goNext}
                                            disabled={!selectedTime}
                                            className="btn-icy px-8"
                                        >
                                            Continue
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Confirm */}
                            {currentStep === 5 && currentTherapist && currentService && selectedDate && selectedTime && (
                                <div className="max-w-xl mx-auto">
                                    <BookingConfirmation
                                        therapist={currentTherapist}
                                        service={currentService}
                                        selectedDate={selectedDate}
                                        selectedTime={selectedTime}
                                        onConfirm={handleConfirmBooking}
                                        onEdit={goToStep}
                                        loading={submitting}
                                    />

                                    {/* Back button */}
                                    <div className="mt-6">
                                        <Button
                                            variant="ghost"
                                            onClick={goBack}
                                            className="w-full text-gray-500"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back to time selection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
}
