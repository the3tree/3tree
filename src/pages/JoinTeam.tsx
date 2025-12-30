import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, ChevronRight, Plus, Upload } from "lucide-react";
import { useState } from "react";

const faqs = [
  { question: "Who can apply to join your team?" },
  { question: "What qualifications do I need?" },
  { question: "How do I apply?" },
  { question: "Is this a full-time or part-time opportunity?" },
  { question: "Can I work remotely?" },
  { question: "Do you provide training or onboarding?" },
  { question: "How will I be compensated?" },
  { question: "Are there any fees to join your team?" },
  { question: "How long does the selection process take?" },
  { question: "What makes The3Tree different for professionals?" },
  { question: "Contact Us" },
];

export default function JoinTeam() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Join The Team | The 3 Tree - Career Opportunities</title>
        <meta
          name="description"
          content="Join a compassionate, ethical team dedicated to meaningful mental health care, personal growth, and holistic well-being."
        />
        <meta
          name="keywords"
          content="careers, join team, psychologist jobs, therapist opportunities, mental health careers"
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 bg-[#1E293B] text-white overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Users className="w-24 h-24 text-white/90" strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d="M20,50 Q20,20 50,20 T80,50"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        opacity="0.6"
                      />
                      <path
                        d="M40,70 Q40,50 60,50 T80,70"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Join The Team
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-10 leading-relaxed">
                Join a compassionate, ethical team dedicated to meaningful mental health care, 
                personal growth, and holistic well-being.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
              >
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* How To Get Started Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-16">
              How To Get Started?
            </h2>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Phone Mockup */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-[500px] bg-[#1E293B] rounded-[3rem] border-8 border-[#1E293B] shadow-2xl overflow-hidden">
                    <div className="bg-white h-full p-6 flex flex-col items-center justify-center">
                      <div className="text-center space-y-4">
                        <h3 className="font-serif text-xl text-[#2D2D2D]">Begin Your Session</h3>
                        <p className="text-sm text-gray-600">Welcome, Sarah</p>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mx-auto" />
                        <p className="text-sm font-medium">Dr. Emily Adams</p>
                        <p className="text-xs text-gray-500">Clinical Psychologist</p>
                        <Button className="bg-[#1E293B] hover:bg-[#2D3E5F] w-full mt-4">
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1E293B] rounded-b-2xl" />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                <div className="bg-[#1E293B] text-white p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-2">Apply Online</h3>
                  <p className="text-sm text-gray-300">
                    Submit your application with your qualifications and areas of interest.
                  </p>
                </div>

                <div className="bg-[#1E293B] text-white p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-2">Professional Screening & Interaction</h3>
                  <p className="text-sm text-gray-300">
                    Attend an interview to align on values, ethics, and holistic practice.
                  </p>
                </div>

                <div className="bg-[#1E293B] text-white p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-2">Begin Your Journey With Us</h3>
                  <p className="text-sm text-gray-300">
                    Complete onboarding and start your professional journey with our team.
                  </p>
                </div>

                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-[#1E293B] text-[#1E293B] hover:bg-[#1E293B] hover:text-white"
                  >
                    TAKE THE FIRST STEP <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-8">
                Apply To Join The Team
              </h2>

              <form className="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="e.g., John Doe" className="w-full" />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input type="email" placeholder="e.g., xyz@abc.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="e.g., +91 982 408 0000" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Address <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="e.g., 42 Wallaby Way" className="w-full" />
                </div>

                {/* Application Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Code (If)
                  </label>
                  <Input placeholder="" className="w-full" />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <Input placeholder="e.g., Sydney" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province/Region <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="e.g., New South Wales" />
                  </div>
                </div>

                {/* Postal Code and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP / Postal Code
                    </label>
                    <Input placeholder="e.g., 20001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Select country</option>
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                {/* License Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Date <span className="text-red-500">*</span>
                  </label>
                  <Input type="date" placeholder="Choose Date" />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <Input placeholder="e.g., best placeholder" />
                  <p className="text-xs text-gray-500 mt-1">If you can add here too</p>
                </div>

                {/* Work Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Experience
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Company Name</label>
                      <Input placeholder="e.g., best placeholder" />
                      <p className="text-xs text-gray-500 mt-1">Title can add here too</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Current/Past Role(s)</label>
                      <Input placeholder="e.g., Choose Circle" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Job Responsibilities</label>
                      <Textarea 
                        placeholder="e.g., best placeholder&#10;Title can add here too" 
                        rows={4}
                      />
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                </div>

                {/* Work Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Availability
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Company Name</label>
                        <Input placeholder="e.g., best placeholder" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Current/Past Role(s)</label>
                        <Input placeholder="e.g., Choose Circle" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Job Responsibilities</label>
                      <Textarea 
                        placeholder="e.g., best placeholder&#10;Title can add here too" 
                        rows={4}
                      />
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-dashed border-gray-300 hover:border-[#1E293B]"
                    type="button"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-red-500 mt-1">Max. File Size : 1MB</p>
                </div>

                {/* Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optional
                  </label>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <p className="text-sm text-gray-700">
                      Confirm that the information provided in this and accurate.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#1E293B] hover:bg-[#2D3E5F] text-white h-12 text-lg"
                >
                  Apply
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-2">
                Find Your Answers Here
              </h2>
              <div className="w-24 h-1 bg-[#2D2D2D] mb-12" />

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg overflow-hidden ${
                      openFaqIndex === index ? "bg-[#1E293B] border-[#1E293B]" : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                        openFaqIndex === index 
                          ? "text-white" 
                          : "text-[#2D2D2D] hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-left font-medium">
                        {faq.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform ${
                          openFaqIndex === index ? "rotate-45 text-white" : "text-gray-600"
                        }`}
                      />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-4 text-gray-300">
                        <p>Answer content goes here...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
