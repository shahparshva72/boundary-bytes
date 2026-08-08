'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  exact?: boolean;
  className?: string;
}

const NavLink = ({ href, children, onClick, exact = false, className = '' }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-xs lg:text-sm font-black px-2 lg:px-2.5 xl:px-3 py-1.5 border-2 border-black transition-all whitespace-nowrap ${
        isActive
          ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white text-black hover:bg-[#FFED66] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
