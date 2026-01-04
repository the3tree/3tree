/**
 * Payment Service - Stripe Integration
 * Handles payments for therapy sessions and packages
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
}

export interface SessionPackage {
    id: string;
    name: string;
    session_count: number;
    discount_percent: number;
    description: string;
    is_active: boolean;
}

export interface PaymentRecord {
    id: string;
    booking_id: string;
    client_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    provider: string;
    provider_payment_id?: string;
    created_at: string;
}

export interface PricingCalculation {
    baseRate: number;
    sessionCount: number;
    discountPercent: number;
    discountAmount: number;
    subtotal: number;
    total: number;
    currency: string;
}

// ==========================================
// Mock Data
// ==========================================

const mockPackages: SessionPackage[] = [
    {
        id: 'pkg_1',
        name: 'Single Session',
        session_count: 1,
        discount_percent: 0,
        description: 'Try a session with no commitment',
        is_active: true
    },
    {
        id: 'pkg_3',
        name: '3-Session Package',
        session_count: 3,
        discount_percent: 5,
        description: 'Begin your journey with a short series',
        is_active: true
    },
    {
        id: 'pkg_6',
        name: '6-Session Package',
        session_count: 6,
        discount_percent: 10,
        description: 'Deeper exploration and progress',
        is_active: true
    },
    {
        id: 'pkg_10',
        name: '10-Session Package',
        session_count: 10,
        discount_percent: 15,
        description: 'Comprehensive therapeutic journey',
        is_active: true
    }
];

// ==========================================
// Package Functions
// ==========================================

/**
 * Fetch all active session packages
 */
export async function fetchSessionPackages(): Promise<SessionPackage[]> {
    try {
        const { data, error } = await supabase
            .from('session_packages')
            .select('*')
            .eq('is_active', true)
            .order('session_count');

        if (error) throw error;
        if (data && data.length > 0) {
            return data as SessionPackage[];
        }
    } catch (error) {
        console.log('Using mock package data');
    }

    return mockPackages;
}

/**
 * Get package by ID
 */
export async function getPackageById(packageId: string): Promise<SessionPackage | null> {
    try {
        const { data, error } = await supabase
            .from('session_packages')
            .select('*')
            .eq('id', packageId)
            .single();

        if (error) throw error;
        return data as SessionPackage;
    } catch (error) {
        console.log('Using mock package data');
    }

    return mockPackages.find(p => p.id === packageId) || null;
}

// ==========================================
// Pricing Calculations
// ==========================================

/**
 * Calculate total price for a booking
 */
export function calculatePrice(
    baseRate: number,
    sessionPackage: SessionPackage,
    currency: string = 'USD'
): PricingCalculation {
    const subtotal = baseRate * sessionPackage.session_count;
    const discountAmount = subtotal * (sessionPackage.discount_percent / 100);
    const total = subtotal - discountAmount;

    return {
        baseRate,
        sessionCount: sessionPackage.session_count,
        discountPercent: sessionPackage.discount_percent,
        discountAmount: Math.round(discountAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        currency
    };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

// ==========================================
// Payment Processing
// ==========================================

/**
 * Create a payment intent (Stripe)
 * In production, this would call a Supabase Edge Function
 */
export async function createPaymentIntent(
    amount: number,
    bookingId: string,
    clientId: string,
    currency: string = 'usd'
): Promise<{ paymentIntent: PaymentIntent | null; error: string | null }> {
    try {
        // In production, call Edge Function
        // const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        //     body: { amount, bookingId, clientId, currency }
        // });

        // For development, return mock payment intent
        const mockIntent: PaymentIntent = {
            id: `pi_${Date.now()}`,
            client_secret: `pi_${Date.now()}_secret_mock`,
            amount: Math.round(amount * 100), // Stripe uses cents
            currency,
            status: 'requires_payment_method'
        };

        return { paymentIntent: mockIntent, error: null };
    } catch (error) {
        return {
            paymentIntent: null,
            error: error instanceof Error ? error.message : 'Failed to create payment intent'
        };
    }
}

/**
 * Confirm payment and record in database
 */
export async function confirmPayment(
    bookingId: string,
    clientId: string,
    paymentIntentId: string,
    amount: number,
    currency: string = 'USD'
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('payments')
            .insert({
                booking_id: bookingId,
                client_id: clientId,
                amount,
                currency,
                status: 'paid',
                provider: 'stripe',
                provider_payment_id: paymentIntentId
            });

        if (error) throw error;

        // Update booking status
        await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);

        return { success: true, error: null };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to confirm payment'
        };
    }
}

