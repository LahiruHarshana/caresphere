"use client";

import { motion } from "framer-motion";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-6">
              Cookie Policy
            </h1>
            <p className="text-gray-600">Last updated: April 27, 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
              <p className="text-gray-600">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="text-gray-600 mb-4">
                CareSphere uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                <li><strong>Performance cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Targeting cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Session Cookies</h3>
                <p className="text-gray-600">
                  These are temporary cookies that exist only during your browsing session. They are deleted when you close your browser.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Persistent Cookies</h3>
                <p className="text-gray-600">
                  These remain on your device for a specified period even after you close your browser. They help us remember your preferences on return visits.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Third-Party Cookies</h3>
                <p className="text-gray-600">
                  Some cookies are placed by third-party services that appear on our site. We do not control these cookies.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-600 mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Browser settings - Most browsers allow you to refuse or accept cookies</li>
                <li>Cookie consent tool - You can update your preferences at any time</li>
                <li>Third-party opt-out - Visit opt-out pages for advertising networks</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Please note that blocking some cookies may impact your experience on our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about our Cookie Policy, please contact us at privacy@caresphere.com.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}