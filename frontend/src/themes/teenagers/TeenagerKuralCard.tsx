import React, { useState } from 'react';
import { Kural } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useApp } from '../../contexts/AppContext';
import { Volume2, VolumeX, Bookmark, BookmarkCheck, Share2, Sparkles, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeenagerKuralCard: React.FC<{ kural: Kural }> = ({ kural }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { isBookmarked, toggleBookmark } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hack' | 'scenario' | 'classic'>('hack');

  const bookmarked = isBookmarked(kural.number);

  const handleAudio = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(`${kural.line1}. ${kural.line2}. Modern takeaway: ${kural.teenExplanation}`, 'ta');
    }
  };

  const handleShare = () => {
    const quote = `🔥 Kural #${kural.number}\n"${kural.line1} ${kural.line2}"\n\nTakeaway: ${kural.teenExplanation}\n\nVia Thiruvalluvar AI`;
    navigator.clipboard.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl bg-slate-900/90 border border-teal-500/30 p-6 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden group"
    >
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-rose-500" />

      {/* Header Info & Actions */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold">
            #{kural.number}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            {kural.athigaram}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            // {kural.paal}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAudio}
            className={`p-2 rounded-xl border transition-all ${
              isSpeaking
                ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Listen to recitation"
          >
            {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(kural.number)}
            className={`p-2 rounded-xl border transition-all ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Save to bookmarks"
          >
            {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Copy share card"
          >
            {copied ? <Check size={17} className="text-teal-400" /> : <Share2 size={17} />}
          </button>
        </div>
      </div>

      {/* Couplet In Neon Modern Highlight */}
      <div className="my-5 p-4 sm:p-5 rounded-xl bg-[#0e1726] border border-teal-500/20 text-left">
        <p className="text-lg sm:text-xl font-bold text-teal-100 tracking-wide leading-relaxed font-sans mb-1.5">
          {kural.line1}
        </p>
        <p className="text-lg sm:text-xl font-bold text-teal-100 tracking-wide leading-relaxed font-sans">
          {kural.line2}
        </p>

        <p className="text-xs text-teal-300/60 mt-3 font-mono italic">
          "{kural.transliteration}"
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('hack')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'hack'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={14} />
          <span>Life Hack</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scenario')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'scenario'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={14} />
          <span>Real World</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('classic')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'classic'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tamil Meaning
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-sm leading-relaxed text-slate-300">
        {activeTab === 'hack' && (
          <div>
            <span className="text-xs font-mono text-teal-400 block mb-1 uppercase tracking-wider">
              High-Signal Insight:
            </span>
            <p>{kural.teenExplanation}</p>
          </div>
        )}

        {activeTab === 'scenario' && (
          <div>
            <span className="text-xs font-mono text-amber-400 block mb-1 uppercase tracking-wider">
              English Translation & Context:
            </span>
            <p className="italic text-slate-200 mb-2">"{kural.translation}"</p>
            <p className="text-xs text-slate-400">
              Keywords: {kural.keywords.join(' • ')}
            </p>
          </div>
        )}

        {activeTab === 'classic' && (
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1">
              மு. வரதராசனார் உரை:
            </span>
            <p className="text-slate-200">{kural.explanationMuVa}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
