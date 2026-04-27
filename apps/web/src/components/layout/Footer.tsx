"use client";

import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: "Find Care", href: "/find-care" },
      { label: "Become a Caregiver", href: "/become-caregiver" },
      { label: "Trust & Safety", href: "/trust-safety" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQs", href: "/faqs" },
    ],
    company: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "GDPR", href: "/gdpr" },
    ],
  };

  return (
    <footer className="footer-dark text-gray-300 py-20 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/">
                <img src="/logo.png" alt="CareSphere" className="h-10 w-auto brightness-0 invert" />
              </Link>
            </div>
            <p className="max-w-sm text-gray-400 leading-relaxed font-body text-sm mb-6">
              Connecting families with vetted, compassionate caregivers through technology and trust.
            </p>
          </div>

          <div>
            <h4 className="text-white font-heading text-lg mb-6">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-300 font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-heading text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-300 font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-heading text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-300 font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 font-body text-sm">
            © {currentYear} CareSphere Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-400 font-body">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
