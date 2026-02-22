"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Smartphone, ShoppingCart, CreditCard, CheckCircle2, Utensils, Timer, Lock, MapPin, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderAppTeaser() {
  const steps = [
    { key: 0, icon: ShoppingCart, title: 'Choose & customize', desc: 'Pick from our signature dishes and tailor portions to your needs.' },
    { key: 1, icon: CreditCard, title: 'Pay securely', desc: 'Protected checkout with major cards and secure payment gateways.' },
    { key: 2, icon: CheckCircle2, title: 'Track & enjoy', desc: 'Get real-time updates and savour your meal at its best.' },
  ]

  // Images aligned to steps: 0->menu, 1->payment, 2->tracking
  const slides = [
    { image: '/assets/img2.webp', title: 'Egusi Soup', subtitle: 'with pounded yam • spicy', price: '₦12.50' },
    { image: '/assets/img1.webp', title: 'Checkout', subtitle: 'Visa • Mastercard • Amex', price: '₦27.00' },
    { image: '/assets/img4.webp', title: 'Order #TB2412', subtitle: 'Out for delivery', price: 'ETA 20m' },
  ]

  const [activeStep, setActiveStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPaused) return
    const i = setInterval(() => setActiveStep((v) => (v + 1) % steps.length), 4500)
    return () => clearInterval(i)
  }, [isPaused, steps.length])

  const pauseTemporarily = (ms = 8000) => {
    setIsPaused(true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), ms)
  }

  function StepIllustration({ index, active }: { index: number; active: boolean }) {
    const common = {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    }
    return (
      <motion.div
        {...common}
        className={`relative h-16 w-24 flex-shrink-0 overflow-visible`}
        aria-hidden
      >
        {/* Ambient glow */}
        <div className={`absolute -inset-2 rounded-2xl ${active ? 'bg-amber-400/20 blur-xl' : 'bg-primary/20 blur-lg'}`} />
        {/* SVG canvas */}
        <motion.svg
          width="96"
          height="64"
          viewBox="0 0 96 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={active ? '#F59E0B' : '#387237'} />
              <stop offset="100%" stopColor={active ? '#FBBF24' : '#6EE7B7'} />
            </linearGradient>
          </defs>
          {index === 0 && (
            <>
              {/* Bowl */}
              <motion.ellipse
                cx="48"
                cy="42"
                rx="28"
                ry="10"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="transparent"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
              {/* Steam */}
              {[0, 1, 2].map((s) => (
                <motion.path
                  key={s}
                  d={`M ${38 + s * 10},30 C ${36 + s * 10},24 ${42 + s * 10},20 ${40 + s * 10},16`}
                  stroke="url(#grad1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ duration: 1.2 + s * 0.1, repeat: Infinity, repeatType: 'mirror' }}
                />
              ))}
              {/* Ingredients dots */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={28 + i * 8}
                  cy={42 - (i % 2 === 0 ? 2 : -2)}
                  r="2"
                  fill="url(#grad1)"
                  initial={{ y: 0, opacity: 0.8 }}
                  animate={{ y: [0, -2, 0], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2 + i * 0.1, repeat: Infinity }}
                />
              ))}
            </>
          )}
          {index === 1 && (
            <>
              {/* Card rectangle */}
              <motion.rect
                x="18"
                y="14"
                width="60"
                height="36"
                rx="8"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="transparent"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
              {/* Chip */}
              <motion.rect x="24" y="24" width="10" height="8" rx="2" fill="url(#grad1)" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              {/* Number */}
              {[0,1,2,3].map((i) => (
                <motion.rect key={i} x={38 + i*8} y="26" width="6" height="4" rx="1" fill="currentColor" className="text-white/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i*0.05 }} />
              ))}
              {/* Tap pulse */}
              <motion.circle cx="70" cy="32" r="6" fill="url(#grad1)" initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1, 0.8] }} transition={{ duration: 1.8, repeat: Infinity }} />
            </>
          )}
          {index === 2 && (
            <>
              {/* Route path */}
              <motion.path
                d="M12 48 C 28 32, 68 32, 84 16"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="transparent"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              {/* Marker */}
              <motion.circle cx="84" cy="16" r="6" stroke="url(#grad1)" strokeWidth="2" fill="transparent" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              {/* Rider dot */}
              <motion.circle cx="12" cy="48" r="4" fill="url(#grad1)" animate={{ cx: [12, 84], cy: [48, 16] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            </>
          )}
        </motion.svg>
      </motion.div>
    )
  }

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-white">

      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Left: Copy */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-3xl font-bold sm:text-4xl md:text-5xl text-gray-900 mb-4"
          >
            Simple Ordering Process
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-lg text-gray-600 mb-8"
          >
            Build your bowl, choose your favourites, and check out securely. Choose delivery or pickup—either way, your meal arrives fresh and fast.
          </motion.p>

          {/* Steps - Modern Flow */}
          <div className="space-y-6 mb-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                onMouseEnter={() => {
                  setActiveStep(i)
                  pauseTemporarily()
                }}
                className="relative group"
              >
                <div className="flex items-start gap-6">
                  {/* Step Number with Progress Line */}
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${
                        activeStep === i
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-orange-50 group-hover:to-orange-100'
                      }`}
                    >
                      <step.icon 
                        className={`h-7 w-7 transition-colors duration-300 ${
                          activeStep === i ? 'text-white' : 'text-gray-600 group-hover:text-orange-600'
                        }`} 
                      />
                    </motion.div>
                    
                    {/* Connecting Line */}
                    {i < steps.length - 1 && (
                      <div className="mt-2 h-16 w-0.5 bg-gradient-to-b from-gray-200 to-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
                      >
                        Step {i + 1}
                      </motion.span>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                    
                    {/* Progress Indicator */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: activeStep === i ? '100%' : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="mt-3 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <Button asChild size="lg" className="rounded-lg px-8 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20">
              <Link href="/order">
                Start your order <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Phone mockup synced with steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-[520px] w-[260px] rounded-[2.5rem] border border-gray-200 bg-white p-2 shadow-lg"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <Image src={slides[activeStep].image} alt="App preview" fill className="object-cover opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                  {/* Overlay varies by step for illustrative design */}
                  {activeStep === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
                      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                        <div className="text-sm text-white/80">{slides[0].title}</div>
                        <div className="text-xs text-white/60">{slides[0].subtitle}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-white">{slides[0].price}</span>
                          <Button size="sm" className="rounded-full px-4 text-sm">Add</Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['Mild', 'Regular', 'Spicy'].map((opt) => (
                          <div key={opt} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-md">{opt}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
                      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                        <div className="mb-2 flex items-center gap-2 text-white/80">
                          <Lock className="h-4 w-4" /> Secure checkout
                        </div>
                        <div className="rounded-lg bg-black/50 p-3 text-white/70">
                          <div className="text-xs">Card number</div>
                          <div className="mt-1">**** **** **** 4242</div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div>Expiry</div>
                              <div className="mt-1">12/26</div>
                            </div>
                            <div>
                              <div>CVC</div>
                              <div className="mt-1">***</div>
                            </div>
                          </div>
                          <Button size="sm" className="mt-3 w-full rounded-full bg-amber-500 text-black hover:bg-amber-400">Pay ₦27.00</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
                      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-white/80">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> SO14 • ETA 20m</div>
                          <Bike className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400"></span> Order received</div>
                          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span> Preparing</div>
                          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/40"></span> Out for delivery</div>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                          <div className="h-full w-1/2 bg-amber-400"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* camera notch */}
            <div className="pointer-events-none absolute left-1/2 top-1.5 h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
} 