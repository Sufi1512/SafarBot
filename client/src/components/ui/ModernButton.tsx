import React from 'react';
import { LucideIcon } from 'lucide-react';
import UnifiedButton from './UnifiedButton';
import { cn } from '../../utils/cn';

/**
 * ModernButton - Enhanced wrapper around UnifiedButton
 * 
 * This component provides backward compatibility while leveraging the new
 * UnifiedButton component with design system colors.
 * 
 * Legacy variants are mapped to the new design system variants:
 * - solid → primary
 * - bordered → outline  
 * - secondary → secondary
 * - ghost → ghost
 * - glass → secondary
 */

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'bordered' | 'secondary' | 'ghost' | 'glass' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  rounded = 'lg',
  shadow = 'md',
  animation = true,
}) => {
  // Map legacy variants to UnifiedButton variants
  const mappedVariant = 
    variant === 'solid' ? 'primary'
    : variant === 'bordered' ? 'outline'
    : variant === 'secondary' ? 'secondary'
    : variant === 'ghost' ? 'ghost'
    : variant === 'glass' ? 'secondary'
    : variant === 'success' ? 'success'
    : variant === 'warning' ? 'warning'
    : variant === 'error' ? 'error'
    : variant === 'info' ? 'info'
    : 'primary'; // fallback

  return (
    <UnifiedButton
      variant={mappedVariant}
      size={size}
      icon={Icon}
      iconPosition={iconPosition}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      className={cn(className)}
      onClick={onClick}
      type={type}
      rounded={rounded}
      shadow={shadow}
      animation={animation}
    >
      {children}
    </UnifiedButton>
  );
};

export default ModernButton;


