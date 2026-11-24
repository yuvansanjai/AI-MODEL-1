import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAgeEstimation } from '../hooks/useVoiceAgeEstimation';
import { MicrophoneButton } from '../components/MicrophoneButton';
import { VoiceIndicator } from '../components/VoiceIndicator';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThiruvalluvarSVG } from '../components/ThiruvalluvarSVG';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const VoiceEstimationPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, countdown, result, startEstimation, applyPreset, reset } = useVoiceAgeEstimation();

  const handleProceed = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a1f36] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#dfd4bf]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft size={16} />
          <span>முகப்புக்குத் திரும்பு</span>
        </button>

        <span className="text-xs font-serif font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          குரல் வழி ஆய்வுக்களம்
        </span>
      </div>

      {/* Main Interactive Stage */}
      <main className="max-w-2xl w-full mx-auto my-8 flex flex-col items-center text-center">
        {/* State 1: Idle - Ready to Listen */}
        {state === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <ThiruvalluvarSVG size={180} showAura={true} />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36]">
                உங்கள் குரலைப் பதிவு செய்யுங்கள்
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed font-serif">
                ஒலிவாங்கியை (Microphone) அழுத்தி, <strong>"வணக்கம் திருவள்ளுவர்"</strong> அல்லது ஏதேனும் ஒரு வாக்கியத்தைப் பேசுங்கள். உங்கள் குரலின் சுருதி (Pitch) மற்றும் ஒலியலைகளை ஆராய்ந்து உகந்த இடைமுகத்தை நாங்கள் அமைப்போம்.
              </p>
            </div>

            <div className="pt-4">
              <MicrophoneButton
                isListening={false}
                onClick={startEstimation}
                size="xl"
                label="பேசத் தொடங்க இங்கே தட்டவும்"
                theme="adult"
              />
            </div>

            {/* Quick Demo Presets */}
            <div className="mt-8 pt-6 border-t border-[#dfd4bf] w-full">
              <span className="text-xs font-serif text-stone-500 block mb-3">
                விரைவு சோதனை முறை / Instant Testing Profiles:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('children')}
                  className="px-3.5 py-1.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition-all"
                >
                  👶 குழந்தை மாதிரி (Pitch ~310Hz)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('teenagers')}
                  className="px-3.5 py-1.5 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-bold transition-all"
                >
                  ⚡ இளைஞர் மாதிரி (Pitch ~205Hz)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('adults')}
                  className="px-3.5 py-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold transition-all"
                >
                  📜 பெரியவர் மாதிரி (Pitch ~120Hz)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* State 2: Recording - Active capture */}
        {state === 'recording' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-3xl font-mono font-black text-rose-600 animate-pulse">
              {countdown}s
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-rose-700">
                குரல் கேட்கப்படுகிறது...
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-serif">
                "வணக்கம் திருவள்ளுவர்..." என்று தொடர்ந்து பேசுங்கள்
              </p>
            </div>

            <VoiceIndicator isActive={true} type="recording" barsCount={11} />

            <div className="pt-2">
              <MicrophoneButton
                isListening={true}
                onClick={() => {}}
                size="lg"
                theme="adult"
              />
            </div>
          </motion.div>
        )}

        {/* State 3: Analyzing - Signal processing */}
        {state === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <LoadingSpinner
              messageTamil="குரலின் ஒலியலைகள் மற்றும் சுருதி பகுப்பாய்வு செய்யப்படுகிறது..."
              messageEnglish="Computing fundamental frequency (F0) & acoustic features..."
            />
          </motion.div>
        )}

        {/* State 4: Completed - Results & UI switch */}
        {state === 'completed' && result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            <div className="text-center space-y-1">
              <span className="text-xs font-serif uppercase tracking-widest text-emerald-700 font-bold">
                பகுப்பாய்வு நிறைவுற்றது / Analysis Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36]">
                தங்களுக்குப் பொருத்தமான இடைமுகம் தயார்!
              </h2>
            </div>

            {/* Confidence Breakdown Display */}
            <ConfidenceBar result={result} />

            {/* Detected Theme Preview Banner */}
            <div className="w-full p-4 rounded-2xl bg-white border border-[#dfd4bf] flex items-center justify-between gap-4 text-left shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {result.ageGroup === 'children' ? '👶' : result.ageGroup === 'teenagers' ? '⚡' : '📜'}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[#1a1f36]">
                    தேர்ந்தெடுக்கப்பட்ட தளம்:{' '}
                    <span className="text-[#b45309]">
                      {result.ageGroup === 'children'
                        ? 'சிறுவர் பூங்கா (Kids Theme)'
                        : result.ageGroup === 'teenagers'
                        ? 'இளைஞர் களம் (Teen Theme)'
                        : 'அறிஞர்கள் பேரவை (Adult Scholar Theme)'}
                    </span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    இத்தளத்தின் வடிவமைப்பு மற்றும் விளக்கங்கள் தங்களின் வயதுக் குழுவிற்கேற்ப அமைக்கப்பட்டுள்ளது.
                  </p>
                </div>
              </div>
            </div>

            {/* Proceed & Retake Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
              <button
                type="button"
                onClick={handleProceed}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-serif font-bold text-sm shadow-md transition-all hover:scale-102"
              >
                <span>தளத்திற்குள் நுழைக</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={reset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-[#dfd4bf] text-stone-700 font-serif text-sm transition-all"
              >
                <RotateCcw size={16} />
                <span>மீண்டும் பதிவு செய்</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Manual Switch Fallback Link */}
      <footer className="max-w-md mx-auto text-center pt-4">
        <button
          type="button"
          onClick={() => navigate('/manual-selection')}
          className="text-xs font-serif text-amber-900 hover:underline"
        >
          நேரடியாக வயதுப் பிரிவை கைமுறையாகத் தேர்ந்தெடுக்க இங்கே செல்லவும் &rarr;
        </button>
      </footer>
    </div>
  );
};
