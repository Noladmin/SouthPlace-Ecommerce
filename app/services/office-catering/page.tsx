'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCalendarAlt, FaUsers, FaUtensils, FaStar, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function OfficeCatering() {
  const features = [
    {
      icon: FaCalendarAlt,
      title: 'Corporate Events',
      description: 'Professional catering for corporate meetings, conferences, and special events with customized menus.'
    },
    {
      icon: FaUsers,
      title: 'Office Lunch Programs',
      description: 'Regular office lunch services that keep your team energized and satisfied throughout the workday.'
    },
    {
      icon: FaUtensils,
      title: 'End of Year Celebrations',
      description: 'Memorable end-of-year parties and celebrations with festive menus and professional service.'
    },
    {
      icon: FaStar,
      title: 'Custom Menu Planning',
      description: 'Tailored menu options that accommodate dietary restrictions and company preferences.'
    }
  ];

  const benefits = [
    'Enhanced team bonding and morale',
    'Convenient and time-saving meal solutions',
    'Professional presentation and service',
    'Flexible scheduling and delivery options',
    'Cost-effective catering packages',
    'Memorable dining experiences'
  ];

  const services = [
    'Daily office lunch delivery',
    'Corporate meeting catering',
    'Conference and seminar catering',
    'End-of-year celebration parties',
    'Team building event catering',
    'Holiday party catering',
    'Product launch events',
    'Award ceremonies and galas'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Office Lunch and End of Year Parties"
        subtitle="Corporate Catering Excellence"
        description="Professional catering services for corporate events, office lunches, and end-of-year celebrations. We create memorable dining experiences that bring teams together."
        backgroundImage="/images/food3.webp"
        showButtons={false}
      />

      {/* Service Overview */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto text-center mb-20"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-8 tracking-wide">
              <span className="text-orange-500 font-medium">Professional</span>{' '}
              <span className="text-gray-800">Corporate Catering</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              Our office catering services are designed to enhance your corporate culture and bring your team together through exceptional dining experiences. 
              From daily office lunches to grand end-of-year celebrations, we provide professional catering solutions that exceed expectations.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <feature.icon className="text-orange-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-lg overflow-hidden"
            >
              <Image
                src="/images/food1.webp"
                alt="Corporate catering setup"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <div className="inline-block mb-6">
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
                </div>
                <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
                  <span className="text-orange-500 font-medium">Our</span>{' '}
                  <span className="text-gray-800">Services</span>
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We offer comprehensive corporate catering solutions tailored to your company&apos;s needs and culture. 
                Our experienced team ensures every event is executed flawlessly, from intimate office lunches to large-scale celebrations.
              </p>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <FaCheck className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Why Choose</span>{' '}
              <span className="text-gray-800">Our Office Catering?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We understand the importance of corporate dining experiences and their impact on team morale and productivity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start">
                  <FaCheck className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              <span className="text-orange-500 font-medium">Our</span>{' '}
              <span className="text-gray-800">Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              From initial consultation to event execution, we ensure a seamless and professional catering experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Consultation',
                description: 'We discuss your event requirements, dietary needs, and preferences to create the perfect catering plan.'
              },
              {
                step: '02',
                title: 'Menu Planning',
                description: 'Our culinary team designs custom menus that align with your company culture and event objectives.'
              },
              {
                step: '03',
                title: 'Preparation',
                description: 'Fresh ingredients are prepared with attention to quality, presentation, and food safety standards.'
              },
              {
                step: '04',
                title: 'Service',
                description: 'Professional service staff ensures smooth execution and exceptional dining experience for your team.'
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">
              Ready to Elevate Your Corporate Dining Experience?
            </h2>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Let us create memorable dining experiences for your team. Contact us today to discuss your office catering needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Get Free Quote
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </Link>
              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors hover:bg-white hover:text-orange-600 flex items-center justify-center"
                >
                  View All Services
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
