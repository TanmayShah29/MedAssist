"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGoogle,
  FaShieldAlt,
  FaLock,
  FaUserMd,
  FaArrowRight,
  FaCheckCircle,
  FaMicroscope
} from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Floating Cards Components
interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string; // Add color prop
  delay: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StatusCard = ({ icon, title, value, color, delay }: StatusCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, x: -20 }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    transition={{ delay, duration: 0.8, ease: "easeOut" }}
    className="absolute bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl w-48"
    style={{ top: delay * 100 + 100, left: delay * 40 + 40 }}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        {icon}
      </div>
      <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{title}</span>
    </div>
    <div className="text-white font-bold text-lg">{value}</div>
  </motion.div>
);

interface FeatureSlideProps {
  active: boolean;
  title: string;
  subtitle: string;
  color: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FeatureSlide = ({ active, title, subtitle, color }: FeatureSlideProps) => (
  <AnimatePresence mode="wait">
    {active && (
      <motion.div
        key={title}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-6 backdrop-blur-sm`}>
          <FaShieldAlt className="text-sky-300" />
          <span>Clinical Grade Security</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-lg text-white/70 max-w-md leading-relaxed">
          {subtitle}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  const slides = [
    {
      title: "AI-Powered Clinical Intelligence",
      subtitle: "MedAssist processes lab results and symptoms with Groq AI to provide hospital-grade insights in seconds.",
      color: "from-sky-600 to-indigo-700",
      accent: "bg-sky-500"
    },
    {
      title: "Secure & Encrypted Health Data",
      subtitle: "Your medical data is encrypted with AES-256 and fully HIPAA-compliant locally processing pipelines.",
      color: "from-violet-600 to-purple-700",
      accent: "bg-violet-500"
    },
    {
      title: "Real-time Biomarker Tracking",
      subtitle: "Monitor vital health metrics over time with predictive analytics and early warning systems.",
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Login successful - Check if onboarding is complete
        // For now, we'll check profile or just default to dashboard
        // Ideally we fetch the profile here.
        // Let's assume dashboard for now, or check profile
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_complete")
            .eq('id', user.id)
            .single();

          if (profile && !profile.onboarding_complete) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }

      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
        } else {
          // Email confirmation case
          setError("Please check your email to confirm your account.");
          setLoading(false);
          return;
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Hero Showcase */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden transition-colors duration-1000 ease-in-out bg-gradient-to-br text-white p-12 flex-col justify-between">
        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${slides[currentSlide].color}`}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale"></div>

        <div className="relative z-10 font-bold text-2xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <FaUserMd />
          </div>
          MedAssist
        </div>

        {/* Floating Cards Animation */}
        <div className="absolute inset-0 z-0">
          <StatusCard
            icon={<FaMicroscope />}
            title="Analysis Status"
            value="Processing..."
            color="bg-amber-500"
            delay={0.2}
          />
          <StatusCard
            icon={<FaCheckCircle />}
            title="Groq AI"
            value="98.4% Accuracy"
            color="bg-emerald-500"
            delay={1.5}
          />
        </div>

        <div className="relative z-10 mb-12">
          <FeatureSlide
            active={true}
            title={slides[currentSlide].title}
            subtitle={slides[currentSlide].subtitle}
            color={slides[currentSlide].accent}
          />

          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-slate-500">
              {mode === "login"
                ? "Enter your credentials to access your patient dashboard."
                : "Join thousands of patients using AI for better health outcomes."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex relative">
            <motion.div
              className="absolute bg-white shadow-sm rounded-lg h-[calc(100%-8px)] top-1 bottom-1"
              initial={false}
              animate={{
                x: mode === "login" ? 0 : "100%",
                width: "50%"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium z-10 transition-colors relative ${mode === "login" ? "text-slate-900" : "text-slate-500"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium z-10 transition-colors relative ${mode === "signup" ? "text-slate-900" : "text-slate-500"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100"
                >
                  <span className="w-1 h-4 bg-red-400 rounded-full" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                      placeholder="Alex Smith"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                placeholder="alex@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                {mode === "login" && (
                  <a href="#" className="text-xs font-medium text-sky-600 hover:text-sky-700">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-medium shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600"
                }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-500">Or continue with</span></div>
            </div>

            <button type="button" className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
              <FaGoogle className="text-red-500" />
              <span>Google</span>
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-1.5 text-xs">
              <FaShieldAlt />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <FaLock />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
