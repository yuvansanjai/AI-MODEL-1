import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Home, MessageCircle, Search, Trophy, Settings, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LanguageToggle } from '../../components/LanguageToggle';

export const ChildrenNav: React.FC = () => {
  const { userStats } = useApp();

  const links = [
    { to: '/dashboard', label: 'முகப்பு', icon: <Home size={22} />, color: 'text-amber-500' },
    { to: '/chat', label: 'தாத்தாவிடம் பேசு', icon: <MessageCircle size={22} />, color: 'text-orange-500' },
    { to: '/kural-of-day', label: 'இன்றைய குறள்', icon: <Sparkles size={22} />, color: 'text-yellow-500' },
    { to: '/search', label: 'குறள் தேடு', icon: <Search size={22} />, color: 'text-emerald-500' },
    { to: '/settings', label: 'அமைப்புகள்', icon: <Settings size={22} />, color: 'text-pink-500' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fff9ea]/95 backdrop-blur-md border-b-4 border-amber-200 px-4 py-3 shadow-sm select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <span className="text-3xl animate-bounce">📜</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-700 font-children tracking-wide">
              வள்ளுவர் தாத்தா
            </h1>
            <p className="text-[11px] font-bold text-amber-900/60 leading-none">
              சிறுவர் குறள் பூங்கா 🎈
            </p>
          </div>
        </NavLink>

        {/* Stars Counter Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-amber-950 font-black text-sm shadow-md animate-pulse">
            <Star size={18} fill="#f59e0b" className="text-amber-600" />
            <span>{userStats.earnedStars} நட்சத்திரங்கள்</span>
          </div>

          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Navigation Bar Pills */}
      <nav className="max-w-6xl mx-auto mt-2 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-300'
                  : 'bg-white/80 text-amber-900 hover:bg-amber-100 hover:scale-102'
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
