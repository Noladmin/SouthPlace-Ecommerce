'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaTshirt, FaClipboardCheck, FaTruck, FaMagic } from 'react-icons/fa';

export default function LaundryServices() {
  const services = [
    {
      icon: FaTshirt,
      title: 'Industrial Laundry Equipment',
      description: 'State-of-the-art industrial washing machines and dryers for efficient large-scale laundry processing.'
    },
    {
      icon: FaClipboardCheck,
      title: 'Quality Control Processes',
      description: 'Rigorous quality checks and inspection procedures to ensure consistent high-quality results.'
    },
    {
      icon: FaTruck,
      title: 'Pickup and Delivery',
      description: 'Convenient pickup and delivery services to minimize disruption to your operations.'
    },
    {
      icon: FaMagic,
      title: 'Specialized Fabric Care',
      description: 'Expert care for different fabric types including delicate materials and specialized uniforms.'
    }
  ];

  const benefits = [
    'Consistent high-quality laundry results',
    'Reduced operational costs',
    'Extended linen life through proper care',
    'Professional appearance maintenance',
    'Compliance with hygiene standards',
    'Convenient pickup and delivery service'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Laundry Services"
        subtitle="Professional Care"
        description="Efficient laundry and linen management services for hotels, hospitals, and corporate facilities"
        backgroundImage="/images/housekeeping.webp"
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
              <span className="text-gray-800">Laundry Services</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              Our laundry services ensure your linens and uniforms are always clean, fresh, and professionally maintained. 
              We use industrial-grade equipment and specialized processes to deliver consistent, high-quality results.
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
                <span className="text-gray-800">Our Laundry Services?</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                Our laundry services combine industrial efficiency with professional care to ensure your linens and uniforms 
                maintain their quality and appearance. We understand the importance of clean, well-maintained textiles in professional environments.
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
                src="/images/housekeeping1.webp"
                alt="Industrial laundry facility workers"
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
              <span className="text-gray-800">Laundry Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We follow systematic laundry processes to ensure consistent quality and proper care of all textiles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Collection & Sorting',
                description: 'Efficient collection of soiled linens with careful sorting by fabric type, color, and cleaning requirements.'
              },
              {
                step: '02',
                title: 'Processing & Cleaning',
                description: 'Professional cleaning using appropriate detergents and techniques for different fabric types and soil levels.'
              },
              {
                step: '03',
                title: 'Quality Control & Delivery',
                description: 'Thorough inspection and quality control before packaging and timely delivery back to your facility.'
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
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Professional Laundry Solutions</h2>
            <p className="text-xl text-gray-300 mb-8">
              Let us handle your laundry needs with professional care and efficiency. Contact us today to discuss 
              your requirements and discover how we can help maintain your textiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                  Get Free Quote
                </motion.button>
              </Link>
              <Link href="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
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
