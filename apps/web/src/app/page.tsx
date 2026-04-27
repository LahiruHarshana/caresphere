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
  Award,
  Users2,
  Quote,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

const LANDING_MEDIA = {
  careVideoEmbed: "https://www.youtube-nocookie.com/embed/cR8JVwNa3bI?rel=0&modestbranding=1",
  matchingImage: "/media/images/landing-matching.jpg",
  familyImage: "/media/images/landing-family.jpg",
  featureThumb: "/media/images/feature-smart-matching.jpg",
  aboutImage: "/media/images/about-caregiver-senior.jpg",
};

const testimonials = [
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
];

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

const statsRef = useRef(null);
const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar isTransparent />

      <main className="flex-grow relative z-10">
{/* Hero Section */}
      <section
          ref={heroRef}
          className="relative min-h-screen flex items-center hero-dark overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(/landing-bg.png)` }}
          />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(13, 148, 136, 0.4) 0%, transparent 70%)",
                filter: "blur(80px)"
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-8 py-32 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                style={{ y: heroY, opacity: heroOpacity }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="section-label section-label-light mb-8"
                >
                  Trusted by 10,000+ Families
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="hero-headline mb-8"
                >
                  Professional Care, <span className="text-primary">Simplified</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="hero-subheadline mb-12"
                >
                  The modern platform connecting families with vetted, compassionate caregivers.
                  Experience peace of mind with smart matching and real-time care tracking.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <Link href="/register?role=CUSTOMER">
                    <Button variant="filled" className="btn-cta">
                      Find a Caregiver
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/register?role=CAREGIVER">
                    <Button variant="outline-light" className="btn-cta">
                      Become a Caregiver
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-16 flex flex-wrap gap-8"
                >
                  {[
                    { icon: Shield, text: "Background Checked" },
                    { icon: Award, text: "Insured & Bonded" },
                    { icon: Clock, text: "24/7 Support" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white/80 text-sm font-body">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="hidden lg:block"
              >
                <div className="glass-card rounded-sm p-8 relative">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-heading text-xl">Verified Caregivers</p>
                        <p className="text-white/60 text-sm font-body">5,000+ professionals</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Match Rate</span>
                        <span className="text-white font-heading text-2xl">98%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Avg Response Time</span>
                        <span className="text-white font-heading text-2xl">&lt;2h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Families Served</span>
                        <span className="text-white font-heading text-2xl">10k+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Mini-Nav */}
          <div className="absolute bottom-0 left-0 right-0 nav-mini py-4">
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-8">
              {["Elderly Care", "Child Care", "Special Needs", "Pet Care"].map((item, i, arr) => (
                <div key={item} className="flex items-center gap-8">
                  <span className="text-white/50 text-xs font-body uppercase tracking-wider">{item}</span>
                  {i < arr.length - 1 && <div className="w-px h-4 bg-white/20" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-32 bg-neutral-50 relative">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
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
                  className="stat-card bg-white"
                >
                  <div className="stat-card-number">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </div>
                  <p className="stat-card-label">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <span className="section-label">
                <PlayCircle className="w-4 h-4" />
                How It Works
              </span>
              <h2 className="font-heading text-4xl lg:text-5xl text-neutral mb-6 tracking-tight">
                See How Care Starts in Minutes
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-body">
                From discovery to first visit, CareSphere keeps every step clear, safe, and personal.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-3 rounded-sm overflow-hidden bg-neutral-900 relative"
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
                    <p className="text-white font-heading text-2xl mb-1">Real caregivers. Real moments.</p>
                    <p className="text-white/80 text-sm font-body">
                      Interview, match, and book with confidence.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2.5 text-white text-xs font-body uppercase tracking-wider">
                    <PlayCircle className="w-4 h-4" />
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
                  whileHover={{ y: -4 }}
                  className="rounded-sm bg-white border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="rounded-sm overflow-hidden mb-5 img-hover-zoom">
                    <img
                      src={LANDING_MEDIA.familyImage}
                      alt="Family meeting a professional caregiver"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-gray-900">Personalized Matching</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-body text-sm">
                    We pair families with caregivers based on care type, schedule, language,
                    and personality fit.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-sm bg-white border border-gray-100 p-8 hover:shadow-lg transition-all duration-300"
                >
                  <ul className="space-y-5">
                    {[
                      "Post your care needs in under 2 minutes",
                      "Compare verified caregivers with real reviews",
                      "Start with chat or a secure video introduction",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-gray-700 leading-relaxed font-body text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-neutral-50 relative">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <span className="section-label">
                Features
              </span>
              <h2 className="font-heading text-4xl lg:text-5xl text-neutral tracking-tight">
                Built for Security and Trust
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-body mt-6">
                Everything you need to manage care with confidence, from intelligent matching to secure payments.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  number: "01",
                  icon: Users,
                  title: "Smart Matching",
                  description: "Our AI-powered matching system finds the perfect caregiver based on medical needs, personality, and location.",
                },
                {
                  number: "02",
                  icon: Lock,
                  title: "Secure Vault",
                  description: "Securely store and share medical records, care instructions, and emergency contacts with your care team.",
                },
                {
                  number: "03",
                  icon: MapPin,
                  title: "Live Tracking",
                  description: "Real-time GPS tracking and check-in notifications keep you updated on your loved one's status.",
                },
                {
                  number: "04",
                  icon: Video,
                  title: "Video Interviews",
                  description: "Meet and screen potential caregivers through our integrated, secure high-definition video platform.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                  whileHover={{ y: -8 }}
                  className="feature-card group bg-white rounded-sm"
                >
                  <div className="feature-card-number">{feature.number}</div>
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4 mt-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-body">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <span className="section-label">
                <Heart className="w-4 h-4" />
                Testimonials
              </span>
              <h2 className="font-heading text-4xl lg:text-5xl text-neutral tracking-tight">
                Loved by Families Everywhere
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-body mt-6">
                Hear from families and caregivers who have experienced the CareSphere difference.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="testimonial-card bg-neutral-50 rounded-sm"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="testimonial-quote text-base mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="testimonial-avatar bg-primary">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="testimonial-name font-body">{testimonial.author}</p>
                      <p className="testimonial-role font-body">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="about" className="py-32 bg-neutral-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:w-1/2"
              >
                <span className="section-label mb-6">
                  <Shield className="w-4 h-4" />
                  Why Choose Us
                </span>
                <h2 className="font-heading text-4xl lg:text-5xl text-neutral tracking-tight mb-10 leading-tight">
                  Why Choose <span className="text-primary">CareSphere</span>?
                </h2>
                <div className="space-y-8">
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
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                      className="flex gap-6 group"
                    >
                      <div className="shrink-0 w-14 h-14 rounded-sm bg-primary flex items-center justify-center">
                        <item.icon className="text-white w-6 h-6" />
                      </div>
                      <div className="pt-1">
                        <h4 className="font-heading text-xl text-neutral mb-2">{item.title}</h4>
                        <p className="text-gray-600 leading-relaxed font-body">{item.desc}</p>
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
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-square rounded-sm overflow-hidden shadow-lg relative img-hover-zoom group"
                  >
                    <img
                      src={LANDING_MEDIA.aboutImage}
                      alt="Professional caregiver with senior patient"
                      className="w-full h-full object-cover grayscale-hover"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-8 -left-8 bg-white p-6 rounded-sm shadow-lg max-w-[280px]"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-body italic leading-relaxed mb-3">
                      &quot;Finding the right care for my mother was a daunting task until we found CareSphere.&quot;
                    </p>
                    <p className="text-sm font-body text-primary">Sarah J., Customer</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                    className="absolute -top-6 -right-6 bg-white p-5 rounded-sm shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-heading text-lg text-neutral">Verified</p>
                        <p className="text-xs text-gray-500 font-body">Caregivers</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    className="absolute top-1/2 -right-6 bg-white p-4 rounded-sm shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-heading text-lg text-neutral">4.9/5</p>
                        <p className="text-xs text-gray-500 font-body">Rating</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[120px]" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-8 text-center relative z-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl lg:text-6xl text-white mb-8 tracking-tight leading-tight"
            >
              Ready to find the perfect care?
            </motion.h2>
            <p className="text-xl text-white/80 mb-14 max-w-2xl mx-auto leading-relaxed font-body">
              Join thousands of families who trust CareSphere for their caregiving needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register?role=CUSTOMER">
                <Button variant="outline-light" className="btn-cta h-14 px-10 text-sm">
                  Start Your Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register?role=CAREGIVER">
                <Button variant="outline-light" className="btn-cta h-14 px-10 text-sm">
                  Join as a Caregiver
                  <Users2 className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}