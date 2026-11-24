import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, VolumeX, ArrowLeft, Bot } from './components/LucideIcons';
import { useTheme } from './contexts/ThemeContext';
import { ChildrenUI } from './themes/children/ChildrenUI';
import { TeenagerUI } from './themes/teenagers/TeenagerUI';
import { AdultUI } from './themes/adults/AdultUI';
import { WelcomeVoiceGate } from './components/WelcomeVoiceGate';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ThiruvalluvarChatModal } from './components/ThiruvalluvarChatModal';

// Standalone sub-pages
import { VoiceEstimationPage } from './pages/VoiceEstimationPage';
import { ManualSelectionPage } from './pages/ManualSelectionPage';
import { SearchPage } from './pages/SearchPage';
import { KuralOfDayPage } from './pages/KuralOfDayPage';
import { TopicExplorationPage } from './pages/TopicExplorationPage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const {
    ageGroup,
    setAgeGroup,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isChatOpen,
    setIsChatOpen,
    isPlayingAudio,
    stopKuralAudio,
  } = useTheme();

  const location = useLocation();

  const renderActiveAgeUI = () => {
    switch (ageGroup) {
      case 'children':
        return <ChildrenUI />;
      case 'teenagers':
        return <TeenagerUI />;
      case 'adults':
        return <AdultUI />;
      case 'unknown':
      default:
        return <WelcomeVoiceGate />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* FLOATING TOP-RIGHT HUD (Visible when inside an age-adaptive interface) */}
      {ageGroup !== 'unknown' && (
        <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-40 flex items-center gap-2">
          {/* Audio Recitation Stop Pill when playing */}
          {isPlayingAudio && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={stopKuralAudio}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg border border-rose-400/50 backdrop-blur-md cursor-pointer animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>நிறுத்து</span>
            </motion.button>
          )}

          {/* Quick Age Switcher / Menu Pill */}
          <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setAgeGroup('unknown')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
              title="முதன்மைப் பக்கம் (Back to Voice Gate / Menu)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Menu</span>
            </button>

            <button
              onClick={() => setAgeGroup('children')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                ageGroup === 'children'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="சிறுவர் பயன்முறை (6–12)"
            >
              <span>🧒</span>
              <span className="hidden md:inline text-[11px]">சிறுவர்</span>
            </button>

            <button
              onClick={() => setAgeGroup('teenagers')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                ageGroup === 'teenagers'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="இளைஞர் பயன்முறை (13–17)"
            >
              <span>🧑</span>
              <span className="hidden md:inline text-[11px]">இளைஞர்</span>
            </button>

            <button
              onClick={() => setAgeGroup('adults')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                ageGroup === 'adults'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="பெரியோர் பயன்முறை (18+)"
            >
              <span>👨</span>
              <span className="hidden md:inline text-[11px]">பெரியோர்</span>
            </button>

            {/* Mic Re-calibration Trigger */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="ml-1 p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
              title="குரல் வழி மறு அளவுத்திருத்தம் (Recalibrate Voice Age)"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Chatbot Floating Trigger */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white shadow-xl shadow-orange-500/25 border border-white/20 cursor-pointer flex items-center justify-center"
            title="வள்ளுவர் AI உரையாடல் (Chat with Thiruvalluvar)"
          >
            <Bot className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* MAIN VIEWPORT WITH SMOOTH TRANSITION */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname + ageGroup}>
          <Route
            path="/"
            element={
              <motion.div
                key={ageGroup}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {renderActiveAgeUI()}
              </motion.div>
            }
          />

          <Route path="/welcome" element={<WelcomeVoiceGate />} />
          <Route path="/voice-estimation" element={<VoiceEstimationPage />} />
          <Route path="/manual-selection" element={<ManualSelectionPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/kural-of-day" element={<KuralOfDayPage />} />
          <Route path="/topics" element={<TopicExplorationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* VOICE ESTIMATION MODAL */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <VoiceRecorder
            onClose={() => setIsVoiceModalOpen(false)}
            onSuccess={(detectedGroup) => {
              setAgeGroup(detectedGroup);
              setIsVoiceModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* THIRUVALLUVAR AI CHAT MODAL */}
      <ThiruvalluvarChatModal />
    </div>
  );
};

export default App;
