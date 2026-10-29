'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { Gender } from '@/types/league';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: "Men's" },
  { value: 'female', label: "Women's" },
];

// ScopeSwitcher picks which leagues the stats cover: men's or women's, then
// every league of that gender or a chosen few. Changes apply immediately.
const ScopeSwitcher = () => {
  const { scope, scopeLabel, setGender, setLeagues, leaguesFor } = useLeagueContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const leagues = leaguesFor(scope.gender);
  const visibleLeagues = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return leagues;
    }
    return leagues.filter(
      (l) => l.fullName.toLowerCase().includes(term) || l.name.toLowerCase().includes(term),
    );
  }, [leagues, search]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const toggleLeague = (code: string) => {
    const selected = scope.leagues.includes(code)
      ? scope.leagues.filter((l) => l !== code)
      : [...scope.leagues, code];
    setLeagues(selected);
  };

  const close = () => {
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Leagues: ${scopeLabel}. Change leagues`}
        className="inline-flex min-h-11 max-w-[11rem] items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-black text-black shadow-[3px_3px_0_#000] hover:bg-[#FFED66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:max-w-[16rem]"
      >
        <span aria-hidden="true">🏏</span>
        <span className="truncate">{scopeLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={3}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={close}
            aria-label="Close league picker"
            tabIndex={-1}
          />
          <div
            id={panelId}
            className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(70vh,560px)] w-[min(92vw,360px)] flex-col border-2 border-black bg-[#FFFEE0] shadow-[6px_6px_0_#000]"
          >
            <div
              className="grid grid-cols-2 border-b-2 border-black"
              role="group"
              aria-label="Gender"
            >
              {GENDERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scope.gender === value}
                  onClick={() => {
                    if (scope.gender !== value) {
                      setGender(value);
                      setSearch('');
                    }
                  }}
                  className={`min-h-11 px-3 text-sm font-black uppercase tracking-wide focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-black ${
                    scope.gender === value
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-[#FFED66]'
                  } ${value === 'male' ? 'border-r-2 border-black' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 border-b-2 border-black bg-white px-3 py-2">
              <Search aria-hidden="true" className="size-4 shrink-0" strokeWidth={3} />
              <span className="sr-only">Search leagues</span>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leagues"
                className="w-full bg-transparent text-sm font-bold text-black placeholder:text-black/50 focus:outline-none"
              />
            </label>

            <div className="overflow-y-auto p-2">
              <button
                type="button"
                aria-pressed={scope.leagues.length === 0}
                onClick={() => setLeagues([])}
                className={`mb-2 flex w-full items-center justify-between border-2 border-black px-3 py-2 text-left text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                  scope.leagues.length === 0 ? 'bg-[#FFC700]' : 'bg-white hover:bg-[#FFED66]'
                }`}
              >
                All {scope.gender === 'male' ? "men's" : "women's"} leagues
                {scope.leagues.length === 0 ? (
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                ) : null}
              </button>

              <fieldset>
                <legend className="sr-only">Choose leagues</legend>
                {visibleLeagues.map((league) => {
                  const checked = scope.leagues.includes(league.id);
                  return (
                    <label
                      key={league.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 border-2 px-2 py-1.5 text-sm text-black hover:border-black ${
                        checked ? 'border-black bg-white' : 'border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLeague(league.id)}
                        className="size-4 shrink-0 accent-black"
                      />
                      <span
                        className="min-w-12 border-2 border-black px-1 text-center text-xs font-black"
                        style={{ backgroundColor: league.colors.primary }}
                      >
                        {league.name}
                      </span>
                      <span className="flex-1 font-bold leading-tight">{league.fullName}</span>
                      {league.stats.matches > 0 ? (
                        <span className="shrink-0 text-xs font-bold text-black/60">
                          {league.stats.matches.toLocaleString()}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
                {visibleLeagues.length === 0 ? (
                  <p className="px-2 py-3 text-sm font-bold text-black/60">
                    No leagues match “{search}”.
                  </p>
                ) : null}
              </fieldset>
            </div>

            <div className="border-t-2 border-black p-2">
              <button
                type="button"
                onClick={() => {
                  close();
                  triggerRef.current?.focus();
                }}
                className="w-full border-2 border-black bg-black px-3 py-2 text-sm font-black uppercase tracking-wide text-white hover:bg-[#FF5E5B] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Done
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ScopeSwitcher;
