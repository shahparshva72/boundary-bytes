'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-base lg:text-lg font-bold text-black hover:text-gray-700 px-2 lg:px-3 py-2 rounded-md ${isActive ? 'bg-black text-white' : ''}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
