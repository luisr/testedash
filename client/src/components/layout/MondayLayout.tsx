import React from 'react';
import { MondaySidebar } from './MondaySidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MondayLayout({ children, className }: LayoutProps) {
  return (
    <div className="monday-layout">
      <MondaySidebar className="monday-sidebar" />
      <main className={cn('monday-main', className)}>
        {children}
      </main>
    </div>
  );
}