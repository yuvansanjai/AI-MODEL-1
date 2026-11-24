import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useApp();

  return (
    <div className={`inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-stone-300 dark:border-stone-700 ${className}`}>
      <Globe size={15} className="ml-1.5 opacity-60 text-stone-600 dark:text-stone-300" />
      <button
        type="button"
        onClick={() => setLanguage('ta')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'ta'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
        }`}
      >
        தமிழ்
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'en'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('bilingual')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'bilingual'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
        }`}
      >
        இருமொழி
      </button>
    </div>
  );
};
