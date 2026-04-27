"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-gray-600">Last updated: April 27, 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-lg max-w-none">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600">
                  By accessing and using CareSphere, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using CareSphere&apos;s services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600">
                  CareSphere provides an online platform connecting families seeking care services with independent caregiver providers. We act as an intermediary and do not provide care services ourselves. The actual care services are provided by independent caregivers who are not employees of CareSphere.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-600 mb-4">
                  To use our services, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update any changes to your information</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Be at least 18 years of age to use our services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Caregiver Verification</h2>
                <p className="text-gray-600">
                  CareSphere performs background checks and verification procedures on caregivers. However, we cannot guarantee the accuracy or completeness of this information. Families should conduct their own due diligence before hiring a caregiver.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Booking and Payment</h2>
                <p className="text-gray-600 mb-4">
                  When you book a caregiver through our platform:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>You agree to pay the specified rate for the care services</li>
                  <li>Payment is processed through our secure payment system</li>
                  <li>Cancellation policies apply as specified in each booking</li>
                  <li>Refunds are subject to our refund policy</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Conduct</h2>
                <p className="text-gray-600 mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Upload or transmit viruses or other harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Engage in any activity that interferes with the proper functioning of the service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-600">
                  CareSphere is not liable for any damages arising from the care services provided by caregivers or any interactions between families and caregivers. Users assume all risks associated with using the platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                <p className="text-gray-600">
                  The content, design, and functionality of CareSphere are protected by copyright and other intellectual property laws. You may not copy, modify, or distribute our intellectual property without our written consent.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-600">
                  We reserve the right to terminate your account and access to our services at any time, for any reason, without notice. Upon termination, you must cease all use of the platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
                <p className="text-gray-600">
                  We may modify these terms at any time. Your continued use of the platform after any modifications indicates your acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-600">
                  For questions about these Terms of Service, please contact us at legal@caresphere.com.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}