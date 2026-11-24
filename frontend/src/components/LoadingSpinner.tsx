import React from 'react';
import { motion } from 'framer-motion';
import { TamilPattern } from './TamilPattern';

interface LoadingSpinnerProps {
  messageTamil?: string;
  messageEnglish?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  messageTamil = 'சிந்தனை செயலாக்கம் பெறுகிறது...',
  messageEnglish = 'Contemplating ancient wisdom...',
  size = 56,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Sacred Wheel / Kolam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="text-amber-500/40"
        >
          <TamilPattern variant="kolam" size={size + 24} />
        </motion.div>

        {/* Inner Pulsing Sacred Lotus */}
        <motion.div
          animate={{ scale: [0.85, 1.1, 0.85] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute text-amber-600 dark:text-amber-400"
        >
          <TamilPattern variant="lotus" size={size} />
        </motion.div>
      </div>

      <div className="text-center mt-2">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {messageTamil}
        </p>
        {messageEnglish && (
          <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-0.5">
            {messageEnglish}
          </p>
        )}
      </div>
    </div>
  );
};
