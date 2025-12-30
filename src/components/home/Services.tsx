import { Link } from "react-router-dom";
import { ArrowRight, User, Users, UsersRound, Heart, Sparkles } from "lucide-react";

const services = [
  {
    icon: User,
    title: "Individual Therapy",
    description:
      "A safe, personal space for one-on-one therapy to explore your feelings, understand why, and grow emotionally and mentally.",
    href: "/services#individual",
  },
  {
    icon: Users,
    title: "Couple Therapy",
    description:
      "Therapy for couples to explore relationship dynamics, enhance understanding, manage disagreements, and nurture intimacy.",
    href: "/services#couple",
  },
  {
    icon: UsersRound,
    title: "Group Therapy",
    description:
      "A safe space to share experiences with peers, explore common challenges, and develop practical strategies together.",
    href: "/services#group",
  },
  {
    icon: Heart,
    title: "Child & Adolescent",
    description:
      "A supportive space for children and teens to explore emotions, navigate challenges, and build resilience.",
    href: "/services#child",
  },
  {
    icon: Sparkles,
    title: "Holistic Coaching",
    description:
      "A holistic approach blending mental health strategies and mind-body-spirit practices for purposeful living.",
    href: "/services#holistic",
  },
];

export default function Services() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-sans tracking-widest text-sm mb-4">
            SELF CARE ISN'T SELFISH
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            Find the right support for you
          </h2>
          <p className="text-muted-foreground text-lg">
            We offer a range of therapeutic services tailored to meet your unique needs and journey.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-6">
          {/* First 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <Link
                key={service.title}
                to={service.href}
                className="group card-elevated p-8 hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
          
          {/* Last 2 cards - centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.slice(3).map((service, index) => (
              <Link
                key={service.title}
                to={service.href}
                className="group card-elevated p-8 hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
