import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Share2, Search, BookOpen, Trophy, Play, Headphones, Sparkles, User, ExternalLink, X, MessageSquare, Compass, Zap, ArrowLeft } from '../../components/LucideIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { TeenagerChallenge } from './TeenagerChallenge';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';

export const TeenagerUI: React.FC = () => {
  const { dailyKural, isPlayingAudio, playKuralAudio, stopKuralAudio, setIsChatOpen, setIsVoiceModalOpen, setAgeGroup } = useTheme();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>('Leadership');
  const [tagSearch, setTagSearch] = useState('');

  const tags = ['Ethics', 'Leadership', 'Friendship', 'Wisdom', 'Young minds', 'Self-Mastery', 'Time'];

  const filteredTags = tags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Thirukkural Hub - Kural of the Day',
        text: `${dailyKural.line1} ${dailyKural.line2} - ${dailyKural.translation}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${dailyKural.line1} ${dailyKural.line2}\n${dailyKural.translation}`);
      alert('குறள் மற்றும் விளக்கம் நகலெடுக்கப்பட்டது! (Copied to clipboard)');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#061814] text-[#f1f5f9] overflow-x-hidden font-sans select-none">
      {/* Subtle radial emerald ambient glow without any background image */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 flex flex-col min-h-screen justify-between">
        {/* HEADER BAR matching Image 2 */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-b border-emerald-800/30">
          {/* Left Brand Badge: White Container matching Image 2 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAgeGroup('unknown')}
              className="px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="முதன்மைத் திரைக்குச் செல்க (Back to Voice Gate / Menu)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>முதன்மைத் திரை</span>
            </button>

            <div className="flex items-center gap-2.5 bg-white text-slate-900 px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#061c17] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden p-0.5">
                <ThiruvalluvarSVG size={28} showAura={false} />
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-black tracking-tight text-slate-950">
                  திருக்குறள்
                </h1>
                <p className="text-[10px] text-slate-600 font-medium">
                  The Art of Living or Thirukkural Hub
                </p>
              </div>
            </div>
          </div>

          {/* Nav Items matching Image 2 */}
          <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
            <button
              onClick={() => setActiveModal('aram')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              அறத்துப்பால் <span className="opacity-60 text-[10px]">(Virtue)</span>
            </button>
            <button
              onClick={() => setActiveModal('porul')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              பொருட்பால் <span className="opacity-60 text-[10px]">(Wealth)</span>
            </button>
            <button
              onClick={() => setActiveModal('inbam')}
              className="hover:text-rose-300 transition-colors cursor-pointer"
            >
              இன்பத்துப்பால் <span className="opacity-60 text-[10px]">(Love)</span>
            </button>
            <button
              onClick={() => setActiveModal('articles')}
              className="hover:text-cyan-300 transition-colors cursor-pointer hidden md:inline-block"
            >
              கதைகள் & கட்டுரைகள் <span className="opacity-60 text-[10px]">(Articles & Stories)</span>
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>தேடல்</span> <span className="opacity-60 text-[10px]">(Search)</span>
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 transition-all cursor-pointer text-xs"
              title="குரல் வழி அளவுத்திருத்தம் (Voice Age Calibration)"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Voice</span>
            </button>
          </nav>
        </header>

        {/* MAIN BODY GRID matching Image 2 */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
          {/* LEFT: KURAL OF THE DAY CARD (5 Cols) matching Image 2 */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col"
          >
            {/* Header */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-bold text-amber-400 tracking-wide">
                இன்றைய குறள்
              </span>
              <span className="text-xs text-slate-400">(Kural of the Day)</span>
            </div>

            {/* Deep Glass Card with Thin Gold Border matching Image 2 */}
            <div className="relative rounded-2xl bg-[#091b16]/90 border border-amber-500/40 p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
              {/* Golden Quote Mark Badge */}
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-serif text-lg mb-4">
                “
              </div>

              {/* Primary Verse in Amber/Gold */}
              <div className="space-y-1 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-300 leading-snug tracking-wide">
                  {dailyKural.line1}
                </h2>
                <h2 className="text-xl sm:text-2xl font-bold text-amber-300 leading-snug tracking-wide">
                  {dailyKural.line2}
                </h2>
              </div>

              {/* Tamil Commentary / Transliteration snippet */}
              <p className="text-xs text-emerald-200/80 leading-relaxed mb-4 font-medium line-clamp-3">
                {dailyKural.explanationMuVa || dailyKural.line1 + ' ' + dailyKural.line2}
              </p>

              {/* English Translation */}
              <div className="pt-3 border-t border-emerald-800/40">
                <p className="text-sm font-semibold text-slate-200 leading-snug">
                  {dailyKural.translation}
                </p>
                <p className="text-xs text-slate-400 mt-1 italic">
                  Exploring the foundations of life, ethics, and wisdom.
                </p>
              </div>

              {/* Bottom 3 Action Buttons matching Image 2 */}
              <div className="mt-6 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs font-semibold text-slate-300">
                <button
                  onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>Listen</span>
                  <span className="text-[10px] text-slate-400">(கேள்)</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Share</span>
                  <span className="text-[10px] text-slate-400">(பகிர்)</span>
                </button>

                <button
                  onClick={() => setActiveModal('deepdive')}
                  className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Deep Dive</span>
                  <span className="text-[10px] text-slate-400">(விரிவான உரை)</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: ANALYTICS, CHALLENGES, PODCASTS & TAGS (7 Cols) matching Image 2 */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Top Row: 2 Cards (Analytics & Daily Reflection/Quiz) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: குறள் பகுப்பாய்வு (Kural Analytics & Commentary) */}
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-2xl bg-[#091b16]/85 border border-emerald-500/25 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-emerald-300 leading-snug">
                    குறள் பகுப்பாய்வு
                  </h3>
                  <span className="text-xs text-slate-400 block mb-2">
                    (Kural Analytics & Commentary)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Featured write-ups by modern scholars to online learn thrs.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40">
                  <button
                    onClick={() => setActiveModal('analytics')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read more</span>
                    <span>&gt;</span>
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Card 2: தினசரி சவால்கள் (Daily Reflection & Quiz) */}
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-2xl bg-[#091b16]/85 border border-emerald-500/25 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-emerald-300 leading-snug">
                    தினசரி சவால்கள்
                  </h3>
                  <span className="text-xs text-slate-400 block mb-2">
                    (Daily Reflection & Quiz)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Gamified but mature progress trackers and forums practice.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40">
                  <button
                    onClick={() => setActiveModal('challenge')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read more</span>
                    <span>&gt;</span>
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Podcasts & Videos Section matching Image 2 */}
            <div className="rounded-2xl bg-[#071612]/90 border border-emerald-800/40 p-5 shadow-lg backdrop-blur-sm">
              <h3 className="text-sm font-bold text-emerald-300 mb-1">
                குறள் பாட்காஸ்ட் & காணொளிகள்
              </h3>
              <span className="text-xs text-slate-400 block mb-4">
                (Podcasts & Videos)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Podcast Audio Card */}
                <div
                  onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                  className="rounded-xl bg-slate-900/80 border border-white/10 p-3.5 flex flex-col justify-between cursor-pointer hover:border-amber-400/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    {/* Animated Waveform bar */}
                    <div className="flex items-center gap-1">
                      {[12, 22, 16, 28, 14, 20, 10].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${isPlayingAudio ? h : 6}px` }}
                          className="w-1 bg-amber-400 rounded-full transition-all duration-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-tight">
                      குறள் பாட்காஸ்ட் & குறி காணொளிகள்
                    </h4>
                    <span className="text-[10px] text-emerald-400 block mt-1">
                      {isPlayingAudio ? 'Now Playing • Tap to stop' : 'Tap to Listen'}
                    </span>
                  </div>
                </div>

                {/* 2. Video Thumbnail Card with Play Overlay */}
                <div
                  onClick={() => setActiveModal('video')}
                  className="rounded-xl bg-slate-900/80 border border-white/10 p-3.5 flex flex-col justify-between cursor-pointer hover:border-emerald-400/40 transition-all relative overflow-hidden group"
                >
                  <div className="aspect-video bg-emerald-950/60 rounded-lg flex items-center justify-center relative overflow-hidden mb-2 border border-emerald-800/30">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-tight">
                      Youth discussing philosophy
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Campus Perspectives
                    </span>
                  </div>
                </div>

                {/* 3. Tags Explorer Card matching Image 2 */}
                <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3.5 flex flex-col justify-between">
                  <div>
                    {/* Search bar inside Tags Card */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs mb-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search tag explorer"
                        className="bg-transparent text-white placeholder-slate-500 text-[11px] focus:outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-300">Tags Explorer</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                            selectedTag === tag
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER matching Image 2 */}
        <footer className="pt-4 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-300">Professional Footer</span>
            <button
              onClick={() => setIsChatOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Ask Thiruvalluvar AI ➔
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">f</span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">𝕏</span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">▶</span>
          </div>

          <div>
            <span>© 2026 Thirukkural Hub • Ancient Wisdom for Youth</span>
          </div>
        </footer>
      </div>

      {/* DEEP DIVE MODAL */}
      <AnimatePresence>
        {activeModal === 'deepdive' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-amber-300 mb-2">
                விரிவான உரை & வாழ்வியல் வழிகாட்டல்
              </h3>
              <p className="text-xs text-emerald-400 mb-4">
                குறள் எண்: {dailyKural.number} ({dailyKural.athigaram})
              </p>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4 font-mono text-sm text-amber-200">
                {dailyKural.line1}
                <br />
                {dailyKural.line2}
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">இளைஞர்களுக்கான நடைமுறை விளக்கம்:</h4>
                  <p className="mt-1 leading-relaxed bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/30">
                    {dailyKural.teenExplanation}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">மு. வரதராசனார் உரை:</h4>
                  <p className="mt-1 leading-relaxed text-slate-300">{dailyKural.explanationMuVa}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  வள்ளுவரிடம் வினா கேட்க
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  மூடுக (Close)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHALLENGE MODAL */}
      <AnimatePresence>
        {activeModal === 'challenge' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <TeenagerChallenge />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
