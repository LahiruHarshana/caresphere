"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const posts = [
  {
    id: 1,
    title: "10 Tips for Finding the Perfect Caregiver",
    excerpt: "Discover how to find a trusted caregiver who meets your family's unique needs.",
    category: "Tips & Advice",
    date: "April 20, 2026",
    image: "/media/images/blog-caregiver-tips.jpg"
  },
  {
    id: 2,
    title: "Understanding the Benefits of In-Home Care",
    excerpt: "Learn why in-home care is becoming the preferred choice for many families.",
    category: "Health & Wellness",
    date: "April 15, 2026",
    image: "/media/images/blog-in-home-care.jpg"
  },
  {
    id: 3,
    title: "How to Prepare for Your First Caregiver Meeting",
    excerpt: "Make the most of your first meeting with a potential caregiver.",
    category: "Guides",
    date: "April 10, 2026",
    image: "/media/images/blog-first-meeting.jpg"
  },
  {
    id: 4,
    title: "The Future of Caregiving: Technology Trends",
    excerpt: "Explore how technology is transforming the caregiving industry.",
    category: "Technology",
    date: "April 5, 2026",
    image: "/media/images/blog-tech-trends.jpg"
  },
  {
    id: 5,
    title: "Caring for Aging Parents: A Guide for Adult Children",
    excerpt: "Navigate the challenges of caring for aging parents with confidence.",
    category: "Family Care",
    date: "March 28, 2026",
    image: "/media/images/blog-aging-parents.jpg"
  },
  {
    id: 6,
    title: "Building a Strong Caregiver-Family Relationship",
    excerpt: "Tips for establishing trust and communication with your caregiver.",
    category: "Relationships",
    date: "March 20, 2026",
    image: "/media/images/blog-relationship.jpg"
  }
];

const categories = ["All", "Tips & Advice", "Health & Wellness", "Guides", "Technology", "Family Care", "Relationships"];

export default function BlogPage() {
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
              CareSphere Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert insights, tips, and stories about caregiving and family wellness.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-teal-100 to-cyan-100 relative">
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-teal-700">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <Link href="#" className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700 transition-colors">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">Get the latest articles and tips delivered to your inbox.</p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button type="submit" className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}