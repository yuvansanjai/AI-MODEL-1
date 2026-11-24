import React from 'react';
import { Volume2, VolumeX } from './LucideIcons';
import { useTheme } from '../contexts/ThemeContext';
import { Kural } from '../types';

interface KuralAudioPlayerProps {
  kural?: Kural;
  className?: string;
  buttonText?: string;
  compact?: boolean;
}

export const KuralAudioPlayer: React.FC<KuralAudioPlayerProps> = ({
  kural,
  className = '',
  buttonText = 'கேள் (Listen)',
  compact = false,
}) => {
  const { dailyKural, isPlayingAudio, playKuralAudio, stopKuralAudio } = useTheme();
  const targetKural = kural || dailyKural;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopKuralAudio();
    } else {
      playKuralAudio(targetKural);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          isPlayingAudio
            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse'
            : 'bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20'
        } ${className}`}
        title={isPlayingAudio ? 'நிறுத்து (Stop)' : 'குரல் வழியே கேள் (Listen to Kural)'}
      >
        {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
        isPlayingAudio
          ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400 animate-pulse'
          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-300'
      } ${className}`}
      title={isPlayingAudio ? 'நிறுத்து (Stop)' : 'குரல் வழியே கேள் (Listen to Kural)'}
    >
      {isPlayingAudio ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>நிறுத்து (Stop)</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};
