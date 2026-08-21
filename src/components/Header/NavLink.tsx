'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isPathActive } from '@/lib/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ href, children, onClick, className = '' }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = isPathActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive && pathname === href.split('?')[0] ? 'page' : undefined}
      className={`inline-flex min-h-11 items-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-black uppercase tracking-wide text-black transition-colors hover:border-black hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isActive ? 'border-black bg-black text-white hover:bg-black' : ''} ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
