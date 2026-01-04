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
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, Shield, Calendar, MessageCircle } from "lucide-react";

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"patient" | "therapist">("patient");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
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
      gsap.fromTo(
        ".signup-feature",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUpWithEmail(
      formData.email,
      formData.password,
      formData.fullName,
      role
    );

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to The 3 Tree. Please check your email to verify your account.",
      });
      navigate("/login");
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const benefits = [
    { icon: Calendar, text: "Book sessions with certified therapists" },
    { icon: Shield, text: "Your data is secure & confidential" },
    { icon: MessageCircle, text: "24/7 messaging with your therapist" },
  ];

  return (
    <>
      <Helmet>
        <title>Create Account | The 3 Tree - Mental Wellness</title>
        <meta name="description" content="Join The 3 Tree and start your mental wellness journey. Create an account to book therapy sessions and connect with compassionate therapists." />
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
                  <div className="signup-feature">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white rounded-full text-sm font-medium">
                      <User className="w-4 h-4" />
                      Join The 3 Tree
                    </span>
                  </div>

                  <h1 className="signup-feature font-serif text-4xl lg:text-5xl text-gray-900 leading-tight">
                    Start your journey to{" "}
                    <span className="text-primary">mental wellness</span>
                  </h1>

                  <p className="signup-feature text-gray-600 text-lg leading-relaxed">
                    Create an account to access personalized therapy sessions,
                    track your progress, and connect with compassionate professionals.
                  </p>

                  {/* Benefits */}
                  <div className="space-y-4 pt-4">
                    {benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="signup-feature flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center">
                          <benefit.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div ref={formRef}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 max-w-md mx-auto shadow-xl border border-gray-100">
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500">Join our wellness community</p>
                  </div>

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setRole("patient")}
                      className={`p-4 rounded-xl border-2 transition-all ${role === "patient"
                        ? "border-[#1a2744] bg-[#1a2744]/5"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <User className={`w-6 h-6 mx-auto mb-2 ${role === "patient" ? "text-[#1a2744]" : "text-gray-400"}`} />
                      <p className={`font-medium ${role === "patient" ? "text-[#1a2744]" : "text-gray-600"}`}>
                        I'm a Client
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Seeking therapy</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("therapist")}
                      className={`p-4 rounded-xl border-2 transition-all ${role === "therapist"
                        ? "border-[#1a2744] bg-[#1a2744]/5"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Shield className={`w-6 h-6 mx-auto mb-2 ${role === "therapist" ? "text-[#1a2744]" : "text-gray-400"}`} />
                      <p className={`font-medium ${role === "therapist" ? "text-[#1a2744]" : "text-gray-600"}`}>
                        I'm a Therapist
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Provide services</p>
                    </button>
                  </div>

                  {/* Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 mb-4 transition-all"
                    onClick={handleGoogleSignup}
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
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700 font-medium">
                        Full Name
                      </Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="pl-12 h-11 rounded-xl border-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-12 h-11 rounded-xl border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                          Password
                        </Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-12 h-11 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                          Confirm
                        </Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="pl-12 h-11 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Show Password Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPassword ? "Hide password" : "Show password"}
                    </button>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744] mt-0.5"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#1a2744] hover:bg-[#0f1a2e] text-white text-base font-semibold rounded-xl shadow-lg shadow-gray-900/10 transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Footer */}
                  <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                      Sign in
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
