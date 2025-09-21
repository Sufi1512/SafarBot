import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Unified Button Component - Design System Colors
 * 
 * This component provides consistent button styling across the entire application
 * using the design system color palette.
 * 
 * Usage Examples:
 * <UnifiedButton variant="primary" size="md">Primary Action</UnifiedButton>
 * <UnifiedButton variant="success" size="lg" icon={Save}>Save Changes</UnifiedButton>
 * <UnifiedButton variant="outline" size="sm" icon={Edit} iconPosition="right">Edit</UnifiedButton>
 */

export type ButtonVariant = 
  | 'primary'    // Main actions (blue)
  | 'secondary'  // Secondary actions (gray)
  | 'success'    // Success actions (green)
  | 'warning'    // Warning actions (yellow/orange)
  | 'error'      // Destructive actions (red)
  | 'outline'    // Outlined buttons
  | 'ghost'      // Transparent buttons
  | 'info'       // Info actions (cyan)
  | 'purple'     // Special actions (purple)
  | 'dark';      // Dark theme buttons

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface UnifiedButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: boolean;
}

const UnifiedButton: React.FC<UnifiedButtonProps> = ({
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
  rounded = 'lg',
  shadow = 'md',
  animation = true,
}) => {
  // Base classes - always applied
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans select-none';
  
  // SafarBot Integrated Color Variants
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-500 border-primary-500',
    secondary: 'bg-transparent border-2 border-secondary-500 text-secondary-500 hover:bg-secondary-500 hover:text-white focus:ring-secondary-500 active:bg-secondary-600',
    success: 'bg-success-500 hover:bg-success-600 active:bg-success-700 text-white focus:ring-success-500 border-success-500',
    warning: 'bg-warning-500 hover:bg-warning-600 active:bg-warning-700 text-white focus:ring-warning-500 border-warning-500',
    error: 'bg-error-500 hover:bg-error-600 active:bg-error-700 text-white focus:ring-error-500 border-error-500',
    info: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white focus:ring-accent-500 border-accent-500',
    accent: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white focus:ring-accent-500 border-accent-500',
    purple: 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white focus:ring-accent-500 border-accent-500',
    dark: 'bg-primary-800 hover:bg-primary-900 active:bg-primary-900 text-white focus:ring-primary-500 border-primary-800',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500 bg-transparent active:bg-primary-600',
    ghost: 'text-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500/20 bg-transparent border-transparent',
  };

  // Size variants with consistent spacing
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]',
  };

  // Rounded variants
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Shadow variants
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl',
  };

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    shadowClasses[shadow],
    widthClass,
    className
  );

  // Animation variants
  const motionProps = animation ? {
    whileHover: { scale: 1.02, y: -1 },
    whileTap: { scale: 0.98, y: 0 },
    transition: { duration: 0.15, ease: "easeInOut" }
  } : {};

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...motionProps}
    >
      {/* Loading Spinner */}
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Left Icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
      )}
      
      {/* Button Content */}
      <span className="truncate">{children}</span>
      
      {/* Right Icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2 flex-shrink-0" />
      )}
    </motion.button>
  );
};

export default UnifiedButton;
