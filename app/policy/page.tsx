'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Hero from '@/components/UI/Hero';
import { FaShieldAlt, FaLock, FaFileContract, FaGavel } from 'react-icons/fa';

export default function Policy() {
  const policySections = [
    {
      icon: FaShieldAlt,
      title: 'Privacy Policy',
      content: [
        'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.',
        'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.',
        'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.',
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        'You have the right to access, update, or delete your personal information at any time.'
      ]
    },
    {
      icon: FaFileContract,
      title: 'Terms of Service',
      content: [
        'By using our services, you agree to be bound by these terms and conditions.',
        'Our services are provided on an "as is" basis without warranties of any kind.',
        'We reserve the right to modify or discontinue our services at any time without notice.',
        'You are responsible for maintaining the confidentiality of your account information.',
        'We may terminate or suspend your account at any time for violation of these terms.'
      ]
    },
    {
      icon: FaLock,
      title: 'Data Protection',
      content: [
        'We are committed to protecting your personal data in accordance with applicable data protection laws.',
        'We only collect data that is necessary for providing our services.',
        'Your data is stored securely and is not shared with unauthorized third parties.',
        'We regularly review and update our data protection practices.',
        'You can request information about the data we hold about you at any time.'
      ]
    },
    {
      icon: FaGavel,
      title: 'Legal Compliance',
      content: [
        'We comply with all applicable laws and regulations in Nigeria.',
        'Our services are provided in accordance with local business practices.',
        'We maintain proper licenses and certifications for our operations.',
        'We respect intellectual property rights and expect our clients to do the same.',
        'Any disputes will be resolved through appropriate legal channels.'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="Privacy Policy & Terms"
        subtitle="Legal Information"
        description="Our commitment to protecting your privacy and the terms governing our services"
        backgroundImage="/images/housekeeping.webp"
        showButtons={false}
      />

      {/* Policy Overview */}
      <section className="py-20 bg-white">
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
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Our</span>{' '}
              <span className="text-gray-800">Policies</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              At South Place Catering Services, we are committed to transparency and protecting your rights. 
              Please review our policies to understand how we handle your information and govern our services.
            </p>
          </motion.div>

          <div className="space-y-12">
            {policySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-lg"
              >
                <div className="flex items-center mb-6">
                  <section.icon className="text-orange-500 text-3xl mr-4" />
                  <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <p key={itemIndex} className="text-gray-600 leading-relaxed">
                      {item}
                    </p>
                  ))}
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
            <h2 className="text-4xl font-bold mb-6">Questions About Our Policies?</h2>
            <p className="text-xl text-gray-300 mb-8">
              If you have any questions or concerns about our privacy policy or terms of service, 
              we&apos;re here to help clarify and address your concerns.
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
