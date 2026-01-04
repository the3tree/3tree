import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Heart, Shield, Video } from "lucide-react";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  // Enhanced GSAP Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stagger animation for left content
      gsap.fromTo(
        ".login-feature",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );

      // Form card animation
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
        );
      }

      // Button hover effects
      gsap.utils.toArray(".login-btn").forEach((btn: any) => {
        btn.addEventListener("mouseenter", () => {
          gsap.to(btn, { scale: 1.02, duration: 0.2, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { scale: 1, duration: 0.2, ease: "power2.out" });
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signInWithEmail(formData.email, formData.password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome back!", description: "Login successful." });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    { icon: Heart, text: "Continue your healing journey" },
    { icon: Video, text: "Join video sessions with your therapist" },
    { icon: Shield, text: "Access your private, secure dashboard" },
  ];

  return (
    <>
      <Helmet>
        <title>Sign In | The 3 Tree - Mental Wellness</title>
        <meta name="description" content="Sign in to your The 3 Tree account to access therapy sessions, track progress, and connect with your therapist." />
      </Helmet>
      <Layout>
        <section ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 py-20 pt-28 flex items-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-teal-50/40 rounded-full blur-[80px]" />
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              {/* Left - Branding */}
              <div className="hidden lg:block">
                <div className="space-y-6">
                  <div className="login-feature">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Welcome Back
                    </span>
                  </div>

                  <h1 className="login-feature font-serif text-4xl lg:text-5xl text-gray-900 leading-tight">
                    Continue your path to{" "}
                    <span className="text-primary">mental wellness</span>
                  </h1>

                  <p className="login-feature text-gray-600 text-lg leading-relaxed">
                    Sign in to access your personalized dashboard, upcoming sessions,
                    and continue your healing journey.
                  </p>

                  {/* Features */}
                  <div className="space-y-4 pt-4">
                    {features.map((feature, i) => (
                      <div
                        key={i}
                        className="login-feature flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div ref={formRef}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 max-w-md mx-auto shadow-xl border border-gray-100">
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl text-gray-900 mb-2">Sign In</h2>
                    <p className="text-gray-500">Access your account</p>
                  </div>

                  {/* Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    className="login-btn w-full h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 mb-6 transition-all"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with email</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                          Password
                        </Label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative mt-2">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="login-btn w-full h-12 bg-[#1a2744] hover:bg-[#0f1a2e] text-white text-base font-semibold rounded-xl shadow-lg shadow-gray-900/10 transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Footer */}
                  <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary font-semibold hover:underline">
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
