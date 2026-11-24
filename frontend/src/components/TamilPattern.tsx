import React from 'react';

interface TamilPatternProps {
  variant?: 'kolam' | 'lotus' | 'gopuram' | 'pillar' | 'kalasam' | 'border';
  className?: string;
  size?: number | string;
  color?: string;
}

export const TamilPattern: React.FC<TamilPatternProps> = ({
  variant = 'kolam',
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  if (variant === 'lotus') {
    return (
      <svg
        viewBox="0 0 100 80"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Sacred Lotus Petals */}
        <path
          d="M50 10 C45 35 30 55 50 75 C70 55 55 35 50 10 Z"
          fill={color}
          opacity="0.9"
        />
        <path
          d="M50 25 C30 35 15 50 32 72 C42 62 48 45 50 25 Z"
          fill={color}
          opacity="0.75"
        />
        <path
          d="M50 25 C70 35 85 50 68 72 C58 62 52 45 50 25 Z"
          fill={color}
          opacity="0.75"
        />
        <path
          d="M32 50 C12 55 5 65 18 78 C30 75 35 65 32 50 Z"
          fill={color}
          opacity="0.6"
        />
        <path
          d="M68 50 C88 55 95 65 82 78 C70 75 65 65 68 50 Z"
          fill={color}
          opacity="0.6"
        />
        {/* Lotus Base */}
        <path
          d="M20 76 Q50 84 80 76 Q50 78 20 76 Z"
          fill={color}
        />
      </svg>
    );
  }

  if (variant === 'gopuram') {
    return (
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Temple Kalasam pinnacle */}
        <polygon points="50,5 47,15 53,15" fill={color} />
        <ellipse cx="50" cy="18" rx="5" ry="3" fill={color} />
        <rect x="44" y="21" width="12" height="4" fill={color} />

        {/* Tier 1 */}
        <polygon points="50,26 35,42 65,42" fill="none" stroke={color} strokeWidth="2.5" />
        <rect x="38" y="42" width="24" height="6" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />

        {/* Tier 2 */}
        <polygon points="50,48 26,68 74,68" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="38" y1="58" x2="62" y2="58" stroke={color} strokeWidth="1.5" />
        <rect x="30" y="68" width="40" height="7" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />

        {/* Tier 3 */}
        <polygon points="50,75 16,98 84,98" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="28" y1="88" x2="72" y2="88" stroke={color} strokeWidth="1.5" />
        <rect x="20" y="98" width="60" height="8" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />

        {/* Base Entrance Gateway / Thiru Vayil */}
        <path d="M 38 118 L 38 106 Q 50 96 62 106 L 62 118" stroke={color} strokeWidth="2.5" />
        <line x1="10" y1="118" x2="90" y2="118" stroke={color} strokeWidth="3" />
      </svg>
    );
  }

  if (variant === 'pillar') {
    return (
      <svg
        viewBox="0 0 60 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Capital */}
        <rect x="8" y="5" width="44" height="8" rx="2" fill={color} />
        <polygon points="12,13 48,13 42,22 18,22" fill={color} opacity="0.8" />
        {/* Shaft */}
        <rect x="22" y="22" width="16" height="78" fill="none" stroke={color} strokeWidth="2" />
        <line x1="27" y1="22" x2="27" y2="100" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="33" y1="22" x2="33" y2="100" stroke={color} strokeWidth="1" opacity="0.6" />
        {/* Base / Peedam */}
        <polygon points="18,100 42,100 48,110 12,110" fill={color} opacity="0.8" />
        <rect x="8" y="110" width="44" height="8" rx="2" fill={color} />
      </svg>
    );
  }

  if (variant === 'border') {
    return (
      <svg
        viewBox="0 0 200 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M 0 12 Q 15 2, 30 12 T 60 12 T 90 12 T 120 12 T 150 12 T 180 12 T 200 12"
          stroke={color}
          strokeWidth="2"
        />
        <circle cx="15" cy="12" r="2.5" fill={color} />
        <circle cx="45" cy="12" r="2.5" fill={color} />
        <circle cx="75" cy="12" r="2.5" fill={color} />
        <circle cx="105" cy="12" r="2.5" fill={color} />
        <circle cx="135" cy="12" r="2.5" fill={color} />
        <circle cx="165" cy="12" r="2.5" fill={color} />
        <circle cx="195" cy="12" r="2.5" fill={color} />
      </svg>
    );
  }

  // Default Kolam / Rangoli (Traditional Sikku Kolam continuous knot)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 5x5 Grid Points (Pulli) */}
      <circle cx="20" cy="50" r="2.5" fill={color} />
      <circle cx="35" cy="35" r="2.5" fill={color} />
      <circle cx="35" cy="65" r="2.5" fill={color} />
      <circle cx="50" cy="20" r="2.5" fill={color} />
      <circle cx="50" cy="50" r="3" fill={color} />
      <circle cx="50" cy="80" r="2.5" fill={color} />
      <circle cx="65" cy="35" r="2.5" fill={color} />
      <circle cx="65" cy="65" r="2.5" fill={color} />
      <circle cx="80" cy="50" r="2.5" fill={color} />

      {/* Sikku Curves looping gracefully around dots */}
      <path
        d="M 50 10 C 60 10, 75 25, 75 35 C 75 45, 90 40, 90 50 C 90 60, 75 55, 75 65 C 75 75, 60 90, 50 90 C 40 90, 25 75, 25 65 C 25 55, 10 60, 10 50 C 10 40, 25 45, 25 35 C 25 25, 40 10, 50 10 Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 35 35 Q 50 20 65 35 Q 80 50 65 65 Q 50 80 35 65 Q 20 50 35 35 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeDasharray="4 2"
        opacity="0.8"
      />
    </svg>
  );
};
