'use client';

import Link from 'next/link';
import { motion } from '@/lib/motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-white">
      {/* Zigzag Wave Design */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-full">
        <svg className="relative block w-full h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,60 L50,20 L100,60 L150,20 L200,60 L250,20 L300,60 L350,20 L400,60 L450,20 L500,60 L550,20 L600,60 L650,20 L700,60 L750,20 L800,60 L850,20 L900,60 L950,20 L1000,60 L1050,20 L1100,60 L1150,20 L1200,60 L1200,60 L0,60 Z" fill="#111827"></path>
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-2xl font-bold">
              <span className="text-orange-500">South</span>
              <span>Place</span>
            </div>
            <p className="text-gray-300 text-sm">
              South Place Catering Services is an indigenous company committed to excellent depth and comprehensive scope of professional catering service with 8 years of operations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <FaInstagram size={20} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-orange-500">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/who-we-are" className="block text-gray-300 hover:text-white transition-colors">
                Who We Are
              </Link>
              <Link href="/services" className="block text-gray-300 hover:text-white transition-colors">
                Our Services
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="/careers" className="block text-gray-300 hover:text-white transition-colors">
                Careers
              </Link>
              <Link href="/policy" className="block text-gray-300 hover:text-white transition-colors">
                Policy
              </Link>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-orange-500">Our Services</h3>
            <div className="space-y-2">
              <Link href="/services/industrial-catering" className="block text-gray-300 hover:text-white transition-colors">
                Industrial Catering
              </Link>
              <Link href="/services/facilities-management" className="block text-gray-300 hover:text-white transition-colors">
                Facilities Management
              </Link>
              <Link href="/services/house-keeping" className="block text-gray-300 hover:text-white transition-colors">
                Housekeeping
              </Link>
              <Link href="/services/office-catering" className="block text-gray-300 hover:text-white transition-colors">
                Office Catering
              </Link>
              <Link href="/services/laundry-services" className="block text-gray-300 hover:text-white transition-colors">
                Laundry Services
              </Link>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-orange-500">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-orange-500" />
                <div className="flex flex-col">
                  <span className="text-gray-300 text-sm">+234-806-779-3091</span>
                  <span className="text-gray-300 text-sm">+234-703-878-3877</span>
                  <span className="text-gray-300 text-sm">+234-907-376-1968</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-orange-500" />
                <span className="text-gray-300 text-sm">southplacecatering@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-orange-500 mt-1" />
                <div className="flex flex-col">
                  <span className="text-gray-300 text-sm font-semibold mb-1">Corporate Address Lagos:</span>
                  <span className="text-gray-300 text-sm">
                    8A Oluwakayode Jacobs,<br />
                    Lekki Phase 1, Lagos, Nigeria
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-orange-500 mt-1" />
                <div className="flex flex-col">
                  <span className="text-gray-300 text-sm font-semibold mb-1">Operational Address Port Harcourt:</span>
                  <span className="text-gray-300 text-sm">
                    No 26 Omerelu Street GRA,<br />
                    Port Harcourt, Rivers State
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 mt-8 pt-8 text-center"
        >
          <p className="text-gray-400 text-sm mb-2">
            © {currentYear} South Place Catering Services. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Developed by{' '}
            <Link 
              href="https://nextoasis.co.uk/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors duration-300"
            >
              NextOasis
            </Link>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
