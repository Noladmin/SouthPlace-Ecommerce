"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "@/lib/motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Planner",
    image: "/assets/userPerson.webp",
    quote:
      "South Place catered my corporate event and the feedback was phenomenal! The Snail & Egg Stew was a hit, and their service was impeccable. Will definitely use them again!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Thompson",
    role: "Food Enthusiast",
    image: "/assets/userPerson.webp",
    quote:
      "As someone who loves trying different cuisines, I was blown away by the authenticity and flavors of South Place. Their Egusi Soup transported me straight to West Africa!",
    rating: 5,
  },
  {
    id: 3,
    name: "Olivia Parker",
    role: "Wedding Client",
    image: "/assets/userPerson.webp",
    quote:
      "We chose South Place for our wedding reception, and it was the best decision! Our guests are still talking about the food months later. Exceptional service and quality!",
    rating: 5,
  },
]

export default function TestimonialsSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg p-8 md:p-10 border border-gray-200 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="md:w-1/4 flex flex-col items-center md:items-start">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-gray-200">
                  <Image
                    src={testimonials[current].image || "/placeholder.svg"}
                    alt={testimonials[current].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{testimonials[current].name}</h3>
                <p className="text-sm text-gray-500 mb-3">{testimonials[current].role}</p>
                <div className="flex gap-1">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="md:w-2/3">
                <p className="text-lg italic text-gray-700 leading-relaxed">{testimonials[current].quote}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-8 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 ${
              index === current
                ? "w-8 h-2 bg-orange-600 rounded-full"
                : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400"
            }`}
            aria-label={`View testimonial ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  )
}
