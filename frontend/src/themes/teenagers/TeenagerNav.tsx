import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Zap, Flame, MessageSquare, Search, Award, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LanguageToggle } from '../../components/LanguageToggle';

export const TeenagerNav: React.FC = () => {
  const { userStats } = useApp();

  const links = [
    { to: '/dashboard', label: 'Feed', icon: <Compass size={18} /> },
    { to: '/chat', label: 'Valluvar AI', icon: <MessageSquare size={18} /> },
    { to: '/kural-of-day', label: 'Daily Drop', icon: <Zap size={18} /> },
    { to: '/topics', label: 'Explore', icon: <Search size={18} /> },
    { to: '/search', label: 'Lookup', icon: <Search size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b1320]/90 backdrop-blur-xl border-b border-teal-500/20 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b1320] rounded-[10px] flex items-center justify-center text-teal-400 font-black text-sm">
              TV
            </div>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Valluvar</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-teal-300/70 font-mono tracking-wider">
              ANCIENT WISDOM // MODERN MIND
            </p>
          </div>
        </NavLink>

        {/* Streaks & XP pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-teal-500/30 text-xs font-mono">
            <Flame size={15} className="text-orange-400 animate-pulse" />
            <span className="text-orange-300 font-bold">{userStats.currentStreak}d Streak</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-500/40 text-xs font-mono">
            <Zap size={14} className="text-amber-400" />
            <span className="text-amber-300 font-bold">{userStats.xpPoints} XP</span>
          </div>

          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Nav pill links */}
      <nav className="max-w-6xl mx-auto mt-2.5 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
