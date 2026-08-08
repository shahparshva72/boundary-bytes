import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Matches' },
  { href: '/stats', label: 'Stats & Analytics' },
  { href: '/players', label: 'Players' },
  { href: '/play', label: 'Play' },
  { href: '/chat', label: 'Chat' },
  { href: '/news', label: 'News' },
];

export default function PublicHeader() {
  return (
    <header className="bg-[#FFC700] p-2 sm:p-2.5 border-b-2 border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-lg sm:text-xl font-black text-black tracking-tighter hover:opacity-90"
        >
          Boundary Bytes
        </Link>

        <nav className="hidden md:flex gap-1.5 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-black text-black bg-white hover:bg-[#FFED66] px-2.5 lg:px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
