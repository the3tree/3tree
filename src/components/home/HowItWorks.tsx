import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  UserRoundSearch,
  CalendarCheck,
  Video,
  HeartHandshake,
  ArrowRight
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: UserRoundSearch,
    title: "Find Your Match",
    description: "Browse our team of licensed therapists and find the one who specializes in your needs.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Your Session",
    description: "Choose a convenient time that works for your schedule - we offer flexible appointments.",
  },
  {
    number: "03",
    icon: Video,
    title: "Connect Securely",
    description: "Meet your therapist via our secure video platform from the comfort of your own space.",
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Start Healing",
    description: "Begin your journey to better mental health with personalized, compassionate care.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".how-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".how-header",
            start: "top 85%",
          },
        }
      );

      // Steps timeline reveal
      gsap.fromTo(
        ".step-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 80%",
          },
        }
      );

      // Connecting line animation
      gsap.fromTo(
        ".connecting-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="how-header text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm tracking-[0.2em] text-primary font-semibold mb-4 uppercase">
            How It Works
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
            Your journey to wellness in{" "}
            <span className="text-primary">4 simple steps</span>
          </h2>
          <p className="text-gray-600 text-lg">
            We've made it easy to get the support you need. Here's how to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="steps-container relative">
          {/* Connecting Line (Desktop) */}
          <div className="connecting-line hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 origin-left" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="step-card relative">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 h-full border border-gray-100 hover:border-cyan-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  {/* Number & Icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-serif text-4xl font-bold text-gray-200 group-hover:text-cyan-300 transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 group-hover:text-slate-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (Desktop only, except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-[52px] -right-4 z-10 w-8 h-8 bg-white rounded-full items-center justify-center shadow-md border border-gray-100">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
