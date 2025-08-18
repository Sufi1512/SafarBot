import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'md',
  error,
  disabled = false,
  required = false,
  className,
  fullWidth = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!value);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsFilled(!!value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsFilled(!!e.target.value);
  };

  const baseClasses = cn(
    'relative transition-all duration-200',
    {
      'w-full': fullWidth,
    },
    className
  );

  const inputClasses = cn(
    'w-full transition-all duration-200 focus:outline-none',
    {
      // Size variants
      'px-3 py-2 text-sm rounded-lg': size === 'sm',
      'px-4 py-3 text-base rounded-xl': size === 'md',
      'px-6 py-4 text-lg rounded-2xl': size === 'lg',
      
      // Icon positioning
      'pl-10': Icon && iconPosition === 'left',
      'pr-10': Icon && iconPosition === 'right',
      
      // Variant styles
      'border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-card text-secondary-900 dark:text-dark-text placeholder-secondary-500 dark:placeholder-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20': variant === 'default',
      'border-0 bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-dark-text placeholder-secondary-500 dark:placeholder-secondary-400 focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500/20': variant === 'filled',
      'border-2 border-secondary-300 dark:border-secondary-600 bg-transparent text-secondary-900 dark:text-dark-text placeholder-secondary-500 dark:placeholder-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20': variant === 'outlined',
      'border border-white/40 dark:border-secondary-600/40 backdrop-blur-md bg-white/40 dark:bg-dark-card/40 text-secondary-900 dark:text-dark-text placeholder-secondary-600 dark:placeholder-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20': variant === 'glass',
      
      // Error state
      'border-error-500 focus:border-error-500 focus:ring-error-500/20': error,
      
      // Disabled state
      'opacity-50 cursor-not-allowed': disabled,
    }
  );

  const labelClasses = cn(
    'absolute left-4 transition-all duration-200 pointer-events-none',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md',
      'text-lg': size === 'lg',
      
      // Position based on focus/filled state
      'top-1/2 -translate-y-1/2 text-secondary-500 dark:text-secondary-400': !isFocused && !isFilled,
      'top-2 text-xs text-primary-500 dark:text-primary-400': isFocused || isFilled,
      
      // Icon positioning
      'left-10': Icon && iconPosition === 'left',
    }
  );

  return (
    <div className={baseClasses}>
      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-secondary-500 dark:text-secondary-400',
              {
                'left-3': iconPosition === 'left',
                'right-3': iconPosition === 'right',
              }
            )}
          >
            <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
          </div>
        )}
        
        {/* Input */}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
        
        {/* Floating label */}
        {label && (
          <motion.label
            className={labelClasses}
            initial={false}
            animate={{
              y: isFocused || isFilled ? -8 : 0,
              scale: isFocused || isFilled ? 0.85 : 1,
            }}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </motion.label>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-error-500 dark:text-error-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default ModernInput;
