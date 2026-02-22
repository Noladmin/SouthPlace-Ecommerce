'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaAward, FaStar, FaQuoteLeft, FaTrophy, FaMedal, FaCertificate, FaChevronLeft, FaChevronRight, FaUsers, FaHeart } from 'react-icons/fa';

export default function Awards() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const awards = [
    {
      icon: FaTrophy,
      title: 'Excellence in Industrial Catering',
      organization: 'Nigerian Hospitality Association',
      description: 'Recognized for outstanding service delivery in industrial catering across oil & gas facilities.'
    },
    {
      icon: FaMedal,
      title: 'Food Safety Excellence Award',
      organization: 'HACCP International',
      description: 'Awarded for maintaining the highest standards in food safety and hygiene practices.'
    },
    {
      icon: FaCertificate,
      title: 'Best Corporate Catering Service',
      organization: 'Lagos Business Awards',
      description: 'Recognized as the leading corporate catering service provider in Lagos State.'
    },
    {
      icon: FaAward,
      title: 'Innovation in Facilities Management',
      organization: 'Nigerian Facilities Management Council',
      description: 'Awarded for innovative approaches to facilities management and operational efficiency.'
    }
  ];

  const testimonials = [
    {
      name: 'Ibiso Eteh',
      position: 'HHR',
      company: 'Lekki Freeport Terminal, Ibeju Lekki',
      content: 'South Place Catering has been an absolute pleasure to work with! Their staff canteen services have been a game-changer for our team. They&apos;ve been catering for over 700 people daily for 4 years without stress. The food is delicious, the service is top-notch, and their team is always willing to go above and beyond. We&apos;ve seen a significant boost in staff morale and satisfaction since they took over the canteen. We couldn&apos;t be happier with the service they&apos;ve provided and would highly recommend them to anyone looking for a reliable and exceptional catering partner.',
      rating: 5
    },
    {
      name: 'Dr. Adebayo Ogunlesi',
      position: 'Operations Manager',
      company: 'NETCO',
      content: 'South Place Catering has been our trusted partner for over 3 years. Their commitment to quality and reliability is unmatched. The team consistently delivers excellent service even in challenging offshore environments.',
      rating: 5
    },
    {
      name: 'Mrs. Fatima Bello',
      position: 'HR Director',
      company: 'Lekki Free Port Terminal',
      content: 'The professionalism and attention to detail shown by South Place Catering is exceptional. Our employees are always satisfied with the meal quality and service delivery.',
      rating: 5
    },
    {
      name: 'Eng. Michael Okoro',
      position: 'Project Manager',
      company: '4mation Drilling Services',
      content: 'Working with South Place Catering has significantly improved our workforce satisfaction. Their scalable solutions perfectly match our operational needs.',
      rating: 5
    }
  ];

  const certifications = [
    {
      title: 'HACCP Certified',
      description: 'Hazard Analysis and Critical Control Points certification for food safety management.',
      icon: FaCertificate
    },
    {
      title: 'ISO 22000:2018',
      description: 'Food safety management systems certification ensuring international standards.',
      icon: FaAward
    },
    {
      title: 'Tax Compliance Certificate',
      description: 'Full compliance with Nigerian tax regulations and corporate governance standards.',
      icon: FaMedal
    },
    {
      title: 'Environmental Health Certificate',
      description: 'Certified for maintaining highest environmental health and safety standards.',
      icon: FaStar
    }
  ];

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [nextTestimonial]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Awards & Reviews"
        subtitle="Recognition & Excellence"
        description="Celebrating our achievements and the trust our clients place in us. Discover the awards we've earned and what our clients say about our services."
        backgroundImage="/images/food3.webp"
        showButtons={false}
      />

      {/* Awards Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Awards</span>{' '}
              <span className="text-gray-800">& Recognition</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Our commitment to excellence has been recognized by industry leaders and professional organizations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-orange-100"
              >
                <div className="flex items-start space-x-6">
                  <div className="bg-orange-500 p-4 rounded-full flex-shrink-0">
                    <award.icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{award.title}</h3>
                    <p className="text-orange-600 font-semibold mb-3">{award.organization}</p>
                    <p className="text-gray-600 leading-relaxed">{award.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide text-center">
              <span className="text-orange-500 font-medium">Awards</span>{' '}
              <span className="text-gray-800">Gallery</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Visual showcase of our achievements and recognition certificates
            </p>
          </motion.div>

          {/* Professional Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Award 1 - Excellence in Industrial Catering */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative group overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-96 lg:h-[28rem]">
                <Image
                  src="/images/Award1.webp"
                  alt={awards[0].title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/85 group-hover:via-black/60 group-hover:to-black/40 transition-all duration-500"></div>
                
                {/* Hover Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
                  <div className="text-center text-white p-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-white/20">
                      <FaTrophy className="text-white text-4xl" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white">{awards[0].title}</h3>
                    <p className="text-orange-300 font-semibold mb-4 text-lg">{awards[0].organization}</p>
                    <p className="text-gray-100 text-base leading-relaxed max-w-md mx-auto">{awards[0].description}</p>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-bold mb-1">{awards[0].title}</h3>
                  <p className="text-orange-300 font-semibold text-sm">{awards[0].organization}</p>
                </div>
              </div>
            </motion.div>

            {/* Award 2 - Food Safety Excellence */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative group overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-96 lg:h-[28rem]">
                <Image
                  src="/images/award3.webp"
                  alt={awards[1].title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/85 group-hover:via-black/60 group-hover:to-black/40 transition-all duration-500"></div>
                
                {/* Hover Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
                  <div className="text-center text-white p-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-white/20">
                      <FaMedal className="text-white text-4xl" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white">{awards[1].title}</h3>
                    <p className="text-orange-300 font-semibold mb-4 text-lg">{awards[1].organization}</p>
                    <p className="text-gray-100 text-base leading-relaxed max-w-md mx-auto">{awards[1].description}</p>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-bold mb-1">{awards[1].title}</h3>
                  <p className="text-orange-300 font-semibold text-sm">{awards[1].organization}</p>
                </div>
              </div>
            </motion.div>

            {/* Team 1 - Professional Excellence */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative group overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-96 lg:h-[28rem]">
                <Image
                  src="/images/team1.webp"
                  alt="Our Professional Team"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/85 group-hover:via-black/60 group-hover:to-black/40 transition-all duration-500"></div>
                
                {/* Hover Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
                  <div className="text-center text-white p-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-white/20">
                      <FaUsers className="text-white text-4xl" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white">Professional Excellence</h3>
                    <p className="text-orange-300 font-semibold mb-4 text-lg">Our Trained Team</p>
                    <p className="text-gray-100 text-base leading-relaxed max-w-md mx-auto">Our trained professionals deliver exceptional service with dedication and expertise.</p>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-bold mb-1">Professional Excellence</h3>
                  <p className="text-orange-300 font-semibold text-sm">Our Trained Team</p>
                </div>
              </div>
            </motion.div>

            {/* Team 2 - Motivated & Respected */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative group overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500"
            >
              <div className="relative h-96 lg:h-[28rem]">
                <Image
                  src="/images/team2.webp"
                  alt="Motivated Team Members"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/85 group-hover:via-black/60 group-hover:to-black/40 transition-all duration-500"></div>
                
                {/* Hover Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
                  <div className="text-center text-white p-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-white/20">
                      <FaHeart className="text-white text-4xl" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white">Motivated & Respected</h3>
                    <p className="text-orange-300 font-semibold mb-4 text-lg">Team Culture</p>
                    <p className="text-gray-100 text-base leading-relaxed max-w-md mx-auto">We foster a culture of respect and motivation that drives our team to excel.</p>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:opacity-0 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-bold mb-1">Motivated & Respected</h3>
                  <p className="text-orange-300 font-semibold text-sm">Team Culture</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Carousel */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/food1.webp"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-300 to-orange-200 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-white mb-6 tracking-wide">
              <span className="text-orange-300 font-medium">Client</span>{' '}
              <span className="text-white">Testimonials</span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              Don&apos;t just take our word for it. Here&apos;s what our valued clients have to say about our services.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-12 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-2xl mx-1" />
                    ))}
                  </div>
                  <FaQuoteLeft className="text-orange-500 text-4xl mb-6 mx-auto" />
                  <p className="text-xl text-gray-700 leading-relaxed mb-8 italic text-center max-w-3xl mx-auto">
                    &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                  </p>
                  <div className="text-center border-t border-gray-200 pt-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-orange-600 font-semibold text-lg">{testimonials[currentTestimonial].position}</p>
                    <p className="text-gray-500">{testimonials[currentTestimonial].company}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-orange-400 text-gray-800 hover:text-black p-4 rounded-full shadow-lg transition-all duration-300 z-10"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-orange-400 text-gray-800 hover:text-black p-4 rounded-full shadow-lg transition-all duration-300 z-10"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-xl" />
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-orange-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Certifications</span>{' '}
              <span className="text-gray-800">& Standards</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We maintain the highest industry standards and certifications to ensure quality, safety, and compliance in all our operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors duration-300"
              >
                <div className="bg-orange-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <cert.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{cert.title}</h3>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
