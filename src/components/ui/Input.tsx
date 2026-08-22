import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  disabled,
  id,
  name,
  ...props
}, ref) => {
  // The label must point at the input for iOS to identify the field. Without an
  // association, Safari falls back to guessing from surrounding text, which is
  // part of why the AutoFill/iCloud Keychain sheet kept re-presenting itself on
  // the sign-in screen.
  const inputId = id || name;

  return (
    <div className={clsx('flex flex-col w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 flex items-center justify-center text-text-secondary z-10">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={clsx(
            'w-full bg-soft-surface border border-border-light rounded-2xl px-4 py-3.5 text-sm text-text-primary transition-colors outline-none focus:border-primary focus:bg-white',
            leftIcon ? 'pl-11' : '',
            rightIcon ? 'pr-11' : '',
            error ? 'border-status-error focus:border-status-error' : '',
            disabled ? 'opacity-50 cursor-not-allowed bg-border-light' : '',
            className
          )}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 flex items-center justify-center text-text-secondary z-10">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="mt-1.5 text-xs text-status-error font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
