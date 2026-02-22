"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// FAQ categories and questions
const faqCategories = [
  {
    id: "ordering",
    name: "Ordering & Delivery",
    icon: "🛒",
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "You can place an order through our website by visiting the 'Order' page, selecting your desired items, and proceeding to checkout. Alternatively, you can call us directly at 07539187928 to place your order over the phone.",
      },
      {
        question: "What areas do you deliver to?",
        answer:
          "We currently deliver throughout Lagos and surrounding areas within a 10-mile radius. For deliveries beyond this area, additional charges may apply. Please contact us for specific delivery information for your location.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery typically takes 45-60 minutes, depending on your location and current order volume. Express delivery is available for an additional fee and aims to deliver within 25-35 minutes.",
      },
      {
        question: "Is there a minimum order for delivery?",
        answer:
          "Yes, there is a minimum order of ₦15 for delivery. This helps us ensure we can provide quality service while covering delivery costs.",
      },
      {
        question: "Can I schedule an order for later?",
        answer:
          "Yes! You can schedule orders up to 7 days in advance. Simply select your desired delivery date and time during checkout.",
      },
    ],
  },
  {
    id: "menu",
    name: "Menu & Dietary Information",
    icon: "🍽️",
    questions: [
      {
        question: "Do you cater to dietary restrictions?",
        answer:
          "Yes, we can accommodate various dietary needs including vegetarian, vegan, gluten-free, and specific allergies. Please inform us of any dietary restrictions when placing your order or during the catering consultation.",
      },
      {
        question: "Are your ingredients locally sourced?",
        answer:
          "We prioritize using locally sourced ingredients whenever possible, while also importing authentic African spices and specialty items to ensure the most authentic flavors in our dishes.",
      },
      {
        question: "How spicy is your food?",
        answer:
          "Our menu includes dishes with varying levels of spiciness. Each item on our menu is marked with a spice level indicator. We can adjust the spice level of most dishes upon request to suit your preference.",
      },
      {
        question: "Do you offer kids' portions?",
        answer:
          "Yes, we offer smaller portions suitable for children. These can be found in the 'Kids Menu' section when ordering online, or you can request them when ordering by phone.",
      },
    ],
  },
  {
    id: "catering",
    name: "Catering & Events",
    icon: "🎉",
    questions: [
      {
        question: "How far in advance should I book catering services?",
        answer:
          "We recommend booking catering services at least 2-4 weeks in advance for small events and 1-3 months for larger events like weddings. However, we can sometimes accommodate last-minute requests depending on availability.",
      },
      {
        question: "What is included in your catering services?",
        answer:
          "Our catering services include menu planning, food preparation, delivery, setup, service staff (if requested), and cleanup. We provide all necessary serving equipment, plates, utensils, and napkins. We can also arrange for tables, chairs, and decorations for an additional fee.",
      },
      {
        question: "Do you offer tastings for catering events?",
        answer:
          "Yes, we offer tastings for catering clients booking events over a certain size. Tastings are scheduled by appointment and allow you to sample potential menu items before finalizing your selections.",
      },
      {
        question: "Can you accommodate last-minute catering requests?",
        answer:
          "We do our best to accommodate last-minute requests, but availability depends on our current schedule and the size of your event. Please contact us as soon as possible, and we'll work with you to find a solution.",
      },
    ],
  },
  {
    id: "payment",
    name: "Payment & Pricing",
    icon: "💳",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept various payment methods including credit/debit cards, bank transfers, and cash. For catering services, we typically require a deposit to secure your booking, with the balance due before the event.",
      },
      {
        question: "Is there a delivery fee?",
        answer:
          "Yes, our standard delivery fee is ₦2.99. Express delivery is available for ₦4.99. Delivery fees may vary for locations outside our standard delivery area.",
      },
      {
        question: "Do you offer any discounts or loyalty programs?",
        answer:
          "Yes, we offer a loyalty program where you earn points for every order. These points can be redeemed for discounts on future orders. We also offer seasonal promotions and special discounts for large catering orders.",
      },
    ],
  },
]

export default function FAQClientPage() {
  const [activeCategory, setActiveCategory] = useState("ordering")
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({})

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-bg.png')] opacity-10 z-0"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display drop-shadow-md">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white/90 mb-8 drop-shadow">
                Find answers to common questions about our African cuisine, catering services, and delivery options.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Category Navigation */}
            <div className="flex overflow-x-auto pb-4 mb-12 gap-3 scrollbar-hide">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-6 py-4 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 font-medium",
                    activeCategory === category.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100",
                  )}
                >
                  <span className="text-xl">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* FAQ Accordions */}
            <div className="space-y-6">
              {faqCategories
                .filter((category) => category.id === activeCategory)
                .map((category) => (
                  <div key={category.id}>
                    <h2 className="text-3xl font-bold mb-8 font-display text-center">
                      <span className="text-4xl mr-2">{category.icon}</span> {category.name}
                    </h2>
                    <div className="space-y-4">
                      {category.questions.map((faq, index) => {
                        const questionId = `${category.id}-${index}`
                        const isOpen = openQuestions[questionId]

                        return (
                          <motion.div
                            key={questionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={cn(
                              "border rounded-xl overflow-hidden transition-all duration-300",
                              isOpen
                                ? "bg-white shadow-lg border-primary/20"
                                : "bg-white hover:bg-gray-50 border-gray-100",
                            )}
                          >
                            <button
                              onClick={() => toggleQuestion(questionId)}
                              className="w-full px-6 py-5 flex items-center justify-between text-left"
                            >
                              <h3 className="text-xl font-bold">{faq.question}</h3>
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                  isOpen ? "bg-primary text-white rotate-180" : "bg-gray-100 text-gray-500",
                                )}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-5 pt-0 text-gray-700 border-t border-gray-100">
                                    <p className="leading-relaxed">{faq.answer}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4 font-display">Still Have Questions?</h2>
                <p className="text-gray-700 mb-6">
                  Can't find the answer you're looking for? Please contact our friendly team.
                </p>
                <div className="space-y-3">
                  <Button asChild size="lg" className="rounded-full w-full md:w-auto">
                    <Link href="/contact">
                      Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1974&auto=format&fit=crop"
                  alt="Customer service"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
