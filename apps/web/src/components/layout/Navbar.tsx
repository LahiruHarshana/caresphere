"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  isTransparent?: boolean;
}

export const Navbar = ({ isTransparent = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Find Care", href: "/find-care" },
    { label: "Become a Caregiver", href: "/become-caregiver" },
    { label: "About", href: "/about-us" },
    { label: "Pricing", href: "/pricing" },
  ];

  const bgColor = isTransparent
    ? isScrolled
      ? "bg-white/95 backdrop-blur-md border-b border-gray-100"
      : "bg-transparent"
    : "bg-white/95 backdrop-blur-md border-b border-gray-100";

  const textColor = isTransparent && !isScrolled ? "text-white" : "text-neutral-600";
  const logoInvert = isTransparent && !isScrolled ? "brightness-0 invert" : "";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${bgColor}`}
    >
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.png" alt="CareSphere" className={`h-12 w-auto ${logoInvert}`} />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link
                href={item.href}
                className={`text-sm font-body ${textColor} hover:text-primary transition-colors duration-300`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-6"
        >
          {user ? (
            <Link href={
              user.role === "ADMIN" ? "/admin/analytics" :
              user.role === "CAREGIVER" ? "/caregiver/dashboard" :
              "/customer/dashboard"
            }>
              <Button variant={isTransparent && !isScrolled ? "outline-light" : "outline"} size="default" className="btn-cta">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-body ${textColor} hover:text-primary transition-colors duration-300`}
              >
                Login
              </Link>
              <Link href="/register?role=CUSTOMER">
                <Button variant={isTransparent && !isScrolled ? "outline-light" : "outline"} size="default" className="btn-cta">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className={`w-6 h-6 ${textColor}`} />
          ) : (
            <Menu className={`w-6 h-6 ${textColor}`} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-lg font-body text-neutral-600 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {user ? (
                <Link
                  href={
                    user.role === "ADMIN" ? "/admin/analytics" :
                    user.role === "CAREGIVER" ? "/caregiver/dashboard" :
                    "/customer/dashboard"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full justify-center">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-lg font-body text-neutral-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register?role=CUSTOMER"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full justify-center">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
