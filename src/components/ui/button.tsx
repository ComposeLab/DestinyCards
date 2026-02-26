'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg',
  secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-300 hover:bg-gray-700/50',
};

const sizes = {
  sm: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
  md: 'px-3 py-1.5 text-sm sm:px-5 sm:py-2.5 sm:text-base',
  lg: 'px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`rounded-lg font-semibold transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
      {...(props as any)}
    />
  )
);
Button.displayName = 'Button';
