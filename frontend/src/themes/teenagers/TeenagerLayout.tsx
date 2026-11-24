import React, { ReactNode } from 'react';
import { TeenagerNav } from './TeenagerNav';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { AgeGroupSwitcher } from '../../components/AgeGroupSwitcher';

export const TeenagerLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1320] text-slate-100 font-teenager">
      {/* Background Ambience / Heritage Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <TeenagerNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Modern Sleek Footer */}
      <footer className="relative z-10 bg-[#080d17] border-t border-teal-500/15 py-6 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-teal-500/30 flex items-center justify-center p-1">
              <ThiruvalluvarSVG size={36} showAura={false} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                "நிற்க அதற்குத் தக" — Walk the Talk
              </p>
              <p className="text-xs text-slate-400">
                Thiruvalluvar AI • Next-Gen Tamil Ethical Tech
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <span className="text-[11px] font-mono text-teal-400">SWITCH PERSPECTIVE:</span>
            <AgeGroupSwitcher compact />
          </div>
        </div>
      </footer>
    </div>
  );
};
