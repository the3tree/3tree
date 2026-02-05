/**
 * BookingPage - Complete premium booking experience
 * 6-step booking flow with beautiful UI and animations
 * Enhanced with real-time slot synchronization and service-specific questionnaires
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Filter, X, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Booking Components
import {
    BookingStepIndicator,
    ServiceSelector,
    ServiceQuestionnaire,
    TherapistCard,
    TherapistCardSkeleton,
    BookingCalendar,
    TimeSlotPicker,
    BookingConfirmation,
    BookingSuccess
} from '@/components/booking';

// Therapist Filter
import TherapistFilter, { applyTherapistFilters, defaultFilters } from '@/components/booking/TherapistFilter';

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

// Real-time Booking Service
import {
    lockSlotInDatabase,
    unlockSlotInDatabase,
    createBookingAtomic,
    subscribeToSlotAvailability,
    getActiveLocksForTherapist
} from '@/lib/services/bookingRealtimeService';

// Booking Automation
import {
    sendBookingConfirmation,
    scheduleBookingReminders,
    generateMeetingUrl,
    sendMeetingLink
} from '@/lib/services/bookingAutomation';

// Form & Assessment Services
import { getUserSubmissions } from '@/lib/services/formService';
import { getUserAssessments } from '@/lib/services/assessmentService';

// Service Questionnaire Service
import {
    getQuestionnaireForService,
    saveQuestionnaireSubmission,
    hasCompletedQuestionnaire,
    type ServiceQuestionnaire as ServiceQuestionnaireType,
} from '@/lib/services/serviceQuestionnaireService';

// Razorpay Payment
import { openPaymentModal, type RazorpayPaymentResult } from '@/lib/services/razorpayService';

// Steps configuration - now includes Questionnaire step
const STEPS = [
    { number: 1, label: 'Service' },
    { number: 2, label: 'Questionnaire' },
    { number: 3, label: 'Therapist' },
    { number: 4, label: 'Date' },
    { number: 5, label: 'Time' },
    { number: 6, label: 'Confirm' }
];

// Onboarding Steps
const ONBOARDING_STEPS = [
    {
        id: 'wellness-check',
        title: 'Wellness Check',
        description: 'A 5-minute checkout of your current mental wellbeing (GAD-7).',
        action: 'Start Assessment',
        link: '/assessments/gad-7?redirect=/booking',
        icon: 'BarChart'
    },
    {
        id: 'intake-form',
        title: 'Client Intake Form',
        description: 'Essential information to help us match you with the best care.',
        action: 'Complete Form',
        link: '/intake?redirect=/booking',
        icon: 'FileText'
    }
];

export default function BookingPage() {
    const { therapistId } = useParams();
    const [searchParams] = useSearchParams();
    const { user, session } = useAuth();
    const { toast } = useToast();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<string | null>(therapistId || null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Questionnaire state
    const [currentQuestionnaire, setCurrentQuestionnaire] = useState<ServiceQuestionnaireType | null>(null);
    const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
    const [questionnaireData, setQuestionnaireData] = useState<Record<string, unknown> | null>(null);

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
    const [therapistFilters, setTherapistFilters] = useState<import('@/components/booking/TherapistFilter').TherapistFilters>({
        specializations: [],
        languages: [],
        serviceTypes: [],
        counsellingModes: [],
        sessionTimes: [],
        onlineOnly: false,
        nextAvailable: false,
    });

    // Onboarding State
    const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'required' | 'complete'>('loading');
    const [stepsStatus, setStepsStatus] = useState({
        assessment: false,
        intake: false
    });

    // Check Onboarding Logic
    useEffect(() => {
        async function checkOnboarding() {
            if (!user) {
                // If not logged in, we can't check, but we'll assume they need to log in first
                // For now, let's treat as 'loading' or bypass if we want guests to see services
                setOnboardingStatus('complete'); // Allow guests to browse services first
                return;
            }

            // Only clients need onboarding before booking
            const sessionRole = session?.user?.user_metadata?.role as string | undefined;
            const effectiveRole = user.role || sessionRole || 'client';

            if (effectiveRole !== 'client') {
                setOnboardingStatus('complete');
                return;
            }

            // If the user has a therapist profile, skip client onboarding
            try {
                const { data: therapistProfile, error: therapistError } = await supabase
                    .from('therapists')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!therapistError && therapistProfile) {
                    setOnboardingStatus('complete');
                    return;
                }
            } catch (error) {
                console.warn('Therapist profile check failed:', error);
            }

            try {
                // 1. Check existing bookings
                const { getUserBookings } = await import('@/lib/bookingService');
                const bookings = await getUserBookings(user.id);

                if (bookings.length > 0) {
                    setOnboardingStatus('complete');
                    return;
                }

                // 2. Check Assessment (GAD-7)
                const assessments = await getUserAssessments(user.id);
                const hasAssessment = assessments.some(a => a.assessment_id === 'gad7');

                // 3. Check Intake Form
                const forms = await getUserSubmissions(user.id);
                const hasIntake = forms.some(f => f.form_id === 'intake-general');

                setStepsStatus({
                    assessment: hasAssessment,
                    intake: hasIntake
                });

                if (hasAssessment && hasIntake) {
                    setOnboardingStatus('complete');
                } else {
                    setOnboardingStatus('required');
                }
            } catch (error) {
                console.error('Error checking onboarding:', error);
                setOnboardingStatus('complete'); // Fail safe
            }
        }

        checkOnboarding();
    }, [user]);

    // Real-time slot state
    const [lockStatus, setLockStatus] = useState<'none' | 'locking' | 'locked' | 'failed'>('none');
    const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
    const lockRefreshInterval = useRef<NodeJS.Timeout | null>(null);
    const realtimeCleanup = useRef<(() => void) | null>(null);

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

    // Auto-select service from URL parameter and skip to step 2
    useEffect(() => {
        const serviceParam = searchParams.get('service');
        if (serviceParam && !selectedService) {
            // Validate that the service exists
            const validService = serviceTypes.find(s => s.id === serviceParam);
            if (validService) {
                setSelectedService(serviceParam);
                // Skip step 1 (service selection) and go to step 2 (questionnaire)
                setCurrentStep(2);
            }
        }
    }, [searchParams, selectedService]);

    // Load questionnaire when service is selected
    useEffect(() => {
        if (selectedService) {
            const questionnaire = getQuestionnaireForService(selectedService);
            setCurrentQuestionnaire(questionnaire);
            
            // Check if user has already completed questionnaire for this service
            if (user?.id && questionnaire) {
                hasCompletedQuestionnaire(user.id, selectedService).then(completed => {
                    setQuestionnaireCompleted(completed);
                });
            }
        } else {
            setCurrentQuestionnaire(null);
            setQuestionnaireCompleted(false);
            setQuestionnaireData(null);
        }
    }, [selectedService, user?.id]);

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

    // Skip to step 3 if therapist is pre-selected (adjusted for new step)
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

            // Get active locks from other users
            const dateStr = date.toISOString().split('T')[0];
            let activeLocks: any[] = [];
            if (user?.id) {
                activeLocks = await getActiveLocksForTherapist(therapistId, dateStr, user.id);
            }

            // Merge slot data with lock status
            const enhancedSlots = slots.map(slot => {
                const lock = activeLocks.find(l => l.slot_datetime === slot.iso);
                return {
                    ...slot,
                    isLocked: !!lock,
                    lockedBy: lock?.locked_by,
                    isBeingBooked: !!lock && lock.locked_by !== user?.id,
                    available: slot.available && (!lock || lock.locked_by === user?.id)
                };
            });

            setTimeSlots(enhancedSlots as TimeSlot[]);
        } catch (error) {
            console.error('Failed to load time slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Handle real-time slot selection with locking
    const handleTimeSelect = useCallback(async (time: string, slotIso?: string) => {
        if (!selectedTherapist || !user?.id) {
            setSelectedTime(time);
            return;
        }

        // Release previous lock if any
        if (selectedSlotIso && selectedSlotIso !== slotIso) {
            await unlockSlotInDatabase(selectedTherapist, selectedSlotIso, user.id);
            if (lockRefreshInterval.current) {
                clearInterval(lockRefreshInterval.current);
                lockRefreshInterval.current = null;
            }
        }

        setSelectedTime(time);
        setSelectedSlotIso(slotIso || null);

        if (!slotIso) return;

        // Lock the slot
        setLockStatus('locking');
        const lockResult = await lockSlotInDatabase(selectedTherapist, slotIso, user.id, 5);

        if (!lockResult.success) {
            setLockStatus('failed');
            toast({
                title: 'Slot Unavailable',
                description: lockResult.error || 'This slot is being booked by someone else.',
                variant: 'destructive'
            });
            setSelectedTime(null);
            setSelectedSlotIso(null);
            // Refresh slots to show updated availability
            if (selectedDate) {
                loadTimeSlots(selectedTherapist, selectedDate);
            }
            return;
        }

        setLockStatus('locked');

        // Set up lock refresh interval (refresh every 4 minutes to keep 5-minute lock active)
        lockRefreshInterval.current = setInterval(async () => {
            if (selectedTherapist && slotIso && user?.id) {
                await lockSlotInDatabase(selectedTherapist, slotIso, user.id, 5);
            }
        }, 4 * 60 * 1000);
    }, [selectedTherapist, user?.id, selectedSlotIso, selectedDate, toast]);

    // Cleanup locks on unmount or navigation away
    useEffect(() => {
        return () => {
            // Release lock when component unmounts
            if (selectedTherapist && user?.id && selectedSlotIso) {
                unlockSlotInDatabase(selectedTherapist, selectedSlotIso, user.id);
            }
            if (lockRefreshInterval.current) {
                clearInterval(lockRefreshInterval.current);
            }
            if (realtimeCleanup.current) {
                realtimeCleanup.current();
            }
        };
    }, [selectedTherapist, user?.id, selectedSlotIso]);

    // Set up real-time subscription when therapist and date are selected
    useEffect(() => {
        if (!selectedTherapist || !selectedDate) return;

        // Cleanup previous subscription
        if (realtimeCleanup.current) {
            realtimeCleanup.current();
        }

        const dateStr = selectedDate.toISOString().split('T')[0];

        const { cleanup } = subscribeToSlotAvailability(selectedTherapist, dateStr, {
            onAvailabilityUpdate: (update) => {
                console.log('📡 Real-time slot update:', update);

                // Refresh slots when changes occur
                if (selectedDate) {
                    loadTimeSlots(selectedTherapist, selectedDate);
                }

                // If our selected slot was booked by someone else, notify and deselect
                if (update.type === 'booked' &&
                    selectedSlotIso === update.slotDatetime &&
                    update.bookedBy !== user?.id) {
                    toast({
                        title: 'Slot No Longer Available',
                        description: 'The time slot you selected was just booked. Please choose another time.',
                        variant: 'destructive'
                    });
                    setSelectedTime(null);
                    setSelectedSlotIso(null);
                    setLockStatus('none');
                }
            },
            onError: (error) => {
                console.error('Real-time subscription error:', error);
            }
        });

        realtimeCleanup.current = cleanup;

        return () => {
            if (realtimeCleanup.current) {
                realtimeCleanup.current();
                realtimeCleanup.current = null;
            }
        };
    }, [selectedTherapist, selectedDate, selectedSlotIso, user?.id, toast]);

    // Navigation functions - updated for 6-step flow
    const goToStep = (step: number) => {
        if (step < 1 || step > 6) return;

        // Validate navigation (updated for new step order)
        if (step >= 2 && !selectedService) return;
        if (step >= 3 && !questionnaireCompleted && currentQuestionnaire) return;
        if (step >= 4 && !selectedTherapist) return;
        if (step >= 5 && !selectedDate) return;
        if (step >= 6 && !selectedTime) return;

        setCurrentStep(step);
    };

    const goNext = () => {
        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle questionnaire completion
    const handleQuestionnaireComplete = async (data: Record<string, unknown>) => {
        if (!user?.id || !selectedService || !currentQuestionnaire) return;

        setQuestionnaireData(data);
        
        // Save questionnaire submission
        const result = await saveQuestionnaireSubmission(
            user.id,
            currentQuestionnaire.id,
            selectedService,
            data
        );

        if (result.success) {
            setQuestionnaireCompleted(true);
            toast({
                title: 'Questionnaire Completed',
                description: 'Thank you for completing the intake questionnaire.',
            });
            goNext();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to save questionnaire. Please try again.',
                variant: 'destructive'
            });
        }
    };

    // Handle questionnaire skip (if allowed)
    const handleQuestionnaireSkip = () => {
        setQuestionnaireCompleted(true);
        goNext();
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

        // TEMPORARILY SKIP PAYMENT - Book directly without payment
        // For PAID services - open Razorpay payment modal
        // if (currentService.price > 0) {
        //     setSubmitting(true);

        //     openPaymentModal(
        //         {
        //             bookingId: `pending_${Date.now()}`,
        //             amount: currentService.price,
        //             currency: 'INR',
        //             customerName: user.email?.split('@')[0] || 'Customer',
        //             customerEmail: user.email || '',
        //             customerPhone: '9999999999', // Default phone to skip contact details popup
        //             serviceName: currentService.name,
        //             therapistName: currentTherapist.user.full_name,
        //         },
        //         // On Payment Success
        //         async (paymentResult: RazorpayPaymentResult) => {
        //             console.log('Payment successful:', paymentResult);
        //             try {
        //                 await completeBooking();
        //             } catch (error) {
        //                 console.error('Booking after payment failed:', error);
        //                 toast({
        //                     title: 'Booking Failed',
        //                     description: 'Payment successful but booking failed. Please contact support.',
        //                     variant: 'destructive'
        //                 });
        //             } finally {
        //                 setSubmitting(false);
        //             }
        //         },
        //         // On Payment Failure/Cancel
        //         (error: string) => {
        //             console.log('Payment failed:', error);
        //             setSubmitting(false);
        //             if (error !== 'Payment cancelled') {
        //                 toast({ title: 'Payment Failed', description: error, variant: 'destructive' });
        //             }
        //         }
        //     );
        // } else {
            // Direct booking without payment (FREE or SKIPPED payment)
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
        // }
    };

    // Filter therapists using advanced filter
    const filteredTherapists = applyTherapistFilters(therapists, therapistFilters, searchQuery);

    // Count active filters
    const activeFilterCount = 
        therapistFilters.specializations.length +
        therapistFilters.languages.length +
        therapistFilters.serviceTypes.length +
        therapistFilters.counsellingModes.length +
        therapistFilters.sessionTimes.length +
        (therapistFilters.onlineOnly ? 1 : 0) +
        (therapistFilters.nextAvailable ? 1 : 0);

    // Check if can proceed to next step (updated for 6-step flow)
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!selectedService;
            case 2: return questionnaireCompleted || !currentQuestionnaire;
            case 3: return !!selectedTherapist;
            case 4: return !!selectedDate;
            case 5: return !!selectedTime;
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

                            {/* Step 2: Service Questionnaire */}
                            {currentStep === 2 && currentQuestionnaire && (
                                <ServiceQuestionnaire
                                    questionnaire={currentQuestionnaire}
                                    onComplete={handleQuestionnaireComplete}
                                    onSkip={handleQuestionnaireSkip}
                                    onBack={goBack}
                                />
                            )}

                            {/* Step 2: Skip if no questionnaire or already completed */}
                            {currentStep === 2 && (!currentQuestionnaire || questionnaireCompleted) && (
                                <div className="max-w-2xl mx-auto text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                        {questionnaireCompleted ? 'Questionnaire Completed' : 'No Questionnaire Required'}
                                    </h2>
                                    <p className="text-gray-500 mb-8">
                                        {questionnaireCompleted 
                                            ? 'Thank you for completing the intake questionnaire. Let\'s proceed to select your therapist.'
                                            : 'This service doesn\'t require an intake questionnaire. Let\'s proceed to select your therapist.'
                                        }
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button variant="outline" onClick={goBack} className="px-6">
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button onClick={goNext} className="btn-icy px-8">
                                            Continue to Therapist Selection
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Select Therapist */}
                            {currentStep === 3 && (
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
                                            className={`px-4 rounded-xl border-2 ${filterOpen || activeFilterCount > 0 ? 'border-cyan-500 text-cyan-600' : ''}`}
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                            {activeFilterCount > 0 && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                                                    {activeFilterCount}
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Advanced Filter Panel */}
                                    {filterOpen && (
                                        <div className="mb-6">
                                            <TherapistFilter
                                                filters={therapistFilters}
                                                onFiltersChange={setTherapistFilters}
                                                onClose={() => setFilterOpen(false)}
                                                selectedServiceId={selectedService}
                                            />
                                        </div>
                                    )}

                                    {/* Active Filters Display */}
                                    {activeFilterCount > 0 && !filterOpen && (
                                        <div className="flex flex-wrap items-center gap-2 mb-6">
                                            <span className="text-sm text-gray-500">Active filters:</span>
                                            {therapistFilters.specializations.map(spec => (
                                                <span
                                                    key={spec}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full"
                                                >
                                                    {spec}
                                                    <button
                                                        onClick={() => setTherapistFilters({
                                                            ...therapistFilters,
                                                            specializations: therapistFilters.specializations.filter(s => s !== spec)
                                                        })}
                                                        className="hover:text-cyan-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {therapistFilters.languages.map(lang => (
                                                <span
                                                    key={lang}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                                >
                                                    {lang}
                                                    <button
                                                        onClick={() => setTherapistFilters({
                                                            ...therapistFilters,
                                                            languages: therapistFilters.languages.filter(l => l !== lang)
                                                        })}
                                                        className="hover:text-blue-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {therapistFilters.counsellingModes.map(mode => (
                                                <span
                                                    key={mode}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                                >
                                                    {mode}
                                                    <button
                                                        onClick={() => setTherapistFilters({
                                                            ...therapistFilters,
                                                            counsellingModes: therapistFilters.counsellingModes.filter(m => m !== mode)
                                                        })}
                                                        className="hover:text-purple-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {therapistFilters.onlineOnly && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                    Online Only
                                                    <button
                                                        onClick={() => setTherapistFilters({ ...therapistFilters, onlineOnly: false })}
                                                        className="hover:text-green-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            )}
                                            <button
                                                onClick={() => setTherapistFilters(defaultFilters)}
                                                className="text-xs text-gray-500 hover:text-cyan-600 underline"
                                            >
                                                Clear all
                                            </button>
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
                                                    setTherapistFilters(defaultFilters);
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

                            {/* Step 4: Select Date */}
                            {currentStep === 4 && currentTherapist && (
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
                                        onDateSelect={async (date) => {
                                            // Release any existing lock
                                            if (selectedTherapist && user?.id && selectedSlotIso) {
                                                await unlockSlotInDatabase(selectedTherapist, selectedSlotIso, user.id);
                                            }
                                            if (lockRefreshInterval.current) {
                                                clearInterval(lockRefreshInterval.current);
                                                lockRefreshInterval.current = null;
                                            }
                                            setSelectedDate(date);
                                            setSelectedTime(null);
                                            setSelectedSlotIso(null);
                                            setLockStatus('none');
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

                            {/* Step 5: Select Time */}
                            {currentStep === 5 && currentTherapist && selectedDate && (
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
                                        onTimeSelect={handleTimeSelect}
                                        loading={loadingSlots}
                                        lockStatus={lockStatus}
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

                            {/* Step 6: Confirm */}
                            {currentStep === 6 && currentTherapist && currentService && selectedDate && selectedTime && (
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
