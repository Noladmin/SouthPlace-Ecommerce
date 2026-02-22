"use client"

import Link from "next/link"
import { motion } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, ArrowRight, MessageCircle, Sparkles, ChevronRight } from "lucide-react"
import ContactForm from "@/components/contact-form"
import WhatsAppContact from "@/components/whatsapp-contact"

export default function ContactPageClient() {
  return (
    <div className="pt-24 pb-16">
      {/* Modern Hero Section */}
      <section className="relative py-28 overflow-hidden bg-gray-50">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-orange-50/30" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-orange-100 mb-6"
            >
              <MessageCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Get In Touch</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 font-display text-gray-900 leading-tight"
            >
              Let's Talk About Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                Next Order
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-500 max-w-2xl mx-auto"
            >
              Have questions or need to place an order? We're here to help bring authentic African cuisine to your table.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Modern Contact Information Cards */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Call Us</h3>
              <p className="text-gray-500 mb-4 text-sm">Our friendly team is here to help.</p>
              <p className="text-2xl font-bold text-orange-600">+234-806-779-3091</p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-400 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Mon-Fri: 9am-6pm
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Email Us</h3>
              <p className="text-gray-500 mb-4 text-sm">We'll respond as soon as possible.</p>
              <p className="text-sm font-bold text-orange-600 break-all">southplacecatering@gmail.com</p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-400 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Within 24 hours
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-gray-900">WhatsApp</h3>
              <p className="text-gray-500 mb-4 text-sm">Quick orders and instant support.</p>
              <div className="mt-6">
                <WhatsAppContact
                  message="Hello! I'd like to place an order or ask about your menu."
                  className="w-full rounded-xl py-3 font-semibold bg-orange-600 hover:bg-orange-500 text-black"
                >
                  Chat Now
                </WhatsAppContact>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Visit Us</h3>
              <p className="text-gray-500 mb-4 text-sm">Come say hello at our location.</p>
              <p className="text-lg font-bold text-orange-600">Lagos</p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Button asChild variant="outline" size="sm" className="rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 font-semibold text-gray-600 hover:text-orange-700">
                  <Link href="#map">
                    View on Map <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 mb-6"
                  >
                    <Sparkles className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">Send A Message</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl lg:text-5xl font-bold mb-6 font-display text-gray-900"
                  >
                    Let's Start a{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                      Conversation
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-500 mb-8"
                  >
                    Whether you have questions about our menu, want to place an order, or need catering for an event, our
                    team is ready to assist you. Fill out the form, and we'll get back to you as soon as possible.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 p-8 rounded-2xl shadow-inner border border-gray-100"
                >
                  <h3 className="text-2xl font-bold mb-6 font-display text-gray-900">Follow Us</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/tasty_bowls_southampton?igsh=MWd1azh0emNhNnJkag=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 text-white flex items-center justify-center hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z"></path>
                      </svg>
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M16.6 5.82C15.9165 5.03962 15.5397 4.03743 15.54 3H12.45V15.4C12.4494 15.9501 12.2489 16.4797 11.8856 16.886C11.5222 17.2923 11.0197 17.5442 10.47 17.6C9.75523 17.6767 9.04195 17.4782 8.48587 17.0509C7.92979 16.6236 7.58066 15.9981 7.52 15.32C7.46583 14.6656 7.68931 14.0222 8.13957 13.5288C8.58982 13.0354 9.22533 12.7323 9.9 12.68C10.1408 12.6581 10.3833 12.6661 10.62 12.7V9.63C10.4185 9.61407 10.2163 9.60553 10.014 9.604C8.93532 9.60036 7.88044 9.89125 6.97077 10.4445C6.0611 10.9978 5.33572 11.7929 4.88044 12.7358C4.42517 13.6788 4.25845 14.7346 4.40295 15.7743C4.54745 16.814 4.99818 17.7908 5.70043 18.5908C6.40268 19.3908 7.32848 19.9815 8.35946 20.3024C9.39044 20.6232 10.4807 20.6626 11.5395 20.4165C12.5983 20.1704 13.5844 19.6472 14.3844 18.8989C15.1843 18.1506 15.7686 17.2051 16.07 16.16C16.0895 16.1068 16.1053 16.0526 16.1173 15.9978V8.92C17.1351 9.6301 18.3141 10.0067 19.52 10.01V6.91C18.9992 6.90931 18.4827 6.82203 17.9943 6.65191C17.5058 6.48178 17.0526 6.23201 16.66 5.91L16.6 5.82Z"></path>
                      </svg>
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm">
                      <Clock className="h-7 w-7 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 font-display">Business Hours</h3>
                      <div className="space-y-2 text-gray-500">
                        <p className="flex justify-between">
                          <span className="font-medium">Monday - Friday:</span>
                          <span>9:00 AM - 6:00 PM</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Saturday:</span>
                          <span>10:00 AM - 4:00 PM</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Sunday:</span>
                          <span className="text-sm">Pre-booked events only</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-100 sticky top-24">
                  <h2 className="text-2xl font-bold mb-8 font-display">Send Us a Message</h2>
                  <ContactForm />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-orange-100">
              Our Location
            </span>
            <h2 className="text-4xl font-bold mb-6 font-display">Find Us</h2>
            <p className="text-lg text-gray-500">
              Located in the heart of Lagos, we're easily accessible and ready to serve you.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl h-[500px] relative border border-gray-100 transform hover:scale-[1.01] transition-transform duration-500">
            <iframe
              src="https://www.google.com/maps?q=Lagos%2C%20Nigeria&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="South Place Lagos Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-orange-800 to-gray-900 opacity-95"></div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
            >
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white">Start Your Journey</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-display leading-tight"
            >
              Ready to Experience{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Authentic African Cuisine?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Place your order now or contact us to discuss catering for your next event.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="group rounded-full px-10 py-7 text-lg font-bold bg-white text-orange-900 hover:bg-gray-100 shadow-2xl shadow-black/20 border-0"
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
                className="rounded-full px-10 py-7 text-lg font-bold border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:text-white transition-all transform hover:-translate-y-0.5"
              >
                <Link href="/menu">View Menu</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
