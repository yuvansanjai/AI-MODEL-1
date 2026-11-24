import React, { useState } from 'react';
import { Kural } from '../types';
import { useApp } from '../contexts/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Volume2, VolumeX, Bookmark, BookmarkCheck, Share2, Check } from 'lucide-react';
import { PalmLeafBorder } from './PalmLeafBorder';

interface KuralDisplayProps {
  kural: Kural;
  className?: string;
  showCommentaryTabs?: boolean;
}

export const KuralDisplay: React.FC<KuralDisplayProps> = ({
  kural,
  className = '',
  showCommentaryTabs = true,
}) => {
  const { language, isBookmarked, toggleBookmark, ageGroup } = useApp();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [copied, setCopied] = useState(false);
  const [commentaryTab, setCommentaryTab] = useState<'adapted' | 'muva' | 'solomon' | 'parimel'>('adapted');

  const bookmarked = isBookmarked(kural.number);

  const handleAudioPlay = () => {
    if (isSpeaking) {
      stop();
    } else {
      const recitation = `${kural.line1}. ${kural.line2}.`;
      speak(recitation, 'ta');
    }
  };

  const handleCopy = () => {
    const text = `திருக்குறள் ${kural.number}\n${kural.line1}\n${kural.line2}\n\nபொருள்: ${kural.explanationMuVa}\n\nTranslation: ${kural.translation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAdaptedExplanation = () => {
    if (ageGroup === 'children') return kural.kidExplanation;
    if (ageGroup === 'teenagers') return kural.teenExplanation;
    return kural.adultExplanation;
  };

  return (
    <PalmLeafBorder variant={ageGroup === 'teenagers' ? 'dark' : 'light'} className={`w-full ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-600/20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-amber-700 text-white font-mono font-bold text-xs">
            குறள் {kural.number}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
            {kural.paal}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            • அதிகாரம்: {kural.athigaram}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAudioPlay}
            aria-label="குறள் கேட்க"
            className={`p-2 rounded-full transition-all ${
              isSpeaking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200'
            }`}
            title="குறள் ஒலி வடிவில் கேட்க"
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(kural.number)}
            aria-label="Bookmark"
            className={`p-2 rounded-full transition-all ${
              bookmarked
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                : 'hover:bg-amber-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300'
            }`}
            title="குறிப்பில் சேமிக்க"
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Share or Copy"
            className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 transition-all"
            title="பகிர அல்லது நகலெடுக்க"
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
          </button>
        </div>
      </div>

      {/* The Two Sacred Couplet Lines */}
      <div className="my-5 text-center sm:text-left space-y-2">
        <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-amber-950 dark:text-amber-100 leading-relaxed font-serif">
          {kural.line1}
        </p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-amber-950 dark:text-amber-100 leading-relaxed font-serif">
          {kural.line2}
        </p>
      </div>

      {/* Transliteration */}
      {(language === 'en' || language === 'bilingual') && (
        <div className="text-xs sm:text-sm italic text-stone-600 dark:text-stone-400 mb-3 font-sans">
          "{kural.transliteration}"
        </div>
      )}

      {/* English Translation */}
      {(language === 'en' || language === 'bilingual') && (
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-600/15 mb-4 text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
          <span className="font-semibold text-amber-800 dark:text-amber-400 block text-xs mb-1">
            Translation:
          </span>
          {kural.translation}
        </div>
      )}

      {/* Explanations & Scholar Commentaries */}
      {showCommentaryTabs && (
        <div className="mt-4 pt-3 border-t border-amber-600/20">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCommentaryTab('adapted')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                commentaryTab === 'adapted'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-200/60 dark:bg-slate-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {ageGroup === 'children' ? '👶 கதை & நீதி' : ageGroup === 'teenagers' ? '⚡ Life Hack' : '📜 தத்துவ உரை'}
            </button>
            <button
              type="button"
              onClick={() => setCommentaryTab('muva')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                commentaryTab === 'muva'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-200/60 dark:bg-slate-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              மு. வரதராசனார்
            </button>
            <button
              type="button"
              onClick={() => setCommentaryTab('solomon')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                commentaryTab === 'solomon'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-200/60 dark:bg-slate-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              சாலமன் பாப்பையா
            </button>
            <button
              type="button"
              onClick={() => setCommentaryTab('parimel')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                commentaryTab === 'parimel'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-200/60 dark:bg-slate-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              பரிமேலழகர்
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-amber-600/10 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
            {commentaryTab === 'adapted' && <p>{getAdaptedExplanation()}</p>}
            {commentaryTab === 'muva' && <p>{kural.explanationMuVa}</p>}
            {commentaryTab === 'solomon' && <p>{kural.explanationSolomon}</p>}
            {commentaryTab === 'parimel' && <p>{kural.explanationParimel}</p>}
          </div>
        </div>
      )}
    </PalmLeafBorder>
  );
};
