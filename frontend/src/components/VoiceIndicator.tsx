import React from 'react';
import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isActive: boolean;
  type?: 'recording' | 'speaking';
  barsCount?: number;
  color?: string;
  className?: string;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isActive,
  type = 'recording',
  barsCount = 7,
  color,
  className = '',
}) => {
  const defaultColor = type === 'recording' ? '#ef4444' : '#0d9488';
  const barColor = color || defaultColor;

  return (
    <div className={`flex items-center justify-center gap-1 h-8 px-2 ${className}`}>
      {Array.from({ length: barsCount }).map((_, i) => {
        const delays = [0.1, 0.3, 0.15, 0.45, 0.25, 0.35, 0.2];
        const delay = delays[i % delays.length];

        return (
          <motion.span
            key={i}
            className="w-1 rounded-full inline-block"
            style={{ backgroundColor: barColor }}
            animate={
              isActive
                ? {
                    height: ['6px', `${12 + (i % 4) * 6}px`, '24px', '8px'],
                  }
                : {
                    height: '4px',
                    opacity: 0.4,
                  }
            }
            transition={
              isActive
                ? {
                    repeat: Infinity,
                    duration: 0.7 + (i % 3) * 0.2,
                    delay: delay,
                    ease: 'easeInOut',
                  }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
};
