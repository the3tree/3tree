import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, ClipboardList, Sparkles, Heart, MessageCircle } from "lucide-react";

export default function Hero() {
  return (
    
    <section className="relative min-h-screen bg-[#F5F1ED] pt-10 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[calc(100vh-12rem)]">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Main Heading with Emojis */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight text-[#2D2D2D]">
              Empowering change through personalized therapy and{" "}
              <span className="inline-flex items-center gap-2">
              </span>{" "}
              counseling
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
              A safe, personal space for one-on-one therapy and counseling. 
              We help you explore your thoughts, heal at your pace, and feel truly heard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button 
                asChild 
                size="lg"
                className="bg-[#2D2D2D] hover:bg-[#1a1a1a] text-white rounded-full px-8 h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Link to="/contact" className="flex items-center gap-2">
                  Book Appointment
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                asChild
                className="text-[#2D2D2D] hover:bg-transparent hover:underline text-base font-medium"
              >
                <Link to="/services">
                  How it Works?
                </Link>
              </Button>
            </div>

            {/* Pill Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Link 
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-sm font-medium text-gray-700"
              >
                <Users className="w-4 h-4" />
                Group Therapy
              </Link>
              <Link 
                to="/assessments"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-sm font-medium text-gray-700"
              >
                <ClipboardList className="w-4 h-4" />
                Assessment Session
              </Link>
            </div>
          </div>

          {/* Right Image Card */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            
            {/* Stats Bar - Standalone Horizontal Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 p-4 lg:p-6">
              <div className="grid grid-cols-4 gap-2 lg:gap-4 divide-x divide-gray-200">
                <div className="text-center px-2">
                  <div className="text-xl lg:text-3xl font-serif font-bold text-[#2D2D2D] mb-1">
                    1,001+
                  </div>
                  <div className="text-[9px] lg:text-[10px] font-bold tracking-widest text-gray-500 uppercase leading-tight">
                    Happy Patients
                  </div>
                </div>
                
                <div className="text-center px-2">
                  <div className="text-xl lg:text-3xl font-serif font-bold text-[#2D2D2D] mb-1">
                    50+
                  </div>
                  <div className="text-[9px] lg:text-[10px] font-bold tracking-widest text-gray-500 uppercase leading-tight">
                    Services
                  </div>
                </div>
                
                <div className="text-center px-2">
                  <div className="text-xl lg:text-3xl font-serif font-bold text-[#2D2D2D] mb-1">
                    100+
                  </div>
                  <div className="text-[9px] lg:text-[10px] font-bold tracking-widest text-gray-500 uppercase leading-tight">
                    Locations
                  </div>
                </div>
                
                <div className="text-center px-2">
                  <div className="text-xl lg:text-3xl font-serif font-bold text-[#2D2D2D] mb-1">
                    30+
                  </div>
                  <div className="text-[9px] lg:text-[10px] font-bold tracking-widest text-gray-500 uppercase leading-tight">
                    Programs
                  </div>
                </div>
              </div>
            </div>

            {/* Main Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Main Hero Image */}
              <div className="aspect-[16/10] relative">
                <img 
                  src="/image 1.jpg"
                  alt="Professional therapist"
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Top overlay gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/10 to-transparent" />
              </div>

              {/* Explore More Card - Bottom Left */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-2 shadow-lg">
                <Link 
                  to="/services" 
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore More
                </Link>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/4 -right-8 w-32 h-32 bg-[#E8E3F5] rounded-full blur-3xl opacity-50" />
            <div className="absolute -z-10 bottom-1/4 -left-8 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
}
