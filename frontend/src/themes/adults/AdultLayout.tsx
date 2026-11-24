import React, { ReactNode } from 'react';
import { AdultNav } from './AdultNav';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { AgeGroupSwitcher } from '../../components/AgeGroupSwitcher';
import { TamilPattern } from '../../components/TamilPattern';

export const AdultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1f36] font-adult selection:bg-amber-200">
      <AdultNav />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Classical Scholarly Footer */}
      <footer className="relative z-10 bg-[#1a1f36] text-[#e2dac9] border-t-2 border-[#c4a35a]/40 py-8 px-4 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-full bg-[#0e1322] border border-[#c4a35a] p-1 shrink-0 flex items-center justify-center">
              <ThiruvalluvarSVG size={46} showAura={false} />
            </div>
            <div>
              <p className="text-base font-serif font-bold text-[#e5cb8e] leading-snug">
                "எப்பொருள் எத்தன்மைத் தாயினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு."
              </p>
              <p className="text-xs text-[#c4a35a]/80 mt-1 font-sans">
                திருவள்ளுவர் செயற்கை நுண்ணறிவு ஆய்வுத்தளம் • Universal Tamil Ethics System
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <span className="text-xs text-[#c4a35a] font-serif uppercase tracking-wider">
              பயனர் நிலை / Age Mode:
            </span>
            <AgeGroupSwitcher compact />
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-6 pt-4 border-t border-[#c4a35a]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#c4a35a]/60">
          <span>133 அதிகாரங்கள் • 1330 அருங்குறள்கள் • முப்பால் நெறி</span>
          <span className="flex items-center gap-2 mt-2 sm:mt-0">
            <TamilPattern variant="kolam" size={16} color="#c4a35a" />
            <span>தமிழ் இணையக் கல்வி மற்றும் தத்துவக் களம்</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
