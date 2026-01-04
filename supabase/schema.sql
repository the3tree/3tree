-- ==========================================
-- 3-3.COM COUNSELING PLATFORM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role AS ENUM ('client', 'therapist', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE session_mode AS ENUM ('video', 'audio', 'chat', 'in_person');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- ==========================================
-- PROFILES
-- ==========================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'client',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- THERAPISTS
-- ==========================================

CREATE TABLE public.therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  credentials TEXT[],
  bio TEXT,
  short_bio TEXT,
  specialties TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  years_experience INTEGER,
  session_rate_individual DECIMAL(10,2) DEFAULT 75.00,
  session_rate_couple DECIMAL(10,2) DEFAULT 100.00,
  session_rate_family DECIMAL(10,2) DEFAULT 120.00,
  accepts_new_clients BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SERVICE CATEGORIES
-- ==========================================

CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Default service categories
INSERT INTO public.service_categories (name, slug, description, sort_order) VALUES
  ('Individual Therapy', 'individual', 'One-on-one sessions tailored to your personal journey', 1),
  ('Couple Therapy', 'couple', 'Strengthen your relationship through guided understanding', 2),
  ('Family Counseling', 'family', 'Navigate family dynamics and build stronger bonds', 3),
  ('Group Sessions', 'group', 'Connect with others facing similar challenges', 4),
  ('Child & Teen', 'youth', 'Age-appropriate support for young minds', 5);

-- ==========================================
-- SESSION PACKAGES
-- ==========================================

CREATE TABLE public.session_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  session_count INTEGER NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Default packages
INSERT INTO public.session_packages (name, session_count, discount_percent, description) VALUES
  ('Single Session', 1, 0, 'Try a session with no commitment'),
  ('3-Session Package', 3, 5, 'Begin your journey with a short series'),
  ('6-Session Package', 6, 10, 'Deeper exploration and progress'),
  ('10-Session Package', 10, 15, 'Comprehensive therapeutic journey');

-- ==========================================
-- AVAILABILITY
-- ==========================================

CREATE TABLE public.therapist_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(therapist_id, day_of_week, start_time)
);

CREATE TABLE public.therapist_blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT
);

-- ==========================================
-- BOOKINGS
-- ==========================================

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id),
  therapist_id UUID REFERENCES public.therapists(id),
  service_category_id UUID REFERENCES public.service_categories(id),
  package_id UUID REFERENCES public.session_packages(id),
  session_number INTEGER DEFAULT 1,
  total_sessions INTEGER DEFAULT 1,
  session_mode session_mode DEFAULT 'video',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status booking_status DEFAULT 'pending',
  meeting_url TEXT,
  client_timezone TEXT,
  notes_client TEXT,
  notes_therapist TEXT,
  intake_form_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id),
  client_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  provider TEXT,
  provider_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ASSESSMENTS
-- ==========================================

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  scoring_logic JSONB,
  question_count INTEGER,
  estimated_minutes INTEGER,
  is_clinical BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES public.assessments(id),
  user_id UUID REFERENCES public.profiles(id),
  answers JSONB NOT NULL,
  score INTEGER,
  severity TEXT,
  interpretation TEXT,
  recommendations TEXT[],
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FORMS
-- ==========================================

CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT,
  schema JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES public.forms(id),
  user_id UUID REFERENCES public.profiles(id),
  booking_id UUID REFERENCES public.bookings(id),
  data JSONB NOT NULL,
  version INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONTENT
-- ==========================================

CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES public.therapists(id),
  category TEXT,
  tags TEXT[],
  read_time_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initials TEXT NOT NULL,
  content TEXT NOT NULL,
  service_type TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT,
  excerpt TEXT,
  content TEXT,
  file_url TEXT,
  cover_image TEXT,
  category TEXT,
  download_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  letter CHAR(1),
  description TEXT,
  content TEXT,
  is_published BOOLEAN DEFAULT false
);

-- ==========================================
-- MESSAGING
-- ==========================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id),
  client_id UUID REFERENCES public.profiles(id),
  therapist_id UUID REFERENCES public.therapists(id),
  last_message_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- E-COMMERCE
-- ==========================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  type TEXT,
  image_url TEXT,
  external_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_therapists_active ON public.therapists(is_active, is_verified);
CREATE INDEX idx_therapists_specialties ON public.therapists USING GIN(specialties);
CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_therapist ON public.bookings(therapist_id);
CREATE INDEX idx_bookings_scheduled ON public.bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);
CREATE INDEX idx_blogs_published ON public.blogs(is_published, published_at DESC);
CREATE INDEX idx_resources_type ON public.resources(type, is_published);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Therapists (public read for verified)
CREATE POLICY "Public can view verified therapists" ON public.therapists
  FOR SELECT USING (is_active = true AND is_verified = true);

CREATE POLICY "Therapists can update own profile" ON public.therapists
  FOR UPDATE USING (profile_id = auth.uid());

-- Bookings
CREATE POLICY "Clients view own bookings" ON public.bookings
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Therapists view assigned bookings" ON public.bookings
  FOR SELECT USING (
    therapist_id IN (SELECT id FROM public.therapists WHERE profile_id = auth.uid())
  );

CREATE POLICY "Clients can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own bookings" ON public.bookings
  FOR UPDATE USING (client_id = auth.uid());

-- Conversations & Messages
CREATE POLICY "Participants view conversations" ON public.conversations
  FOR SELECT USING (
    client_id = auth.uid() OR
    therapist_id IN (SELECT id FROM public.therapists WHERE profile_id = auth.uid())
  );

CREATE POLICY "Participants view messages" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE client_id = auth.uid()
         OR therapist_id IN (SELECT id FROM public.therapists WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Participants send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Assessment Submissions
CREATE POLICY "Users view own assessments" ON public.assessment_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create own assessments" ON public.assessment_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Form Submissions
CREATE POLICY "Users view own forms" ON public.form_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users submit forms" ON public.form_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Public read policies for content
CREATE POLICY "Public reads services" ON public.service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public reads packages" ON public.session_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public reads blogs" ON public.blogs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public reads testimonials" ON public.testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public reads resources" ON public.resources
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public reads products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public reads assessments" ON public.assessments
  FOR SELECT USING (is_active = true);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
