import React from 'react';
import { MondaySidebar } from './MondaySidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MondayLayout({ children, className }: LayoutProps) {
  return (
    <div className="flex h-screen bg-primary">
      <MondaySidebar className="w-64 flex-none" />
      <main className={cn('flex-1 overflow-auto bg-secondary', className)}>
        {children}
      </main>
    </div>
  );
}