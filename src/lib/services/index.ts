/**
 * Services Index - Export all service modules
 */

// Therapist Service
export {
    fetchTherapists,
    fetchTherapistById,
    fetchTherapistByProfileId,
    getTherapistAvailability,
    getBlockedTimes,
    getAvailableTimeSlots,
    getAvailableDates,
    updateAvailability,
    blockTime,
    getAllSpecialties,
    getAllLanguages,
    type TherapistProfile,
    type TherapistAvailability,
    type BlockedTime,
    type AvailableSlot
} from './therapistService';

// WebRTC Service
export {
    WebRTCService,
    createVideoSession,
    getVideoSession,
    getVideoSessionByRoom,
    type RTCConfig,
    type SignalMessage,
    type VideoSession
} from './webrtcService';

// Payment Service
export {
    fetchSessionPackages,
    getPackageById,
    calculatePrice,
    formatPrice,
    createPaymentIntent,
    confirmPayment,
    getPaymentByBooking,
    getClientPayments,
    processRefund,
    generateInvoice,
    type SessionPackage,
    type PaymentRecord,
    type PricingCalculation,
    type Invoice
} from './paymentService';

// Assessment Service
export {
    fetchAssessments,
    getAssessmentBySlug,
    calculateScore,
    submitAssessment,
    getUserAssessments,
    getLatestResult,
    generatePDFReport,
    getSeverityColor,
    type Assessment,
    type AssessmentQuestion,
    type AssessmentSubmission,
    type AssessmentResult
} from './assessmentService';

// Form Service
export {
    fetchForms,
    getFormBySlug,
    submitForm,
    getUserSubmissions,
    checkRequiredForms,
    validateFormData,
    type FormSchema,
    type FormField,
    type FormSection,
    type FormSubmission
} from './formService';

// Default exports as namespaced objects
import therapistService from './therapistService';
import WebRTCService from './webrtcService';
import paymentService from './paymentService';
import assessmentService from './assessmentService';
import formService from './formService';

export {
    therapistService,
    WebRTCService,
    paymentService,
    assessmentService,
    formService
};
