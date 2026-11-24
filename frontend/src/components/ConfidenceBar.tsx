import React from 'react';
import { motion } from 'framer-motion';
import { VoiceAgeEstimationResult } from '../types';

interface ConfidenceBarProps {
  result: VoiceAgeEstimationResult;
  className?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ result, className = '' }) => {
  const { confidence, estimatedAge, pitchHz, breakdown } = result;

  return (
    <div className={`w-full rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 border border-amber-600/20 shadow-lg ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
            குரல் மதிப்பீடு / Voice Analysis
          </span>
          <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>கணிக்கப்பட்ட வயது: ~{estimatedAge}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
              {confidence}% நம்பகத்தன்மை
            </span>
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-500 dark:text-stone-400">அடிப்படை சுருதி</span>
          <div className="text-sm font-mono font-semibold text-amber-700 dark:text-amber-300">
            {pitchHz} Hz (F0)
          </div>
        </div>
      </div>

      {/* Probabilistic Breakdown Bars */}
      <div className="space-y-3">
        {/* Children */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
              <span>👶</span>
              <span>குழந்தைகள் (3-12 வயது)</span>
            </span>
            <span className="font-mono text-stone-700 dark:text-stone-300">
              {breakdown.children}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-orange-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.children}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
            />
          </div>
        </div>

        {/* Teenagers */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <span>🚀</span>
              <span>இளைஞர்கள் (13-19 வயது)</span>
            </span>
            <span className="font-mono text-stone-700 dark:text-stone-300">
              {breakdown.teenagers}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-teal-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.teenagers}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
            />
          </div>
        </div>

        {/* Adults */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-indigo-800 dark:text-amber-300 flex items-center gap-1.5">
              <span>📜</span>
              <span>பெரியவர்கள் (20+ வயது)</span>
            </span>
            <span className="font-mono text-stone-700 dark:text-stone-300">
              {breakdown.adults}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-indigo-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.adults}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-600 via-amber-600 to-amber-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
