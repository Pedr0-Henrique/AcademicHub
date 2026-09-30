import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'border border-transparent bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover',
    secondary: 'border border-border bg-surface-elevated text-foreground hover:bg-surface-hover',
    outline: 'border border-border-strong bg-transparent text-foreground hover:bg-surface-hover',
    ghost: 'border border-transparent bg-transparent text-muted hover:bg-surface-hover hover:text-foreground',
    danger: 'border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15',
    success: 'border border-success/20 bg-success/10 text-success hover:bg-success/15',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
