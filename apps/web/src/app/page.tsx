"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Users,
  Lock,
  MapPin,
  Video,
  PlayCircle,
  Heart,
  CheckCircle,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Users2,
} from "lucide-react";

const FloatingShape = ({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) => (
  <motion.div
    className={`floating-shape ${className}`}
    animate={{
      y: [0, -30, 0],
      rotate: [0, 10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const TestimonialCard = ({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) => (
  <motion.div
    whileHover={{ y: -12, rotateX: 2 }}
    className="testimonial-premium"
  >
    <div className="flex gap-1 mb-5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-accent fill-accent" : "text-gray-300"}`}
        />
      ))}
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 italic text-lg">&quot;{quote}&quot;</p>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary-500 to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
        {author.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-lg">{author}</p>
        <p className="text-sm text-gray-500 font-medium">{role}</p>
      </div>
    </div>
  </motion.div>
);

const LANDING_MEDIA = {
  careVideoEmbed: "https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1",
  matchingImage: "/media/images/landing-matching.jpg",
  familyImage: "/media/images/landing-family.jpg",
  featureThumb: "/media/images/feature-smart-matching.jpg",
  aboutImage: "/media/images/about-caregiver-senior.jpg",
};

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") router.push("/admin/analytics");
      else if (user.role === "CAREGIVER") router.push("/caregiver/dashboard");
      else router.push("/customer/dashboard");
    }
  }, [user, isLoading, router]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingShape className="w-96 h-96 bg-primary-200/30" delay={0} />
        <FloatingShape className="w-64 h-64 bg-accent-200/30" delay={2} />
        <FloatingShape className="w-48 h-48 bg-primary-300/20" delay={4} />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? "glass-effect shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.png" alt="CareSphere" className="h-12 w-auto" />
          </motion.div>

          <nav className="hidden md:flex items-center gap-10">
            {["Features", "How it Works", "About"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="nav-link text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link href="/register?role=CUSTOMER">
              <Button className="btn-primary h-11 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-grow pt-20 relative z-10">
{/* Hero Section */}
  <section
    ref={heroRef}
    className="relative min-h-screen flex items-center overflow-hidden aurora-bg"
  >
    {/* Dynamic Gradient Orbs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)",
          filter: "blur(60px)"
        }}
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)",
          filter: "blur(60px)"
        }}
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)",
          filter: "blur(50px)"
        }}
      />
    </div>

    <motion.div
      style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      className="container mx-auto px-6 py-20 lg:py-32 relative z-10"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-primary-100 shadow-lg shadow-primary/10 mb-10 pulse-ring"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          <span className="text-sm font-bold text-primary">
            Trusted by <span className="text-accent">10,000+</span> Families
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold text-gray-900 mb-10 leading-[1.05] tracking-tight font-heading"
        >
          Professional Care,{" "}
          <motion.span
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="gradient-text bg-clip-text text-transparent relative"
            style={{ backgroundSize: "200% 200%" }}
          >
            Simplified
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl lg:text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed"
        >
          The modern platform connecting families with vetted, compassionate caregivers.
          Experience peace of mind with{" "}
          <motion.span
            className="text-primary font-bold relative"
            whileHover={{ scale: 1.05 }}
          >
            smart matching
          </motion.span>{" "}
          and real-time care tracking.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/register?role=CUSTOMER">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="btn-glow w-full sm:w-auto h-16 px-12 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
            >
              Find a Caregiver
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </Link>
          <Link href="/register?role=CAREGIVER">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="btn-soft w-full sm:w-auto h-16 px-12 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
            >
              Become a Caregiver
              <Users2 className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: Shield, text: "Background Checked" },
            { icon: Award, text: "Insured & Bonded" },
            { icon: Clock, text: "24/7 Support" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary-100"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-md shadow-primary/20">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-700">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>

    {/* Scroll Indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-9 h-14 rounded-full border-2 border-primary/30 flex items-start justify-center p-2.5 bg-white/20 backdrop-blur-sm"
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-1.5 h-3.5 bg-gradient-to-b from-primary to-primary-600 rounded-full"
        />
      </motion.div>
    </motion.div>
  </section>

{/* Stats Section */}
  <section ref={statsRef} className="py-24 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
      />
    </div>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={statsInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-6 relative z-10"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[
          { target: 10000, suffix: "+", label: "Happy Families" },
          { target: 5000, suffix: "+", label: "Vetted Caregivers" },
          { target: 98, suffix: "%", label: "Satisfaction Rate" },
          { target: 24, suffix: "/7", label: "Support Available" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 40 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            whileHover={{ scale: 1.05, y: -8 }}
            className="stat-card-modern"
          >
            <div className="text-4xl lg:text-5xl font-extrabold font-heading gradient-text mb-3">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
            </div>
            <p className="text-gray-600 font-semibold text-lg">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>

{/* How It Works Section */}
  <section id="how-it-works" className="py-28 bg-gradient-to-b from-gray-50/50 to-white relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
        filter: "blur(60px)"
      }}
    />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20"
      style={{
        background: "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
        filter: "blur(60px)"
      }}
    />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <span className="section-label section-label-teal">
          <PlayCircle className="w-5 h-5" />
          How It Works
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
          See How Care Starts in
          <span className="gradient-text"> Minutes</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          From discovery to first visit, CareSphere keeps every step clear, safe, and
          personal.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-3 rounded-3xl overflow-hidden bg-gray-900 relative shadow-soft-2xl"
        >
          <iframe
            src={LANDING_MEDIA.careVideoEmbed}
            title="CareSphere Platform Video"
            className="w-full h-full min-h-[400px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-white font-bold text-2xl mb-1">Real caregivers. Real moments.</p>
              <p className="text-white/80 text-base">
                Interview, match, and book with confidence.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2.5 text-white text-sm font-semibold">
              <PlayCircle className="w-5 h-5" />
              Live Preview
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-white border border-gray-100 shadow-soft-xl p-6 hover:shadow-soft-2xl transition-all duration-500"
          >
            <div className="rounded-2xl overflow-hidden mb-5">
              <img
                src={LANDING_MEDIA.familyImage}
                alt="Family meeting a professional caregiver"
                className="w-full h-44 object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Personalized Matching</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We pair families with caregivers based on care type, schedule, language,
              and personality fit.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-white border border-gray-100 shadow-soft-xl p-8 hover:shadow-soft-2xl transition-all duration-500"
          >
            <ul className="space-y-5">
              {[
                "Post your care needs in under 2 minutes",
                "Compare verified caregivers with real reviews",
                "Start with chat or a secure video introduction",
              ].map((item, i) => (
                <li key={item} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>

{/* Features Section */}
  <section id="features" className="py-28 bg-gradient-to-b from-white via-primary-50/20 to-white relative overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
      style={{
        background: "radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)",
        filter: "blur(80px)"
      }}
    />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <span className="section-label section-label-violet">
          <Sparkles className="w-5 h-5" />
          Features
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
          Built for{" "}
          <span className="gradient-text">Security</span> and{" "}
          <span className="gradient-text-accent">Trust</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Everything you need to manage care with confidence, from intelligent matching to
          secure payments.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: Users,
            title: "Smart Matching",
            description: "Our AI-powered matching system finds the perfect caregiver based on medical needs, personality, and location.",
            gradient: "from-primary to-primary-600",
            bgGradient: "from-primary-50 to-primary-100",
          },
          {
            icon: Lock,
            title: "Secure Vault",
            description: "Securely store and share medical records, care instructions, and emergency contacts with your care team.",
            gradient: "from-violet to-violet-600",
            bgGradient: "from-violet-50 to-violet-100",
          },
          {
            icon: MapPin,
            title: "Live Tracking",
            description: "Real-time GPS tracking and check-in notifications keep you updated on your loved one's status.",
            gradient: "from-accent-400 to-accent-500",
            bgGradient: "from-amber-50 to-amber-100",
          },
          {
            icon: Video,
            title: "Video Interviews",
            description: "Meet and screen potential caregivers through our integrated, secure high-definition video platform.",
            gradient: "from-primary-500 to-primary-400",
            bgGradient: "from-teal-50 to-teal-100",
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
            whileHover={{ y: -10, scale: 1.03 }}
            className="feature-card group"
          >
            <div className="feature-card-icon bg-gradient-to-br mb-6 shadow-lg group-hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, var(--${feature.gradient.includes('primary') ? 'primary' : feature.gradient.includes('violet') ? 'violet' : feature.gradient.includes('accent') ? 'accent' : 'primary'}), var(--${feature.gradient.includes('600') ? 'primary-600' : 'primary-500'}))`
              }}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

{/* Testimonials Section */}
  <section className="py-28 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
        filter: "blur(60px)"
      }}
    />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <span className="section-label section-label-amber">
          <Heart className="w-5 h-5" />
          Testimonials
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
          Loved by{" "}
          <span className="gradient-text">Families</span> Everywhere
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Hear from families and caregivers who have experienced the CareSphere difference.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            quote: "Finding the right care for my mother was a daunting task until we found CareSphere. The matching was perfect!",
            author: "Sarah Johnson",
            role: "Customer since 2024",
            rating: 5
          },
          {
            quote: "As a caregiver, this platform has connected me with wonderful families. The support and tools are exceptional.",
            author: "Maria Santos",
            role: "Caregiver since 2023",
            rating: 5
          },
          {
            quote: "The live tracking feature gives me such peace of mind. I can see exactly when the caregiver arrives and leaves.",
            author: "David Chen",
            role: "Customer since 2024",
            rating: 5
          },
        ].map((testimonial, i) => (
          <motion.div
            key={testimonial.author}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
            whileHover={{ y: -12, rotateX: 2 }}
            className="testimonial-premium"
          >
            <div className="flex gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < testimonial.rating ? "text-accent fill-accent" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6 italic text-lg">&quot;{testimonial.quote}&quot;</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary-500 to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{testimonial.author}</p>
                <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

{/* Trust Section */}
  <section id="about" className="py-28 bg-white relative overflow-hidden">
    <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-10"
      style={{
        background: "radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)",
        filter: "blur(80px)"
      }}
    />
    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2"
        >
          <span className="section-label section-label-teal mb-6">
            <Shield className="w-5 h-5" />
            Why Choose Us
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-10 font-heading leading-tight">
            Why Choose{" "}
            <span className="gradient-text">CareSphere</span>?
          </h2>
          <div className="space-y-8">
            {[
              {
                icon: Shield,
                title: "Background Checked",
                desc: "Every caregiver undergoes a rigorous 5-point background and identity verification.",
                gradient: "from-primary to-primary-600",
              },
              {
                icon: Award,
                title: "Insured & Bonded",
                desc: "All bookings through our platform are protected by our comprehensive insurance policy.",
                gradient: "from-violet to-violet-600",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Our dedicated care coordinators are available around the clock to assist you.",
                gradient: "from-accent-400 to-accent-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ x: 12 }}
                className="flex gap-6 group cursor-pointer"
              >
                <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                  <item.icon className="text-white w-8 h-8" />
                </div>
                <div className="pt-2">
                  <h4 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 relative"
        >
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.03, rotate: 0.5 }}
              transition={{ duration: 0.4 }}
              className="aspect-square rounded-[3rem] overflow-hidden shadow-soft-2xl relative"
            >
              <img
                src={LANDING_MEDIA.aboutImage}
                alt="Professional caregiver with senior patient"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/15" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-soft-2xl border border-gray-100 max-w-[300px] transition-all duration-500"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-base font-medium text-gray-700 italic mb-4 leading-relaxed">
                &quot;Finding the right care for my mother was a daunting task until we found
                CareSphere.&quot;
              </p>
              <p className="text-sm font-bold text-primary">Sarah J., Customer</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-soft-2xl border border-gray-100 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Verified</p>
                  <p className="text-sm text-gray-500">Caregivers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="absolute top-1/2 -right-8 bg-white p-4 rounded-2xl shadow-soft-2xl border border-gray-100 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">4.9/5</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>

{/* CTA Section */}
  <section className="py-32 cta-section relative overflow-hidden">
    <motion.div
      className="absolute inset-0 opacity-30"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      style={{
        backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
        backgroundSize: "100% 100%",
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-6 text-center relative z-10"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-4xl lg:text-6xl font-extrabold text-white mb-8 font-heading leading-tight"
      >
        Ready to find the{" "}
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative inline-block"
        >
          <span className="relative z-10">perfect care</span>
        </motion.span>
        ?
      </motion.h2>
      <p className="text-xl lg:text-2xl text-primary-100 mb-14 max-w-2xl mx-auto leading-relaxed">
        Join thousands of families who trust CareSphere for their caregiving needs.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/register?role=CUSTOMER">
          <motion.button
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto h-16 px-12 text-lg font-bold bg-white text-primary rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:shadow-3xl transition-all duration-500"
          >
            Start Your Search
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </Link>
        <Link href="/register?role=CAREGIVER">
          <motion.button
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto h-16 px-12 text-lg font-bold border-2 border-white/80 text-white rounded-2xl hover:bg-white/15 flex items-center justify-center gap-3 backdrop-blur-sm transition-all duration-500"
          >
            Join as a Caregiver
            <Users2 className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  </section>
      </main>

{/* Footer */}
    <footer className="footer-modern text-gray-300 py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="CareSphere" className="h-12 w-auto" />
            </div>
            <p className="max-w-sm text-gray-400 leading-relaxed mb-8 text-lg">
              Connecting families with vetted, compassionate caregivers through technology and
              trust. Our mission is to simplify professional care for everyone.
            </p>
            <div className="flex gap-4">
              {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.15, y: -4, backgroundColor: "rgb(20, 184, 166)" }}
                  className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-sm uppercase font-bold">{social.charAt(0)}</span>
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-4">
              {["Find Care", "Become a Caregiver", "Trust & Safety", "Pricing", "FAQs"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-primary hover:translate-x-2 transition-all inline-block font-medium"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4">
              {["About Us", "Careers", "Blog", "Press", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="hover:text-primary hover:translate-x-2 transition-all inline-block font-medium"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="hover:text-primary hover:translate-x-2 transition-all inline-block font-medium"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-gradient mb-8" />
        
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">© {new Date().getFullYear()} CareSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
            <span className="text-gray-400 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}