"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const familyPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for families getting started",
    features: [
      "Create family profile",
      "Browse caregiver listings",
      "Book hourly care",
      "Chat with caregivers",
      "Basic customer support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    description: "Best for regular care needs",
    features: [
      "Everything in Basic",
      "Unlimited bookings",
      "Priority matching",
      "Verified caregiver reviews",
      "Care coordination tools",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For agencies and large families",
    features: [
      "Everything in Premium",
      "Dedicated care manager",
      "Custom reporting",
      "Multiple family accounts",
      "API access",
      "24/7 phone support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const caregiverPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Start building your care career",
    features: [
      "Create caregiver profile",
      "Accept bookings",
      "Basic messaging",
      "Standard payment processing"
    ],
    cta: "Join Free"
  },
  {
    name: "Pro",
    price: "15%",
    period: "service fee",
    description: "Maximize your earnings",
    features: [
      "Everything in Free",
      "Featured profile placement",
      "Advanced analytics",
      "Instant payouts",
      "Priority support"
    ],
    cta: "Upgrade to Pro"
  }
];

export default function PricingPage() {
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
              Pricing
            </span>
            <h1 className="page-hero-title mb-6">
              Simple, Transparent <span className="text-[#5eead4]">Pricing</span>
            </h1>
            <p className="page-hero-subtitle mx-auto">
              Choose the plan that fits your needs. No hidden fees, cancel anytime.
            </p>
          </motion.div>
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
              For Families
            </span>
            <h2 className="font-heading text-4xl text-white mb-4 tracking-tight">Find the perfect care solution</h2>
            <p className="text-white/40">Choose the plan that fits your needs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {familyPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-sm ${plan.popular ? 'bg-[#0d9488] text-white ring-4 ring-[#0d9488] ring-offset-4 ring-offset-[#0f172a]' : 'inner-card'}`}
              >
                {plan.popular && (
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                    MOST POPULAR
                  </span>
                )}
                <h3 className={`text-2xl font-heading mb-2 ${plan.popular ? 'text-white' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-heading ${plan.popular ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && <span className={`text-sm ${plan.popular ? 'text-teal-100' : 'text-white/40'}`}>{plan.period}</span>}
                </div>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-teal-100' : 'text-white/40'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-[#5eead4]'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-white' : 'text-white/60'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register?role=CUSTOMER">
                  <Button className={`w-full ${plan.popular ? 'bg-white text-[#0d9488] hover:bg-gray-100' : 'bg-[#0d9488] hover:bg-[#0f766e] text-white'}`}>
                    {plan.cta}
                  </Button>
                </Link>
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
              For Caregivers
            </span>
            <h2 className="font-heading text-4xl text-white mb-4 tracking-tight">Keep more of what you earn</h2>
            <p className="text-white/40">Start free, upgrade when you&apos;re ready</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {caregiverPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="inner-card p-8"
              >
                <h3 className="text-2xl font-heading text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-heading text-white">{plan.price}</span>
                  {plan.period && <span className="text-sm text-white/40">/{plan.period}</span>}
                </div>
                <p className="text-sm text-white/40 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#5eead4]" />
                      <span className="text-sm text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register?role=CAREGIVER">
                  <Button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white">
                    {plan.cta}
                  </Button>
                </Link>
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
            className="text-center"
          >
            <h2 className="font-heading text-4xl text-white mb-4 tracking-tight">Have questions about pricing?</h2>
            <p className="text-white/40 mb-8">Check our detailed FAQ section for more information.</p>
            <Link href="/faqs">
              <Button variant="outline-light" className="btn-cta">
                View Pricing FAQs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}