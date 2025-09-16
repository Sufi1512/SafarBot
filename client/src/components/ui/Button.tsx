import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * Unified Button component
 *
 * Variants: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error'
 * Sizes: 'sm' | 'md' | 'lg' | 'xl'
 *
 * Examples:
 * <Button variant="primary" size="md">Book now</Button>
 * <Button variant="outline" size="sm" icon={Plus}>Add</Button>
 * <Button variant="secondary" size="lg" fullWidth>Continue</Button>
 */

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-medium hover:shadow-large transform hover:-translate-y-0.5',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 focus:ring-secondary-300 dark:bg-dark-card dark:hover:bg-secondary-800 dark:text-white shadow-soft hover:shadow-medium',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500/20',
    success: 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-500 shadow-medium hover:shadow-large transform hover:-translate-y-0.5',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500 shadow-medium hover:shadow-large transform hover:-translate-y-0.5',
    error: 'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500 shadow-medium hover:shadow-large transform hover:-translate-y-0.5',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </motion.button>
  );
};

export default Button;
