import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Login successful!", description: "Welcome back." });
    }, 1000);
  };

  return (
    <>
      <Helmet><title>Login | The 3 Tree</title></Helmet>
      <Layout>
        <section className="py-20 lg:py-28 bg-background min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4 max-w-md">
            <div className="card-elevated p-8">
              <h1 className="font-serif text-3xl text-foreground text-center mb-2">Welcome Back</h1>
              <p className="text-muted-foreground text-center mb-8">Sign in to your account</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" /></div>
                <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required className="mt-2" /></div>
                <Button type="submit" variant="accent" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">Don't have an account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link></p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
