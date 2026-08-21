'use client';

import { ArrowRight, ChevronDown, Menu, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { featureGroups, isExplorePath, primaryNavigation } from '@/lib/navigation';
import LeagueSwitcher from '../ui/LeagueSwitcher';
import NavLink from './NavLink';

const Header = () => {
  const pathname = usePathname();
  const { selectedLeague, leagueConfig } = useLeagueContext();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const exploreTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const exploreIsActive = isExplorePath(pathname);

  useEffect(() => {
    if (!isExploreOpen && !isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExploreOpen(false);
        setIsMobileMenuOpen(false);
        if (isMobileMenuOpen) {
          mobileTriggerRef.current?.focus();
        } else {
          exploreTriggerRef.current?.focus();
        }
        return;
      }

      if (event.key === 'Tab' && isMobileMenuOpen && mobileDialogRef.current) {
        const focusableElements = mobileDialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExploreOpen, isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileCloseButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#FFC700] shadow-[0_3px_0_0_#000]">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-3 sm:px-4 lg:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          aria-label="Boundary Bytes home"
        >
          <span className="grid size-10 place-items-center border-2 border-black bg-[#FF5E5B] text-base font-black shadow-[3px_3px_0_#000] transition-transform group-hover:-translate-y-0.5">
            BB
          </span>
          <span className="hidden font-black tracking-[-0.04em] text-black sm:block sm:text-lg xl:text-xl">
            Boundary Bytes
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.slice(0, 2).map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}

          <button
            ref={exploreTriggerRef}
            type="button"
            onClick={() => setIsExploreOpen((isOpen) => !isOpen)}
            aria-expanded={isExploreOpen}
            aria-controls="explore-menu"
            className={`inline-flex min-h-11 items-center gap-1 border-2 px-3 py-2 text-sm font-black uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              exploreIsActive || isExploreOpen
                ? 'border-black bg-black text-white'
                : 'border-transparent text-black hover:border-black hover:bg-white'
            }`}
          >
            Explore
            <ChevronDown
              aria-hidden="true"
              className={`size-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`}
              strokeWidth={3}
            />
          </button>

          {primaryNavigation.slice(2).map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <div className="hidden xl:block">
            <NavLink
              href="/chat"
              className="border-black bg-[#4ECDC4] shadow-[3px_3px_0_#000] hover:bg-white"
            >
              <Sparkles aria-hidden="true" className="size-4" strokeWidth={3} />
              Ask AI
            </NavLink>
          </div>

          {selectedLeague ? <LeagueSwitcher /> : null}

          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="grid size-11 place-items-center border-2 border-black bg-white text-black shadow-[3px_3px_0_#000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={3} />
          </button>
        </div>
      </div>

      {isExploreOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-30 hidden cursor-default bg-black/20 lg:block"
            onClick={() => setIsExploreOpen(false)}
            aria-label="Close Explore menu"
          />
          <div
            id="explore-menu"
            className="absolute left-1/2 z-40 hidden w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2 border-2 border-t-0 border-black bg-[#FFFEE0] p-4 shadow-[6px_6px_0_#000] lg:block"
          >
            <div className="grid grid-cols-3 gap-4">
              {featureGroups.map((group, groupIndex) => (
                <section
                  key={group.label}
                  className="border-2 border-black bg-white shadow-[3px_3px_0_#000]"
                >
                  <div
                    className={`border-b-2 border-black p-3 ${
                      groupIndex === 0
                        ? 'bg-[#FF5E5B]'
                        : groupIndex === 1
                          ? 'bg-[#FFED66]'
                          : 'bg-[#4ECDC4]'
                    }`}
                  >
                    <h2 className="font-black uppercase text-black">{group.label}</h2>
                    <p className="mt-1 text-xs font-bold text-black/75">{group.description}</p>
                  </div>
                  <div className="grid gap-1 p-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsExploreOpen(false)}
                          className="group flex items-start gap-3 border-2 border-transparent p-2 text-black hover:border-black hover:bg-[#FFFEE0] focus-visible:border-black focus-visible:outline-none"
                        >
                          <span className="grid size-9 shrink-0 place-items-center border-2 border-black bg-white group-hover:bg-[#FFC700]">
                            <Icon aria-hidden="true" className="size-4" strokeWidth={3} />
                          </span>
                          <span>
                            <span className="block text-sm font-black">{item.label}</span>
                            <span className="block text-xs font-bold text-black/65">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <Link
              href="/explore"
              onClick={() => setIsExploreOpen(false)}
              className="mt-4 flex items-center justify-between border-2 border-black bg-black px-4 py-3 font-black uppercase tracking-wide text-white hover:bg-[#FF5E5B] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Browse every Boundary Bytes feature
              <ArrowRight aria-hidden="true" className="size-5" strokeWidth={3} />
            </Link>
          </div>
        </>
      ) : null}

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/55"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          />
          <nav
            ref={mobileDialogRef}
            id="mobile-navigation"
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
            className="absolute right-0 top-0 flex h-full w-[min(92vw,400px)] flex-col border-l-2 border-black bg-[#FFFEE0] shadow-[-6px_0_0_#000]"
          >
            <div className="flex items-center justify-between border-b-2 border-black bg-[#FFC700] p-3">
              <div>
                <p className="text-xl font-black tracking-tight text-black">
                  Explore Boundary Bytes
                </p>
                {selectedLeague && leagueConfig ? (
                  <p className="text-xs font-black uppercase text-black/70">
                    {leagueConfig.icon} {leagueConfig.name}
                  </p>
                ) : null}
              </div>
              <button
                ref={mobileCloseButtonRef}
                type="button"
                onClick={closeMobileMenu}
                className="grid size-11 place-items-center border-2 border-black bg-white text-black shadow-[3px_3px_0_#000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                aria-label="Close navigation menu"
              >
                <X aria-hidden="true" className="size-6" strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-4">
                {primaryNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="border-black bg-white shadow-[2px_2px_0_#000]"
                    >
                      <Icon aria-hidden="true" className="size-4" strokeWidth={3} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              <Link
                href="/chat"
                onClick={closeMobileMenu}
                className="my-4 flex items-center justify-between border-2 border-black bg-[#4ECDC4] p-3 font-black uppercase text-black shadow-[3px_3px_0_#000]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles aria-hidden="true" className="size-5" strokeWidth={3} />
                  Ask Boundary Bytes
                </span>
                <ArrowRight aria-hidden="true" className="size-5" strokeWidth={3} />
              </Link>

              <div className="space-y-5">
                {featureGroups.map((group) => (
                  <section key={group.label}>
                    <h2 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-black/60">
                      {group.label}
                    </h2>
                    <div className="grid gap-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className="flex min-h-12 items-center gap-3 border-2 border-transparent px-2 py-2 font-black text-black hover:border-black hover:bg-white focus-visible:border-black focus-visible:outline-none"
                          >
                            <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={3} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
