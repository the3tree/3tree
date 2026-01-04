import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Calendar, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Section - Premium Design with Video and Parallax Effects
 * Vibrant, engaging, with smooth scroll-triggered animations
 */

const emotionalWords = [
  "SEEN...",
  "HEARD...",
  "UNDERSTOOD...",
  "EMPOWERED...",
  "WHOLE...",
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState(emotionalWords[0]);

  // Word rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % emotionalWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Smooth fade transition for word change
  useEffect(() => {
    const wordEl = document.querySelector(".emotional-word");
    if (!wordEl) return;

    gsap.to(wordEl, {
      opacity: 0,
      y: -15,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setDisplayWord(emotionalWords[wordIndex]);
        gsap.fromTo(wordEl,
          { opacity: 0, y: 20, scale: 1.05 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
        );
      },
    });
  }, [wordIndex]);

  // Initial animations + Parallax scroll effects
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Initial reveal sequence
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 50, rotateX: -15 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15 },
          "-=0.4"
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.12 },
          "-=0.3"
        )
        .fromTo(
          ".hero-video-wrapper",
          { opacity: 0, scale: 0.9, x: 60 },
          { opacity: 1, scale: 1, x: 0, duration: 1.2, ease: "power3.out" },
          "-=0.8"
        )
        .fromTo(
          ".hero-floating-card",
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.7)" },
          "-=0.6"
        )
        .fromTo(
          ".hero-trust",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        );

      // Parallax scroll effects
      gsap.to(".parallax-slow", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".parallax-medium", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(".parallax-fast", {
        yPercent: -80,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2,
        },
      });

      // Scale effect on video as user scrolls
      gsap.to(".hero-video-wrapper", {
        scale: 0.9,
        opacity: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });

      // Floating animation for cards
      gsap.to(".float-animation", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-24 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/40"
    >
      {/* Animated Background Elements - Vibrant */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient orbs with subtle animation */}
        <div className="parallax-slow absolute top-[10%] right-[5%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/40 to-teal-100/30 rounded-full blur-[120px]" />
        <div className="parallax-medium absolute bottom-[5%] left-[2%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-cyan-50/30 rounded-full blur-[100px]" />
        <div className="parallax-fast absolute top-[50%] left-[30%] w-[300px] h-[300px] bg-gradient-to-r from-teal-100/30 to-emerald-50/20 rounded-full blur-[80px]" />

        {/* Decorative shapes */}
        <div className="absolute top-[20%] left-[10%] w-16 h-16 border-2 border-cyan-200/30 rounded-full parallax-medium" />
        <div className="absolute top-[40%] right-[15%] w-10 h-10 bg-cyan-100/40 rounded-lg rotate-45 parallax-slow" />
        <div className="absolute bottom-[30%] left-[5%] w-8 h-8 bg-teal-100/50 rounded-full parallax-fast" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-6rem)] py-12 lg:py-16">
          {/* Left - Content */}
          <div className="space-y-7 max-w-xl">
            {/* Badge with sparkle */}
            <div className="hero-badge">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-200/50 rounded-full text-sm font-medium text-cyan-700 shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Now accepting new clients
              </span>
            </div>

            {/* Main Heading with Animated Word */}
            <div className="space-y-2">
              <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.08] tracking-tight text-gray-900">
                <span className="hero-title-line block">We Help You Feel</span>
                <span className="emotional-word hero-title-line block mt-1 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent font-bold">
                  {displayWord}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="hero-subtitle space-y-3">
              <p className="text-xl text-gray-600 leading-relaxed">
                A welcoming space to explore your thoughts, heal at your
                pace, and feel truly heard.
              </p>
              <p className="text-lg font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent italic">
                "Self Care isn't selfish"
              </p>
            </div>

            {/* CTAs with hover effects */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="hero-cta group h-14 px-8 text-base font-semibold bg-gradient-to-r from-[#1a2744] to-[#2d3a54] hover:from-[#0f1a2e] hover:to-[#1a2744] text-white rounded-xl shadow-lg shadow-gray-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5"
              >
                <Link to="/booking" className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book a Session
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="hero-cta h-14 px-6 text-base font-medium border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 rounded-xl group transition-all duration-300 hover:-translate-y-0.5"
              >
                <a href="tel:+1234567890" className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-cyan-600 group-hover:animate-pulse" />
                  Speak to Someone
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust flex items-center gap-6 pt-2">
              <div className="flex -space-x-3">
                {[
                  "A", "B", "C", "D"
                ].map((letter, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 border-3 border-white flex items-center justify-center text-white font-semibold text-sm shadow-md"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">2,500+ Clients Helped</p>
                <p className="text-gray-500">Trusted by individuals & families</p>
              </div>
            </div>
          </div>

          {/* Right - Video Section */}
          <div ref={videoRef} className="hero-video-wrapper relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Video Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-gray-200">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[4/5] object-cover bg-gray-100"
                  poster="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=750&fit=crop"
                >
                  <source
                    src="https://cdn.pixabay.com/video/2020/05/25/40130-424930941_large.mp4"
                    type="video/mp4"
                  />
                </video>

                {/* Fallback Image that shows if video doesn't load */}
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=750&fit=crop"
                  alt="Mental wellness and meditation"
                  className="absolute inset-0 w-full h-full object-cover -z-10"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/40 via-transparent to-cyan-500/5" />
              </div>

              {/* Floating Card - Stats */}
              <div className="hero-floating-card float-animation absolute -left-6 lg:-left-10 bottom-16 lg:bottom-24 bg-white rounded-2xl p-4 lg:p-5 shadow-xl shadow-gray-200/50 border border-gray-100 z-10">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-11 h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">98%</p>
                    <p className="text-xs lg:text-sm text-gray-500">Client satisfaction</p>
                  </div>
                </div>
              </div>

              {/* Floating Card - Quick Access */}
              <div className="hero-floating-card float-animation absolute -right-4 lg:-right-8 top-16 lg:top-24 bg-white rounded-2xl p-3 lg:p-4 shadow-xl shadow-gray-200/50 border border-gray-100 z-10" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs lg:text-sm">Next Available</p>
                    <p className="text-cyan-600 font-bold text-xs lg:text-sm">Today, 3:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Animated */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-xs text-gray-500 tracking-widest uppercase font-medium">
          Explore
        </span>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
