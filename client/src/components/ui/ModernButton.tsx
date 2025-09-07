import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModernButtonProps extends MotionProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  ...motionProps
}) => {
  const baseClasses = cn(
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    {
      // Size variants
      'px-3 py-2 text-sm rounded-lg': size === 'sm',
      'px-4 py-2.5 text-sm rounded-xl': size === 'md',
      'px-6 py-3 text-base rounded-xl': size === 'lg',
      'px-8 py-4 text-lg rounded-2xl': size === 'xl',
      
      // Width
      'w-full': fullWidth,
      
      // Variant styles
      'bg-primary-500 hover:bg-primary-600 text-white shadow-medium hover:shadow-large focus:ring-primary-500': variant === 'primary',
      'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-white shadow-soft hover:shadow-medium focus:ring-secondary-300': variant === 'secondary',
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500': variant === 'outline',
      'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500': variant === 'ghost',
      'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-glow focus:ring-primary-500': variant === 'gradient',
      'backdrop-blur-md bg-white/20 dark:bg-dark-card/20 border border-white/30 dark:border-secondary-700/30 text-white hover:bg-white/30 dark:hover:bg-dark-card/30 focus:ring-primary-500': variant === 'glass',
    },
    className
  );

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  const content = (
    <>
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}
      
      <div className={cn('flex items-center gap-2 whitespace-nowrap leading-none', { 'opacity-0': loading })}>
        {Icon && iconPosition === 'left' && (
          <Icon size={iconSize[size]} className="shrink-0" />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon size={iconSize[size]} className="shrink-0" />
        )}
      </div>
    </>
  );

  return (
    <motion.button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
};

export default ModernButton;
