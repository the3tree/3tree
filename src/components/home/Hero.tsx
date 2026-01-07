import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Calendar, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Section - Premium Design with Full-Width Video at Bottom
 * Clean, professional layout with content above and video below
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState(emotionalWords[0]);
  const [videoError, setVideoError] = useState(false);

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

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true; // Ensure muted for autoplay
        await video.play();
      } catch {
        console.log("Video autoplay blocked, trying with user interaction");
        setVideoError(true);
      }
    };

    // Attempt to play when video is ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  // Initial animations
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
          ".hero-video-section",
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.5"
        );

      // Parallax scroll effects for background
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

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-white to-cyan-50/30"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="parallax-slow absolute top-[10%] right-[5%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/40 to-teal-100/30 rounded-full blur-[120px]" />
        <div className="parallax-medium absolute bottom-[5%] left-[2%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-cyan-50/30 rounded-full blur-[100px]" />
      </div>

      {/* Hero Content Section */}
      <div className="container mx-auto px-6 lg:px-8 pt-28 pb-12 lg:pt-32 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge with sparkle */}
          <div className="hero-badge mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-200/50 rounded-full text-sm font-medium text-cyan-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Now accepting new clients
            </span>
          </div>

          {/* Main Heading with Animated Word */}
          <div className="space-y-2 mb-6">
            <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.08] tracking-tight text-gray-900">
              <span className="hero-title-line block">We Help You Feel</span>
              <span className="emotional-word hero-title-line block mt-1 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent font-bold">
                {displayWord}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="hero-subtitle space-y-3 mb-8">
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A welcoming space to explore your thoughts, heal at your
              pace, and feel truly heard.
            </p>
            <p className="text-lg font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent italic">
              "Self Care isn't selfish"
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="pill"
              size="lg"
              className="hero-cta group h-14 px-8 text-base font-semibold shadow-xl hover:shadow-2xl"
            >
              <Link to="/booking" className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book a Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="pill-outline"
              size="lg"
              asChild
              className="hero-cta h-14 px-6 text-base font-medium group"
            >
              <a href="tel:+1234567890" className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-cyan-600 group-hover:text-white group-hover:animate-pulse" />
                Speak to Someone
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Full-Width Video Section at Bottom */}
      <div className="hero-video-section w-full">
        <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            poster="/images/hero-poster.jpg"
          >
            <source src="/video.mp4" type="video/mp4" />
            <source src="/video.webm" type="video/webm" />
          </video>

          {/* Fallback Background if Video Fails */}
          {videoError && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] via-[#2d3a54] to-[#161A30] flex items-center justify-center">
              <div className="text-center text-white/80">
                <span className="text-6xl mb-4 block">🌳</span>
                <p className="text-lg font-medium">The 3 Tree Mental Wellness</p>
              </div>
            </div>
          )}

          {/* Gradient Overlays for Smooth Blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F8FAFC] to-transparent pointer-events-none" />

          {/* Optional: Content Overlay on Video */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-white/90 text-lg md:text-xl font-medium drop-shadow-lg">
                Your Journey to Wellness Starts Here
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
