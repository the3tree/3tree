import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Home from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Team from "./pages/Team";
import FAQs from "./pages/FAQs";
import ForClients from "./pages/ForClients";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Specialities from "./pages/Specialities";
import JoinTeam from "./pages/JoinTeam";
import Assessments from "./pages/Assessments";
import DownloadableGuides from "./pages/DownloadableGuides";
import AssessmentResults from "./pages/AssessmentResults";
import PHQ9Questionnaire from "./pages/PHQ9Questionnaire";
import GAD7Questionnaire from "./pages/GAD7Questionnaire";
import PSSQuestionnaire from "./pages/PSSQuestionnaire";
import PTSDQuestionnaire from "./pages/PTSDQuestionnaire";
import DASTQuestionnaire from "./pages/DASTQuestionnaire";
import SCOFFQuestionnaire from "./pages/SCOFFQuestionnaire";
import BFIQuestionnaire from "./pages/BFIQuestionnaire";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import OurStory from "./pages/OurStory";
import CounsellingTypes from "./pages/CounsellingTypes";
import CounsellingModes from "./pages/CounsellingModes";
import SupervisionTherapists from "./pages/SupervisionTherapists";
import SupportBusinesses from "./pages/SupportBusinesses";
import SupportSchools from "./pages/SupportSchools";
import SupportWorkshops from "./pages/SupportWorkshops";

// Dashboard Pages
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import TherapistDashboard from "./pages/dashboard/TherapistDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import DashboardRouter from "./pages/DashboardRouter";

// Booking
import BookingPage from "./pages/BookingPage";

// Blogs
import BlogsPage from "./pages/BlogsPage";

// Video Call
import VideoCallRoom from "./pages/VideoCallRoom";

// Messages
import MessagesPage from "./pages/MessagesPage";

// New Pages
import EBooks from "./pages/EBooks";
import Shop from "./pages/Shop";
import Stories from "./pages/Stories";
import IntakeForm from "./pages/IntakeForm";
import AssessmentTake from "./pages/AssessmentTake";
import TherapistProfile from "./pages/TherapistProfile";
import AuthCallback from "./pages/AuthCallback";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SessionNotes from "./pages/SessionNotes";
import MyPatients from "./pages/MyPatients";
import BookingManagement from "./pages/BookingManagement";
import FindTherapist from "./pages/FindTherapist";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessment-results" element={<AssessmentResults />} />
                <Route path="/phq-9-questionnaire" element={<PHQ9Questionnaire />} />
                <Route path="/gad-7-questionnaire" element={<GAD7Questionnaire />} />
                <Route path="/pss-questionnaire" element={<PSSQuestionnaire />} />
                <Route path="/ptsd-questionnaire" element={<PTSDQuestionnaire />} />
                <Route path="/dast-questionnaire" element={<DASTQuestionnaire />} />
                <Route path="/scoff-questionnaire" element={<SCOFFQuestionnaire />} />
                <Route path="/bfi-questionnaire" element={<BFIQuestionnaire />} />
                <Route path="/services" element={<Services />} />
                <Route path="/specialities" element={<Specialities />} />
                <Route path="/counselling-types" element={<CounsellingTypes />} />
                <Route path="/counselling-modes" element={<CounsellingModes />} />
                <Route path="/team" element={<Team />} />
                <Route path="/find-therapist" element={<FindTherapist />} />
                <Route path="/therapist/:id" element={<TherapistProfile />} />
                <Route path="/join-team" element={<JoinTeam />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/guides" element={<DownloadableGuides />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/:slug" element={<TopicDetail />} />
                <Route path="/for-clients" element={<ForClients />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/supervision-therapists" element={<SupervisionTherapists />} />
                <Route path="/support-businesses" element={<SupportBusinesses />} />
                <Route path="/support-schools" element={<SupportSchools />} />
                <Route path="/support-workshops" element={<SupportWorkshops />} />
                <Route path="/blogs/*" element={<BlogsPage />} />
                <Route path="/ebooks" element={<EBooks />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/intake-form" element={<IntakeForm />} />
                <Route path="/assessments/:slug" element={<AssessmentTake />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />

                {/* Protected Routes - Dashboards */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/dashboard/patient" element={<PatientDashboard />} />
                <Route path="/dashboard/therapist" element={<TherapistDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/super-admin" element={<SuperAdminLogin />} />
                <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />

                {/* Booking */}
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/booking/:therapistId" element={<BookingPage />} />

                {/* Communication */}
                <Route path="/call/:roomId" element={<VideoCallRoom />} />
                <Route path="/video-call/:roomId" element={<VideoCallRoom />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:conversationId" element={<MessagesPage />} />

                {/* Therapist Pages */}
                <Route path="/notes" element={<SessionNotes />} />
                <Route path="/patients" element={<MyPatients />} />
                <Route path="/bookings-management" element={<BookingManagement />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
