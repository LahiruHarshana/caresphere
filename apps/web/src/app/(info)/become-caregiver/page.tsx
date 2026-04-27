"use client";

import { motion } from "framer-motion";
import { DollarSign, Clock, Shield, Users, ArrowRight, CheckCircle, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: DollarSign, title: "Competitive Earnings", description: "Set your own rates and keep 100% of what you earn" },
  { icon: Clock, title: "Flexible Schedule", description: "Work when you want, on your own terms" },
  { icon: Shield, title: "Secure Payments", description: "Guaranteed payments with our secure platform" },
  { icon: Users, title: "Steady Clients", description: "Get matched with families who need your skills" }
];

const requirements = [
  "Must be 18 years or older",
  "Pass background check and verification",
  "Complete onboarding training",
  "Have relevant caregiving experience",
  "Provide references from previous work",
  "Own a smartphone with internet access"
];

const steps = [
  { number: "1", title: "Create Your Profile", description: "Sign up and complete your caregiver profile with your experience and skills." },
  { number: "2", title: "Verify Your Identity", description: "Complete our background check and verification process." },
  { number: "3", title: "Get Matched", description: "Our platform matches you with families that fit your expertise and availability." },
  { number: "4", title: "Start Earning", description: "Begin providing care and building your reputation on our platform." }
];

export default function BecomeCaregiverPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-6">
              Join Our Network of Caring Professionals
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Turn your passion for caregiving into a rewarding career. Connect with families who need your skills.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register?role=CAREGIVER">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Why Caregivers Love CareSphere</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Requirements to Join</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {requirements.map((req, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 py-3 border-b border-gray-100"
              >
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-gray-700">{req}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">Start Your Caregiving Journey Today</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join our community of compassionate caregivers and make a difference in families&apos; lives.
          </p>
          <Link href="/register?role=CAREGIVER">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}