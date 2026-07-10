import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/players', label: 'Players' },
  { href: '/stats', label: 'Stats' },
  { href: '/stat-explorer', label: 'Stat Explorer' },
  { href: '/chat', label: 'Chat' },
  { href: '/play', label: 'Play' },
  { href: '/news', label: 'News' },
];

export default function PublicHeader() {
  return (
    <header className="bg-[#FFC700] p-2 sm:p-2.5 border-b-2 border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg sm:text-xl font-black text-black tracking-tighter">
          Boundary Bytes
        </Link>

        <nav className="hidden md:flex gap-2 lg:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base lg:text-lg font-bold text-black hover:text-gray-700 px-2 lg:px-3 py-2 rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
