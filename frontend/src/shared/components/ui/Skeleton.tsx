import { type ReactNode } from 'react';
import { Skeleton as HeroSkeleton } from '@heroui/react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Shared loading placeholder. Replaces ad-hoc Skeleton usages so loading
 * visuals stay consistent across pages (skill: designing-beautiful-websites).
 */
export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <HeroSkeleton className={`bg-surface-secondary/70 ${className}`}>
      {children}
    </HeroSkeleton>
  );
}
