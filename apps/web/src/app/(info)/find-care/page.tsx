"use client";

import { motion } from "framer-motion";
import { Shield, Search, Star, Clock, Heart, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Shield,
    title: "Vetted Caregivers",
    description: "Every caregiver passes our rigorous background checks and verification process."
  },
  {
    icon: Search,
    title: "Smart Matching",
    description: "Our algorithm matches you with caregivers based on your specific needs and preferences."
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book care for a few hours, days, or on a recurring schedule that works for you."
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Get matched with caregivers who have the right skills and experience for your situation."
  }
];

const careTypes = [
  { title: "Elderly Care", description: "Companionship, medication reminders, and daily living assistance" },
  { title: "Child Care", description: "Qualified babysitters and nannies for children of all ages" },
  { title: "Special Needs", description: "Trained caregivers for individuals with special requirements" },
  { title: "Post-Surgery Care", description: "Professional support during recovery and rehabilitation" },
  { title: "Respite Care", description: "Temporary relief for family caregivers" },
  { title: "Companion Care", description: "Social interaction and emotional support" }
];

export default function FindCarePage() {
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
              Find Trusted Care for Your Loved Ones
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with vetted, compassionate caregivers in your area. Quality care starts here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register?role=CUSTOMER">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/caregivers">
                <Button variant="outline" size="lg">
                  Browse Caregivers
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Why Families Choose CareSphere</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make finding quality care simple, safe, and reliable.
            </p>
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Types of Care Available</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the right type of care for your unique needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careTypes.map((care, index) => (
              <motion.div
                key={care.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{care.title}</h3>
                <p className="text-gray-600">{care.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">Ready to Find Your Perfect Caregiver?</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust CareSphere for their caregiving needs.
          </p>
          <Link href="/register?role=CUSTOMER">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}