import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles, BookOpen, Compass, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw } from './LucideIcons';
import { ThiruvalluvarSVG } from './ThiruvalluvarSVG';
import { TamilPattern } from './TamilPattern';
import { useTheme } from '../contexts/ThemeContext';
import { VoiceFeatureExtractor } from '../services/audioAnalyzer';
import { AgeGroup, VoiceAgeEstimationResult } from '../types';

export const WelcomeVoiceGate: React.FC = () => {
  const { setAgeGroup, setLastVoiceResult, language, setLanguage } = useTheme();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'ta'
      ? 'மைக் பொத்தானை அழுத்திப் பேசவும் (எ.கா: "வணக்கம், திருக்குறள் கற்க விரும்புகிறேன்")'
      : 'Click the microphone and speak (e.g., "Hello, I want to learn Thirukkural")'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedResult, setDetectedResult] = useState<VoiceAgeEstimationResult | null>(null);

  const extractorRef = useRef<VoiceFeatureExtractor | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    extractorRef.current = new VoiceFeatureExtractor();
    return () => {
      if (extractorRef.current) {
        extractorRef.current.stopListening();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Audio wave visualizer loop
  useEffect(() => {
    if (!isRecording) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      phase += 0.14;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const colors = ['#f59e0b', '#10b981', '#ec4899', '#6366f1'];
      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.lineWidth = 2.5 - i * 0.4;
        ctx.strokeStyle = color;

        for (let x = 0; x < width; x += 3) {
          const freq = 0.024 + i * 0.007;
          const amp = (height * 0.3) * (0.6 + Math.sin(phase * 0.6 + i) * 0.4);
          const y = height / 2 + Math.sin(x * freq + phase + i * 1.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording]);

  const startVoiceCapture = async () => {
    setDetectedResult(null);
    setStatusMessage(
      language === 'ta'
        ? 'கேட்கிறது... தொடர்ந்து பேசவும்...'
        : 'Listening... Please speak naturally...'
    );
    setIsRecording(true);
    setRecordingSeconds(0);

    if (extractorRef.current) {
      await extractorRef.current.startListening();
    }

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 4) {
          stopVoiceCapture();
          return 4;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopVoiceCapture = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setIsAnalyzing(true);
    setStatusMessage(
      language === 'ta'
        ? 'ஒலியியல் அதிர்வெண் பகுப்பாய்வு செய்யப்படுகிறது...'
        : 'Analyzing acoustic features and vocal harmonics...'
    );

    try {
      let finalResult: VoiceAgeEstimationResult;
      if (extractorRef.current) {
        finalResult = extractorRef.current.stopListening();
      } else {
        finalResult = VoiceFeatureExtractor.getPresetSimulation('teenagers');
      }

      // Send to local FastAPI backend (/api/voice-age or /api/voice/analyze)
      try {
        const res = await fetch('http://localhost:8000/api/voice-age', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pitch: finalResult.pitchHz,
            spectral_centroid: finalResult.features.spectralCentroid,
            energy: finalResult.features.energy,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const backendGroup = data.estimated_age_group as string;
          if (backendGroup === 'child' || backendGroup === 'children') {
            finalResult.ageGroup = 'children';
          } else if (backendGroup === 'teenager' || backendGroup === 'teenagers') {
            finalResult.ageGroup = 'teenagers';
          } else {
            finalResult.ageGroup = 'adults';
          }
          finalResult.confidence = data.confidence || finalResult.confidence;
        }
      } catch {
        // Fallback to local analyzer
      }

      setDetectedResult(finalResult);
      setLastVoiceResult(finalResult);
      setIsAnalyzing(false);

      if (finalResult.confidence >= 0.65) {
        setStatusMessage(
          language === 'ta'
            ? `கண்டறியப்பட்ட பிரிவு: ${getAgeGroupTamil(finalResult.ageGroup)}`
            : `Detected Profile: ${finalResult.ageGroup.toUpperCase()} (${Math.round(finalResult.confidence * 100)}% confidence)`
        );
      } else {
        setStatusMessage(
          language === 'ta'
            ? 'குரல் பண்புகள் தெளிவற்றவை. கீழேயுள்ள பிரிவுகளில் ஒன்றை நேரடியாகத் தேர்ந்தெடுக்கலாம்.'
            : 'Confidence is low. Please select your age group manually below.'
        );
      }
    } catch {
      setIsAnalyzing(false);
      const fallback = VoiceFeatureExtractor.getPresetSimulation('teenagers');
      setDetectedResult(fallback);
    }
  };

  const getAgeGroupTamil = (group: AgeGroup) => {
    switch (group) {
      case 'children':
        return 'சிறுவர் (6–12 ஆண்டுகள்)';
      case 'teenagers':
        return 'இளைஞர் (13–17 ஆண்டுகள்)';
      case 'adults':
        return 'பெரியோர் (18+ ஆண்டுகள்)';
      default:
        return 'பொதுவானது';
    }
  };

  const chooseAgeGroup = (group: AgeGroup) => {
    setAgeGroup(group);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a1412] text-[#f1f5f9] flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Decorative Traditional Subtle Accents */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-rose-600" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Background Subtle Kolam/Gopuram Pattern */}
      <div className="absolute top-10 right-10 text-white/5 pointer-events-none">
        <TamilPattern variant="gopuram" size={260} />
      </div>
      <div className="absolute bottom-10 left-10 text-white/5 pointer-events-none">
        <TamilPattern variant="kolam" size={260} />
      </div>

      {/* TOP HEADER */}
      <header className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-serif font-black shadow-md">
            வ
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-amber-300 tracking-wide">
              திருவள்ளுவர் AI
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Ancient Wisdom • Intelligent Future
            </p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-amber-200 font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>🌐</span>
          <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
        </button>
      </header>

      {/* MAIN HERO & VOICE GATE */}
      <main className="max-w-3xl w-full mx-auto px-4 py-4 flex flex-col items-center text-center relative z-10">
        {/* Traditional Thiruvalluvar Emblem */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-3 flex flex-col items-center"
        >
          <div className="relative p-2 rounded-full bg-gradient-to-b from-amber-500/20 via-transparent to-emerald-500/20 border border-amber-500/30 shadow-2xl">
            <ThiruvalluvarSVG size={180} showAura={true} className="drop-shadow-2xl" />
          </div>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span>📜 ஓலைச்சுவடி ஏந்திய பெருந்தகை</span>
            <span>•</span>
            <span>1,330 திருக்குறள் தளம்</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-1.5 max-w-xl mb-6"
        >
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            THIRUVALLUVAR AI
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-400/90 tracking-wide">
            "பழமையான ஞானம், புத்திசாலி எதிர்காலம்"
          </p>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
            குரல் ஒலியியல் மூலம் வயது அறிந்து, குழந்தைகளுக்கும், இளைஞர்களுக்கும், பெரியவர்களுக்கும் ஏற்றவாறு தனித்துவமான திருக்குறள் இடைமுகத்தை வழங்குகிறது.
          </p>
        </motion.div>

        {/* PROMINENT VOICE SEARCH / CALIBRATION GATE */}
        <div className="w-full max-w-md rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 shadow-2xl backdrop-blur-xl mb-6 relative">
          <div className="flex flex-col items-center">
            {/* Pulsing Mic Button */}
            <div className="relative mb-4">
              {isRecording && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-rose-500/30 blur-md"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -inset-2 rounded-full bg-amber-500/20 blur-lg"
                  />
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopVoiceCapture : startVoiceCapture}
                disabled={isAnalyzing}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all cursor-pointer relative z-10 ${
                  isRecording
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 ring-4 ring-rose-400/60 shadow-rose-500/50 animate-pulse'
                    : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 hover:shadow-amber-500/40 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-9 h-9 text-white" />
                    <span className="text-[11px] font-bold text-white tracking-wider">0:0{recordingSeconds}s</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-9 h-9 text-white" />
                    <span className="text-[11px] font-bold text-white/95">பேசுக (Speak)</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Live Audio Waveform Canvas */}
            {isRecording && (
              <div className="w-full h-14 bg-black/50 rounded-2xl border border-white/10 mb-3 overflow-hidden p-1 flex items-center justify-center">
                <canvas ref={canvasRef} width={320} height={50} className="w-full h-full" />
              </div>
            )}

            {/* Status Message */}
            <p className="text-xs sm:text-sm font-medium text-slate-200 min-h-[38px] flex items-center justify-center px-2">
              {statusMessage}
            </p>

            {/* Detected Result Action Card */}
            <AnimatePresence>
              {detectedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full mt-4 p-4 rounded-2xl bg-white/5 border border-amber-500/40 text-left space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">கண்டறியப்பட்ட பிரிவு</span>
                      <h4 className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {getAgeGroupTamil(detectedResult.ageGroup)}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">நம்பிக்கை விகிதம்</span>
                      <p className="text-base font-mono font-bold text-emerald-400">
                        {Math.round(detectedResult.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(detectedResult.confidence * 100)}%` }}
                      className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500"
                    />
                  </div>

                  <button
                    onClick={() => chooseAgeGroup(detectedResult.ageGroup)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>இந்த இடைமுகத்திற்குள் செல்க (Enter Website)</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STEP 4: CLEAN MANUAL SELECTION BUTTONS */}
        <div className="w-full max-w-md space-y-2">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            அல்லது நேரடியாகப் பிரிவைத் தேர்ந்தெடுக்கவும் (Manual Selection):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Children Mode Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => chooseAgeGroup('children')}
              className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 hover:to-rose-600/30 border border-pink-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-1">🧒</span>
                <h4 className="text-xs font-bold text-pink-300">சிறுவர்</h4>
                <span className="text-[10px] text-slate-400 block">Ages 6–12</span>
              </div>
              <span className="text-[10px] text-pink-200 font-medium mt-2 block">
                கதைகள் & விளையாட்டுகள் ➔
              </span>
            </motion.button>

            {/* Teenager Mode Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => chooseAgeGroup('teenagers')}
              className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-600/20 hover:from-teal-500/30 hover:to-emerald-600/30 border border-teal-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-1">🧑</span>
                <h4 className="text-xs font-bold text-teal-300">இளைஞர்</h4>
                <span className="text-[10px] text-slate-400 block">Ages 13–17</span>
              </div>
              <span className="text-[10px] text-teal-200 font-medium mt-2 block">
                நவீன வழிகாட்டல் & சவால்கள் ➔
              </span>
            </motion.button>

            {/* Adult Mode Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => chooseAgeGroup('adults')}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 border border-amber-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-1">👨</span>
                <h4 className="text-xs font-bold text-amber-300">பெரியோர்</h4>
                <span className="text-[10px] text-slate-400 block">Ages 18+</span>
              </div>
              <span className="text-[10px] text-amber-200 font-medium mt-2 block">
                மெய்யியல் & உரைகள் ➔
              </span>
            </motion.button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl w-full mx-auto p-4 border-t border-white/10 text-center text-xs text-slate-500 relative z-10">
        <p>100% Offline Educational Platform • திருக்குறள் உலகப் பொதுமறை</p>
      </footer>
    </div>
  );
};
