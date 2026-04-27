"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      {
        q: "How do I sign up for CareSphere?",
        a: "Simply click the 'Get Started' button and choose whether you're looking for care or want to become a caregiver. Fill in your details, verify your email, and you're ready to go!"
      },
      {
        q: "Is CareSphere free to use?",
        a: "Families can sign up for free and browse caregivers. Premium features require a subscription. Caregivers can join for free and upgrade to Pro for enhanced features."
      },
      {
        q: "How long does the verification process take?",
        a: "The verification process typically takes 24-48 hours. This includes background checks, identity verification, and reference validation."
      }
    ]
  },
  {
    title: "For Families",
    questions: [
      {
        q: "How do I find the right caregiver?",
        a: "Use our search and filtering options to find caregivers based on location, experience, specialties, and availability. Read reviews and profiles to make an informed decision."
      },
      {
        q: "What types of care are available?",
        a: "We offer elderly care, child care, special needs care, post-surgery care, respite care, and companion care. Each caregiver specifies their expertise and experience."
      },
      {
        q: "How does pricing work?",
        a: "Caregivers set their own hourly rates. You only pay for the hours booked. Premium plans offer additional features and benefits."
      },
      {
        q: "Can I meet the caregiver before booking?",
        a: "Yes! You can message caregivers through our platform to ask questions and discuss your needs before making a commitment."
      }
    ]
  },
  {
    title: "For Caregivers",
    questions: [
      {
        q: "How do I get paid?",
        a: "Payments are processed automatically after each booking is completed. You can choose between instant payouts or weekly transfers to your bank account."
      },
      {
        q: "What if a family cancels last minute?",
        a: "Our cancellation policy protects caregivers. If a family cancels within 24 hours of a booking, they may be charged a cancellation fee."
      },
      {
        q: "Can I set my own schedule?",
        a: "Absolutely! You have full control over your availability. Set your own hours and only accept bookings that fit your schedule."
      }
    ]
  },
  {
    title: "Safety & Trust",
    questions: [
      {
        q: "How do you verify caregivers?",
        a: "We perform comprehensive background checks including criminal records, identity verification, and reference checks. All caregivers must pass our verification process."
      },
      {
        q: "What should I do if I feel unsafe?",
        a: "Your safety is paramount. If you ever feel uncomfortable, end the session immediately and contact our support team. We take all reports seriously."
      },
      {
        q: "Is my information secure?",
        a: "Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties."
      }
    ]
  }
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about CareSphere.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          {faqCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h2>
              <div className="space-y-4">
                {category.questions.map((item, qIndex) => {
                  const index = catIndex * 10 + qIndex;
                  return (
                    <div
                      key={qIndex}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        {openIndex === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {openIndex === index && (
                        <div className="px-6 pb-4 text-gray-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-8">Can't find what you're looking for? Contact our support team.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}