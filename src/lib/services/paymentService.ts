// Stripe Payment Integration Service
// Handles payment processing for therapy sessions

import { supabase } from '@/lib/supabase';

// Types
export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
}

export interface CheckoutSession {
    id: string;
    url: string;
}

export interface PaymentDetails {
    booking_id: string;
    amount: number;
    currency?: string;
    description?: string;
    customer_email?: string;
    customer_name?: string;
    therapist_name?: string;
    session_date?: string;
}

// Create a checkout session for booking payment
export async function createCheckoutSession(details: PaymentDetails): Promise<{
    data: CheckoutSession | null;
    error: string | null;
}> {
    try {
        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: {
                booking_id: details.booking_id,
                amount: details.amount,
                currency: details.currency || 'inr',
                description: details.description || 'Therapy Session Booking',
                customer_email: details.customer_email,
                customer_name: details.customer_name,
                therapist_name: details.therapist_name,
                session_date: details.session_date,
                success_url: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${window.location.origin}/booking?canceled=true`,
            },
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Checkout session error:', error);
        return { data: null, error: error.message };
    }
}

// Create a payment intent for client-side confirmation
export async function createPaymentIntent(details: PaymentDetails): Promise<{
    data: PaymentIntent | null;
    error: string | null;
}> {
    try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            body: {
                booking_id: details.booking_id,
                amount: Math.round(details.amount * 100), // Convert to smallest currency unit
                currency: details.currency || 'inr',
                description: details.description || 'Therapy Session Payment',
            },
        });

        if (error) throw error;

        return {
            data: {
                id: data.id,
                client_secret: data.client_secret,
                amount: data.amount / 100,
                currency: data.currency,
                status: data.status,
            },
            error: null,
        };
    } catch (error: any) {
        console.error('Payment intent error:', error);
        return { data: null, error: error.message };
    }
}

// Confirm payment and update booking status
export async function confirmPayment(
    bookingId: string,
    paymentIntentId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({
                payment_status: 'completed',
                payment_id: paymentIntentId,
                status: 'confirmed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Create notification for therapist
        const { data: booking } = await supabase
            .from('bookings')
            .select('therapist_id')
            .eq('id', bookingId)
            .single();

        if (booking?.therapist_id) {
            const { data: therapist } = await supabase
                .from('therapists')
                .select('user_id')
                .eq('id', booking.therapist_id)
                .single();

            if (therapist?.user_id) {
                await supabase.from('notifications').insert({
                    user_id: therapist.user_id,
                    type: 'booking_confirmed',
                    title: 'New Booking Confirmed',
                    message: 'A payment has been received for a new booking',
                    data: { booking_id: bookingId },
                });
            }
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Payment confirmation error:', error);
        return { success: false, error: error.message };
    }
}

// Process refund for canceled booking
export async function processRefund(
    bookingId: string,
    amount?: number,
    reason?: string
): Promise<{ success: boolean; refund_id?: string; error: string | null }> {
    try {
        const { data, error } = await supabase.functions.invoke('process-refund', {
            body: {
                booking_id: bookingId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason: reason || 'Booking canceled',
            },
        });

        if (error) throw error;

        // Update booking status
        await supabase
            .from('bookings')
            .update({
                payment_status: amount ? 'partially_refunded' : 'refunded',
                updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        return { success: true, refund_id: data.refund_id, error: null };
    } catch (error: any) {
        console.error('Refund error:', error);
        return { success: false, error: error.message };
    }
}

// Get payment history for a user
export async function getPaymentHistory(userId: string): Promise<{
    data: any[];
    error: string | null;
}> {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, amount, payment_status, payment_id, created_at, scheduled_at, service_type,
                therapist:therapists(user:users(full_name))
            `)
            .eq('client_id', userId)
            .in('payment_status', ['completed', 'refunded', 'partially_refunded'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            data: (data || []).map((p: any) => ({
                id: p.id,
                amount: p.amount,
                status: p.payment_status,
                payment_id: p.payment_id,
                date: p.created_at,
                session_date: p.scheduled_at,
                service: p.service_type,
                therapist: p.therapist?.user?.full_name || 'Therapist',
            })),
            error: null,
        };
    } catch (error: any) {
        console.error('Payment history error:', error);
        return { data: [], error: error.message };
    }
}

// Calculate session price
export function calculateSessionPrice(
    baseRate: number,
    sessionType: string,
    durationMinutes: number = 50
): number {
    const multipliers: Record<string, number> = {
        individual: 1,
        couple: 1.5,
        family: 2,
        group: 0.6,
    };

    const durationMultiplier = durationMinutes / 50;
    const typeMultiplier = multipliers[sessionType] || 1;

    return Math.round(baseRate * typeMultiplier * durationMultiplier);
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default {
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    processRefund,
    getPaymentHistory,
    calculateSessionPrice,
    formatCurrency,
};
