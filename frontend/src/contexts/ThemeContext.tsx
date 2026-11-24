import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AgeGroup, Language, UserStats, VoiceAgeEstimationResult, Kural } from '../types';
import { MOCK_KURALS } from '../services/mockData';
import { apiService } from '../services/api';

export interface ThemeContextType {
  ageGroup: AgeGroup;
  setAgeGroup: (group: AgeGroup) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceGender: 'male' | 'female';
  setVoiceGender: (gender: 'male' | 'female') => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  userStats: UserStats;
  toggleBookmark: (kuralNumber: number) => void;
  isBookmarked: (kuralNumber: number) => boolean;
  addQuizScore: (stars: number) => void;
  completeChallenge: (challengeId: string, xp: number) => void;
  lastVoiceResult: VoiceAgeEstimationResult | null;
  setLastVoiceResult: (result: VoiceAgeEstimationResult | null) => void;
  resetProgress: () => void;
  // Active daily kural and audio state
  dailyKural: Kural;
  setDailyKural: (kural: Kural) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
  playKuralAudio: (kural?: Kural) => void;
  stopKuralAudio: () => void;
  // Modals & Panels
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

const defaultStats: UserStats = {
  kuralsRead: [1, 78, 391, 788],
  bookmarks: [1, 391],
  completedQuizzes: 1,
  earnedStars: 3,
  completedChallenges: ['c1', 'c2'],
  currentStreak: 4,
  xpPoints: 450,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ageGroup, setAgeGroupState] = useState<AgeGroup>(() => {
    const saved = localStorage.getItem('thiruvalluvar_age_group');
    if (saved === 'children' || saved === 'teenagers' || saved === 'adults') {
      return saved as AgeGroup;
    }
    return 'unknown';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('thiruvalluvar_language');
    return (saved as Language) || 'bilingual';
  });

  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [lastVoiceResult, setLastVoiceResult] = useState<VoiceAgeEstimationResult | null>(null);
  const [dailyKural, setDailyKural] = useState<Kural>(MOCK_KURALS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Global modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('thiruvalluvar_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultStats;
      }
    }
    return defaultStats;
  });

  // Fetch true daily kural from backend on mount
  useEffect(() => {
    let isMounted = true;
    apiService.getKuralOfDay()
      .then((kural) => {
        if (isMounted && kural) {
          setDailyKural(kural);
        }
      })
      .catch(() => {
        // Fallback to MOCK_KURALS[0]
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const setAgeGroup = (group: AgeGroup) => {
    setAgeGroupState(group);
    if (group === 'unknown') {
      localStorage.removeItem('thiruvalluvar_age_group');
    } else {
      localStorage.setItem('thiruvalluvar_age_group', group);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('thiruvalluvar_language', lang);
  };

  useEffect(() => {
    localStorage.setItem('thiruvalluvar_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Update theme class on HTML body
  useEffect(() => {
    document.body.classList.remove('theme-children', 'theme-teenager', 'theme-adult', 'theme-unknown');
    if (ageGroup === 'children') {
      document.body.classList.add('theme-children');
    } else if (ageGroup === 'teenagers') {
      document.body.classList.add('theme-teenager');
    } else if (ageGroup === 'adults') {
      document.body.classList.add('theme-adult');
    } else {
      document.body.classList.add('theme-unknown');
    }
  }, [ageGroup]);

  // High-fidelity natural TTS audio playback via backend /api/tts with browser fallback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playKuralAudio = async (kural?: Kural) => {
    const target = kural || dailyKural;
    if (!target) return;

    // Stop existing audio if playing
    stopKuralAudio();

    const verseText = `${target.line1}\n${target.line2}`;
    setIsPlayingAudio(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: verseText,
          age_group: ageGroup,
          language: language,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback to SpeechSynthesis if backend is unavailable
    }

    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${target.line1}. ${target.line2}. ${target.translation}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (ageGroup === 'children') {
        utterance.pitch = 1.25;
        utterance.rate = 0.92;
      } else if (ageGroup === 'teenagers') {
        utterance.pitch = 1.05;
        utterance.rate = 1.02;
      } else {
        utterance.pitch = 0.95;
        utterance.rate = 0.90;
      }

      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const stopKuralAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const toggleBookmark = (kuralNumber: number) => {
    setUserStats((prev) => {
      const exists = prev.bookmarks.includes(kuralNumber);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((n) => n !== kuralNumber)
          : [...prev.bookmarks, kuralNumber],
      };
    });
  };

  const isBookmarked = (kuralNumber: number) => {
    return userStats.bookmarks.includes(kuralNumber);
  };

  const addQuizScore = (stars: number) => {
    setUserStats((prev) => ({
      ...prev,
      completedQuizzes: prev.completedQuizzes + 1,
      earnedStars: prev.earnedStars + stars,
      xpPoints: prev.xpPoints + stars * 50,
    }));
  };

  const completeChallenge = (challengeId: string, xp: number) => {
    setUserStats((prev) => {
      if (prev.completedChallenges.includes(challengeId)) return prev;
      return {
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        xpPoints: prev.xpPoints + xp,
      };
    });
  };

  const resetProgress = () => {
    setUserStats(defaultStats);
    localStorage.removeItem('thiruvalluvar_stats');
  };

  return (
    <ThemeContext.Provider
      value={{
        ageGroup,
        setAgeGroup,
        language,
        setLanguage,
        voiceGender,
        setVoiceGender,
        voiceSpeed,
        setVoiceSpeed,
        userStats,
        toggleBookmark,
        isBookmarked,
        addQuizScore,
        completeChallenge,
        lastVoiceResult,
        setLastVoiceResult,
        resetProgress,
        dailyKural,
        setDailyKural,
        isPlayingAudio,
        setIsPlayingAudio,
        playKuralAudio,
        stopKuralAudio,
        isChatOpen,
        setIsChatOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        activeModal,
        setActiveModal,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Alias useApp to useTheme for 100% backwards compatibility
export const useApp = useTheme;
export const AppContext = ThemeContext;
export const AppProvider = ThemeProvider;
