import { type ReactNode } from 'react';
import { Card as HeroCard } from '@heroui/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'surface' | 'plain';
  interactive?: boolean;
}

/**
 * App-wide Card primitive. Centralises the "elevated surface + hairline top
 * accent" treatment so every panel shares one visual language
 * (skill: designing-beautiful-websites).
 */
export function Card({ children, className = '', variant = 'surface', interactive = false }: CardProps) {
  const base =
    'group relative overflow-hidden rounded-2xl border bg-surface/70 backdrop-blur-xl';
  const variants = {
    surface: 'border-border shadow-1',
    plain: 'border-transparent shadow-none bg-transparent',
  };
  const interaction = interactive
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-3'
    : 'transition-shadow duration-200';
  return (
    <HeroCard.Root variant="secondary" className={`${base} ${variants[variant]} ${interaction} ${className}`}>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/50 via-accent/30 to-transparent opacity-80" />
      {children}
    </HeroCard.Root>
  );
}

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <HeroCard.Header className={`px-5 pt-5 pb-0 ${className}`}>{children}</HeroCard.Header>;
}

function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <HeroCard.Title className={`text-sm font-semibold text-foreground ${className}`}>
      {children}
    </HeroCard.Title>
  );
}

function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <HeroCard.Description className={`text-xs text-muted mt-0.5 ${className}`}>
      {children}
    </HeroCard.Description>
  );
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <HeroCard.Content className={className}>{children}</HeroCard.Content>;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
