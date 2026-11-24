import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, Volume2, CheckCircle2, RotateCcw, X, ShieldAlert } from './LucideIcons';
import { useTheme } from '../contexts/ThemeContext';
import { VoiceFeatureExtractor } from '../services/audioAnalyzer';
import { AgeGroup, VoiceAgeEstimationResult } from '../types';

interface VoiceRecorderProps {
  onClose?: () => void;
  onSuccess?: (detectedGroup: AgeGroup) => void;
  inline?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onClose, onSuccess, inline = false }) => {
  const { setAgeGroup, setLastVoiceResult } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusText, setStatusText] = useState('குரல் மூலம் வயதை அறிந்துகொள்ள மைக் பொத்தானை அழுத்தவும்');
  const [result, setResult] = useState<VoiceAgeEstimationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

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

  // Waveform visualizer loop
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
    const drawWave = () => {
      phase += 0.12;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Multiple colored vibrating sine waves
      const colors = ['#f59e0b', '#14b8a6', '#ec4899', '#6366f1'];
      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.lineWidth = 2.5 - i * 0.4;
        ctx.strokeStyle = color;

        for (let x = 0; x < width; x += 3) {
          const freq = 0.025 + i * 0.008;
          const amp = (height * 0.28) * (0.6 + Math.sin(phase * 0.6 + i) * 0.4);
          const y = height / 2 + Math.sin(x * freq + phase + i * 1.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      setAudioLevel(0.4 + Math.sin(phase * 2) * 0.35);
      animFrameRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording]);

  const startVoiceRecording = async () => {
    setResult(null);
    setStatusText('பேசுங்கள்... எ.கா: "வணக்கம், திருக்குறள் கற்க விரும்புகிறேன்"');
    setIsRecording(true);
    setRecordingSeconds(0);

    if (extractorRef.current) {
      await extractorRef.current.startListening();
    }

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 4) {
          stopVoiceRecording();
          return 4;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopVoiceRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(true);
    setStatusText('குரல் அதிர்வெண் மற்றும் ஒலியியல் பண்புகள் ஆய்வு செய்யப்படுகின்றன...');

    try {
      let finalResult: VoiceAgeEstimationResult;
      if (extractorRef.current) {
        finalResult = extractorRef.current.stopListening();
      } else {
        finalResult = VoiceFeatureExtractor.getPresetSimulation('teenagers');
      }

      // Try sending to local backend
      try {
        const res = await fetch('http://localhost:8000/api/voice/analyze', {
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
        // Local acoustic classifier in audioAnalyzer fallback
      }

      setResult(finalResult);
      setLastVoiceResult(finalResult);
      setIsProcessing(false);

      if (finalResult.confidence >= 0.65) {
        setStatusText(`பொருத்தமான இடைமுகம் கண்டறியப்பட்டது: ${getAgeGroupTamil(finalResult.ageGroup)}`);
      } else {
        setStatusText('குரல் பகுப்பாய்வு நம்பிக்கை குறைவு. கீழேயுள்ள தெரிவுகளில் ஒன்றை நேரடியாகத் தேர்ந்தெடுக்கலாம்.');
      }
    } catch {
      setIsProcessing(false);
      const fallback = VoiceFeatureExtractor.getPresetSimulation('teenagers');
      setResult(fallback);
    }
  };

  const applyDetectedTheme = (group: AgeGroup) => {
    setAgeGroup(group);
    if (onSuccess) onSuccess(group);
    if (onClose) onClose();
  };

  const getAgeGroupTamil = (group: AgeGroup) => {
    switch (group) {
      case 'children':
        return 'சிறுவர் (6–12 ஆண்டுகள்)';
      case 'teenagers':
        return 'இளைஞர் (13–17 ஆண்டுகள்)';
      case 'adults':
        return 'பெரியோர் (18+ ஆண்டுகள்)';
    }
  };

  const content = (
    <div className="relative bg-slate-900/95 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-2xl max-w-xl w-full mx-auto overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              குரல் வழி வயது அறிதல்
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AI Acoustic
              </span>
            </h3>
            <p className="text-xs text-slate-400">Voice-Adaptive Age Estimation & UI Switcher</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Mic Section */}
      <div className="py-6 flex flex-col items-center text-center relative z-10">
        <div className="relative mb-6">
          {/* Pulsing halo rings when recording */}
          {isRecording && (
            <>
              <motion.div
                animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-rose-500/30 blur-md"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -inset-2 rounded-full bg-amber-500/20 blur-lg"
              />
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={isProcessing}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all duration-300 relative z-10 ${
              isRecording
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 ring-4 ring-rose-400/50 shadow-rose-500/50 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 hover:shadow-amber-500/40 cursor-pointer'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-10 h-10 text-white" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">0:0{recordingSeconds}s</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 text-white" />
                <span className="text-xs font-semibold text-white/90">பேசுக (Tap)</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Live waveform canvas */}
        {isRecording && (
          <div className="w-full max-w-sm h-16 bg-slate-950/60 rounded-2xl border border-white/10 mb-4 overflow-hidden p-1 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} width={340} height={60} className="w-full h-full" />
          </div>
        )}

        <p className="text-sm font-medium text-slate-200 max-w-md min-h-[40px] px-4 flex items-center justify-center">
          {statusText}
        </p>

        {/* Disclaimer alert */}
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>குரல் பண்புகள் மூலம் தோராய மதிப்பீடே செய்யப்படுகிறது; எப்போது வேண்டுமானாலும் சுய விருப்பப்படி மாற்றிக்கொள்ளலாம்.</span>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative z-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">கண்டறியப்பட்ட பிரிவு</span>
                <h4 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {getAgeGroupTamil(result.ageGroup)}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider">நம்பிக்கை விகிதம்</span>
                <p className="text-lg font-mono font-bold text-emerald-400">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(result.confidence * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-400 rounded-full"
              />
            </div>

            {/* Acoustic Details */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-slate-400 block text-[10px]">அதிர்வெண் (F0)</span>
                <span className="font-mono font-bold text-slate-200">{Math.round(result.pitchHz)} Hz</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-slate-400 block text-[10px]">சென்ட்ராய்டு</span>
                <span className="font-mono font-bold text-slate-200">{Math.round(result.features.spectralCentroid)} Hz</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="text-slate-400 block text-[10px]">ஆற்றல் (RMS)</span>
                <span className="font-mono font-bold text-slate-200">{(result.features.energy * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => applyDetectedTheme(result.ageGroup)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                இந்த இடைமுகத்திற்கு மாறுக (Apply Theme)
              </button>
              <button
                onClick={startVoiceRecording}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="மீண்டும் முயற்சி செய்க"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Selection Fallback Pills */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center relative z-10">
        <span className="text-xs text-slate-400 block mb-3">அல்லது நேரடியாகத் தேர்ந்தெடுக்கவும் (Manual Selection):</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyDetectedTheme('children')}
            className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
          >
            🧒 சிறுவர் (6–12)
          </button>
          <button
            onClick={() => applyDetectedTheme('teenagers')}
            className="py-2.5 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
          >
            🧑 இளைஞர் (13–17)
          </button>
          <button
            onClick={() => applyDetectedTheme('adults')}
            className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
          >
            👨 பெரியோர் (18+)
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-xl"
      >
        {content}
      </motion.div>
    </motion.div>
  );
};
