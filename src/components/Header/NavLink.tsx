'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-lg font-bold text-black hover:text-gray-700 px-3 py-2 rounded-md ${isActive ? 'bg-black text-white' : ''}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
