import { ArrowRight, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { featureGroups } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Explore Cricket Stats & Tools | Boundary Bytes',
  description:
    'Explore cricket matchups, player comparisons, leaderboards, advanced analysis, AI answers, and games powered by real data.',
};

const groupColors = ['bg-[#FF5E5B]', 'bg-[#FFED66]', 'bg-[#4ECDC4]'];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#FFFEE0] px-3 py-6 pb-20 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden border-2 border-black bg-[#FFC700] p-5 shadow-[5px_5px_0_#000] sm:p-8 lg:p-10">
          <Sparkles
            aria-hidden="true"
            className="absolute -right-4 -top-4 size-28 rotate-12 text-black/10 sm:size-40"
            strokeWidth={3}
          />
          <p className="mb-3 inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[2px_2px_0_#000]">
            Your cricket data toolkit
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-black sm:text-6xl lg:text-7xl">
            Find the stat that settles the debate.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-bold text-black/75 sm:text-xl">
            Start with a matchup, scan the leaderboards, build a custom analysis, or ask your
            question in plain English.
          </p>
        </section>

        <div className="mt-8 space-y-10 sm:mt-12">
          {featureGroups.map((group, groupIndex) => (
            <section key={group.label} aria-labelledby={`group-${groupIndex}`}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2
                  id={`group-${groupIndex}`}
                  className={`w-fit border-2 border-black px-4 py-2 text-xl font-black uppercase text-black shadow-[3px_3px_0_#000] sm:text-2xl ${groupColors[groupIndex]}`}
                >
                  {group.label}
                </h2>
                <p className="max-w-lg text-sm font-bold text-black/65 sm:text-right sm:text-base">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-52 flex-col border-2 border-black bg-white p-4 text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#000] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                    >
                      <span
                        className={`grid size-12 place-items-center border-2 border-black ${groupColors[groupIndex]}`}
                      >
                        <Icon aria-hidden="true" className="size-6" strokeWidth={3} />
                      </span>
                      <h3 className="mt-5 text-xl font-black tracking-tight">{item.label}</h3>
                      <p className="mt-2 text-sm font-bold text-black/65">{item.description}</p>
                      <span className="mt-auto flex items-center justify-between pt-5 text-xs font-black uppercase tracking-wider">
                        Open tool
                        <ArrowRight
                          aria-hidden="true"
                          className="size-5 transition-transform group-hover:translate-x-1"
                          strokeWidth={3}
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
