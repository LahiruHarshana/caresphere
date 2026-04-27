"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

const benefits = [
  "Health Insurance",
  "Flexible Working Hours",
  "Remote Work Options",
  "Professional Development",
  "401(k) Matching",
  "Parental Leave",
  "Wellness Programs",
  "Team Building Events"
];

const positions = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "New York, NY",
    type: "Full-time"
  },
  {
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time"
  }
];

export default function CareersPage() {
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
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Help us transform the caregiving industry. We&apos;re looking for passionate people to join our mission.
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Why Work at CareSphere</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer competitive benefits and a supportive work environment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-xl text-center"
              >
                <span className="text-gray-700 font-medium">{benefit}</span>
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your next opportunity at CareSphere.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {positions.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {position.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  {position.type}
                </span>
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
            className="text-center"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Don&apos;t see the right role?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <a href="mailto:careers@caresphere.com" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Send Your Resume
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-4xl font-heading font-bold mb-6">Make a Difference</h2>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Join a team that&apos;s passionate about improving lives through quality caregiving.
          </p>
        </div>
      </section>
    </div>
  );
}