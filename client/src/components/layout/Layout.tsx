import React from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="flex h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Sidebar className="w-64 flex-shrink-0" />
      <main className={cn('flex-1 overflow-auto', className)}>
        {children}
      </main>
    </div>
  );
}