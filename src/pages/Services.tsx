import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Users, UsersRound, Heart, Sparkles, Video, MessageCircle, Building } from "lucide-react";

const services = [
  {
    id: "individual",
    icon: User,
    title: "Individual Therapy",
    description:
      "A safe, personal space for one-on-one therapy to explore your feelings, understand patterns, and grow emotionally and mentally. Our therapists use evidence-based approaches tailored to your unique needs.",
    features: ["Cognitive Behavioral Therapy", "Mindfulness-Based Therapy", "Person-Centered Approach", "Trauma-Informed Care"],
  },
  {
    id: "couple",
    icon: Users,
    title: "Couple Therapy",
    description:
      "Therapy for couples to explore relationship dynamics, enhance understanding, manage disagreements, and nurture intimacy, empathy, and mutual support.",
    features: ["Communication Skills", "Conflict Resolution", "Intimacy Building", "Trust Restoration"],
  },
  {
    id: "group",
    icon: UsersRound,
    title: "Group Therapy",
    description:
      "A safe space to share experiences with peers, explore common challenges, receive support, and develop practical strategies to navigate emotions together.",
    features: ["Peer Support", "Shared Learning", "Social Skills", "Community Building"],
  },
  {
    id: "child",
    icon: Heart,
    title: "Child & Adolescent Therapy",
    description:
      "A supportive space for children (5–12) and teens (13–17) to explore emotions, navigate challenges, and build resilience. Parental or guardian consent required.",
    features: ["Play Therapy", "Art Therapy", "Family Involvement", "School Collaboration"],
  },
  {
    id: "holistic",
    icon: Sparkles,
    title: "Holistic Consciousness Coaching",
    description:
      "A holistic approach blending mental health strategies and mind-body-spirit practices to support self-awareness, emotional regulation, mindfulness, and purposeful living.",
    features: ["Mindfulness Training", "Breathwork", "Life Purpose Discovery", "Spiritual Integration"],
  },
];

const modes = [
  {
    icon: Video,
    title: "Online Sessions",
    description: "Secure video sessions from the comfort of your home.",
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Text-based therapy for flexible communication.",
  },
  {
    icon: Building,
    title: "In-Person",
    description: "Face-to-face sessions at our welcoming center.",
  },
];

export default function Services() {
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
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">OUR SERVICES</p>
              <h1 className="font-serif text-4xl md:text-6xl mb-6">Support We Offer</h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                We provide comprehensive mental health services tailored to meet you where you are in your journey.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="space-y-16">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  id={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                      <service.icon className="h-8 w-8 text-accent" />
                    </div>
                    <h2 className="font-serif text-3xl text-foreground mb-4">{service.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                    <ul className="grid grid-cols-2 gap-3 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" asChild>
                      <Link to="/contact">
                        Book a Session
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className={`card-elevated p-8 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center">
                      <service.icon className="h-20 w-20 text-accent/30" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counselling Modes */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">COUNSELLING MODES</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                Choose how you connect
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {modes.map((mode) => (
                <div key={mode.title} className="card-elevated p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <mode.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3">{mode.title}</h3>
                  <p className="text-muted-foreground text-sm">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Ready to Begin?</h2>
            <p className="text-accent-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Take the first step towards your mental wellness journey today.
            </p>
            <Button variant="default" size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link to="/contact">
                Book Your Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    </>
  );
}
