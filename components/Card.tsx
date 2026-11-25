import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
