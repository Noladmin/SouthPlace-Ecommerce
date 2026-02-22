"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Utensils, Boxes, Soup, Package, ClipboardList } from "lucide-react"

const services = [
  {
    title: "Food Trays",
    description:
      "Beautifully arranged trays ideal for office lunches, family gatherings, and parties.",
    image: "/assets/FoodTray.webp",
    badge: "Food Trays",
    icon: Utensils,
  },
  {
    title: "Food in Coolers",
    description:
      "Bulk-friendly coolers to keep meals hot and fresh for events and long services.",
    image: "/assets/FoodCoolers.webp",
    badge: "Hot & Fresh",
    icon: Boxes,
  },
  {
    title: "Food in Bowls",
    description:
      "Individually plated or bowls for a restaurant-style experience at your venue.",
    image: "/assets/bulkorder.jpg",
    badge: "Plates & Bowls",
    icon: Soup,
  },
  {
    title: "Rental Services",
    description:
      "Chafing dishes, warmers, utensils, and setup equipment for a seamless service.",
    image: "/assets/Rental.webp",
    badge: "Rentals",
    icon: Package,
  },
  {
    title: "Event Catering",
    description:
      "End-to-end catering for weddings, corporate events, and celebrations of any size.",
    image: "/assets/CateringServices.webp",
    badge: "Catering",
    icon: ClipboardList,
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="bg-gray-50 py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold md:text-5xl text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600">
            From family trays to full-service events, choose the service that matches your needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer relative group w-full aspect-square"
            >
              {/* Image with overlay - All content on overlay like menu cards */}
              <div className="relative w-full h-full">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
                {/* Overlay gradient - Matching menu cards exactly */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

                {/* All content organized on overlay - Menu card style */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
                  {/* Top: Badge */}
                  <div className="flex items-start justify-between">
                    <span className="inline-block bg-white/95 text-gray-900 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                      {service.badge}
                    </span>
                  </div>

                  {/* Bottom: Title, Description & Button */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold leading-tight text-white drop-shadow-md mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-white/90 line-clamp-2 leading-snug drop-shadow-sm">
                        {service.description}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-lg bg-orange-600 text-black hover:bg-orange-500 px-4 py-2 text-sm font-semibold h-auto shadow-md"
                    >
                      <Link href="/services">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 
