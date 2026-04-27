"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Users, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description: "We believe that empathy and understanding are at the heart of quality care."
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Every interaction on our platform is built on a foundation of trust and security."
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster meaningful connections between families and caregivers."
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "We continuously improve our technology to deliver the best experience."
  }
];

const timeline = [
  { year: "2023", title: "Founded", description: "CareSphere was founded with a mission to revolutionize caregiving." },
  { year: "2024", title: "1,000 Caregivers", description: "Reached our first major milestone of 1,000 verified caregivers." },
  { year: "2024", title: "10,000 Families", description: "Helped over 10,000 families find quality care." },
  { year: "2025", title: "National Expansion", description: "Expanded services across the country." }
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <section className="page-hero py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="page-hero-label mb-6">
              About CareSphere
            </span>
            <h1 className="page-hero-title mb-6">
              We&apos;re on a mission to connect families with <span className="text-[#5eead4]">compassionate</span>, vetted caregivers
            </h1>
            <p className="page-hero-subtitle mx-auto">
              Join thousands of families who trust CareSphere for their caregiving needs.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-4xl text-white mb-6 tracking-tight">Our Story</h2>
              <div className="space-y-4 text-white/60 font-body leading-relaxed">
                <p>
                  CareSphere was founded in 2023 by a team of healthcare professionals and technology experts who recognized the growing need for reliable, compassionate caregiving services.
                </p>
                <p>
                  We saw families struggling to find trustworthy caregivers and qualified caregivers having difficulty connecting with families who needed them. Our solution was simple: create a platform that makes finding quality care as easy as possible.
                </p>
                <p>
                  Today, we&apos;re proud to have helped thousands of families find the perfect caregiver and provided thousands of caregivers with meaningful work opportunities.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inner-card p-8"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="font-heading text-4xl text-[#5eead4] mb-2">10,000+</div>
                  <div className="text-white/40">Families Served</div>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl text-[#5eead4] mb-2">5,000+</div>
                  <div className="text-white/40">Caregivers</div>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl text-[#5eead4] mb-2">50+</div>
                  <div className="text-white/40">Cities</div>
                </div>
                <div className="text-center">
                  <div className="font-heading text-4xl text-[#5eead4] mb-2">4.9</div>
                  <div className="text-white/40">Average Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0f172a] relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-label section-label-light mb-4">
              Our Values
            </span>
            <h2 className="font-heading text-4xl text-white mb-4 tracking-tight">The principles that guide everything we do</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="inner-card p-6 group"
              >
                <div className="w-12 h-12 rounded-sm bg-[#0d9488]/10 flex items-center justify-center mb-4 group-hover:bg-[#0d9488]/20 transition-colors">
                  <value.icon className="w-6 h-6 text-[#5eead4]" />
                </div>
                <h3 className="font-heading text-xl text-white mb-2">{value.title}</h3>
                <p className="text-white/40 font-body text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-label section-label-light mb-4">
              Our Journey
            </span>
            <h2 className="font-heading text-4xl text-white tracking-tight">Milestones that define us</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 pb-8 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-[#0d9488] rounded-full" />
                  {index !== timeline.length - 1 && <div className="w-px h-full bg-white/10 mt-2" />}
                </div>
                <div className="pb-8">
                  <span className="text-[#5eead4] font-heading text-lg">{item.year}</span>
                  <h3 className="font-heading text-xl text-white mt-1">{item.title}</h3>
                  <p className="text-white/40 mt-2 font-body leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0d9488] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-8 text-center relative z-10"
        >
          <h2 className="font-heading text-4xl lg:text-5xl text-white mb-6 tracking-tight">Join Our Mission</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed font-body">
            Whether you&apos;re looking for care or want to become a caregiver, we&apos;re here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/find-care" className="px-6 py-3 bg-white text-[#0d9488] rounded-full font-body text-sm hover:bg-gray-100 transition-colors">
              Find Care
            </Link>
            <Link href="/become-caregiver" className="px-6 py-3 border-2 border-white text-white rounded-full font-body text-sm hover:bg-white/10 transition-colors">
              Become a Caregiver
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}