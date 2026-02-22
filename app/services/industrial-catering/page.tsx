'use client';

import { motion } from '@/lib/motion';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import { FaCheck, FaUtensils, FaClock, FaUsers, FaShieldAlt, FaCalendarAlt, FaGraduationCap, FaHeart, FaTrophy } from 'react-icons/fa';

export default function IndustrialCatering() {
  const features = [
    {
      icon: FaUtensils,
      title: 'Customized Menu Planning',
      description: 'Tailored menus designed to meet the nutritional needs and preferences of your workforce.'
    },
    {
      icon: FaClock,
      title: 'Flexible Scheduling',
      description: 'Adaptable meal times and delivery schedules to accommodate shift patterns and operational requirements.'
    },
    {
      icon: FaUsers,
      title: 'Bulk Preparation',
      description: 'Efficient large-scale meal preparation ensuring consistent quality and timely service.'
    },
    {
      icon: FaShieldAlt,
      title: 'Food Safety Standards',
      description: 'Strict adherence to HACCP principles and food safety regulations for industrial environments.'
    },
    {
      icon: FaCalendarAlt,
      title: 'Office Lunch and End of Year Parties',
      description: 'Professional catering services for corporate events, office lunches, and end-of-year celebrations.'
    }
  ];

  const benefits = [
    'Improved employee satisfaction and morale',
    'Enhanced productivity through proper nutrition',
    'Reduced absenteeism and health issues',
    'Cost-effective meal solutions',
    'Compliance with workplace safety standards',
    'Professional service management'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Industrial Catering Services"
        subtitle="Fueling Productivity"
        description="Professional catering solutions designed specifically for Onshore and Offshore Oil & Gas Facilities and Large Scale Operations"
        backgroundImage="/images/food1.webp"
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
            <h2 className="text-5xl font-light text-gray-900 mb-8 tracking-wide">Professional Industrial Catering</h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-4xl mx-auto">
              Our industrial catering services are specifically designed to meet the unique demands of Onshore and Offshore Oil & Gas Facilities and Large Scale Operations. 
              We understand that your workforce needs nutritious, satisfying meals to maintain peak performance throughout their shifts.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white rounded-2xl hover:bg-orange-50 transition-all duration-500 shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <feature.icon className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4 tracking-wide">{feature.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Value Proposition Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20 bg-gradient-to-r from-orange-50 to-orange-100 p-12 rounded-3xl shadow-xl border border-orange-200"
          >
            <div className="inline-block mb-6">
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h3 className="text-4xl font-light text-gray-900 mb-8 tracking-wide">Our Value Proposition</h3>
            <p className="text-2xl text-gray-700 font-light mb-10 leading-relaxed">
              &ldquo;Reliable, hygienic and scalable meal solutions for industrial teams - delivered fresh, on time and every time.&rdquo;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-medium text-orange-600 mb-3 text-lg">Reliable</h4>
                <p className="text-gray-700 font-light">Emphasis consistency, which is critical for onshore and offshore locations.</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-medium text-orange-600 mb-3 text-lg">Hygienic</h4>
                <p className="text-gray-700 font-light">Address food safety concerns - especially important in industrial settings.</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-medium text-orange-600 mb-3 text-lg">Scalable</h4>
                <p className="text-gray-700 font-light">Signals your ability to handle large volumes and grow with clients needs.</p>
              </div>
            </div>
            <p className="text-gray-700 mt-8 text-lg font-light">Delivered fresh, on time and punctuality and operational excellence.</p>
          </motion.div>

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
                <span className="text-gray-800">Our Industrial Catering?</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed font-light">
                We specialize in providing comprehensive catering solutions for industrial environments. 
                Our experienced team understands the challenges of feeding large workforces and has developed 
                efficient systems to ensure consistent quality and service.
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
                src="/images/food2.webp"
                alt="Industrial cafeteria serving workers"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Empowerment Section */}
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
              <span className="text-orange-500 font-medium">Team</span>{' '}
              <span className="text-gray-800">Empowerment</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Our staff are trained, respected and motivated to serve with excellence. We believe that empowered teams deliver exceptional service.
            </p>
          </motion.div>

          {/* Team Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/team1.webp"
                  alt="Our Professional Team"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Professional Excellence</h3>
                  <p className="text-gray-200">Our trained professionals deliver exceptional service with dedication and expertise.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/team2.webp"
                  alt="Motivated Team Members"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Motivated & Respected</h3>
                  <p className="text-gray-200">We foster a culture of respect and motivation that drives our team to excel.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Team Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg border border-orange-100"
            >
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Training</h3>
              <p className="text-gray-600 leading-relaxed">Our team undergoes regular training to stay updated with industry best practices and safety standards.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg border border-orange-100"
            >
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Respect & Dignity</h3>
              <p className="text-gray-600 leading-relaxed">We treat every team member with respect and dignity, creating a positive work environment.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg border border-orange-100"
            >
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence Focus</h3>
              <p className="text-gray-600 leading-relaxed">We motivate our team to strive for excellence in every aspect of service delivery.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Badges Section */}
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
              className="bg-white p-8 rounded-lg shadow-lg text-center"
            >
              <div className="bg-orange-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaShieldAlt className="text-4xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tax Compliance</h3>
              <p className="text-gray-600">Fully compliant with all tax regulations and requirements, ensuring transparent and lawful operations.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-lg text-center"
            >
              <div className="bg-orange-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaShieldAlt className="text-4xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">HACCP Compliance</h3>
              <p className="text-gray-600">Strict adherence to Hazard Analysis and Critical Control Points for food safety and quality assurance.</p>
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
              <span className="text-gray-800">Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              We follow a systematic approach to ensure your industrial catering needs are met efficiently and effectively.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Assessment & Planning',
                description: 'We evaluate your facility, workforce size, dietary requirements, and operational constraints to develop a customized catering plan.'
              },
              {
                step: '02',
                title: 'Menu Development',
                description: 'Our nutritionists work with your team to create balanced, appealing menus that meet nutritional standards and cultural preferences.'
              },
              {
                step: '03',
                title: 'Implementation & Service',
                description: 'We establish efficient service systems, train our staff, and begin delivering consistent, high-quality meals to your workforce.'
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

    </div>
  );
}
