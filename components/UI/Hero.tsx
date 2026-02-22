'use client';

import { motion } from '@/lib/motion';
import Link from 'next/link';
import Image from 'next/image';
import { IconType } from 'react-icons';
import HeroCarousel from './HeroCarousel';

interface StatItem {
  icon: IconType;
  value: string;
  label: string;
  variant?: 'dark' | 'cream' | 'white';
}

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundImages?: string[];
  showButtons?: boolean;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  showStats?: boolean;
  stats?: StatItem[];
}

export default function Hero({
  title,
  subtitle,
  description,
  backgroundImage = "https://img.freepik.com/free-photo/beautiful-arrangement-different-dishes_23-2148985938.jpg",
  backgroundImages,
  showButtons = true,
  buttonText = "Our Services",
  buttonLink = "/services",
  secondaryButtonText = "Contact Us",
  secondaryButtonLink = "/contact",
  showStats = false,
  stats = []
}: HeroProps) {
  return (
      <section className={`relative ${showButtons ? 'min-h-[600px] md:h-screen' : 'h-[60vh]'} flex items-center overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {backgroundImages && backgroundImages.length > 0 ? (
          <HeroCarousel images={backgroundImages} />
        ) : (
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover object-center scale-110"
            priority
          />
        )}
      </div>
      
      {/* Subtle Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10"></div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 relative z-20">
        <div className={`flex flex-col ${showStats ? 'lg:grid lg:grid-cols-2 gap-8 lg:gap-12' : ''} items-center`}>
          
          {/* Text Content */}
          <div className={`text-white ${!showStats ? 'text-center mx-auto max-w-4xl' : 'text-center lg:text-left w-full'}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-orange-400 font-semibold text-sm md:text-base mb-3 uppercase tracking-wide"
                >
                  {subtitle}
                </motion.p>
              )}
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`font-bold mb-6 leading-tight ${showStats ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-6xl'}`}
              >
                {title}
              </motion.h1>
              
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className={`text-lg md:text-xl text-gray-200 mb-8 ${!showStats && 'max-w-3xl mx-auto'}`}
                >
                  {description}
                </motion.p>
              )}
          
              {showButtons && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className={`flex flex-col md:flex-row gap-4 w-full md:w-auto ${!showStats ? 'justify-center items-center' : 'justify-center lg:justify-start items-stretch'}`}
                >
                  <Link href={buttonLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-orange-500 hover:bg-orange-400 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-colors shadow-lg w-full md:w-auto md:min-w-[200px]"
                    >
                      {buttonText}
                    </motion.button>
                  </Link>
                  
                  <Link href={secondaryButtonLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-all shadow-lg w-full md:w-auto md:min-w-[200px]"
                    >
                      {secondaryButtonText}
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Statistics Cards (Bento Grid) */}
          {showStats && stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8 lg:mt-0 w-full max-w-md sm:max-w-2xl lg:max-w-none">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`${
                    stat.variant === 'dark' ? 'bg-gray-900 text-white' :
                    stat.variant === 'cream' ? 'bg-orange-50 text-gray-900' :
                    'bg-white/95 text-gray-900 backdrop-blur-sm'
                  } rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="flex flex-col items-start h-full">
                    <div className={`mb-3 md:mb-4 ${stat.variant === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>
                      <stat.icon className="text-2xl md:text-4xl" />
                    </div>
                    <div className={`text-2xl md:text-4xl font-bold mb-1 md:mb-2 ${stat.variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs md:text-sm font-medium ${stat.variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Scroll Indicator */}
      {showButtons && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
