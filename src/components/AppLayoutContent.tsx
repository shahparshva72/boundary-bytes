'use client';

import { ReactNode, useState } from 'react';
import Header from '@/components/Header';
import CommandPalette from '@/components/ui/CommandPalette';
import MobileBottomNav from '@/components/ui/MobileBottomNav';

interface AppLayoutContentProps {
  children: ReactNode;
}

export default function AppLayoutContent({ children }: AppLayoutContentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <div className="flex-1">{children}</div>
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
