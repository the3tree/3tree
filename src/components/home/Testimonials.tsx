import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Jordan T.",
    quote:
      "The Feeling Wheel guide helped me finally put words to how I've been feeling. I never realized how important it was to name my emotions.",
    rating: 5,
  },
  {
    name: "Aarushi M.",
    quote:
      "The Cognitive Restructuring Worksheet completely shifted the way I talk to myself. It's now part of my weekly reflection routine.",
    rating: 5,
  },
  {
    name: "Dev R.",
    quote:
      "The Mental Health Planner keeps me grounded. I've been using it every Sunday to plan my emotional goals for the week.",
    rating: 5,
  },
  {
    name: "Sanya K.",
    quote:
      "I downloaded the Wellness Tracker just to try it out—and now it's become my morning ritual. It's simple but powerful.",
    rating: 5,
  },
  {
    name: "Rakesh V.",
    quote:
      "These guides feel like a therapist in your pocket. They're well-designed, easy to use, and genuinely helpful when you're overwhelmed.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-sans tracking-widest text-sm mb-4">WHAT CLIENTS SAY</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-2">100+ five-star reviews</h2>
          <div className="flex justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-warm text-warm" />
            ))}
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="text-center">
                    <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8 text-primary-foreground/90">
                      "{testimonial.quote}"
                    </blockquote>
                    <p className="font-medium text-accent">{testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="hero"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-accent w-6"
                      : "bg-primary-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="hero"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-primary-foreground/10">
          {[
            { value: "100+", label: "Happy Patients" },
            { value: "5+", label: "Services" },
            { value: "10+", label: "Locations" },
            { value: "15+", label: "Programs" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl md:text-5xl text-accent mb-2">{stat.value}</p>
              <p className="text-primary-foreground/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
