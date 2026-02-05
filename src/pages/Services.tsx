import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Users, UsersRound, Heart, Sparkles, Video, MessageCircle, Building, Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BackButton from "@/components/ui/BackButton";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "individual",
    icon: User,
    title: "Individual Therapy",
    description:
      "A safe, personal space for one-on-one therapy to explore your feelings, understand patterns, and grow emotionally and mentally. Our therapists use evidence-based approaches tailored to your unique needs.",
    features: ["Cognitive Behavioral Therapy", "Mindfulness-Based Therapy", "Person-Centered Approach", "Trauma-Informed Care"],
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
  },
  {
    id: "couple",
    icon: Users,
    title: "Couple Therapy",
    description:
      "Therapy for couples to explore relationship dynamics, enhance understanding, manage disagreements, and nurture intimacy, empathy, and mutual support.",
    features: ["Communication Skills", "Conflict Resolution", "Intimacy Building", "Trust Restoration"],
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop",
  },
  {
    id: "group",
    icon: UsersRound,
    title: "Group Therapy",
    description:
      "A safe space to share experiences with peers, explore common challenges, receive support, and develop practical strategies to navigate emotions together.",
    features: ["Peer Support", "Shared Learning", "Social Skills", "Community Building"],
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  },
  {
    id: "child",
    icon: Heart,
    title: "Child & Adolescent Therapy",
    description:
      "A supportive space for children (5–12) and teens (13–17) to explore emotions, navigate challenges, and build resilience. Parental or guardian consent required.",
    features: ["Play Therapy", "Art Therapy", "Family Involvement", "School Collaboration"],
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop",
  },
  {
    id: "holistic",
    icon: Sparkles,
    title: "Holistic Consciousness Coaching",
    description:
      "A holistic approach blending mental health strategies and mind-body-spirit practices to support self-awareness, emotional regulation, mindfulness, and purposeful living.",
    features: ["Mindfulness Training", "Breathwork", "Life Purpose Discovery", "Spiritual Integration"],
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
  },
];

const modes = [
  {
    icon: Video,
    title: "Online Sessions",
    description: "Secure video sessions from the comfort of your home. Connect with your therapist from anywhere.",
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Text-based therapy for flexible communication. Perfect for those who prefer writing.",
  },
  {
    icon: Building,
    title: "In-Person",
    description: "Face-to-face sessions at our welcoming center. Experience traditional therapy in a safe space.",
  },
];

export default function Services() {
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        ".services-hero-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Service blocks stagger
      gsap.fromTo(
        ".service-block",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-list",
            start: "top 80%",
          },
        }
      );

      // Modes cards
      gsap.fromTo(
        ".mode-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".modes-grid",
            start: "top 85%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Services | The 3 Tree - Therapy & Counselling</title>
        <meta
          name="description"
          content="Explore our therapy services: individual, couple, group therapy, child counselling, and holistic coaching. Find the right support for your mental wellness journey."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section ref={heroRef} className="py-24 lg:py-32 bg-[#1a2744] text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            {/* Back Button */}
            <div className="absolute top-0 left-0">
              <BackButton to="/" label="Back to Home" className="text-white/80 hover:text-white hover:bg-white/10" />
            </div>

            <div className="services-hero-content max-w-3xl mx-auto text-center">
              <span className="inline-block text-sm tracking-[0.3em] text-cyan-300 font-medium mb-4 uppercase">
                Our Services
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                Support We Offer
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                We provide comprehensive mental health services tailored to meet you where you are in your journey.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section ref={servicesRef} className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="services-list space-y-20 lg:space-y-28">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  id={service.id}
                  className="service-block scroll-mt-24"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}>
                    {/* Content */}
                    <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                      <div className="w-14 h-14 rounded-xl bg-[#1a2744] flex items-center justify-center mb-6">
                        <service.icon className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="font-serif text-3xl lg:text-4xl text-gray-900 mb-4">
                        {service.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                        {service.description}
                      </p>
                      <ul className="grid grid-cols-2 gap-3 mb-8">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="bg-[#1a2744] hover:bg-[#0f1a2e] text-white rounded-lg">
                        <Link to={`/booking?service=${service.id}`}>
                          Book a Session
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Image */}
                    <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full aspect-[4/3] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counselling Modes */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-sm tracking-[0.2em] text-primary font-semibold mb-4 uppercase">
                Counselling Modes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
                Choose How You Connect
              </h2>
              <p className="text-gray-600">
                We offer flexible options to make therapy accessible and comfortable for you.
              </p>
            </div>
            <div className="modes-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {modes.map((mode) => (
                <div key={mode.title} className="mode-card bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-[#1a2744] flex items-center justify-center mx-auto mb-6">
                    <mode.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{mode.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-[#1a2744] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Ready to Begin?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Take the first step towards your mental wellness journey today. We're here to support you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-[#1a2744] hover:bg-gray-100 rounded-lg">
                <Link to="/booking">
                  Book Your Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10 rounded-lg">
                <Link to="/assessments">
                  Take a Free Assessment
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
