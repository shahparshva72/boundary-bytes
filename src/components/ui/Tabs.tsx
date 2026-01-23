'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { ReactNode } from 'react';

interface TabProps {
  label: string;
  children: ReactNode;
}

interface TabsProps {
  children: Array<React.ReactElement<TabProps>>;
  defaultTab?: string;
}

const Tabs = ({ children, defaultTab = 'Batter vs Bowler' }: TabsProps) => {
  const firstTabLabel = defaultTab || children[0]?.props.label || '';

  const [{ tab: activeTab }, setQueryStates] = useQueryStates(
    {
      tab: parseAsString.withDefault(firstTabLabel),
      batter: parseAsString,
      bowler: parseAsString,
      runScorersPage: parseAsInteger,
      wicketTakersPage: parseAsInteger,
      bowlingWicketTypesPage: parseAsInteger,
      players: parseAsString,
      seasons: parseAsString,
      statType: parseAsString,
    },
    { clearOnDefault: true },
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, newActiveTab: string) => {
    e.preventDefault();
    setQueryStates({
      tab: newActiveTab,
      batter: null,
      bowler: null,
      runScorersPage: null,
      wicketTakersPage: null,
      bowlingWicketTypesPage: null,
      players: null,
      seasons: null,
      statType: null,
    });
  };

  return (
    <div className="w-full max-w-fit overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0 md:flex md:justify-center">
        <div className="inline-flex border-2 border-black bg-white rounded-none ">
          {children.map((child) => (
            <button
              key={child.props.label}
              className={`${
                activeTab === child.props.label
                  ? 'bg-[#FF5E5B] text-white shadow-inset transform'
                  : 'bg-white text-black hover:bg-[#FFED66] hover:transform hover:translate-x-[1px] hover:translate-y-[1px]'
              } text-[10px] sm:text-xs md:text-sm lg:text-base font-black py-1.5 sm:py-2 md:py-2.5 px-1 sm:px-2 md:px-3 lg:px-4 border-r-2 border-black transition-all duration-150 ease-in-out uppercase tracking-wide whitespace-nowrap flex-shrink-0`}
              onClick={(e) => handleClick(e, child.props.label)}
            >
              {child.props.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 bg-white border-2 border-black rounded-none sm:shadow-[4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_0px_0px_rgba(0,0,0,1)] min-h-[200px] overflow-hidden">
        {children.map((child) => {
          if (child.props.label === activeTab) {
            return <div key={child.props.label}>{child.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
};

const Tab = ({ children }: TabProps) => {
  return <div className="hidden">{children}</div>;
};

export { Tab, Tabs };
