import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ThemeLayout } from '../components/ThemeLayout';
import { MOCK_KURALS } from '../services/mockData';
import { ChildrenKuralCard } from '../themes/children/ChildrenKuralCard';
import { ChildrenQuiz } from '../themes/children/ChildrenQuiz';
import { TeenagerKuralCard } from '../themes/teenagers/TeenagerKuralCard';
import { TeenagerChallenge } from '../themes/teenagers/TeenagerChallenge';
import { AdultDashboard } from '../themes/adults/AdultDashboard';
import { NavLink } from 'react-router-dom';
import { Sparkles, MessageSquare, Zap, BookOpen, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { ageGroup } = useApp();

  // Child Theme Dashboard View
  if (ageGroup === 'children') {
    const featuredKural = MOCK_KURALS[1]; // Kural 78 (Anbudaimai)
    return (
      <ThemeLayout>
        <div className="space-y-8">
          {/* Welcome Kids Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 p-6 sm:p-8 text-amber-950 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-3xl">🎈</span>
              <h2 className="text-2xl sm:text-3xl font-black font-children">
                வணக்கம் செல்லமே! நலமா?
              </h2>
              <p className="text-base font-bold text-amber-900 leading-relaxed max-w-md">
                இன்று வள்ளுவர் தாத்தா உனக்காக ஒரு அழகான நல்ல பழக்கத்தைக் கற்றுத்தர வந்திருக்கிறேன்!
              </p>
            </div>

            <NavLink
              to="/chat"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-amber-50 text-orange-600 font-black text-base shadow-lg transition-all hover:scale-105 flex items-center gap-2 shrink-0"
            >
              <MessageSquare size={20} />
              <span>தாத்தாவிடம் பேசு</span>
            </NavLink>
          </div>

          {/* Today's Story Kural */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌟</span>
              <h3 className="text-xl font-black text-amber-900">
                இன்றைய சிறப்புக் கதை & குறள்
              </h3>
            </div>
            <ChildrenKuralCard kural={featuredKural} />
          </div>

          {/* Fun Interactive Quiz Section */}
          <div>
            <ChildrenQuiz />
          </div>
        </div>
      </ThemeLayout>
    );
  }

  // Teenager Theme Dashboard View
  if (ageGroup === 'teenagers') {
    const dailyDrop = MOCK_KURALS[4]; // Kural 392 (STEM + Humanities)
    return (
      <ThemeLayout>
        <div className="space-y-8">
          {/* Modern Hero Header */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0f1d30] via-[#132c44] to-[#0b1320] border border-teal-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest block mb-1">
                // DAILY MENTAL REPROGRAMMING
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                Ancient Logic. Modern Speed.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Cut through brain fog and algorithm overload. Thiruvalluvar decoded human psychology, social dynamics, and peak focus 2,000 years ago.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <NavLink
                  to="/chat"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Ask AI Mentor</span>
                </NavLink>

                <NavLink
                  to="/topics"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
                >
                  Browse Playbooks
                </NavLink>
              </div>
            </div>
          </div>

          {/* Daily Drop */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                <span>Today's High-Signal Drop</span>
              </h3>
              <NavLink to="/kural-of-day" className="text-xs text-teal-400 font-mono hover:underline">
                Full breakdown &rarr;
              </NavLink>
            </div>
            <TeenagerKuralCard kural={dailyDrop} />
          </div>

          {/* Daily Challenges */}
          <div>
            <TeenagerChallenge />
          </div>
        </div>
      </ThemeLayout>
    );
  }

  // Adult Scholarly Dashboard View
  return (
    <ThemeLayout>
      <AdultDashboard />
    </ThemeLayout>
  );
};
