import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mustard' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants = {
    primary: 'bg-primary text-white shadow-clay-sm hover:shadow-clay',
    secondary: 'bg-transparent text-primary border-2 border-primary hover:bg-surfaceLight',
    mustard: 'bg-accent text-white shadow-clay-sm hover:shadow-clay',
    outline: 'bg-transparent text-textPrimary border-2 border-borderLight hover:bg-surfaceLight',
    ghost: 'bg-transparent text-textPrimary hover:bg-surfaceLight',
    success: 'bg-status-success text-white',
    danger: 'bg-status-error text-white',
  };

  return (
    <button
      className={clsx(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth ? 'w-full' : '',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
