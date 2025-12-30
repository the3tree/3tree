import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Account created!", description: "Please check your email to verify." });
    }, 1000);
  };

  return (
    <>
      <Helmet><title>Sign Up | The 3 Tree</title></Helmet>
      <Layout>
        <section className="py-20 lg:py-28 bg-background min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4 max-w-md">
            <div className="card-elevated p-8">
              <h1 className="font-serif text-3xl text-foreground text-center mb-2">Create Account</h1>
              <p className="text-muted-foreground text-center mb-8">Start your wellness journey</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" required className="mt-2" /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" /></div>
                <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required className="mt-2" /></div>
                <Button type="submit" variant="accent" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link></p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
