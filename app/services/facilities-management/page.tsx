'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaBuilding, FaTools, FaShieldAlt, FaCog } from 'react-icons/fa';

export default function FacilitiesManagement() {
  const services = [
    {
      icon: FaTools,
      title: 'Preventive Maintenance',
      description: 'Regular maintenance schedules to prevent equipment failures and extend asset life.'
    },
    {
      icon: FaShieldAlt,
      title: 'Security Services',
      description: 'Comprehensive security solutions to protect your premises and assets.'
    },
    {
      icon: FaCog,
      title: 'Utility Management',
      description: 'Efficient management of electricity, water, and other utilities to reduce costs.'
    },
    {
      icon: FaBuilding,
      title: 'Space Optimization',
      description: 'Strategic space planning and utilization to maximize efficiency and productivity.'
    }
  ];

  const benefits = [
    'Reduced operational costs through efficient management',
    'Extended asset life through preventive maintenance',
    'Improved workplace safety and compliance',
    'Enhanced productivity through optimized spaces',
    '24/7 emergency response capabilities',
    'Professional facility management expertise'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Facilities Management Services"
        subtitle="Comprehensive Solutions"
        description="Professional facilities management to keep your premises running smoothly and efficiently"
        backgroundImage="/images/food3.webp"
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
              <span className="text-orange-500 font-medium">Complete</span>{' '}
              <span className="text-gray-800">Facilities Management</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              Our comprehensive facilities management services ensure your premises operate at peak efficiency. 
              From maintenance to security, we handle all aspects of facility operations so you can focus on your core business.
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
                <span className="text-gray-800">Our Facilities Management?</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                Our experienced facilities management team provides comprehensive solutions tailored to your specific needs. 
                We combine technical expertise with operational efficiency to ensure your facilities run smoothly and cost-effectively.
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
                src="/images/catering2.webp"
                alt="Facilities manager checking building maintenance"
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
              <span className="text-gray-800">Management Approach</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We follow a systematic approach to facilities management that ensures optimal performance and cost efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Facility Assessment',
                description: 'Comprehensive evaluation of your facilities, systems, and requirements to develop customized management strategies.'
              },
              {
                step: '02',
                title: 'Strategic Planning',
                description: 'Development of detailed management plans, schedules, and protocols tailored to your operational needs and budget.'
              },
              {
                step: '03',
                title: 'Implementation & Monitoring',
                description: 'Execution of management plans with continuous monitoring, reporting, and optimization for maximum efficiency.'
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
            <h2 className="text-4xl font-bold mb-6">Optimize Your Facilities Today</h2>
            <p className="text-xl text-gray-300 mb-8">
              Let us help you streamline your facilities management and reduce operational costs while improving efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                  Get Free Assessment
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
