import { Brain, Leaf, Heart } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "Mind",
    subtitle: "Professional Mental Health Support",
    description:
      "Our clinical and counselling psychologists guide you to manage stress, anxiety, and life challenges with clarity and resilience.",
    color: "accent",
  },
  {
    icon: Leaf,
    title: "Body",
    subtitle: "Holistic Physical Wellness",
    description:
      "Yoga, nutrition, and somatic practices boost vitality, energy, and overall physical well-being.",
    color: "warm",
  },
  {
    icon: Heart,
    title: "Soul",
    subtitle: "Emotional & Spiritual Balance",
    description:
      "Mindfulness and holistic practices help you connect with your inner self, find inner peace, balance, and purpose.",
    color: "accent",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-sans tracking-widest text-sm mb-4">
            WHY CHOOSE US?
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            We empower mind, body, and soul
          </h2>
          <p className="text-muted-foreground text-lg">
            Through professional therapy, holistic wellness, and mindful practices.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="text-center p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  pillar.color === "warm"
                    ? "bg-warm/10"
                    : "bg-accent/10"
                }`}
              >
                <pillar.icon
                  className={`h-10 w-10 ${
                    pillar.color === "warm" ? "text-warm" : "text-accent"
                  }`}
                />
              </div>
              <h3 className="font-serif text-3xl text-foreground mb-2">{pillar.title}</h3>
              <p className="text-accent font-medium text-sm mb-4">{pillar.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
