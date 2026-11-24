import React, { ReactNode } from 'react';
import { ChildrenNav } from './ChildrenNav';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { AgeGroupSwitcher } from '../../components/AgeGroupSwitcher';

export const ChildrenLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffde7] text-[#37474f] font-children">
      {/* Playful Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-10 left-5 w-24 h-24 rounded-full bg-pink-200 blur-xl animate-pulse" />
        <div className="absolute top-40 right-10 w-32 h-32 rounded-full bg-yellow-200 blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full bg-emerald-200 blur-xl" />
      </div>

      <ChildrenNav />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Cheerful Footer */}
      <footer className="relative z-10 bg-amber-100/90 border-t-4 border-amber-300 py-6 px-4 mt-12 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ThiruvalluvarSVG size={48} showAura={false} />
            <div className="text-left">
              <p className="font-bold text-amber-900 text-sm">
                "அன்போடு கற்போம்! நல்ல பிள்ளைகளாக வளர்வோம்!"
              </p>
              <p className="text-xs text-amber-800/70">
                திருவள்ளுவர் செயற்கை நுண்ணறிவு - சிறுவர் பகுதி
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1">
            <span className="text-[11px] font-bold text-amber-800">வயது முறை மாற்றம்:</span>
            <AgeGroupSwitcher compact />
          </div>
        </div>
      </footer>
    </div>
  );
};
