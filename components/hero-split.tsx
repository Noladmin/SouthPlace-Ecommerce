"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { useEffect, useState } from "react"
import { ArrowRight, Star, Clock, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSplit() {
  const heroImages = ["/assets/img1.webp", "/assets/img3.webp", "/assets/img5.webp"]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50/30 pt-20 pb-16 lg:pt-28 lg:pb-20">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[75vh]">

          {/* Left Content - Modern, Bold */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-orange-100"
            >
              <Sparkles className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Authentic African Cuisine</span>
            </motion.div>

            {/* Main Heading - Bold & Modern */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-gray-900"
            >
              Experience the Rich{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                Flavors
              </span>{" "}
              of Africa
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0"
            >
              South Place Lagos brings authentic African cuisine to your events and doorstep, with fresh ingredients and traditional recipes.
            </motion.p>

            {/* Trust Badges - Modernized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
            >
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                </div>
                <span className="text-sm font-bold text-gray-900">4.9</span>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">30-45 min</span>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">Lagos</span>
              </div>
            </motion.div>

            {/* CTA Buttons - Bold & Modern */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-2xl px-10 py-7 text-lg font-bold shadow-xl shadow-orange-600/30 transition-all duration-300"
              >
                <Link href="/order">
                  Order Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl px-10 py-7 text-lg font-semibold border-2 border-gray-300 hover:border-orange-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
              >
                <Link href="/menu">Explore Menu</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Visual - Modern Image Presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:block hidden"
          >
            {/* Main Image Container - Bold, Modern */}
            <div className="relative">
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -top-4 -left-4 z-20 bg-white rounded-2xl px-4 py-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-gray-900">Now Accepting Orders</span>
                </div>
              </motion.div>

              {/* Image Grid - Bolt Food Style */}
              <div className="relative h-[600px] w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroImages[idx]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src={heroImages[idx]}
                      alt="Delicious African cuisine"
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400 rounded-full blur-2xl opacity-60" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-400 rounded-full blur-2xl opacity-60" />
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-2xl border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">500+</div>
                    <div className="text-xs text-gray-600">Happy Customers</div>
                  </div>
                  <div className="h-12 w-px bg-gray-200" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4.9</div>
                    <div className="text-xs text-gray-600">Average Rating</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:hidden relative h-[400px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={heroImages[idx]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image src={heroImages[idx]} alt="Delicious African cuisine" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 