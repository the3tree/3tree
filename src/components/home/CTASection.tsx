import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* E-Books & Courses */}
          <div className="card-elevated p-10 lg:p-12">
            <h3 className="font-serif text-3xl text-foreground mb-4">E-Books & Courses</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Discover a range of carefully crafted e-books and self-paced courses built to support
              your mental well-being. From managing stress to building self-awareness and
              resilience, these tools are here to guide and empower you.
            </p>
            <Button variant="outline" asChild>
              <Link to="/guides">
                Explore E-books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Need Advice */}
          <div className="card-elevated p-10 lg:p-12 bg-accent/5 border-accent/20">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
              <MessageCircle className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-serif text-3xl text-foreground mb-4">Need Advice?</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Not sure where to begin? Whether you're feeling overwhelmed, unsure, or just need a
              little guidance, we're here to support you. Reach out with your questions—sometimes, a
              simple nudge in the right direction is all it takes.
            </p>
            <Button variant="accent" asChild>
              <Link to="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
