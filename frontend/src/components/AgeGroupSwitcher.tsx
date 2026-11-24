import React from 'react';
import { useApp } from '../contexts/AppContext';
import { AgeGroup } from '../types';
import { Sparkles, Compass, BookOpen } from 'lucide-react';

export const AgeGroupSwitcher: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => {
  const { ageGroup, setAgeGroup } = useApp();

  const groups: { id: AgeGroup; labelTamil: string; labelEng: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'children',
      labelTamil: 'குழந்தைகள்',
      labelEng: 'Kids (3-12)',
      icon: <Sparkles size={14} />,
      color: 'from-orange-400 to-amber-400 text-amber-950',
    },
    {
      id: 'teenagers',
      labelTamil: 'இளைஞர்கள்',
      labelEng: 'Teens (13-19)',
      icon: <Compass size={14} />,
      color: 'from-teal-500 to-cyan-500 text-slate-950',
    },
    {
      id: 'adults',
      labelTamil: 'பெரியவர்கள்',
      labelEng: 'Adults (20+)',
      icon: <BookOpen size={14} />,
      color: 'from-amber-600 to-amber-700 text-white',
    },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-stone-300 dark:border-stone-700 ${className}`}>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setAgeGroup(g.id)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              ageGroup === g.id
                ? `bg-gradient-to-r ${g.color} shadow-sm font-bold scale-102`
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            {g.icon}
            <span>{g.labelTamil}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-2 w-full max-w-md ${className}`}>
      {groups.map((g) => {
        const isActive = ageGroup === g.id;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => setAgeGroup(g.id)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
              isActive
                ? `bg-gradient-to-b ${g.color} border-transparent shadow-md font-bold scale-102 ring-2 ring-amber-400/50`
                : 'bg-white/70 dark:bg-slate-800/70 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700'
            }`}
          >
            <div className="mb-1">{g.icon}</div>
            <span className="text-xs font-bold leading-tight">{g.labelTamil}</span>
            <span className="text-[10px] opacity-80 leading-tight">{g.labelEng}</span>
          </button>
        );
      })}
    </div>
  );
};
