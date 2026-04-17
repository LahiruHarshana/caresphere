import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Lock, MapPin, Video, Heart, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">CareSphere</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How it Works</Link>
            <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">About Us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/register?role=CUSTOMER">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white py-20 lg:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                <span>Trusted by 10,000+ Families</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                Professional Care, <span className="text-primary">Simplified</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                The modern platform connecting families with vetted, compassionate caregivers. 
                Experience peace of mind with smart matching and real-time care tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=CUSTOMER">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                    Find a Caregiver
                  </Button>
                </Link>
                <Link href="/register?role=CAREGIVER">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-white shadow-sm transition-all hover:-translate-y-1">
                    Become a Caregiver
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-accent text-sm font-bold tracking-widest uppercase mb-4">Features</h2>
              <p className="text-4xl font-bold text-gray-900 mb-6">Built for Security and Trust</p>
              <p className="text-lg text-gray-600">Everything you need to manage care with confidence, from matching to secure payments.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <Users className="text-primary w-7 h-7 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Matching</h3>
                <p className="text-gray-600 leading-relaxed">Our AI-powered matching system finds the perfect caregiver based on medical needs, personality, and location.</p>
              </div>

              <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                  <Lock className="text-accent w-7 h-7 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Vault</h3>
                <p className="text-gray-600 leading-relaxed">Securely store and share medical records, care instructions, and emergency contacts with your care team.</p>
              </div>

              <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <MapPin className="text-primary w-7 h-7 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Live Tracking</h3>
                <p className="text-gray-600 leading-relaxed">Real-time GPS tracking and check-in notifications keep you updated on your loved one&apos;s status.</p>
              </div>

              <div className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                  <Video className="text-accent w-7 h-7 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Video Interviews</h3>
                <p className="text-gray-600 leading-relaxed">Meet and screen potential caregivers through our integrated, secure high-definition video platform.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust/Social Proof Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Why CareSphere?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                      <CheckCircle className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Background Checked</h4>
                      <p className="text-gray-600">Every caregiver undergoes a rigorous 5-point background and identity verification.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                      <CheckCircle className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Insured & Bonded</h4>
                      <p className="text-gray-600">All bookings through our platform are protected by our comprehensive insurance policy.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                      <CheckCircle className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">24/7 Support</h4>
                      <p className="text-gray-600">Our dedicated care coordinators are available around the clock to assist you.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="aspect-square bg-gray-200 rounded-3xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                    [Professional Care Image Placeholder]
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-[240px]">
                  <p className="text-sm font-medium text-gray-900 italic">&quot;Finding the right care for my mother was a daunting task until we found CareSphere.&quot;</p>
                  <p className="text-xs font-bold text-primary mt-4">Sarah J., Customer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">Ready to find the perfect care?</h2>
            <p className="text-xl text-teal-100 mb-12 max-w-2xl mx-auto">Join thousands of families who trust CareSphere for their caregiving needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=CUSTOMER">
                  <Button size="lg" className="bg-white text-primary hover:bg-teal-50 h-14 px-8 text-lg font-bold">
                    Start Your Search
                  </Button>
                </Link>
                <Link href="/register?role=CAREGIVER">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-bold">
                    Join as a Caregiver
                  </Button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">CareSphere</span>
              </div>
              <p className="max-w-md text-gray-400 leading-relaxed mb-6">
                Connecting families with vetted, compassionate caregivers through technology and trust.
                Our mission is to simplify professional care for everyone.
              </p>
              <div className="flex gap-4">
                {/* Social icons would go here */}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-primary transition-colors">Find Care</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Become a Caregiver</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CareSphere Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
