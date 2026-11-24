import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  label?: string;
  theme?: 'children' | 'teenager' | 'adult';
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  onClick,
  size = 'md',
  disabled = false,
  label,
  theme = 'adult',
}) => {
  const sizeMap = {
    sm: { button: 'w-10 h-10', icon: 18 },
    md: { button: 'w-14 h-14', icon: 24 },
    lg: { button: 'w-20 h-20', icon: 34 },
    xl: { button: 'w-28 h-28', icon: 44 },
  };

  const getThemeStyles = () => {
    if (theme === 'children') {
      return {
        active: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/40 ring-4 ring-orange-300',
        idle: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg hover:scale-105 active:scale-95',
        pulseRing: 'bg-orange-400/40',
      };
    } else if (theme === 'teenager') {
      return {
        active: 'bg-teal-500 text-slate-950 shadow-xl shadow-teal-500/50 ring-4 ring-teal-400/50',
        idle: 'bg-slate-800 text-teal-400 border border-teal-500/40 hover:bg-slate-700/80 hover:border-teal-400 shadow-lg shadow-teal-900/20 active:scale-95',
        pulseRing: 'bg-teal-400/30',
      };
    } else {
      return {
        active: 'bg-amber-600 text-white shadow-xl shadow-amber-900/30 ring-4 ring-amber-300',
        idle: 'bg-[#1a1f36] text-[#c4a35a] border border-[#c4a35a]/40 hover:bg-[#252b47] hover:border-[#c4a35a] shadow-md active:scale-95',
        pulseRing: 'bg-amber-500/30',
      };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        {/* Animated Ripple Waves when Listening */}
        {isListening && (
          <>
            <motion.span
              className={`absolute inset-0 rounded-full ${currentTheme.pulseRing}`}
              animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
            />
            <motion.span
              className={`absolute inset-0 rounded-full ${currentTheme.pulseRing}`}
              animate={{ scale: [1, 2.3], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: 0.5, ease: 'easeOut' }}
            />
          </>
        )}

        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label || (isListening ? 'Stop recording' : 'Start speaking')}
          className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            sizeMap[size].button
          } ${isListening ? currentTheme.active : currentTheme.idle}`}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
            >
              <Mic size={sizeMap[size].icon} />
            </motion.div>
          ) : (
            <MicOff size={sizeMap[size].icon} />
          )}
        </button>
      </div>

      {label && (
        <span className="text-xs font-medium tracking-wide opacity-80 text-center select-none">
          {label}
        </span>
      )}
    </div>
  );
};
