"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Instagram, Linkedin, Twitter, ChevronRight, UtensilsCrossed, Truck, Star } from "lucide-react"

// Team members data
const teamMembers = {
  leadership: [
    {
      name: "Samuel Jack",
      role: "Managing Director",
      bio: "Managing Director with a passion for operational excellence and customer satisfaction.",
      image: "/assets/userPerson.webp",
      social: { instagram: "#", linkedin: "#", twitter: "#" },
    },
    {
      name: "Toju Jack",
      role: "Head Chef / Ops Manager",
      bio: "The culinary heart of South Place, bringing authentic Nigerian flavors to every dish.",
      image: "/assets/userPerson.webp",
      social: { instagram: "#", linkedin: "#", twitter: "#" },
    },
    {
      name: "Obiajuru Ibekwe",
      role: "Marketing Manager",
      bio: "Ensuring every customer interaction is positive and sharing our story with the world.",
      image: "/assets/userPerson.webp",
      social: { instagram: "#", linkedin: "#", twitter: "#" },
    },
  ],
  culinary: [
    {
      name: "Emmanuel Adeyemi",
      role: "Senior Chef",
      specialty: "West African",
      image: "/assets/userPerson.webp",
    },
    {
      name: "Fatima Diallo",
      role: "Chef de Partie",
      specialty: "North African",
      image: "/assets/userPerson.webp",
    },
    {
      name: "Samuel Osei",
      role: "Sous Chef",
      specialty: "Ghanaian",
      image: "/assets/userPerson.webp",
    },
    {
      name: "Zainab Musa",
      role: "Pastry Chef",
      specialty: "Desserts",
      image: "/assets/userPerson.webp",
    },
  ],
  service: [
    {
      name: "Delivery Team",
      role: "Logistics",
      description: "Fast, friendly delivery to your door.",
      image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Event Staff",
      role: "Catering",
      description: "Professional service for memorable events.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Customer Support",
      role: "Service",
      description: "Here to help with every order.",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
    },
  ],
}

// Helper: return provided image or avatar
function getAvatarPng(name: string, image?: string) {
  if (image) return image
  const seed = encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, "-"))
  return `https://avatars.dicebear.com/api/avataaars/${seed}.png?background=%23ffffff&radius=50`
}

export default function TeamClientPage() {
  return (
    <div className="pt-24 pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gray-50/50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-orange-50/20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/about" className="inline-flex items-center text-orange-600 font-medium mb-6 hover:text-orange-700 transition-colors group text-sm">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to About
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 font-display text-gray-900"
            >
              Our <span className="text-orange-600">Team</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
            >
              Meet the passionate people behind the delicious food and exceptional service at South Place.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Leadership Section - Compact Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-orange-600 font-semibold tracking-wider text-sm uppercase">Leadership</span>
              <h2 className="text-3xl font-bold mt-2 font-display text-gray-900">Guiding Vision</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.leadership.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center"
                >
                  <div className="relative w-32 h-32 mb-6">
                    <Image
                      src={getAvatarPng(member.name, member.image)}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover border-4 border-orange-50 shadow-md"
                    />
                    <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5 border-2 border-white">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-orange-600 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{member.bio}</p>

                  <div className="flex gap-3 mt-auto">
                    {Object.entries(member.social).map(([platform, link], i) => (
                      <Link key={i} href={link} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        {platform === 'instagram' && <Instagram className="w-4 h-4" />}
                        {platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                        {platform === 'twitter' && <Twitter className="w-4 h-4" />}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Team - Simplified Grid */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-orange-600 font-semibold tracking-wider text-sm uppercase">Culinary</span>
              <h2 className="text-3xl font-bold mt-2 font-display text-gray-900">Master Chefs</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {teamMembers.culinary.map((chef, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={getAvatarPng(chef.name, chef.image)}
                      alt={chef.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900">{chef.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{chef.role}</p>
                    <span className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wide rounded-md">
                      {chef.specialty}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Team - Standard Cards (Not Full Height) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-orange-600 font-semibold tracking-wider text-sm uppercase">Service</span>
              <h2 className="text-3xl font-bold mt-2 font-display text-gray-900">Customer Care</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.service.map((team, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={team.image || "/placeholder.svg"}
                      alt={team.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-orange-600 text-sm font-medium mb-3">{team.role}</p>
                    <p className="text-gray-500 text-sm">{team.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
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
                👥 Join Our Team
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-display text-white leading-tight"
            >
              Become Part of the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400">
                South Place Family
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              We are always looking for passionate people to join our team. If you love food and people, we'd love to hear from you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg shadow-xl bg-white text-orange-900 hover:bg-gray-100 border-0 font-semibold group">
                <Link href="/careers">
                  View Open Positions
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators - relevant for potential employees too */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <span className="font-semibold text-white">Growth Opportunities</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <span className="font-semibold text-white">Supportive Team</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold text-white">Excellence Driven</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
