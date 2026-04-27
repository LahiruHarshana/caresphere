"use client";

import { motion } from "framer-motion";

export default function GDPRPage() {
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
              GDPR Compliance
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600">
                The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy. CareSphere is committed to complying with GDPR requirements for all users in the European Economic Area (EEA).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Basis for Processing</h2>
              <p className="text-gray-600 mb-4">
                We process your personal data based on the following legal bases:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Consent:</strong> Where you have given explicit consent for processing</li>
                <li><strong>Contract:</strong> Where processing is necessary for the performance of a contract</li>
                <li><strong>Legitimate Interest:</strong> Where we have a legitimate business interest</li>
                <li><strong>Legal Obligation:</strong> Where processing is required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Data Subject Rights</h2>
              <p className="text-gray-600 mb-4">
                Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> You can correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> You can limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> You can receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> You can object to certain processing activities</li>
                <li><strong>Rights Related to Automated Decision-Making:</strong> You can contest automated decisions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect and process the following categories of personal data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Identity data (name, username)</li>
                <li>Contact data (email, phone, address)</li>
                <li>Technical data (IP address, browser information)</li>
                <li>Usage data (how you use our platform)</li>
                <li>Profile data (preferences, feedback)</li>
                <li>Transaction data (payment information)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600">
                We will retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Transfers</h2>
              <p className="text-gray-600">
                When we transfer personal data outside the EEA, we ensure appropriate safeguards are in place, such as standard contractual clauses approved by the European Commission, to protect your data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Officer</h2>
              <p className="text-gray-600">
                We have appointed a Data Protection Officer (DPO) who is responsible for overseeing questions in relation to this policy. If you have any questions, please contact our DPO at dpo@caresphere.com.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaints</h2>
              <p className="text-gray-600">
                You have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal data violates GDPR. You can contact the supervisory authority in your country of residence.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                For questions about our GDPR compliance or to exercise your data subject rights, please contact us at dpo@caresphere.com or visit our Contact page.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}