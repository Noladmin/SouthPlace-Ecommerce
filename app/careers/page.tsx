'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaUsers, FaBriefcase, FaGraduationCap, FaHeart, FaArrowRight } from 'react-icons/fa';

export default function Careers() {
  const benefits = [
    {
      icon: FaGraduationCap,
      title: 'Professional Development',
      description: 'Continuous learning opportunities and skill enhancement programs.'
    },
    {
      icon: FaUsers,
      title: 'Team Environment',
      description: 'Collaborative work culture with supportive colleagues and management.'
    },
    {
      icon: FaBriefcase,
      title: 'Career Growth',
      description: 'Clear career progression paths and advancement opportunities.'
    },
    {
      icon: FaHeart,
      title: 'Work-Life Balance',
      description: 'Flexible schedules and employee wellness programs.'
    }
  ];

  const positions = [
    {
      title: 'Catering Manager',
      department: 'Operations',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      description: 'Lead catering operations and ensure quality service delivery.'
    },
    {
      title: 'Facilities Coordinator',
      department: 'Facilities Management',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      description: 'Coordinate facilities management activities and maintenance schedules.'
    },
    {
      title: 'Housekeeping Supervisor',
      department: 'Housekeeping',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      description: 'Supervise housekeeping staff and maintain cleanliness standards.'
    },
    {
      title: 'Laundry Specialist',
      department: 'Laundry Services',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      description: 'Handle specialized laundry operations and quality control.'
    }
  ];

  const whyJoinUs = [
    'Competitive salary and benefits package',
    'Health insurance and wellness programs',
    'Professional development opportunities',
    'Collaborative and inclusive work environment',
    'Career advancement and growth potential',
    'Recognition and reward programs'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Join Our Team"
        subtitle="Career Opportunities"
        description="Be part of a dynamic team delivering excellence in catering and facilities management services"
        backgroundImage="/images/catering1.webp"
        showButtons={false}
      />

      {/* Why Join Us */}
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
              <span className="text-orange-500 font-medium">Why Join</span>{' '}
              <span className="text-gray-800">South Place Catering?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We&apos;re building a team of passionate professionals who are committed to delivering exceptional service 
              and making a difference in the hospitality industry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <benefit.icon className="text-orange-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

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
                <span className="text-orange-500 font-medium">Our</span>{' '}
                <span className="text-gray-800">Culture</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                At South Place Catering, we believe in fostering a positive work environment where every team member 
                can thrive and contribute to our collective success. We value diversity, innovation, and continuous improvement.
              </p>
              <ul className="space-y-3">
                {whyJoinUs.map((reason, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <FaCheck className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                    {reason}
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
                alt="Happy employees celebrating success"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section id="positions" className="py-20 bg-gray-50">
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
              <span className="text-orange-500 font-medium">Current</span>{' '}
              <span className="text-gray-800">Openings</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Explore our current job opportunities and find the perfect role to advance your career with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {positions.map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    {position.type}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Department:</span> {position.department}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span> {position.location}
                  </p>
                </div>
                <p className="text-gray-600 mb-6">{position.description}</p>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    Apply Now
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
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
              <span className="text-orange-500 font-medium">Application</span>{' '}
              <span className="text-gray-800">Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Our straightforward application process ensures we find the right fit for both you and our team.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Submit Application',
                description: 'Send us your resume and cover letter through our contact form or email.'
              },
              {
                step: '02',
                title: 'Initial Screening',
                description: 'Our HR team will review your application and contact qualified candidates.'
              },
              {
                step: '03',
                title: 'Interview Process',
                description: 'Meet with our team to discuss the role and assess mutual fit.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="text-4xl font-bold text-orange-500 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
