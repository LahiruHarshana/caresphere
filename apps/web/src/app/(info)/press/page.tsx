"use client";

import { motion } from "framer-motion";
import { Newspaper, Mail, ArrowRight } from "lucide-react";

const pressReleases = [
  {
    title: "CareSphere Raises $10M in Series A Funding",
    date: "April 15, 2026",
    excerpt: "Leading caregiving platform secures funding to expand services nationwide.",
    category: "Funding News"
  },
  {
    title: "CareSphere Launches AI-Powered Care Matching",
    date: "March 20, 2026",
    excerpt: "New algorithm helps families find the perfect caregiver faster than ever.",
    category: "Product News"
  },
  {
    title: "CareSphere Reaches 10,000 Active Caregivers",
    date: "February 10, 2026",
    excerpt: "Milestone marks platform's rapid growth in the caregiving industry.",
    category: "Company News"
  },
  {
    title: "CareSphere Partners with National Caregiver Association",
    date: "January 25, 2026",
    excerpt: "Strategic partnership aims to improve caregiver training and certification.",
    category: "Partnerships"
  }
];

const mediaCoverage = [
  {
    outlet: "TechCrunch",
    title: "This startup is making it easier to find trusted caregivers",
    date: "April 10, 2026"
  },
  {
    outlet: "Forbes",
    title: "The Future of Home Care: How CareSphere is Changing the Game",
    date: "March 15, 2026"
  },
  {
    outlet: "Business Insider",
    title: "CareSphere's mission to solve the caregiving crisis",
    date: "February 28, 2026"
  },
  {
    outlet: "The Wall Street Journal",
    title: "Startups vie to modernize the $100B home care market",
    date: "January 20, 2026"
  }
];

export default function PressPage() {
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
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Latest news, press releases, and media coverage about CareSphere.
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Press Releases</h2>
          </motion.div>

          <div className="space-y-6 max-w-3xl mx-auto">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-teal-600 text-sm mb-2">
                  <span className="px-2 py-1 bg-teal-100 rounded-full text-xs font-medium">{release.category}</span>
                  <span className="text-gray-500">{release.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                <p className="text-gray-600">{release.excerpt}</p>
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
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Media Coverage</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mediaCoverage.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-xl border border-gray-200"
              >
                <span className="text-teal-600 font-bold text-sm">{item.outlet}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{item.title}</h3>
                <span className="text-gray-500 text-sm">{item.date}</span>
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
            <Newspaper className="w-12 h-12 text-teal-600 mx-auto mb-6" />
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Media Inquiries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              For press inquiries, interview requests, or media assets, please contact our PR team.
            </p>
            <a href="mailto:press@caresphere.com" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              <Mail className="w-5 h-5" />
              Contact Press Team
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">Brand Assets</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Download our brand guidelines, logos, and high-resolution images.
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Download Brand Kit
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}