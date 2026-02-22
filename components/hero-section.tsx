"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const heroImages = [
  "/assets/img1.webp",
  "/assets/img2.webp",
  "/assets/img3.webp",
  "/assets/img4.webp"
]

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {/* Background Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentImageIndex ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={`African cuisine ${index + 1}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block bg-secondary text-white px-4 py-1 rounded-full text-sm font-medium mb-6">
              Authentic African Cuisine
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 font-display leading-tight"
          >
            Experience the Rich Flavors of Africa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl"
          >
            South Place Lagos brings authentic African cuisine to your events and doorstep, with fresh ingredients
            and traditional recipes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full px-8 py-6 text-base font-medium shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:translate-y-[-2px] transition-all"
            >
              <Link href="/order">Order Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-base font-medium border-white text-white
               bg-white/10 backdrop-blur-sm hover:bg-primary  hover:text-white hover:border-primary
               shadow-lg hover:shadow-green/20 hover:translate-y-[-2px] transition-all"
            >
              <Link href="/menu">Explore Menu</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`transition-all duration-300 ${
              index === currentImageIndex
                ? "w-10 h-3 bg-white rounded-full shadow-md"
                : "w-3 h-3 bg-white/50 rounded-full hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-secondary rounded-full opacity-20 blur-3xl"></div>
    </section>
  )
}
