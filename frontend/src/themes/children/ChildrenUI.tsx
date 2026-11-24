import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, BookOpen, Gamepad2, Calendar, Video, Play, MessageCircle, HelpCircle, X, Award, RotateCcw, ArrowLeft } from '../../components/LucideIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { ChildrenQuiz } from './ChildrenQuiz';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';

export const ChildrenUI: React.FC = () => {
  const { dailyKural, isPlayingAudio, playKuralAudio, stopKuralAudio, setIsChatOpen, setIsVoiceModalOpen, setAgeGroup } = useTheme();
  const [activeStoryModal, setActiveStoryModal] = useState(false);
  const [activeQuizModal, setActiveQuizModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#86efac] text-[#1e293b] overflow-x-hidden font-sans select-none">
      {/* Decorative Cloud & Floating Natural Accents (Pure Vector/CSS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft cartoon clouds */}
        <div className="absolute top-8 left-12 w-32 h-12 bg-white/70 rounded-full blur-xs" />
        <div className="absolute top-14 left-20 w-24 h-10 bg-white/80 rounded-full blur-xs" />
        <div className="absolute top-10 right-20 w-40 h-14 bg-white/70 rounded-full blur-xs" />
        <div className="absolute top-16 right-28 w-28 h-10 bg-white/80 rounded-full blur-xs" />

        {/* Floating Stars & Leaves */}
        <motion.div
          animate={{ y: [-10, 15, -10], x: [-5, 8, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-16 text-3xl"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ y: [15, -12, 15], x: [8, -6, 8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-36 left-1/3 text-2xl"
        >
          🍃
        </motion.div>
        <motion.div
          animate={{ y: [-8, 12, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-20 right-1/4 text-2xl"
        >
          ✨
        </motion.div>

        {/* Rolling hills at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-[#4ade80]/60 rounded-t-[100%] scale-150 transform translate-y-12 blur-xs pointer-events-none" />
      </div>

      {/* Main Content Framing */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-16 flex flex-col min-h-screen justify-between">
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2 border-b border-white/30">
          {/* Brand Title: சிறுவர் திருக்குறள் + Back to Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAgeGroup('unknown')}
              className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-emerald-800 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="முதன்மைத் திரைக்குச் செல்க (Back to Voice Gate / Menu)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>முதன்மைத் திரை</span>
            </button>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer"
              onClick={() => setIsChatOpen(true)}
              title="வள்ளுவர் தாத்தாவிடம் பேசுங்கள்"
            >
              <div className="relative">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.35)] flex items-center gap-2">
                  <span className="text-[#fef08a] drop-shadow-[0_2px_0_#ca8a04]">சிறுவர்</span>
                  <span className="text-[#38bdf8] drop-shadow-[0_2px_0_#0369a1]">திருக்குறள்</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-300 text-sm">★</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#15803d] tracking-wide bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    Thirukkural for Kids
                  </span>
                  <span className="text-emerald-500 text-xs">🍃</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4 Glossy Rounded Pill Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* 1. கதைகள் (Stories) - Pink pill */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStoryModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#ff4081] to-[#f50057] text-white font-extrabold shadow-[0_4px_12px_rgba(245,0,87,0.3)] border-2 border-white/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 drop-shadow-xs" />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">கதைகள்</span>
                <span className="block text-[9px] text-pink-100 font-bold uppercase tracking-wider">Stories</span>
              </div>
            </motion.button>

            {/* 2. விளையாட்டுகள் (Games) - Purple pill */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveQuizModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#7c4dff] to-[#651fff] text-white font-extrabold shadow-[0_4px_12px_rgba(101,31,255,0.3)] border-2 border-white/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 drop-shadow-xs" />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">விளையாட்டுகள்</span>
                <span className="block text-[9px] text-purple-100 font-bold uppercase tracking-wider">Games</span>
              </div>
            </motion.button>

            {/* 3. தினமும் ஒரு குறள் (Daily Kural) - Cyan pill */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playKuralAudio(dailyKural)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#00b0ff] to-[#0091ea] text-white font-extrabold shadow-[0_4px_12px_rgba(0,145,234,0.3)] border-2 border-white/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 drop-shadow-xs" />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">தினமும் ஒரு குறள்</span>
                <span className="block text-[9px] text-cyan-100 font-bold uppercase tracking-wider">Daily Kural</span>
              </div>
            </motion.button>

            {/* 4. காணொளிகள் (Videos) - Magenta pill */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveVideoModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#e040fb] to-[#d500f9] text-white font-extrabold shadow-[0_4px_12px_rgba(213,0,249,0.3)] border-2 border-white/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 drop-shadow-xs" />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">காணொளிகள்</span>
                <span className="block text-[9px] text-pink-100 font-bold uppercase tracking-wider">Videos</span>
              </div>
            </motion.button>
          </div>
        </header>

        {/* SAGE & SQUIRREL CHARACTER BANNER */}
        <div className="my-2 flex items-center justify-center sm:justify-start gap-3">
          <div className="p-1 rounded-2xl bg-white/70 border-2 border-white shadow-md flex items-center gap-2 px-3 py-1.5">
            <ThiruvalluvarSVG size={45} showAura={false} />
            <span className="text-xs font-bold text-emerald-950">
              வள்ளுவர் தாத்தா: "கற்க கசடறக் கற்பவை!"
            </span>
          </div>
        </div>

        {/* MIDDLE SECTION: MAIN KURAL CARD & RIGHT ACTIVITY CARDS */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-center">
          {/* LEFT: FLORAL KURAL CARD (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 relative"
          >
            {/* Outer Floral Pattern Frame */}
            <div className="relative rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-br from-[#fef08a] via-[#fbcfe8] to-[#bae6fd] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border-4 border-white">
              <div className="absolute -top-3 -left-3 text-2xl select-none">🌸</div>
              <div className="absolute -top-3 -right-3 text-2xl select-none">🌺</div>
              <div className="absolute -bottom-3 -left-3 text-2xl select-none">🌼</div>
              <div className="absolute -bottom-3 -right-3 text-2xl select-none">🌻</div>

              {/* Inner Cream Card */}
              <div className="relative rounded-[2rem] bg-[#fffef5] border-2 border-amber-200/60 p-6 sm:p-8 pt-9 text-center shadow-inner overflow-hidden">
                {/* Header Badge: இன்றைய குறள் (Orange Pill) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#fb923c] to-[#ea580c] text-white px-6 py-1.5 rounded-b-2xl font-black text-sm sm:text-base shadow-md border-b-2 border-amber-600/40 tracking-wide">
                  இன்றைய குறள்
                </div>

                {/* Tamil Verse */}
                <div className="mt-3 space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#1e293b] leading-relaxed drop-shadow-xs">
                    {dailyKural.line1}
                  </h2>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1e293b] leading-relaxed drop-shadow-xs">
                    {dailyKural.line2}
                  </h2>
                </div>

                {/* English Meaning */}
                <div className="mt-4 pt-4 border-t border-amber-100 max-w-md mx-auto">
                  <p className="text-sm sm:text-base font-bold text-[#475569] leading-normal">
                    {dailyKural.translation}
                  </p>
                </div>

                {/* Kid Explanation / Story Snippet */}
                <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/60 text-xs sm:text-sm font-medium text-amber-950 leading-snug">
                  {dailyKural.kidExplanation}
                </div>

                {/* Interactive Audio & Chat Buttons */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlayingAudio ? 'நிறுத்து' : 'குறளைக் கேள்'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsChatOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>தாத்தாவிடம் பேசு</span>
                  </motion.button>
                </div>

                {/* Cute Smiling Sun with Sunglasses ☀️ */}
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 select-none cursor-pointer"
                  onClick={() => playKuralAudio(dailyKural)}
                  title="கேளுங்கள்!"
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl drop-shadow-md">🌞</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: 3 ACTIVITY CARDS (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Top Card: குறள் கதைகள் (Animated Stories) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-3xl p-4 bg-gradient-to-r from-[#4ade80] to-[#22c55e] border-4 border-white shadow-lg overflow-hidden text-white flex items-center justify-between"
            >
              <div className="relative z-10">
                <span className="text-lg sm:text-xl font-black block drop-shadow-xs">குறள் கதைகள்</span>
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">
                  Animated Stories
                </span>
                <button
                  onClick={() => setActiveStoryModal(true)}
                  className="mt-2.5 px-4 py-1.5 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-black text-xs shadow-md border-2 border-white flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>விளையாடு / Play</span>
                  <Gamepad2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-5xl select-none drop-shadow-md">🦌🌲</div>
            </motion.div>

            {/* Bottom Row: 2 Cards (Games & Audio) */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 2: விளையாடி பழகு! (Interactive Games) */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveQuizModal(true)}
                className="rounded-3xl p-4 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] border-4 border-white shadow-lg text-white flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-sm sm:text-base font-black leading-tight">விளையாடி பழகு!</h4>
                  <p className="text-[10px] text-sky-100 font-bold uppercase tracking-wider mt-0.5">
                    Interactive Games
                  </p>
                </div>
                <div className="my-3 flex items-center justify-center gap-2 text-3xl">
                  <span>🧒</span>
                  <span className="text-4xl animate-bounce">🧩</span>
                  <span>👧</span>
                </div>
                <span className="text-[11px] font-bold text-center bg-white/20 rounded-full py-1">
                  தொடங்குக ➔
                </span>
              </motion.div>

              {/* Card 3: கேட்டு மகிழ்! (Listen & Learn) */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
                className="rounded-3xl p-4 bg-gradient-to-br from-[#fb923c] to-[#ea580c] border-4 border-white shadow-lg text-white flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-sm sm:text-base font-black leading-tight">கேட்டு மகிழ்!</h4>
                  <p className="text-[10px] text-orange-100 font-bold uppercase tracking-wider mt-0.5">
                    Listen & Learn
                  </p>
                </div>
                <div className="my-3 flex items-center justify-center text-4xl">
                  <span className={isPlayingAudio ? 'animate-spin' : ''}>📻🎧</span>
                </div>
                <span className="text-[11px] font-bold text-center bg-white/20 rounded-full py-1">
                  {isPlayingAudio ? 'நிறுத்து' : 'ஒலி கேட்க ➔'}
                </span>
              </motion.div>
            </div>
          </div>
        </main>

        {/* BOTTOM STRIP: CHARACTERS & ACTION DOCK */}
        <footer className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-white/40">
          {/* Left Social & Mode Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => (isPlayingAudio ? stopKuralAudio() : playKuralAudio(dailyKural))}
              className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
              title="ஒலி"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
              title="குரல் வழி அளவுத்திருத்தம் (Voice Calibration)"
            >
              🎤
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
              title="உரையாடல்"
            >
              💬
            </button>
          </div>

          {/* Center Copyright Banner */}
          <div className="text-center">
            <p className="text-xs sm:text-sm font-extrabold text-[#1e293b]/80 bg-white/60 px-4 py-1 rounded-full shadow-xs">
              © Copyright 2026, Thirukkural Kids Edition • Ancient Wisdom for Young Hearts
            </p>
          </div>

          {/* Right Waving Characters Strip */}
          <div className="flex items-center gap-1.5 text-2xl select-none">
            <span>👦</span>
            <span>🧒</span>
            <span>👧</span>
            <span>🐿️</span>
            <span>🐘</span>
          </div>
        </footer>
      </div>

      {/* QUIZ MODAL */}
      <AnimatePresence>
        {activeQuizModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border-4 border-purple-400">
              <button
                onClick={() => setActiveQuizModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <ChildrenQuiz />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY MODAL */}
      <AnimatePresence>
        {activeStoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-lg bg-[#fffef5] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-400 text-[#1e293b]">
              <button
                onClick={() => setActiveStoryModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📖</span>
                <div>
                  <h3 className="text-xl font-black text-emerald-800">வள்ளுவர் சொன்ன கதை</h3>
                  <p className="text-xs text-slate-500">Kural Story: {dailyKural.athigaram}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                ஒருமுறை ஒரு பள்ளியில் மாணவர்கள் முதல் பாடத்தைப் படிக்கத் தொடங்கினார்கள். ஆசிரியர் கரும்பலகையில் "அ" என்று எழுதினார். "குழந்தைகளே, இந்த 'அ' என்ற எழுத்துதான் மற்ற எல்லா எழுத்துக்களுக்கும் தொடக்கம். அதேபோல, இந்த அழகான உலகத்தின் எல்லாவற்றிற்கும் கடவுளே தொடக்கம்!" என்றார் வள்ளுவர் தாத்தா.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>நீதி: நல்ல தொடக்கமும் அன்பான வணக்கமும் வாழ்க்கையை அழகாக்கும்!</span>
              </div>
              <button
                onClick={() => setActiveStoryModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                நன்றி தாத்தா! (Close)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO / ANIMATION MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-4 border-pink-400">
              <button
                onClick={() => setActiveVideoModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-pink-300 mb-2 flex items-center gap-2">
                <Video className="w-5 h-5" />
                சிறுவர் குறள் அனிமேஷன்
              </h3>
              <div className="aspect-video bg-black/60 rounded-2xl flex flex-col items-center justify-center border border-white/10 my-4">
                <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-lg animate-pulse cursor-pointer" onClick={() => playKuralAudio(dailyKural)}>
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-xs text-slate-300 mt-3 font-medium">அகர முதல எழுத்தெல்லாம் - அனிமேஷன் ஒளிவடிவம்</p>
              </div>
              <p className="text-xs text-slate-400 text-center">ஆடியோ மற்றும் காட்சி விளக்கங்களுடன் குறளை எளிதாகப் படியுங்கள்!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
