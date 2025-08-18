import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ModernCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'soft' | 'medium' | 'large' | 'glow';
  onClick?: () => void;
  hover?: boolean;
  border?: boolean;
  background?: 'solid' | 'gradient' | 'glass';
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  shadow = 'medium',
  onClick,
  hover = false,
  border = true,
  background = 'solid',
  ...motionProps
}) => {
  const baseClasses = cn(
    'relative overflow-hidden transition-all duration-300',
    {
      // Padding variants
      'p-0': padding === 'none',
      'p-4': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg',
      'p-12': padding === 'xl',
      
      // Shadow variants
      'shadow-none': shadow === 'none',
      'shadow-soft': shadow === 'soft',
      'shadow-medium': shadow === 'medium',
      'shadow-large': shadow === 'large',
      'shadow-glow': shadow === 'glow',
      
      // Border variants
      'border border-secondary-200 dark:border-secondary-700': border,
      'border-0': !border,
      
      // Background variants
      'bg-white dark:bg-dark-card': background === 'solid',
      'bg-gradient-to-br from-white to-secondary-50 dark:from-dark-card dark:to-secondary-800': background === 'gradient',
      'backdrop-blur-md bg-white/80 dark:bg-dark-card/80 border-white/20 dark:border-secondary-700/50': background === 'glass',
      
      // Interactive variants
      'cursor-pointer': onClick || hover,
      'hover:scale-[1.02] hover:-translate-y-1': hover,
      'active:scale-[0.98]': onClick,
    },
    className
  );

  const variantClasses = {
    default: 'rounded-2xl',
    glass: 'rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-dark-card/10 border-white/20 dark:border-secondary-700/30',
    gradient: 'rounded-2xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-dark-card dark:to-secondary-800',
    elevated: 'rounded-2xl shadow-xl hover:shadow-2xl',
    interactive: 'rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300',
  };

  const shadowGlow = shadow === 'glow' ? 'shadow-[0_0_20px_rgba(30,144,255,0.3)]' : '';

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], shadowGlow)}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...motionProps}
    >
      {/* Gradient overlay for glass effect */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border glow for interactive cards */}
      {variant === 'interactive' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-primary-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.div>
  );
};

export default ModernCard;
