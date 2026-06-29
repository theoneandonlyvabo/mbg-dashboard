import React from 'react';
import type { NavSection } from '../../types';
import { NAV_TABS } from '../../data/constants';

interface NavTabsProps {
  activeSection: NavSection;
  onTabClick: (id: NavSection) => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({ activeSection, onTabClick }) => {
  const handleClick = (id: string) => {
    const sec = document.getElementById(id);
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onTabClick(id as NavSection);
  };

  return (
    <div className="nav-tabs">
      {NAV_TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${activeSection === tab.id ? ' active' : ''}`}
          onClick={() => handleClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
