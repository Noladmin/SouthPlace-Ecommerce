"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function AboutPageClient() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-orange-50/30" />

        {/* Decorative blur elements */}
        <div className="absolute top-20 -right-20 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm border border-orange-100 text-orange-700">
                ✨ Our Story
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 font-display text-gray-900"
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">South Place</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-3xl mx-auto"
            >
              Discover the passion, people, and principles behind Lagos's premier African cuisine destination.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 relative z-20">
        <div className="container mx-auto px-4">
          {/* Our Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-5 py-2 rounded-full text-sm font-semibold mb-8 w-fit">
                  🍽️ From Tradition to Table
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 font-display text-gray-900">Our Journey</h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    South Place Lagos was born from a deep love for African culinary traditions and a desire to
                    share these authentic flavors with the Lagos community. Our founder, inspired by family
                    recipes passed down through generations, established South Place in 2023.
                  </p>
                  <p>
                    What began as a small catering service quickly grew into a beloved food delivery and event
                    catering business, as more people discovered the rich, vibrant flavors of our authentic African
                    dishes.
                  </p>
                  <p>
                    Today, we take pride in being Lagos's premier destination for African cuisine, serving
                    hundreds of satisfied customers and catering events of all sizes throughout the region.
                  </p>
                </div>

                <div className="mt-10">
                  <Button asChild className="rounded-full px-8 py-6 text-base shadow-lg bg-orange-600 hover:bg-orange-500 text-black border-0 group">
                    <Link href="/about/history">
                      Read our full history <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-96 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
                  alt="The beginning of South Place"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Timeline overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-sm border border-gray-200">
                    <h3 className="text-2xl font-bold mb-6 text-orange-800">Our Timeline</h3>
                    <ul className="space-y-4">
                      <li className="flex items-center group hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 text-sm font-bold shadow-sm">
                          23
                        </div>
                        <span className="text-gray-700 font-medium">Founded in 2023</span>
                      </li>
                      <li className="flex items-center group hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 text-sm font-bold shadow-sm">
                          24
                        </div>
                        <span className="text-gray-700 font-medium">Expanded services in 2024</span>
                      </li>
                      <li className="flex items-center group hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 text-sm font-bold shadow-sm">
                          25
                        </div>
                        <span className="text-gray-700 font-medium">Launched delivery in 2025</span>
                      </li>
                      <li className="flex items-center group hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 text-sm font-bold shadow-sm">
                          🎯
                        </div>
                        <span className="text-gray-700 font-medium">Walk-in Restaurant 2025</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Story Highlights */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Authentic Recipes",
                description:
                  "Our dishes are prepared using traditional recipes passed down through generations, ensuring authentic African flavors in every bite.",
                image:
                  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2080&auto=format&fit=crop",
                badge: "Traditional",
                icon: "🍲",
              },
              {
                title: "Community Focus",
                description:
                  "We're proud to be part of the Lagos community, supporting local events and introducing African cuisine to new audiences.",
                image:
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
                badge: "Local",
                icon: "🤝",
              },
              {
                title: "Culinary Excellence",
                description:
                  "Our team of skilled chefs combines traditional techniques with modern presentation to create exceptional dining experiences.",
                image:
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
                badge: "Quality",
                icon: "⭐",
              },
            ].map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={highlight.image || "/placeholder.svg"}
                    alt={highlight.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold border border-white/30">
                        {highlight.icon} {highlight.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display mb-3">{highlight.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{highlight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-gray-900">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-gray-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/20 shadow-lg">
                🎉 Join Our Community
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-display text-white leading-tight"
            >
              Ready to Experience Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                Authentic African Cuisine?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              Place your order now or contact us to discuss catering for your next event.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg shadow-xl bg-white text-orange-900 hover:bg-gray-100 border-0 font-semibold group">
                <Link href="/order">
                  Order Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 font-semibold group">
                <Link href="/contact">
                  Contact Us
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold text-white">500+ Happy Customers</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold text-white">50+ Events Catered</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍲</span>
                <span className="font-semibold text-white">100% Authentic</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}