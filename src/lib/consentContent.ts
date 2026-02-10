/**
 * Consent Content Configuration
 * Contains all informed consent text and section definitions
 */

import { SERVICE_TYPES, CONSENT_VERSION } from './services/consentService';

// ==========================================
// Types
// ==========================================

export interface ConsentSection {
  id: string;
  title: string;
  content: string;
  isUniversal?: boolean;
  applicableServices?: string[];
}

// ==========================================
// Constants
// ==========================================

export { CONSENT_VERSION };

// ==========================================
// Intro Sections (1-3)
// ==========================================

export const INTRO_SECTIONS: ConsentSection[] = [
  {
    id: 'introduction',
    title: '1. INTRODUCTION',
    content: `The3tree is a mental health and wellbeing platform that connects users with qualified professionals, including psychiatrists, psychologists, counsellors, yoga instructors, and nutrition professionals.
Services are provided independently by professionals acting within their respective education, training, and scope of practice, as applicable under Indian law and ethical guidelines.`,
    isUniversal: true,
  },
  {
    id: 'emergency-disclaimer',
    title: '2. EMERGENCY DISCLAIMER',
    content: `I understand that The3tree is not an emergency or crisis service.
In case of immediate risk to myself or others, I agree to contact:
    • Local emergency services
    • The nearest hospital
    • Crisis helplines available in my location`,
    isUniversal: true,
  },
  {
    id: 'voluntary-participation',
    title: '3. VOLUNTARY PARTICIPATION',
    content: `I understand that:
    • Participation in all services is voluntary
    • I may ask questions at any time
    • I may discontinue services at my discretion
I acknowledge that no guarantees are made regarding outcomes or results.`,
    isUniversal: true,
  },
];

// ==========================================
// Outro Sections (10-16)
// ==========================================

export const OUTRO_SECTIONS: ConsentSection[] = [
  {
    id: 'online-services',
    title: '10. ONLINE / TELE-BASED SERVICES',
    content: `I understand that services may be delivered via:
    • Video calls
    • Audio calls
    • Online platforms
I acknowledge that:
    • Technical disruptions may occur
    • Absolute confidentiality over digital platforms cannot be guaranteed despite reasonable safeguards
    • Online services may have limitations compared to in-person care
    • Physical emergency intervention is not possible during online sessions`,
    isUniversal: true,
  },
  {
    id: 'professional-credentials',
    title: '11. PROFESSIONAL CREDENTIALS & SCOPE OF PRACTICE',
    content: `I understand that:
    • Psychiatrists are registered medical practitioners
    • Psychologists and counsellors hold relevant postgraduate qualifications and practise within their professional scope
    • Registration with statutory bodies applies only where mandated by Indian law
    • Yoga instructors and nutrition professionals practise as wellness professionals and are not medical doctors
Professional titles are used in accordance with Indian ethical and legal standards.`,
    isUniversal: true,
  },
  {
    id: 'client-location',
    title: '12. CLIENT LOCATION & INTERNATIONAL SERVICES',
    content: `If I am accessing services online:
    • I confirm my current location at the time of the session
    • I understand services are provided from India
    • I confirm I am legally permitted to receive tele-based mental health or wellness services in my country of residence`,
    isUniversal: true,
  },
  {
    id: 'data-privacy',
    title: '13. DATA COLLECTION, STORAGE & PRIVACY',
    content: `I consent to the collection, storage, and use of my personal data, including:
    • Contact details
    • Session notes
    • Assessments and related records
I understand that:
    • Data may be stored electronically on secure systems
    • Access is limited to authorised professionals
    • If I am located outside India, my data may be processed across borders`,
    isUniversal: true,
  },
  {
    id: 'fees-cancellations',
    title: '14. FEES, CANCELLATIONS & REFUNDS',
    content: `I understand that:
    • Fees are communicated prior to booking
    • Cancellations and rescheduling are subject to stated policy
    • No-shows may be charged
    • Refunds, if any, are governed by applicable terms`,
    isUniversal: true,
  },
  {
    id: 'right-to-withdraw',
    title: '15. RIGHT TO WITHDRAW & TERMINATION',
    content: `I understand that:
    • Participation in services is voluntary
    • I may discontinue services at any time
    • Services may be terminated or referred elsewhere if deemed clinically inappropriate or unsafe`,
    isUniversal: true,
  },
  {
    id: 'jurisdiction',
    title: '16. JURISDICTION & GOVERNING LAW',
    content: `This informed consent shall be governed by the laws of India.
Any disputes shall be subject to the jurisdiction of Indian courts.`,
    isUniversal: true,
  },
];

// ==========================================
// Service-Specific Sections (5-9)
// ==========================================

