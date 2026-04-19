"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Users,
  Lock,
  MapPin,
  Video,
  Heart,
  CheckCircle,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Users2,
  HeartHandshake,
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

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
  accentColor = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  accentColor?: "primary" | "accent";
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-soft-xl cursor-pointer overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        layoutId={`feature-bg-${index}`}
      />

      <div
        className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
          accentColor === "primary"
            ? "bg-gradient-to-br from-primary-500 to-primary-600 group-hover:scale-110 group-hover:rotate-6"
            : "bg-gradient-to-br from-accent-400 to-accent-500 group-hover:scale-110 group-hover:-rotate-6"
        }`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-4 font-heading group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="relative z-10 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
        {description}
      </p>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
      />
    </motion.div>
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
    whileHover={{ y: -8, rotateY: 2 }}
    className="p-8 rounded-3xl bg-white border border-gray-100 shadow-soft-xl"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-accent fill-accent" : "text-gray-200"}`}
        />
      ))}
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 italic">&quot;{quote}&quot;</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
        {author.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

export default function LandingPage() {
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
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-heading">
              CareSphere
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-10">
            {["Features", "How it Works", "About", "Pricing"].map((item, i) => (
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
          className="relative min-h-screen flex items-center overflow-hidden layered-bg"
        >
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="container mx-auto px-6 py-20 lg:py-32"
          >
            <div className="max-w-5xl mx-auto text-center">
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-primary-100 shadow-lg mb-8 badge-pulse"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold text-primary">
                  Trusted by <span className="text-accent">10,000+</span> Families
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight font-heading"
              >
                Professional Care,{" "}
                <motion.span
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="gradient-text bg-clip-text text-transparent"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Simplified
                </motion.span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                The modern platform connecting families with vetted, compassionate caregivers.
                Experience peace of mind with{" "}
                <motion.span
                  className="text-primary font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  smart matching
                </motion.span>{" "}
                and real-time care tracking.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-5 justify-center"
              >
                <Link href="/register?role=CUSTOMER">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    Find a Caregiver
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </Link>
                <Link href="/register?role=CAREGIVER">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl shadow-lg border-2 border-gray-200 bg-white flex items-center justify-center gap-3"
                  >
                    Become a Caregiver
                    <Users2 className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500"
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
                    transition={{ delay: 1 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 cursor-glow px-4 py-2 rounded-full"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.text}</span>
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
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-12 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20 bg-white relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-6"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {[
                { target: 10000, suffix: "+", label: "Happy Families" },
                { target: 5000, suffix: "+", label: "Vetted Caregivers" },
                { target: 98, suffix: "%", label: "Satisfaction Rate" },
                { target: 24, suffix: "/7", label: "Support Available" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 rounded-3xl bg-gray-50/50 hover:bg-primary-50/50 transition-colors"
                >
                  <div className="text-4xl lg:text-5xl font-extrabold font-heading gradient-text mb-2">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gradient-to-b from-white to-primary-50/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100 text-accent-600 text-sm font-bold uppercase tracking-wider mb-6"
              >
                Features
              </motion.span>
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
              <FeatureCard
                icon={Users}
                title="Smart Matching"
                description="Our AI-powered matching system finds the perfect caregiver based on medical needs, personality, and location."
                index={0}
                accentColor="primary"
              />
              <FeatureCard
                icon={Lock}
                title="Secure Vault"
                description="Securely store and share medical records, care instructions, and emergency contacts with your care team."
                index={1}
                accentColor="accent"
              />
              <FeatureCard
                icon={MapPin}
                title="Live Tracking"
                description="Real-time GPS tracking and check-in notifications keep you updated on your loved one's status."
                index={2}
                accentColor="primary"
              />
              <FeatureCard
                icon={Video}
                title="Video Interviews"
                description="Meet and screen potential caregivers through our integrated, secure high-definition video platform."
                index={3}
                accentColor="accent"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 text-sm font-bold uppercase tracking-wider mb-6">
                How It Works
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
                Three Simple Steps to{" "}
                <span className="gradient-text">Quality Care</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: "01",
                  title: "Create Your Profile",
                  description:
                    "Tell us about your care needs, schedule, and preferences. Our smart system uses this to find the perfect matches.",
                  icon: HeartHandshake,
                },
                {
                  step: "02",
                  title: "Match & Meet",
                  description:
                    "Browse curated caregiver profiles, read reviews, and conduct video interviews to find your ideal match.",
                  icon: Users2,
                },
                {
                  step: "03",
                  title: "Start Care",
                  description:
                    "Once you've found the right caregiver, schedule services and enjoy peace of mind with real-time updates.",
                  icon: Heart,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-soft-xl group"
                >
                  <motion.div
                    className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {item.step}
                  </motion.div>
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <item.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-primary-50/30 to-accent-50/20 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100 text-accent-600 text-sm font-bold uppercase tracking-wider mb-6">
                Testimonials
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
                Loved by{" "}
                <span className="gradient-text">Families</span> Everywhere
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Finding the right care for my mother was a daunting task until we found CareSphere. The matching was perfect!"
                author="Sarah Johnson"
                role="Customer since 2024"
                rating={5}
              />
              <TestimonialCard
                quote="As a caregiver, this platform has connected me with wonderful families. The support and tools are exceptional."
                author="Maria Santos"
                role="Caregiver since 2023"
                rating={5}
              />
              <TestimonialCard
                quote="The live tracking feature gives me such peace of mind. I can see exactly when the caregiver arrives and leaves."
                author="David Chen"
                role="Customer since 2024"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="about" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:w-1/2"
              >
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 font-heading">
                  Why Choose{" "}
                  <span className="gradient-text">CareSphere</span>?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      icon: Shield,
                      title: "Background Checked",
                      desc: "Every caregiver undergoes a rigorous 5-point background and identity verification.",
                    },
                    {
                      icon: Award,
                      title: "Insured & Bonded",
                      desc: "All bookings through our platform are protected by our comprehensive insurance policy.",
                    },
                    {
                      icon: Clock,
                      title: "24/7 Support",
                      desc: "Our dedicated care coordinators are available around the clock to assist you.",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                      whileHover={{ x: 10 }}
                      className="flex gap-5 group cursor-pointer"
                    >
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <item.icon className="text-white w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
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
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden shadow-soft-2xl"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center"
                      >
                        <Heart className="w-24 h-24 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-soft-2xl border border-gray-100 max-w-[280px]"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-700 italic mb-4">
                      &quot;Finding the right care for my mother was a daunting task until we found
                      CareSphere.&quot;
                    </p>
                    <p className="text-sm font-bold text-primary">Sarah J., Customer</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-white to-primary-50/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 text-sm font-bold uppercase tracking-wider mb-6">
                Pricing
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading">
                Simple,{" "}
                <span className="gradient-text">Transparent</span> Pricing
              </h2>
              <p className="text-lg text-gray-600">
                No hidden fees. Pay only for the care you need.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Basic",
                  price: "0",
                  desc: "For families exploring care options",
                  features: [
                    "Create family profile",
                    "Browse caregiver listings",
                    "Video interview requests",
                    "Basic messaging",
                  ],
                  popular: false,
                },
                {
                  title: "Premium",
                  price: "29",
                  desc: "Most popular for ongoing care",
                  features: [
                    "Everything in Basic",
                    "AI-powered smart matching",
                    "Unlimited video interviews",
                    "Live GPS tracking",
                    "Secure vault storage",
                    "Priority support",
                  ],
                  popular: true,
                },
                {
                  title: "Enterprise",
                  price: "Custom",
                  desc: "For agencies and facilities",
                  features: [
                    "Everything in Premium",
                    "Multiple family management",
                    "Advanced analytics",
                    "Custom integrations",
                    "Dedicated account manager",
                    "SLA guarantee",
                  ],
                  popular: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={plan.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`relative p-8 rounded-3xl ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary to-primary-600 text-white shadow-xl shadow-primary/30 scale-105"
                      : "bg-white border border-gray-100 shadow-soft-xl"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-sm font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.title}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? "text-primary-100" : "text-gray-500"}`}>
                    {plan.desc}
                  </p>
                  <div className="mb-8">
                    <span className={`text-5xl font-extrabold font-heading ${plan.popular ? "text-white" : "text-gray-900"}`}>
                      ${plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className={plan.popular ? "text-primary-100" : "text-gray-500"}>
                        /month
                      </span>
                    )}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${plan.popular ? "text-accent" : "text-primary"}`} />
                        <span className={plan.popular ? "text-primary-50" : "text-gray-600"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button
                      variant={plan.popular ? "outline" : "default"}
                      className={`w-full h-12 font-bold rounded-xl ${
                        plan.popular
                          ? "bg-white text-primary hover:bg-primary-50 border-0"
                          : "btn-primary"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)",
              backgroundSize: "100% 100%",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="container mx-auto px-6 text-center relative z-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-6xl font-extrabold text-white mb-6 font-heading"
            >
              Ready to find the{" "}
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                perfect care
              </motion.span>
              ?
            </motion.h2>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto">
              Join thousands of families who trust CareSphere for their caregiving needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/register?role=CUSTOMER">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto h-16 px-10 text-lg font-bold bg-white text-primary rounded-2xl shadow-xl flex items-center justify-center gap-3"
                >
                  Start Your Search
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/register?role=CAREGIVER">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto h-16 px-10 text-lg font-bold border-2 border-white text-white rounded-2xl hover:bg-white/10 flex items-center justify-center gap-3"
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
      <footer className="bg-gray-900 text-gray-400 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center">
                  <Heart className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight font-heading">
                  CareSphere
                </span>
              </div>
              <p className="max-w-sm text-gray-400 leading-relaxed mb-6">
                Connecting families with vetted, compassionate caregivers through technology and
                trust. Our mission is to simplify professional care for everyone.
              </p>
              <div className="flex gap-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ scale: 1.2, y: -3 }}
                    className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <span className="text-xs uppercase font-bold">{social.charAt(0)}</span>
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
                        className="hover:text-primary hover:translate-x-2 transition-all inline-block"
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
                      className="hover:text-primary hover:translate-x-2 transition-all inline-block"
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
                      className="hover:text-primary hover:translate-x-2 transition-all inline-block"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CareSphere Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}