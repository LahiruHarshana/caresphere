"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle, Lock, Users, AlertTriangle, Phone, FileText } from "lucide-react";

const safeguards = [
  {
    icon: Shield,
    title: "Background Verification",
    description: "All caregivers undergo comprehensive background checks including criminal records, identity verification, and reference checks."
  },
  {
    icon: Users,
    title: "Identity Verification",
    description: "We verify the identity of every caregiver through government-issued ID verification and biometric checks."
  },
  {
    icon: CheckCircle,
    title: "Skills Certification",
    description: "Caregivers must provide proof of relevant certifications and undergo skills assessment before joining our platform."
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "All transactions are encrypted and processed securely. We never store your payment information on our servers."
  },
  {
    icon: AlertTriangle,
    title: "24/7 Monitoring",
    description: "Our team monitors the platform around the clock to detect and prevent any suspicious activity."
  },
  {
    icon: Phone,
    title: "Emergency Support",
    description: "Access to emergency support services whenever you need assistance during your care experience."
  }
];

const safeTips = [
  "Always meet in a public place for the first time",
  "Verify the caregiver's identity before the appointment",
  "Read reviews and ratings from other families",
  "Communicate clearly about your expectations",
  "Report any concerns to our support team immediately",
  "Trust your instincts - if something feels wrong, end the session"
];

export default function TrustSafetyPage() {
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
              Your Safety is Our Priority
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We&apos;ve implemented robust measures to ensure a safe and trustworthy experience for families and caregivers.
            </p>
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Our Safety Safeguards</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every measure we take is designed to protect you and your loved ones.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeguards.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Tips for a Safe Experience</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these guidelines to ensure a safe and positive caregiving experience.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
            {safeTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold mb-6">Have Concerns?</h2>
            <p className="text-xl text-teal-100 mb-8">
              If you ever feel unsafe or notice something suspicious, please contact our support team immediately.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/contact" className="px-6 py-3 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Contact Support
              </a>
              <a href="/faqs" className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}