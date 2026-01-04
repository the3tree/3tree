import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/BackButton";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | The 3 Tree - Get in Touch</title>
        <meta name="description" content="Contact The 3 Tree for therapy inquiries. Book a session or ask questions about our mental health services." />
      </Helmet>
      <Layout>
        <section className="relative py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="absolute top-6 left-4 lg:left-8">
            <BackButton to="/" label="Back to Home" className="text-white/80 hover:text-white hover:bg-white/10" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <p className="text-accent font-sans tracking-widest text-sm mb-4">CONTACT US</p>
            <h1 className="font-serif text-4xl md:text-6xl mb-6">Get in Touch</h1>
            <p className="text-primary-foreground/70 text-lg">We're here to support you on your journey.</p>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="font-serif text-3xl text-foreground mb-8">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="name">Name</Label><Input id="name" required className="mt-2" /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" /></div>
                  </div>
                  <div><Label htmlFor="phone">Phone</Label><Input id="phone" className="mt-2" /></div>
                  <div><Label htmlFor="message">Message</Label><Textarea id="message" rows={5} required className="mt-2" /></div>
                  <Button type="submit" variant="accent" size="lg" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
                </form>
              </div>
              <div className="space-y-8">
                <h2 className="font-serif text-3xl text-foreground mb-8">Contact Information</h2>
                {[
                  { icon: MapPin, title: "Location", text: "Sikkim/Majitar, India" },
                  { icon: Phone, title: "Phone", text: "+91 1234567890" },
                  { icon: Mail, title: "Email", text: "hello@the3tree.com" },
                  { icon: Clock, title: "Hours", text: "Mon-Sat: 9AM - 6PM" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div><h4 className="font-medium text-foreground">{item.title}</h4><p className="text-muted-foreground">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
