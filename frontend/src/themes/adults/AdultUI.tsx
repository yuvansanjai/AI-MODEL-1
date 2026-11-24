import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, BookOpen, Share2, MessageSquare, Search, Globe, Users, Play, Headphones, X, Award, Sparkles, Feather, ArrowLeft } from '../../components/LucideIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';

export const AdultUI: React.FC = () => {
  const { dailyKural, isPlayingAudio, playKuralAudio, stopKuralAudio, setIsChatOpen, setIsVoiceModalOpen, language, setLanguage, setAgeGroup } = useTheme();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCommentary, setSelectedCommentary] = useState<'muva' | 'sp' | 'parimel'>('muva');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Thirukkural - The Wisdom of Thirukkural',
        text: `${dailyKural.line1} ${dailyKural.line2}\n${dailyKural.translation}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${dailyKural.line1} ${dailyKural.line2}\n${dailyKural.translation}`);
      alert('குறள் மற்றும் உரை நகலெடுக்கப்பட்டது!');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#090e1a] text-[#fbf8f1] overflow-x-hidden font-serif select-none">
      {/* Subtle classical ambient glow without any background image */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#c4a35a]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 flex flex-col min-h-screen justify-between">
        {/* HEADER BAR matching Image 3 */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-b border-[#c4a35a]/30">
          {/* Left Brand Badge matching Image 3 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAgeGroup('unknown')}
              className="px-3 py-1.5 rounded-full bg-[#3d0f19] hover:bg-[#521523] border border-[#c4a35a]/40 text-[#e5cb8e] text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="முதன்மைத் திரைக்குச் செல்க (Back to Voice Gate / Menu)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>முதன்மைத் திரை</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-[#c4a35a] bg-[#1a0509] flex items-center justify-center p-0.5 shadow-md shrink-0 overflow-hidden">
                <ThiruvalluvarSVG size={36} showAura={false} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f0e1]">
                  திருக்குறள்
                </h1>
                <p className="text-[10px] text-[#c4a35a] tracking-wider uppercase font-sans">
                  The Wisdom of Thirukkural
                </p>
              </div>
            </div>
          </div>

          {/* Nav Items matching Image 3 */}
          <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-[#dfd4bf]">
            <button
              onClick={() => setActiveModal('aram')}
              className="hover:text-[#e5cb8e] transition-colors cursor-pointer"
            >
              அறத்துப்பால் <span className="opacity-60 text-[10px]">(Virtue)</span>
            </button>
            <button
              onClick={() => setActiveModal('porul')}
              className="hover:text-[#e5cb8e] transition-colors cursor-pointer"
            >
              பொருட்பால் <span className="opacity-60 text-[10px]">(Wealth)</span>
            </button>
            <button
              onClick={() => setActiveModal('inbam')}
              className="hover:text-[#e5cb8e] transition-colors cursor-pointer"
            >
              இன்பத்துப்பால் <span className="opacity-60 text-[10px]">(Love)</span>
            </button>
            <button
              onClick={() => setActiveModal('commentators')}
              className="hover:text-[#e5cb8e] transition-colors cursor-pointer hidden lg:inline-block"
            >
              உரையாசிரியர்கள் <span className="opacity-60 text-[10px]">(Commentaries)</span>
            </button>
            <button
              onClick={() => setActiveModal('research')}
              className="hover:text-[#e5cb8e] transition-colors cursor-pointer hidden md:inline-block"
            >
              ஆராய்ச்சி <span className="opacity-60 text-[10px]">(Research)</span>
            </button>
          </nav>

          {/* Right Controls: Search, Lang Globe, and Golden Sign-In Button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-[#c4a35a]/30 text-xs">
              <Search className="w-3.5 h-3.5 text-[#c4a35a]" />
              <input
                type="text"
                placeholder="தேடுக..."
                onClick={() => setIsChatOpen(true)}
                className="bg-transparent text-white placeholder-[#dfd4bf]/60 text-xs focus:outline-none w-20 sm:w-28 cursor-pointer"
                readOnly
              />
            </div>

            <button
              onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
              className="p-2 rounded-lg bg-black/40 border border-[#c4a35a]/30 text-[#e5cb8e] hover:bg-black/60 transition-colors cursor-pointer"
              title="மொழி மாற்றி (Tamil / English)"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Golden Sign-In Button matching Image 3 */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c4a35a] via-[#e5cb8e] to-[#b38f45] text-[#1a0509] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>உள்நுழைக</span>
              <span className="text-[10px] font-sans opacity-80">(Voice)</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY GRID matching Image 3 */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-7 my-6 items-start">
          {/* LEFT: ORNATE GOLD FILIGREE KURAL CARD (6 Cols) matching Image 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex flex-col"
          >
            {/* Title above card */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-[#e5cb8e] tracking-wide">
                இன்றைய குறள்
              </span>
              <span className="text-xs text-[#dfd4bf]/60 font-sans">(Kural of the Day)</span>
            </div>

            {/* Antique Golden Engraved Frame with Corner Flourishes */}
            <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#c4a35a] via-[#85672c] to-[#c4a35a] shadow-[0_20px_45px_rgba(0,0,0,0.7)]">
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1 text-[#e5cb8e] text-xs pointer-events-none select-none">❖</div>
              <div className="absolute top-1 right-1 text-[#e5cb8e] text-xs pointer-events-none select-none">❖</div>
              <div className="absolute bottom-1 left-1 text-[#e5cb8e] text-xs pointer-events-none select-none">❖</div>
              <div className="absolute bottom-1 right-1 text-[#e5cb8e] text-xs pointer-events-none select-none">❖</div>

              {/* Inner Parchment Card */}
              <div className="relative rounded-[14px] bg-[#1a0509]/95 border border-[#c4a35a]/30 p-6 sm:p-7 backdrop-blur-md">
                {/* Verse with Illuminated Drop Cap "அ" */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-[#4a101d] to-[#25080e] border border-[#c4a35a]/50 flex items-center justify-center text-3xl font-bold text-[#e5cb8e] shadow-md shrink-0">
                    அ
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#f5f0e1] leading-relaxed tracking-wide">
                      {dailyKural.line1}
                    </h2>
                    <h2 className="text-lg sm:text-xl font-bold text-[#f5f0e1] leading-relaxed tracking-wide">
                      {dailyKural.line2}
                    </h2>
                  </div>
                </div>

                {/* Romanized Transliteration matching Image 3 */}
                <p className="text-xs text-[#c4a35a] font-sans font-medium tracking-wide mb-3 pl-1">
                  Akara Mudhala Ezhuthellam Aadhi Bhagavan Muthatre Ulagu
                </p>

                {/* English Translation */}
                <div className="pt-3 border-t border-[#c4a35a]/20 pl-1">
                  <p className="text-xs sm:text-sm text-[#dfd4bf] leading-relaxed font-sans">
                    {dailyKural.translation}
                  </p>
                </div>

                {/* Bottom Action Toolbar matching Image 3 */}
                <div className="mt-6 pt-4 border-t border-[#c4a35a]/20 flex flex-wrap items-center justify-between text-xs text-[#e5cb8e] font-sans">
                  <button
                    onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4 text-[#e5cb8e]" /> : <Volume2 className="w-4 h-4 text-[#e5cb8e]" />}
                    <span>கேள்</span>
                    <span className="opacity-60 text-[10px]">Listen</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('commentaries')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <BookOpen className="w-4 h-4 text-[#e5cb8e]" />
                    <span>விளக்கவுரை</span>
                    <span className="opacity-60 text-[10px]">Commentaries</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <Share2 className="w-4 h-4 text-[#e5cb8e]" />
                    <span>பகிர்</span>
                    <span className="opacity-60 text-[10px]">Share</span>
                  </button>

                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <MessageSquare className="w-4 h-4 text-[#e5cb8e]" />
                    <span>பயிற்சி</span>
                    <span className="opacity-60 text-[10px]">Reflections</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Symmetrical Gold Filigree Divider Motif below card matching Image 3 */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[#c4a35a]/60 select-none">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#c4a35a]" />
              <span className="text-sm">❦</span>
              <span className="text-xs">❖</span>
              <span className="text-sm">❦</span>
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#c4a35a]" />
            </div>
          </motion.div>

          {/* RIGHT: 3 SCHOLARLY CARDS (6 Cols) matching Image 3 */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Card 1: இன்றைய சிந்தனை (Daily Wisdom Reflection) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-[#0d1612]/80 border border-[#c4a35a]/30 p-5 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-[#e5cb8e]">
                  இன்றைய சிந்தனை <span className="text-xs font-sans text-[#dfd4bf]/70 font-normal">(Daily Wisdom Reflection)</span>
                </h3>
              </div>
              <p className="text-xs text-[#dfd4bf] leading-relaxed mb-4 font-sans">
                Brief scholarly insights into life, ethical leadership, and personal growth.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-1.5 rounded-full bg-[#1b2b23] border border-[#c4a35a]/40 text-[#e5cb8e] hover:bg-[#253d31] transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>விவாதி / Discuss</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Card 2: ஆராய்ச்சி கட்டுரைகள் (Scholarly Research) matching Image 3 */}
            <div className="rounded-2xl bg-[#0d1612]/80 border border-[#c4a35a]/30 p-5 shadow-lg backdrop-blur-sm">
              <h3 className="text-base font-bold text-[#e5cb8e] mb-1">
                ஆராய்ச்சி கட்டுரைகள் <span className="text-xs font-sans text-[#dfd4bf]/70 font-normal">(Scholarly Research)</span>
              </h3>

              {/* 3 Scholar Thumbnails in Row matching Image 3 */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {/* Scholar 1 */}
                <div
                  onClick={() => setActiveModal('scholars')}
                  className="rounded-xl bg-black/40 border border-[#c4a35a]/20 p-2.5 flex flex-col justify-between cursor-pointer hover:border-[#c4a35a] transition-all"
                >
                  <div className="aspect-4/3 bg-[#240a10] rounded-lg flex items-center justify-center text-3xl mb-2 relative overflow-hidden">
                    <span>🧔</span>
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#c4a35a] flex items-center justify-center text-[7px] text-black font-bold">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#f5f0e1] leading-tight">அறத்தின் வழி</h4>
                    <span className="text-[9px] text-[#c4a35a] block font-sans">(The Path of Virtue)</span>
                  </div>
                </div>

                {/* Scholar 2 */}
                <div
                  onClick={() => setActiveModal('scholars')}
                  className="rounded-xl bg-black/40 border border-[#c4a35a]/20 p-2.5 flex flex-col justify-between cursor-pointer hover:border-[#c4a35a] transition-all"
                >
                  <div className="aspect-4/3 bg-[#1e1e24] rounded-lg flex items-center justify-center text-3xl mb-2">
                    <span>👨‍🏫</span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#f5f0e1] leading-tight">வாழ்வியல் தத்துவம்</h4>
                    <span className="text-[9px] text-[#c4a35a] block font-sans">(Philosophy of Life)</span>
                  </div>
                </div>

                {/* Scholar 3 (Temple/Sculpture) */}
                <div
                  onClick={() => setActiveModal('research')}
                  className="rounded-xl bg-black/40 border border-[#c4a35a]/20 p-2.5 flex flex-col justify-between cursor-pointer hover:border-[#c4a35a] transition-all"
                >
                  <div className="aspect-4/3 bg-[#151c17] rounded-lg flex items-center justify-center text-3xl mb-2">
                    <span>🏛️</span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#f5f0e1] leading-tight">கோவில் சிற்பங்கள்</h4>
                    <span className="text-[9px] text-[#c4a35a] block font-sans">(Ancient Heritage)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: ஊடகம் & பாட்காஸ்ட் (Podcasts & Videos) matching Image 3 */}
            <div className="rounded-2xl bg-[#0d1612]/80 border border-[#c4a35a]/30 p-5 shadow-lg backdrop-blur-sm">
              <h3 className="text-base font-bold text-[#e5cb8e] mb-3">
                ஊடகம் & பாட்காஸ்ட் <span className="text-xs font-sans text-[#dfd4bf]/70 font-normal">(Podcasts & Videos)</span>
              </h3>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#c4a35a] bg-[#22070e] flex items-center justify-center text-2xl shadow-md shrink-0">
                    <span>🧔</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#1b2b23] border border-[#c4a35a]/40 flex items-center justify-center text-sm text-[#e5cb8e]">
                    🪔
                  </div>
                </div>

                {/* Audio Waveforms */}
                <div
                  onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                  className="flex-1 flex items-center justify-end gap-1.5 cursor-pointer bg-black/30 p-2.5 rounded-xl border border-white/5 hover:border-[#c4a35a]/40 transition-all"
                >
                  <Headphones className="w-4 h-4 text-[#e5cb8e] mr-2" />
                  {[8, 18, 12, 24, 16, 28, 10, 20, 14, 6].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${isPlayingAudio ? h : 4}px` }}
                      className="w-1 bg-[#c4a35a] rounded-full transition-all duration-300"
                    />
                  ))}
                  <span className="text-[10px] text-[#e5cb8e] ml-2 font-sans font-bold">
                    {isPlayingAudio ? 'நிறுத்து' : 'கேட்க'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER matching Image 3 */}
        <footer className="pt-4 border-t border-[#c4a35a]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#dfd4bf]/70 font-sans">
          <div className="flex items-center gap-5">
            <button onClick={() => setActiveModal('aram')} className="hover:text-[#e5cb8e] cursor-pointer">
              அறத்துப்பால்
            </button>
            <button onClick={() => setActiveModal('porul')} className="hover:text-[#e5cb8e] cursor-pointer">
              பொருட்பால்
            </button>
            <button onClick={() => setActiveModal('inbam')} className="hover:text-[#e5cb8e] cursor-pointer">
              இன்பத்துப்பால்
            </button>
          </div>

          <div className="flex items-center gap-3 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">f</span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">𝕏</span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">▶</span>
          </div>

          <div>
            <span>© Copyright 2026 - Thirukkural Hub • All Rights Reserved</span>
          </div>
        </footer>
      </div>

      {/* COMMENTARIES MODAL */}
      <AnimatePresence>
        {activeModal === 'commentaries' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="relative w-full max-w-2xl bg-[#1e070c] border border-[#c4a35a] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#f5f0e1]">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#e5cb8e]"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-[#e5cb8e] mb-1">
                உரையாசிரியர்களின் சிறப்பு உரைகள்
              </h3>
              <p className="text-xs text-[#dfd4bf]/70 mb-4 font-sans">
                குறள் எண்: {dailyKural.number} ({dailyKural.athigaram})
              </p>

              {/* Scholar Switcher Tabs */}
              <div className="flex gap-2 mb-4 border-b border-[#c4a35a]/30 pb-2">
                <button
                  onClick={() => setSelectedCommentary('muva')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCommentary === 'muva'
                      ? 'bg-[#c4a35a] text-[#1a0509]'
                      : 'bg-white/10 text-[#dfd4bf]'
                  }`}
                >
                  மு. வரதராசனார் உரை
                </button>
                <button
                  onClick={() => setSelectedCommentary('sp')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCommentary === 'sp'
                      ? 'bg-[#c4a35a] text-[#1a0509]'
                      : 'bg-white/10 text-[#dfd4bf]'
                  }`}
                >
                  சாலமன் பாப்பையா உரை
                </button>
                <button
                  onClick={() => setSelectedCommentary('parimel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCommentary === 'parimel'
                      ? 'bg-[#c4a35a] text-[#1a0509]'
                      : 'bg-white/10 text-[#dfd4bf]'
                  }`}
                >
                  பரிமேலழகர் உரை
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-[#c4a35a]/30 text-sm leading-relaxed text-[#dfd4bf]">
                {selectedCommentary === 'muva' && (
                  <p>{dailyKural.explanationMuVa}</p>
                )}
                {selectedCommentary === 'sp' && (
                  <p>{dailyKural.explanationSolomon || dailyKural.explanationMuVa}</p>
                )}
                {selectedCommentary === 'parimel' && (
                  <p>{dailyKural.explanationParimel || dailyKural.adultExplanation}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 font-sans">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#c4a35a] text-[#1a0509] font-bold text-xs cursor-pointer hover:brightness-110"
                >
                  ஆய்வு வினா கேட்க (Ask AI)
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-[#dfd4bf] font-bold text-xs cursor-pointer hover:bg-white/20"
                >
                  மூடுக
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
