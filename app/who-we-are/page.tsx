'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaUsers, FaAward, FaHandshake, FaStar, FaArrowRight, FaShieldAlt, FaFileInvoice } from 'react-icons/fa';

export default function WhoWeAre() {
  const values = [
    {
      icon: FaHandshake,
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and ethical practices in all our operations.'
    },
    {
      icon: FaUsers,
      title: 'Customer Focus',
      description: 'Our clients are at the center of everything we do, ensuring their satisfaction and success.'
    },
    {
      icon: FaAward,
      title: 'Excellence',
      description: 'We strive for the highest standards in service delivery, quality, and professional performance.'
    },
    {
      icon: FaStar,
      title: 'Innovation',
      description: 'We continuously improve our services through innovation and adoption of best practices.'
    },
    {
      icon: FaShieldAlt,
      title: 'HACCP Compliance',
      description: 'Strict adherence to Hazard Analysis and Critical Control Points for food safety and quality assurance.'
    },
    {
      icon: FaFileInvoice,
      title: 'Tax Compliance',
      description: 'Fully compliant with all tax regulations and requirements, ensuring transparent and lawful operations.'
    }
  ];

  const achievements = [
    { number: '8', label: 'Years of Operations' },
    { number: '50+', label: 'Happy Clients' },
    { number: '1000+', label: 'Projects Completed' },
    { number: '24/7', label: 'Support Available' }
  ];

  const whyChooseUs = [
    'Experienced and qualified management staff',
    'Outstanding standards in service delivery',
    'Cost-effective solutions for all clients',
    'Diverse range of industry expertise',
    'Commitment to quality and reliability',
    'Professional and courteous service'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Who We Are"
        subtitle="About South Place"
        description="An indigenous hospitality company with experienced and qualified management staff, committed to providing outstanding standards and cost-effective services with 8 years of operations"
        backgroundImage="/images/catering2.webp"
        showButtons={false}
      />

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
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
                  <span className="text-gray-800">Story</span>
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Welcome to South Place! South Place Catering Services is an indigenous company founded on 
                commitment to excellent depth and comprehensive scope of professional catering service. With 8 years 
                of operations, we are committed to providing high class catering services to the full satisfaction 
                of our clients.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                It is the policy of South Place Catering Services to design executive works and to provide services 
                that fully meet the requirement and expectation of our clients at all times. Our dedication to excellence, 
                integrity, and customer satisfaction has made us a trusted partner for leading companies across Nigeria.
              </p>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  Get In Touch
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-lg overflow-hidden"
            >
              <Image
                src="/images/food1.webp"
                alt="Business team discussing strategy"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
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
              <span className="text-gray-800">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Our core values guide everything we do and shape our commitment to excellence in service delivery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <value.icon className="text-orange-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-white mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Our</span>{' '}
              <span className="text-white">Achievements</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Numbers that reflect our commitment to excellence and client satisfaction.
            </p>
          </motion.div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-12 shadow-2xl border border-orange-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <div className="text-2xl font-light text-white">{achievement.number}</div>
                  </div>
                  <div className="text-5xl font-light text-orange-600 mb-2">{achievement.number}</div>
                  <div className="text-gray-700 font-medium">{achievement.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
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
                src="/images/catering1.webp"
                alt="Successful business meeting"
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
                  <span className="text-orange-500 font-medium">Why Choose</span>{' '}
                  <span className="text-gray-800">Us?</span>
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We stand out in the industry through our commitment to quality, innovation, and client satisfaction. 
                Our experienced team and proven track record make us the preferred choice for leading companies.
              </p>
              <ul className="space-y-3">
                {whyChooseUs.map((reason, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <FaCheck className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Badges Section */}
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
              <span className="text-orange-500 font-medium">Compliance</span>{' '}
              <span className="text-gray-800">& Certifications</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We maintain the highest standards of compliance and certification to ensure quality and safety in all our operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-lg shadow-lg text-center"
            >
              <div className="bg-orange-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaAward className="text-4xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tax Compliance</h3>
              <p className="text-gray-600">Fully compliant with all tax regulations and requirements, ensuring transparent and lawful operations.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-lg shadow-lg text-center"
            >
              <div className="bg-orange-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaAward className="text-4xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">HACCP Compliance</h3>
              <p className="text-gray-600">Strict adherence to Hazard Analysis and Critical Control Points for food safety and quality assurance.</p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
