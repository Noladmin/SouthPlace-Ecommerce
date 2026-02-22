"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight, Utensils, Boxes, Soup, Package, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    id: "food-trays",
    title: "Food Trays",
    shortDesc: "Beautifully arranged trays for gatherings and offices",
    description:
      "Ideal for office lunches, family gatherings, and parties. Delivered hot and ready to serve.",
    image: "/assets/FoodTray.webp",
    icon: <Utensils className="h-6 w-6" />,
    badge: "Food Trays",
  },
  {
    id: "food-coolers",
    title: "Food in Coolers",
    shortDesc: "Bulk-friendly coolers to keep meals hot and fresh",
    description:
      "Perfect for long services and events. We portion and pack to retain heat and flavor throughout.",
    image: "/assets/FoodCoolers.webp",
    icon: <Boxes className="h-6 w-6" />,
    badge: "Hot & Fresh",
  },
  {
    id: "plates-bowls",
    title: "Food in Bowls",
    shortDesc: "Individually plated or bowl service on-site",
    description:
      "Restaurant-style presentation for your venue or event, served in plates and bowls.",
    image: "/assets/bulkorder.jpg",
    icon: <Soup className="h-6 w-6" />,
    badge: "Plates & Bowls",
  },
  {
    id: "rental-services",
    title: "Rental Services",
    shortDesc: "Chafing dishes, warmers, utensils, setup equipment",
    description:
      "Everything you need for a seamless service: warmers, utensils, buffet setup and more.",
    image: "/assets/Rental.webp",
    icon: <Package className="h-6 w-6" />,
    badge: "Rentals",
  },
  {
    id: "event-catering",
    title: "Event Catering",
    shortDesc: "End-to-end catering for weddings and corporate events",
    description:
      "Menu planning, on-site service, and complete execution for celebrations of any size.",
    image:
      "/assets/CateringServices.webp",
    icon: <ClipboardList className="h-6 w-6" />,
    badge: "Catering",
  },
]

export default function ServicesClientPage() {
  const [activeService, setActiveService] = useState("food-trays")

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-orange-100">
              Exceptional Services
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-display text-gray-900">Our Services</h1>
            <div className="flex flex-wrap justify-center gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveService(s.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border-2",
                    activeService === s.id
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Matching menu UI */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
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
                          {service.shortDesc}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-lg bg-orange-600 text-black hover:bg-orange-500 px-4 py-2 text-sm font-semibold h-auto shadow-md"
                      >
                        <Link href={`/services#${service.id}`}>
                          Learn More <ChevronRight className="ml-2 h-4 w-4 inline" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
              >
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-white">Let's Get Started</span>
              </div>

              {/* Heading */}
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-display leading-tight"
              >
                Ready to Experience Our{" "}
                <span className="text-amber-300">Services?</span>
              </h2>

              {/* Description */}
              <p
                className="text-xl text-orange-50 max-w-2xl mx-auto"
              >
                Contact us today to discuss your needs or place an order online. We're here to make your event unforgettable.
              </p>

              {/* Buttons */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="group rounded-2xl px-10 py-7 text-lg font-bold bg-white text-orange-700 hover:bg-amber-50 shadow-2xl shadow-black/20"
                >
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-10 py-7 text-lg font-bold border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-orange-700 transition-all"
                >
                  <Link href="/order">Order Now</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div
                className="pt-8 flex flex-wrap items-center justify-center gap-8 text-white/80"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Fast Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
