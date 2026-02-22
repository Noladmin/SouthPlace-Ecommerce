'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import SectionTitle from '@/components/UI/SectionTitle';
import { FaUtensils, FaBuilding, FaBroom, FaTshirt, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';

export default function Services() {
  const services = [
    {
      id: 1,
      title: 'Industrial Catering',
      description: 'Professional catering services designed specifically for Onshore and Offshore Oil & Gas Facilities and large-scale operations. We ensure your workforce receives nutritious, delicious meals that fuel productivity.',
      features: [
        'Customized menu planning',
        'Bulk meal preparation',
        'Quality food safety standards',
        'Flexible delivery schedules',
        'Nutritional balance focus'
      ],
      icon: FaUtensils,
      link: '/services/industrial-catering',
      image: '/images/catering2.webp'
    },
    {
      id: 2,
      title: 'Facilities Management',
      description: 'Comprehensive facilities management solutions to keep your premises running smoothly. From maintenance to security, we handle all aspects of facility operations.',
      features: [
        'Preventive maintenance',
        'Security services',
        'Utility management',
        'Space optimization',
        'Emergency response'
      ],
      icon: FaBuilding,
      link: '/services/facilities-management',
      image: '/images/catering3.webp'
    },
    {
      id: 3,
      title: 'Housekeeping',
      description: 'Professional housekeeping services maintaining the highest standards of cleanliness and hygiene. Our trained staff ensures your facilities are spotless and welcoming.',
      features: [
        'Daily cleaning services',
        'Deep cleaning programs',
        'Sanitization protocols',
        'Waste management',
        'Supply management'
      ],
      icon: FaBroom,
      link: '/services/house-keeping',
      image: '/images/housekeeping1.webp'
    },
    {
      id: 4,
      title: 'Office Lunch and End of Year Parties',
      description: 'Professional catering services for corporate events, office lunches, and end-of-year celebrations. We create memorable dining experiences that bring teams together.',
      features: [
        'Corporate event catering',
        'Office lunch programs',
        'End-of-year celebrations',
        'Custom menu planning',
        'Professional service staff'
      ],
      icon: FaCalendarAlt,
      link: '/services/office-catering',
      image: '/images/food3.webp'
    },
    {
      id: 5,
      title: 'Laundry Services',
      description: 'Efficient laundry and linen management services for hotels, hospitals, and corporate facilities. We ensure your linens are always clean, fresh, and professionally maintained.',
      features: [
        'Industrial laundry equipment',
        'Linen inventory management',
        'Quality control processes',
        'Pickup and delivery',
        'Specialized fabric care'
      ],
      icon: FaTshirt,
      link: '/services/laundry-services',
      image: '/images/laundery.webp'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Our Services"
        subtitle="Comprehensive Solutions"
        description="Professional catering and facilities management services tailored to meet your specific needs"
        backgroundImage="/images/catering2.webp"
        showButtons={false}
      />

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionTitle 
              description="From industrial catering to comprehensive facilities management, we provide end-to-end solutions that ensure your operations run smoothly and efficiently."
            >
              <span className="text-orange-500">What We</span>{' '}
              <span className="text-gray-900">Offer</span>
            </SectionTitle>
          </motion.div>

          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
                      <service.icon className="text-white text-6xl" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Features:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <FaArrowRight className="text-orange-500 mr-3 text-sm" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={service.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
                    >
                      Learn More
                      <FaArrowRight className="ml-2" />
                    </motion.button>
                  </Link>
                </div>
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
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-300 to-orange-200 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-white mb-6 tracking-wide">
              <span className="text-orange-300 font-medium">Ready</span>{' '}
              <span className="text-white">to Get Started?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              Contact us today to discuss your specific requirements and how we can help your business succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                  Contact Us
                </motion.button>
              </Link>
              <Link href="/who-we-are">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
                >
                  Learn About Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
