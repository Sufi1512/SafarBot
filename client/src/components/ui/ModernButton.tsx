import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

// Backward-compatible wrapper around the unified Button.
// Maps legacy ModernButton variants/sizes to the new Button API
// so existing usages stay visually consistent.

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'bordered' | 'secondary' | 'ghost' | 'glass';
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
}) => {
  // Map legacy variants to unified Button variants
  const mappedVariant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' =
    variant === 'solid' ? 'primary'
    : variant === 'bordered' ? 'outline'
    : variant === 'secondary' ? 'secondary'
    : variant === 'ghost' ? 'ghost'
    // 'glass' best approximates secondary styling across light/dark
    : 'secondary';

  // Pass-through size mapping is 1:1 with Button
  const mappedSize = size;

  return (
    <Button
      variant={mappedVariant}
      size={mappedSize}
      icon={Icon}
      iconPosition={iconPosition}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      className={cn(className)}
      onClick={onClick}
      type={type}
    >
      {children}
    </Button>
  );
};

export default ModernButton;


