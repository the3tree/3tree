import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Book Your First Session",
    description: "Book your appointment at a time that feels right for you.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Share Your Details",
    description: "Complete a brief, confidential form to help us understand your needs.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Begin Your Sessions",
    description: "Start your journey with personalized, professional support.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-sans tracking-widest text-sm mb-4">
            YOUR JOURNEY STARTS HERE
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            How to get started?
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 right-0 w-full h-px bg-gradient-to-r from-border via-accent/30 to-border translate-x-1/2" />
              )}

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center shadow-soft">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="text-accent font-serif text-4xl opacity-30">{step.step}</span>
                <h3 className="font-serif text-xl text-foreground mt-2 mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="accent" size="lg" asChild>
            <Link to="/contact">
              Take The First Step
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
