import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'soft' | 'medium' | 'large' | 'xl';
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'soft',
  onClick,
  variant = 'default',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
    xl: 'shadow-xl',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700',
    elevated: 'bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 shadow-large',
    outlined: 'bg-transparent border-2 border-secondary-200 dark:border-secondary-700',
    glass: 'bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-white/20 dark:border-secondary-700/50',
  };

  const baseClasses = `rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      className={baseClasses} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
};

export default Card;
