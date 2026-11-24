import React, { ReactNode } from 'react';

interface PalmLeafBorderProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'manuscript';
}

export const PalmLeafBorder: React.FC<PalmLeafBorderProps> = ({
  children,
  className = '',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 border ${
        isDark
          ? 'bg-slate-900/90 border-amber-600/30 text-amber-100 shadow-xl shadow-black/40'
          : 'bg-[#faf6ee] border-[#d8c5a5] text-stone-900 shadow-md'
      } ${className}`}
    >
      {/* Top Palm Leaf Binding String Holes */}
      <div className="absolute -top-3 left-8 sm:left-12 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-slate-800 border border-amber-700/30 text-[10px] font-mono tracking-widest text-amber-900 dark:text-amber-300 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-red-600 inline-block ring-1 ring-amber-300"></span>
        <span>ஓலைச்சுவடி</span>
        <span className="w-2 h-2 rounded-full bg-red-600 inline-block ring-1 ring-amber-300"></span>
      </div>

      {/* Traditional Corner Kolam Ornaments */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600/40 rounded-br-sm pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>

      {/* Bottom Subtle Palm Leaf Texture Bar */}
      <div className="mt-4 pt-3 border-t border-amber-600/20 flex items-center justify-between text-xs text-amber-800/70 dark:text-amber-400/60 font-serif">
        <span className="flex items-center gap-1">
          <span>௧</span>
          <span className="h-1 w-8 bg-amber-600/30 rounded-full inline-block"></span>
        </span>
        <span className="text-[11px] tracking-wide">திருவள்ளுவர் அருளிய தமிழ் மறை</span>
        <span className="flex items-center gap-1">
          <span className="h-1 w-8 bg-amber-600/30 rounded-full inline-block"></span>
          <span>௧௩௩0</span>
        </span>
      </div>
    </div>
  );
};
