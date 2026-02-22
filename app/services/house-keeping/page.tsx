'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaBroom, FaSprayCan, FaTrash, FaBox } from 'react-icons/fa';

export default function Housekeeping() {
  const services = [
    {
      icon: FaBroom,
      title: 'Daily Cleaning Services',
      description: 'Regular cleaning schedules to maintain cleanliness and hygiene standards throughout your facility.'
    },
    {
      icon: FaSprayCan,
      title: 'Deep Cleaning Programs',
      description: 'Comprehensive deep cleaning services for thorough sanitization and maintenance of all areas.'
    },
    {
      icon: FaTrash,
      title: 'Waste Management',
      description: 'Efficient waste collection, segregation, and disposal services following environmental guidelines.'
    },
    {
      icon: FaBox,
      title: 'Supply Management',
      description: 'Management of cleaning supplies, equipment, and materials to ensure continuous service delivery.'
    }
  ];

  const benefits = [
    'Maintained cleanliness and hygiene standards',
    'Improved workplace health and safety',
    'Professional appearance of facilities',
    'Reduced risk of contamination and illness',
    'Compliance with health regulations',
    'Cost-effective cleaning solutions'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Housekeeping Services"
        subtitle="Professional Cleanliness"
        description="Maintaining the highest standards of cleanliness and hygiene for your facilities"
        backgroundImage="/images/housekeeping1.webp"
        showButtons={false}
      />

      {/* Service Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Professional</span>{' '}
              <span className="text-gray-800">Housekeeping</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              Our housekeeping services ensure your facilities maintain the highest standards of cleanliness and hygiene. 
              We provide comprehensive cleaning solutions tailored to your specific needs and requirements.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div id="services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <service.icon className="text-orange-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-6">
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
              </div>
              <h3 className="text-4xl font-light text-gray-900 mb-6 tracking-wide">
                <span className="text-orange-500 font-medium">Why Choose</span>{' '}
                <span className="text-gray-800">Our Housekeeping Services?</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                Our trained housekeeping staff uses professional-grade equipment and eco-friendly cleaning products 
                to ensure your facilities are not only clean but also safe for occupants and environmentally responsible.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <FaCheck className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-lg overflow-hidden"
            >
              <Image
                src="/images/housekeeping.webp"
                alt="Professional cleaner in office building"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              <span className="text-orange-500 font-medium">Our</span>{' '}
              <span className="text-gray-800">Cleaning Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We follow systematic cleaning protocols to ensure consistent quality and thorough sanitization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Assessment & Planning',
                description: 'Thorough evaluation of your facility to identify cleaning requirements and develop customized cleaning schedules.'
              },
              {
                step: '02',
                title: 'Equipment & Supplies',
                description: 'Deployment of professional-grade cleaning equipment and eco-friendly supplies for effective cleaning.'
              },
              {
                step: '03',
                title: 'Execution & Quality Control',
                description: 'Systematic cleaning execution with regular quality checks to ensure standards are consistently met.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-lg shadow-lg"
              >
                <div className="text-4xl font-bold text-orange-500 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Keep Your Facilities Spotless</h2>
            <p className="text-xl mb-8">
              Contact us today to discuss your housekeeping requirements and discover how we can help maintain 
              the highest standards of cleanliness for your facilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                  Get Free Quote
                </motion.button>
              </Link>
              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
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
