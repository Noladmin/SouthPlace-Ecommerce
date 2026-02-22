'use client';

import { motion } from '@/lib/motion';
import { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  value: string;
  label: string;
  variant?: 'dark' | 'cream' | 'white';
  delay?: number;
}

export default function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  variant = 'dark',
  delay = 0 
}: StatCardProps) {
  const variantClasses = {
    dark: 'bg-[#1a3a35] text-white',
    cream: 'bg-[#f5f0e8] text-gray-900',
    white: 'bg-white/95 text-gray-900 backdrop-blur-sm'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`${variantClasses[variant]} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex flex-col items-start">
        <div className={`mb-4 ${variant === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>
          <Icon className="text-4xl" />
        </div>
        <div className={`text-4xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`text-sm font-medium ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}


