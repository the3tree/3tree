import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";

const teamMembers = [
  {
    name: "Shraddha Gurung",
    role: "Founder | Psychologist | PhD in Psychology",
    image: "/placeholder-therapist.jpg", // Replace with actual image
    expertise: ["Anxiety", "ADHD", "Depression", "Stress", "Trauma", "Loneliness"],
    languages: ["English", "Hindi", "Bengali", "Nepali"],
    counselling: ["Chat", "Call", "Video"],
  },
];

const pricingPackages = [
  {
    title: "DISCUSS",
    sessions: "1 Session",
    pricePerSession: "₹1099",
    totalPrice: "₹1099",
    features: [
      "Share in a safe space",
      "Release pent-up emotions",
      "Build your therapy plan & grow",
    ],
  },
  {
    title: "UNDERSTAND",
    sessions: "3 Session",
    pricePerSession: "₹999",
    totalPrice: "₹2999",
    features: [
      "Share in a safe space",
      "Release pent-up emotions",
      "Build your therapy plan & grow",
    ],
    popular: true,
  },
  {
    title: "INTROSPECT",
    sessions: "5 Session",
    pricePerSession: "₹899",
    totalPrice: "₹4499",
    features: [
      "Share in a safe space",
      "Release pent-up emotions",
      "Build your therapy plan & grow",
    ],
  },
];

const faqs = [
  { question: "How do you select psychologists to join your team?" },
  { question: "Can I learn about each psychologist's expertise and specialization?" },
  { question: "Do your psychologists follow a particular therapy approach?" },
  { question: "Are the psychologists licensed and certified?" },
  { question: "Can I switch to a different psychologist if I feel the need?" },
  { question: "Do team members work with patients across different age groups?" },
  { question: "Are the team members trained in handling online consultations?" },
  { question: "How often is your team updated or expanded?" },
  { question: "How much does it cost" },
  { question: "Payments & Billing" },
  { question: "How will I communicate with my professional?" },
  { question: "How does live chat sessions work?" },
  { question: "How does voice call session work?" },
  { question: "How do video sessions work?" },
  { question: "Can I have access to past messages" },
  { question: "Is what I share kept confidential?" },
  { question: "How is my privacy and security protected?" },
];

export default function Team() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Meet The Team | The 3 Tree - Mental Wellness Professionals</title>
        <meta
          name="description"
          content="Meet our holistic team of licensed psychologists and therapists who nurture mind, body, and emotions through ethical, evidence-based care."
        />
        <meta
          name="keywords"
          content="therapists, psychologists, mental health team, counselors, licensed professionals"
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 bg-[#1E293B] text-white overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            {/* Back Button */}
            <div className="absolute top-6 left-4 lg:left-8">
              <BackButton to="/" label="Back to Home" className="text-white/80 hover:text-white hover:bg-white/10" />
            </div>

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
                Meet The Team
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-10 leading-relaxed">
                Our holistic team nurtures mind, body, and emotions through ethical, evidence-based care,
                ensuring privacy, respect, and a safe space for your personal healing journey today.
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

        {/* Team Members Section */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-[#1E293B] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                >
                  {/* Header with image */}
                  <div className="p-8 pb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0" />
                      <div className="flex-1 text-white">
                        <h3 className="font-serif text-2xl mb-1">{member.name}</h3>
                        <p className="text-sm text-gray-300">{member.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white p-8 pt-6">
                    {/* Expertise */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-[#2D2D2D] mb-3">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-[#2D2D2D] mb-2">Languages</h4>
                      <p className="text-sm text-gray-700">
                        {member.languages.join(" · ")}
                      </p>
                    </div>

                    {/* Counselling */}
                    <div>
                      <h4 className="font-semibold text-[#2D2D2D] mb-2">Counselling</h4>
                      <p className="text-sm text-gray-700">
                        {member.counselling.join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-12">
              Someone To Openup
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {pricingPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="border-4 border-[#1E293B] rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300" />

                  {/* Content */}
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-xl text-center mb-4">{pkg.title}</h3>
                    <p className="text-center text-gray-700 mb-2">{pkg.sessions}</p>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      {pkg.pricePerSession} per session
                    </p>

                    <div className="space-y-2 mb-6">
                      {pkg.features.map((feature, i) => (
                        <p key={i} className="text-sm text-center text-gray-700">
                          {feature}
                        </p>
                      ))}
                    </div>

                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-[#2D2D2D]">
                        {pkg.totalPrice}
                      </span>
                    </div>

                    <Button className="w-full bg-[#1E293B] hover:bg-[#2D3E5F] text-white h-12">
                      Book An Appointment <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-2">
                Find Your Answers Here
              </h2>
              <div className="w-24 h-1 bg-[#2D2D2D] mx-auto mb-12" />

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-left text-[#2D2D2D] font-medium">
                        {faq.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${openFaqIndex === index ? "rotate-45" : ""
                          }`}
                      />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-4 text-gray-700">
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
