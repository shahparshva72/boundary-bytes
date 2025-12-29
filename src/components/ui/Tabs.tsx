'use client';

import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
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
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsString.withDefault(firstTabLabel).withOptions({ clearOnDefault: true }),
  );

  // Query states for all params that need to be cleared when switching tabs
  const [, setBatter] = useQueryState(
    'batter',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [, setBowler] = useQueryState(
    'bowler',
    parseAsString.withOptions({ clearOnDefault: true }),
  );
  const [, setRunScorersPage] = useQueryState(
    'runScorersPage',
    parseAsInteger.withOptions({ clearOnDefault: true }),
  );
  const [, setWicketTakersPage] = useQueryState(
    'wicketTakersPage',
    parseAsInteger.withOptions({ clearOnDefault: true }),
  );
  const [, setBowlingWicketTypesPage] = useQueryState(
    'bowlingWicketTypesPage',
    parseAsInteger.withOptions({ clearOnDefault: true }),
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, newActiveTab: string) => {
    e.preventDefault();
    setActiveTab(newActiveTab);

    // Clear all query params when switching tabs to ensure each tab starts fresh
    // This prevents params from one tab (like pagination) persisting when switching to another tab
    setBatter(null);
    setBowler(null);
    setRunScorersPage(null);
    setWicketTakersPage(null);
    setBowlingWicketTypesPage(null);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0 md:flex md:justify-center">
        <div className="inline-flex border-2 sm:border-4 border-black bg-white rounded-none ">
          {children.map((child) => (
            <button
              key={child.props.label}
              className={`${
                activeTab === child.props.label
                  ? 'bg-[#FF5E5B] text-white shadow-inset transform'
                  : 'bg-white text-black hover:bg-[#FFED66] hover:transform hover:translate-x-[1px] hover:translate-y-[1px]'
              } text-[10px] sm:text-sm md:text-base lg:text-xl font-black py-2 sm:py-3 md:py-4 px-1.5 sm:px-4 md:px-6 lg:px-8 border-r-2 sm:border-r-4 border-black transition-all duration-150 ease-in-out uppercase tracking-wide whitespace-nowrap flex-shrink-0`}
              onClick={(e) => handleClick(e, child.props.label)}
            >
              {child.props.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 bg-white border-2 sm:border-4 border-black rounded-none sm:shadow-[8px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_0px_0px_rgba(0,0,0,1)] min-h-[200px] overflow-hidden">
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
