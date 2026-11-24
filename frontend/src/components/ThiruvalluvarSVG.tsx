import React from 'react';

interface ThiruvalluvarSVGProps {
  className?: string;
  size?: number | string;
  variant?: 'portrait' | 'full' | 'icon';
  showAura?: boolean;
}

export const ThiruvalluvarSVG: React.FC<ThiruvalluvarSVGProps> = ({
  className = '',
  size = 280,
  showAura = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={`select-none ${className}`}
      aria-label="Traditional Thiruvalluvar Sage Portrait"
    >
      <defs>
        {/* Soft Golden Aura */}
        <radialGradient id="sacredHalo" cx="50%" cy="45%" r="50%" fx="50%" fy="45%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fde047" stopOpacity="0.4" />
          <stop offset="85%" stopColor="#d97706" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        {/* Skin Tone Gradient */}
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d99860" />
          <stop offset="50%" stopColor="#c57d42" />
          <stop offset="100%" stopColor="#a9622d" />
        </linearGradient>

        {/* Traditional White/Ivory Shawl (Uthreeyam) */}
        <linearGradient id="shawlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Gold Trim for Shawl */}
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Beard & Hair Gradient */}
        <linearGradient id="whiteBeard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Palm Leaf Manuscript (Olai Suvadi) Gradient */}
        <linearGradient id="palmLeafGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4a373" />
          <stop offset="50%" stopColor="#faedcd" />
          <stop offset="100%" stopColor="#ccd5ae" />
        </linearGradient>
      </defs>

      {/* Radiant Aura / Prabhaavai */}
      {showAura && (
        <circle cx="250" cy="225" r="195" fill="url(#sacredHalo)" />
      )}

      {/* Decorative Traditional Halo Ring with rays */}
      <circle
        cx="250"
        cy="225"
        r="170"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity="0.6"
      />

      {/* Shoulders & Torso */}
      <path
        d="M100 450 C 130 360, 180 340, 250 340 C 320 340, 370 360, 400 450 Z"
        fill="url(#skinTone)"
      />

      {/* Traditional White Shawl / Uthreeyam Drape */}
      <path
        d="M110 450 C 120 380, 160 345, 230 345 C 190 380, 170 410, 160 450 Z"
        fill="url(#shawlGradient)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      {/* Golden border on shawl */}
      <path
        d="M110 450 C 120 380, 160 345, 230 345"
        fill="none"
        stroke="url(#goldBorder)"
        strokeWidth="5"
      />

      {/* Right side shawl wrap */}
      <path
        d="M270 348 C 340 355, 380 390, 395 450 L 340 450 C 325 410, 290 380, 270 348 Z"
        fill="url(#shawlGradient)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      <path
        d="M270 348 C 340 355, 380 390, 395 450"
        fill="none"
        stroke="url(#goldBorder)"
        strokeWidth="5"
      />

      {/* Neck */}
      <rect x="225" y="270" width="50" height="75" rx="10" fill="url(#skinTone)" />

      {/* Head Bun (Kondai / Jada Mudi) - Authentic Tamil Ascetic Hair */}
      <ellipse cx="250" cy="118" rx="42" ry="32" fill="url(#whiteBeard)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Hair bun tie knot */}
      <ellipse cx="250" cy="136" rx="28" ry="8" fill="#a16207" />

      {/* Face Structure */}
      <ellipse cx="250" cy="215" rx="58" ry="68" fill="url(#skinTone)" />

      {/* Ears */}
      <ellipse cx="190" cy="215" rx="10" ry="18" fill="url(#skinTone)" />
      <ellipse cx="310" cy="215" rx="10" ry="18" fill="url(#skinTone)" />

      {/* Ascetic Head Hair Flow around temples */}
      <path
        d="M 195 200 C 190 150, 230 135, 250 135 C 270 135, 310 150, 305 200 C 295 160, 275 148, 250 148 C 225 148, 205 160, 195 200 Z"
        fill="url(#whiteBeard)"
        stroke="#94a3b8"
        strokeWidth="1"
      />

      {/* Forehead Sacred Tilak / Vibhuti (Three horizontal sacred ash lines & red kumkum) */}
      <path d="M 230 174 L 270 174" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M 226 179 L 274 179" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M 230 184 L 270 184" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      {/* Red Tilak Bindu */}
      <circle cx="250" cy="179" r="3.2" fill="#dc2626" />

      {/* Calm, Wise Eyebrows (Arched, mature silver) */}
      <path d="M 215 198 Q 230 193 242 198" fill="none" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 285 198 Q 270 193 258 198" fill="none" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" />

      {/* Eyes - Serene, benevolent and contemplative */}
      <path d="M 218 206 Q 230 213 242 206" fill="none" stroke="#3b2314" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="230" cy="206" r="3.2" fill="#2d1b0d" />
      <circle cx="231" cy="205" r="1" fill="#ffffff" />

      <path d="M 258 206 Q 270 213 282 206" fill="none" stroke="#3b2314" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="270" cy="206" r="3.2" fill="#2d1b0d" />
      <circle cx="271" cy="205" r="1" fill="#ffffff" />

      {/* Gentle, Noble Nose */}
      <path d="M 250 200 Q 251 222 245 228 Q 250 231 255 228" fill="none" stroke="#874719" strokeWidth="2" strokeLinecap="round" />

      {/* Subtle Gentle Smile */}
      <path d="M 240 239 Q 250 245 260 239" fill="none" stroke="#874719" strokeWidth="2.5" strokeLinecap="round" />

      {/* Traditional Flowing Moustache (Silver white) */}
      <path
        d="M 250 236 C 242 235, 225 240, 218 248 C 228 247, 243 244, 250 241 C 257 244, 272 247, 282 248 C 275 240, 258 235, 250 236 Z"
        fill="url(#whiteBeard)"
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* Flowing Patriarchal White Beard (Long, iconic, classical Tamil ascetic) */}
      <path
        d="M 205 238 C 190 280, 210 375, 250 395 C 290 375, 310 280, 295 238 C 285 270, 275 330, 250 345 C 225 330, 215 270, 205 238 Z"
        fill="url(#whiteBeard)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      {/* Realistic Beard strands and texture */}
      <path d="M 235 255 Q 230 310 248 375" fill="none" stroke="#e2e8f0" strokeWidth="1.8" opacity="0.8" />
      <path d="M 250 248 L 250 385" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
      <path d="M 265 255 Q 270 310 252 375" fill="none" stroke="#e2e8f0" strokeWidth="1.8" opacity="0.8" />
      <path d="M 222 270 Q 235 325 245 365" fill="none" stroke="#cbd5e1" strokeWidth="1.2" opacity="0.7" />
      <path d="M 278 270 Q 265 325 255 365" fill="none" stroke="#cbd5e1" strokeWidth="1.2" opacity="0.7" />

      {/* Palm Leaf Manuscript (Olai Suvadi) held with sacred grace */}
      <g transform="translate(145, 410) rotate(-6)">
        {/* Shadow */}
        <rect x="0" y="4" width="210" height="24" rx="4" fill="#000000" opacity="0.15" />
        {/* Leaf Plate */}
        <rect x="0" y="0" width="210" height="24" rx="4" fill="url(#palmLeafGrad)" stroke="#b45309" strokeWidth="1.5" />
        {/* Palm Leaf Binder Holes and Silk Thread */}
        <circle cx="25" cy="12" r="3.5" fill="#581825" />
        <circle cx="185" cy="12" r="3.5" fill="#581825" />
        <line x1="25" y1="12" x2="185" y2="12" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" />
        {/* Ancient Tamil Inscription Lines */}
        <line x1="42" y1="8" x2="168" y2="8" stroke="#78350f" strokeWidth="1" strokeDasharray="4 2 6 2" opacity="0.7" />
        <line x1="42" y1="16" x2="168" y2="16" stroke="#78350f" strokeWidth="1" strokeDasharray="5 2 3 2" opacity="0.7" />
      </g>

      {/* Stylus / Iron Writing Pen (Ezhuthani) */}
      <g transform="translate(330, 395) rotate(42)">
        <polygon points="0,0 6,4 40,4 45,2 40,0 6,0" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
        <polygon points="0,0 -8,2 0,4" fill="#cbd5e1" />
      </g>
    </svg>
  );
};
