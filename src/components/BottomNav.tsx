import React from 'react';
import { Plane, Layers, CheckSquare, BarChart3 } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'planner',
      label: 'Planner',
      icon: <Plane className="w-[22px] h-[22px]" />,
    },
    {
      id: 'swipe',
      label: 'Swipe',
      icon: <Layers className="w-[22px] h-[22px]" />,
    },
    {
      id: 'review',
      label: 'Review',
      icon: <CheckSquare className="w-[22px] h-[22px]" />,
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <BarChart3 className="w-[22px] h-[22px]" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-[#FAF9F6]/95 backdrop-blur-xl border-t border-[#0F172A]/5 shadow-[0_-4px_20px_rgba(15,23,42,0.05)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[3.5rem] min-h-[3rem] px-2 py-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#00685F] font-bold'
                  : 'text-[#6D7A77] hover:text-[#131B2E]'
              }`}
            >
              <div className={`${isActive ? 'scale-105' : 'scale-100'} transition-transform`}>
                {tab.icon}
              </div>
              <span className="text-[11px] font-semibold mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