export const SERVICE_SPECIFIC_SECTIONS: ConsentSection[] = [
  {
    id: 'psychiatric-consultation',
    title: '5. CONSENT FOR PSYCHIATRIC SERVICES',
    content: `I understand that psychiatric services:
    • Involve medical and psychological assessment
    • May include diagnosis and prescription of medication
    • Are provided only by a qualified Psychiatrist (Registered Medical Practitioner)
I acknowledge that:
    • Psychiatric medications may have side effects
    • Response to medication varies between individuals
    • Follow-up consultations may be required
I understand that telepsychiatry services are provided in accordance with applicable Indian telemedicine and professional guidelines, and prescriptions will be issued only where legally permissible.`,
    applicableServices: [SERVICE_TYPES.PSYCHIATRIC],
  },
  {
    id: 'individual-therapy',
    title: '6. CONSENT FOR INDIVIDUAL PSYCHOLOGICAL THERAPY / COUNSELLING',
    content: `I understand that individual therapy and counselling:
    • Involve discussion of personal, emotional, behavioural, or psychological concerns
    • May bring up uncomfortable emotions or memories
    • Are collaborative processes with no guaranteed outcomes
Confidentiality
Information shared during sessions will remain confidential, except where disclosure is required due to:
    • Risk of serious harm to self or others
    • Suspected abuse or neglect of a minor or vulnerable person
    • Legal or court-mandated obligations
Therapy records are maintained securely and accessed only as permitted by law.`,
    applicableServices: [SERVICE_TYPES.INDIVIDUAL_THERAPY],
  },
  {
    id: 'group-therapy',
    title: '7. CONSENT FOR GROUP THERAPY',
    content: `I understand that group therapy involves psychological sessions with multiple participants present simultaneously, facilitated by a mental health professional.
I acknowledge that:
    • Group therapy involves shared space and shared discussions
    • While confidentiality is emphasized, complete confidentiality cannot be guaranteed, as other participants are involved
    • I agree to respect and maintain the confidentiality of other group members
    • Group discussions may involve hearing experiences that I may find emotionally challenging
I understand that:
    • Participation in group therapy is voluntary
    • I may withdraw from group sessions if I feel uncomfortable or unsafe
☐ I consent to participate in group therapy sessions under these conditions`,
    applicableServices: [SERVICE_TYPES.GROUP_THERAPY],
  },
  {
    id: 'yoga-wellness',
    title: '8. CONSENT FOR YOGA / MIND–BODY WELLNESS SERVICES',
    content: `I understand that yoga and mind–body services:
    • Are provided for general wellbeing, relaxation, and stress management
    • Are not a substitute for medical or psychological treatment
I confirm that:
    • I have disclosed relevant medical conditions or physical limitations
    • I have sought medical advice where necessary before participation
    • I will practise within my comfort and safety limits
    • I will stop immediately if I experience pain, discomfort, or distress`,
    applicableServices: [SERVICE_TYPES.YOGA_WELLNESS],
  },
  {
    id: 'nutrition-guidance',
    title: '9. CONSENT FOR NUTRITION & LIFESTYLE GUIDANCE',
    content: `I understand that nutrition services:
    • Provide general dietary and lifestyle guidance
    • Do not constitute medical diagnosis or treatment
I acknowledge that:
    • I am responsible for sharing accurate health information
    • Dietary changes are undertaken at my own discretion
    • I have consulted a medical professional where required`,
    applicableServices: [SERVICE_TYPES.NUTRITION],
  },
];

// ==========================================
// Legacy Universal Sections (For backward compatibility if needed)
// ==========================================

export const UNIVERSAL_SECTIONS = [...INTRO_SECTIONS, ...OUTRO_SECTIONS];

// ==========================================
// Helper Functions
// ==========================================

/**
 * Get all sections relevant to selected services
 */
export function getRelevantSections(selectedServices: string[]): ConsentSection[] {
  const relevantServiceSections = SERVICE_SPECIFIC_SECTIONS.filter((section) =>
    section.applicableServices?.some((service) => selectedServices.includes(service))
  );

  return [...UNIVERSAL_SECTIONS, ...relevantServiceSections];
}

/**
 * Get service-specific sections only
 */
export function getServiceSpecificSections(selectedServices: string[]): ConsentSection[] {
  return SERVICE_SPECIFIC_SECTIONS.filter((section) =>
    section.applicableServices?.some((service) => selectedServices.includes(service))
  );
}

/**
 * Get service display name
 */
export function getServiceDisplayName(serviceId: string): string {
  const names: Record<string, string> = {
    [SERVICE_TYPES.PSYCHIATRIC]: 'Psychiatric Consultation',
    [SERVICE_TYPES.INDIVIDUAL_THERAPY]: 'Individual Psychological Therapy / Counselling',
    [SERVICE_TYPES.GROUP_THERAPY]: 'Group Therapy',
    [SERVICE_TYPES.YOGA_WELLNESS]: 'Yoga / Mind–Body Wellness Services',
    [SERVICE_TYPES.NUTRITION]: 'Nutrition & Lifestyle Guidance',
  };
  return names[serviceId] || serviceId;
}

/**
 * Get all available services
 */
export function getAllServices(): Array<{ id: string; name: string }> {
  return [
    { id: SERVICE_TYPES.PSYCHIATRIC, name: 'Psychiatric Consultation' },
    { id: SERVICE_TYPES.INDIVIDUAL_THERAPY, name: 'Individual Psychological Therapy / Counselling' },
    { id: SERVICE_TYPES.GROUP_THERAPY, name: 'Group Therapy' },
    { id: SERVICE_TYPES.YOGA_WELLNESS, name: 'Yoga / Mind–Body Wellness Services' },
    { id: SERVICE_TYPES.NUTRITION, name: 'Nutrition & Lifestyle Guidance' },
  ];
}

export default {
  INTRO_SECTIONS,
  OUTRO_SECTIONS,
  UNIVERSAL_SECTIONS,
  SERVICE_SPECIFIC_SECTIONS,
  CONSENT_VERSION,
  getRelevantSections,
  getServiceSpecificSections,
  getServiceDisplayName,
  getAllServices,
};
