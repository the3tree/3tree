import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Team from "./pages/Team";
import FAQs from "./pages/FAQs";
import Guides from "./pages/Guides";
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
import OurStory from "./pages/OurStory";
import CounsellingTypes from "./pages/CounsellingTypes";
import CounsellingModes from "./pages/CounsellingModes";
import SupervisionTherapists from "./pages/SupervisionTherapists";
import SupportBusinesses from "./pages/SupportBusinesses";
import SupportSchools from "./pages/SupportSchools";
import SupportWorkshops from "./pages/SupportWorkshops";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
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
            <Route path="/join-team" element={<JoinTeam />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/guides" element={<DownloadableGuides />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/for-clients" element={<ForClients />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/supervision-therapists" element={<SupervisionTherapists />} />
            <Route path="/support-businesses" element={<SupportBusinesses />} />
            <Route path="/support-schools" element={<SupportSchools />} />
            <Route path="/support-workshops" element={<SupportWorkshops />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
