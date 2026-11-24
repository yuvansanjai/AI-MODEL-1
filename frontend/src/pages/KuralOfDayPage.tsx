import React, { useEffect, useState } from 'react';
import { ThemeLayout } from '../components/ThemeLayout';
import { apiService } from '../services/api';
import { Kural } from '../types';
import { KuralDisplay } from '../components/KuralDisplay';
import { Calendar, Sparkles, Heart, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const KuralOfDayPage: React.FC = () => {
  const [kural, setKural] = useState<Kural | null>(null);

  useEffect(() => {
    const fetchKural = async () => {
      const data = await apiService.getKuralOfDay();
      setKural(data);
    };
    fetchKural();
  }, []);

  const today = new Date();
  const dateStrTamil = today.toLocaleDateString('ta-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateStrEnglish = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!kural) return null;

  return (
    <ThemeLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Date Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <Calendar size={15} />
            <span>{dateStrTamil}</span>
            <span className="opacity-50">•</span>
            <span>{dateStrEnglish}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e] flex items-center justify-center gap-2">
            <Sparkles size={24} className="text-amber-500" />
            <span>இன்றைய திருக்குறள் சிந்தனை</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            ஒவ்வொரு நாளும் ஒரு குறளைக் கற்று வாழ்வியல் நெறியில் நடைமுறைப்படுத்துங்கள்.
          </p>
        </div>

        {/* The Kural Display Component */}
        <KuralDisplay kural={kural} />

        {/* Reflection & Action Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 border border-amber-600/20 text-center space-y-3">
          <h4 className="font-bold text-base text-[#1a1f36] dark:text-[#e5cb8e]">
            இன்றைய வாழ்வியல் தியானம் (Daily Contemplation)
          </h4>
          <p className="text-sm text-stone-700 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
            "இன்று நீங்கள் சந்திக்கவிருக்கும் நபர்களிடம் இக்குறள் கூறும் அறநெறியை எவ்வாறு வெளிப்படுத்தப் போகிறீர்கள் என்று சிந்தித்துப் பாருங்கள்."
          </p>

          <div className="pt-2">
            <NavLink
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <MessageSquare size={16} />
              <span>இக்குறள் குறித்து வள்ளுவரிடம் உரையாட</span>
            </NavLink>
          </div>
        </div>
      </div>
    </ThemeLayout>
  );
};
