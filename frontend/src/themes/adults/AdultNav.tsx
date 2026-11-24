import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Compass, Search, Calendar, Info, Settings, Feather } from 'lucide-react';
import { LanguageToggle } from '../../components/LanguageToggle';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';

export const AdultNav: React.FC = () => {
  const links = [
    { to: '/dashboard', label: 'முகப்பு', labelEng: 'Overview', icon: <Compass size={16} /> },
    { to: '/chat', label: 'உரையாடல்', labelEng: 'Philosophy AI', icon: <Feather size={16} /> },
    { to: '/kural-of-day', label: 'நாள் குறள்', labelEng: 'Daily Couplet', icon: <Calendar size={16} /> },
    { to: '/topics', label: 'அதிகாரங்கள்', labelEng: 'Chapters', icon: <BookOpen size={16} /> },
    { to: '/search', label: 'ஆராய்ச்சி & தேடல்', labelEng: 'Research', icon: <Search size={16} /> },
    { to: '/about', label: 'வள்ளுவம்', labelEng: 'About', icon: <Info size={16} /> },
    { to: '/settings', label: 'அமைப்புகள்', labelEng: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1a1f36] text-[#f5f0e1] border-b border-[#c4a35a]/30 shadow-md">
      {/* Top Gold Trim Strip */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c4a35a] to-transparent opacity-80" />

      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-[#0f1322] border border-[#c4a35a]/60 p-0.5 flex items-center justify-center shadow-inner">
            <ThiruvalluvarSVG size={38} showAura={false} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#e5cb8e] font-serif leading-tight">
              திருவள்ளுவர் AI
            </h1>
            <p className="text-[10px] text-[#c4a35a]/80 tracking-widest uppercase font-serif">
              தமிழ் அறநெறி சிந்தனைப் பேரவை
            </p>
          </div>
        </NavLink>

        {/* Right side language toggle & quick info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-xs text-[#c4a35a] font-serif border-r border-[#c4a35a]/30 pr-3">
            <span>முப்பால்: அறம் • பொருள் • இன்பம்</span>
          </div>

          <LanguageToggle />
        </div>
      </div>

      {/* Nav Link Bar */}
      <div className="bg-[#121626] border-t border-[#c4a35a]/20 px-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-1.5 scrollbar-none">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif tracking-wide whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#c4a35a] text-[#1a1f36] font-bold shadow-sm'
                    : 'text-[#e2dac9] hover:text-[#e5cb8e] hover:bg-[#1a1f36]'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              <span className="hidden lg:inline text-[10px] opacity-70">({link.labelEng})</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