/**
 * Get payment by booking ID
 */
export async function getPaymentByBooking(bookingId: string): Promise<PaymentRecord | null> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', bookingId)
            .single();

        if (error) throw error;
        return data as PaymentRecord;
    } catch (error) {
        return null;
    }
}

/**
 * Get all payments for a client
 */
export async function getClientPayments(clientId: string): Promise<PaymentRecord[]> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as PaymentRecord[];
    } catch (error) {
        return [];
    }
}

/**
 * Process refund
 */
export async function processRefund(
    paymentId: string,
    reason?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // In production, call Stripe API via Edge Function
        // const { data, error } = await supabase.functions.invoke('process-refund', {
        //     body: { paymentId, reason }
        // });

        // Update payment status
        const { error } = await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('id', paymentId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process refund'
        };
    }
}

// ==========================================
// Stripe Webhook Handling (Edge Function)
// ==========================================

/**
 * Handle Stripe webhook events
 * This would be implemented as a Supabase Edge Function
 * 
 * Example Edge Function code:
 * 
 * import Stripe from 'stripe';
 * import { createClient } from '@supabase/supabase-js';
 * 
 * const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
 * const supabase = createClient(
 *     Deno.env.get('SUPABASE_URL')!,
 *     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 * );
 * 
 * Deno.serve(async (req) => {
 *     const signature = req.headers.get('stripe-signature');
 *     const body = await req.text();
 *     
 *     try {
 *         const event = stripe.webhooks.constructEvent(
 *             body,
 *             signature!,
 *             Deno.env.get('STRIPE_WEBHOOK_SECRET')!
 *         );
 *         
 *         switch (event.type) {
 *             case 'payment_intent.succeeded':
 *                 // Update payment status
 *                 break;
 *             case 'payment_intent.payment_failed':
 *                 // Handle failure
 *                 break;
 *         }
 *         
 *         return new Response(JSON.stringify({ received: true }), { status: 200 });
 *     } catch (error) {
 *         return new Response(JSON.stringify({ error: error.message }), { status: 400 });
 *     }
 * });
 */

// ==========================================
// Invoice Generation
// ==========================================

export interface Invoice {
    id: string;
    client_name: string;
    client_email: string;
    therapist_name: string;
    service_name: string;
    session_count: number;
    date: string;
    amount: number;
    discount: number;
    total: number;
    status: string;
    paid_at?: string;
}

/**
 * Generate invoice data
 */
export function generateInvoice(
    bookingId: string,
    clientName: string,
    clientEmail: string,
    therapistName: string,
    serviceName: string,
    pricing: PricingCalculation,
    paidAt?: string
): Invoice {
    return {
        id: `INV-${bookingId.slice(-8).toUpperCase()}`,
        client_name: clientName,
        client_email: clientEmail,
        therapist_name: therapistName,
        service_name: serviceName,
        session_count: pricing.sessionCount,
        date: new Date().toISOString(),
        amount: pricing.subtotal,
        discount: pricing.discountAmount,
        total: pricing.total,
        status: paidAt ? 'paid' : 'pending',
        paid_at: paidAt
    };
}

export default {
    fetchSessionPackages,
    getPackageById,
    calculatePrice,
    formatPrice,
    createPaymentIntent,
    confirmPayment,
    getPaymentByBooking,
    getClientPayments,
    processRefund,
    generateInvoice
};
