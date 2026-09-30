import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ className = '', padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-soft ${paddingClasses[padding]} ${className}`}
      {...props}
    />
  );
}