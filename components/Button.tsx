'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'soft';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 font-display text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white shadow-soft hover:bg-primary-hover hover:shadow-lift',
    accent: 'bg-accent text-white shadow-soft hover:brightness-95 hover:shadow-lift',
    soft: 'bg-primary-soft text-primary hover:bg-primary-soft/70',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
