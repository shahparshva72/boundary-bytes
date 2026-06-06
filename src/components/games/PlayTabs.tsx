'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { ReactNode } from 'react';

const GAME_TABS = ['stat-guesser', 'matchup', 'daily'] as const;
export type GameTab = (typeof GAME_TABS)[number];

const GAME_LABELS: Record<GameTab, string> = {
  'stat-guesser': 'Stat Guesser',
  matchup: 'Matchup Showdown',
  daily: 'Daily Challenge',
};

interface PlayTabProps {
  id: GameTab;
  children: ReactNode;
}

interface PlayTabsProps {
  children: Array<React.ReactElement<PlayTabProps>>;
  defaultTab?: GameTab;
}

const gameParser = parseAsStringLiteral(GAME_TABS);

const PlayTabs = ({ children, defaultTab = 'stat-guesser' }: PlayTabsProps) => {
  const [activeGame, setActiveGame] = useQueryState('game', gameParser.withDefault(defaultTab));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0 md:flex md:justify-center">
        <div className="inline-flex border-2 border-black bg-white rounded-none">
          {children.map((child) => (
            <button
              key={child.props.id}
              type="button"
              className={`${
                activeGame === child.props.id
                  ? 'bg-[#FF5E5B] text-white shadow-inset transform'
                  : 'bg-white text-black hover:bg-[#FFED66] hover:transform hover:translate-x-[1px] hover:translate-y-[1px]'
              } text-[10px] sm:text-xs md:text-sm lg:text-base font-black py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-r-2 border-black last:border-r-0 transition-all duration-150 ease-in-out uppercase tracking-wide whitespace-nowrap flex-shrink-0`}
              onClick={() => setActiveGame(child.props.id)}
            >
              {GAME_LABELS[child.props.id]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 bg-white border-2 border-black rounded-none sm:shadow-[4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_0px_0px_rgba(0,0,0,1)] min-h-[280px] overflow-hidden w-full">
        {children.map((child) => {
          if (child.props.id === activeGame) {
            return (
              <div key={child.props.id} className="w-full flex flex-col items-center">
                {child.props.children}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const PlayTab = ({ children }: PlayTabProps) => {
  return <div className="hidden">{children}</div>;
};

export { PlayTab, PlayTabs };
