'use client';
import { useQueryState, useQueryStates } from 'nuqs';
import { parseAsString } from 'nuqs';
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

  // Query states for batter and bowler (used in Matchup component)
  const [, setMatchupParams] = useQueryStates({
    batter: parseAsString.withOptions({ clearOnDefault: true }),
    bowler: parseAsString.withOptions({ clearOnDefault: true }),
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, newActiveTab: string) => {
    e.preventDefault();
    setActiveTab(newActiveTab);

    // Clear batter and bowler params when switching away from "Batter vs Bowler" tab
    if (newActiveTab !== 'Batter vs Bowler') {
      setMatchupParams({ batter: null, bowler: null });
    }
  };

  return (
    <div className="w-full">
      <div className="flex border-4 border-black bg-white shadow-[12px_0px_0px_rgba(0,0,0,1)] rounded-none">
        {children.map((child) => (
          <button
            key={child.props.label}
            className={`${
              activeTab === child.props.label
                ? 'bg-[#FF5E5B] text-white shadow-inset transform'
                : 'bg-white text-black hover:bg-[#FFED66] hover:transform hover:translate-x-[1px] hover:translate-y-[1px]'
            } text-xl font-black py-4 px-8 border-r-4 border-black transition-all duration-150 ease-in-out uppercase tracking-wide`}
            onClick={(e) => handleClick(e, child.props.label)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="py-8 bg-white border-4 border-t-0 border-black rounded-none shadow-[12px_0px_0px_rgba(0,0,0,1)] min-h-[200px]">
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

export { Tabs, Tab };
