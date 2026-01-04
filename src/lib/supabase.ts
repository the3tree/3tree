// Supabase Configuration
// Replace these with your actual Supabase project credentials
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'patient' | 'therapist' | 'admin' | 'super_admin';
  phone?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Therapist {
  id: string;
  user_id: string;
  specialties: string[];
  credentials: string;
  bio: string;
  hourly_rate: number;
  availability: Record<string, string[]>;
  is_approved: boolean;
  rating: number;
  total_sessions: number;
}

export interface Booking {
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
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
