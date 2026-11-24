export type AgeGroup = 'unknown' | 'children' | 'teenagers' | 'adults';

export type Language = 'ta' | 'en' | 'bilingual';

export type PaalId = 'aram' | 'porul' | 'inbam';

export interface PaalInfo {
  id: PaalId;
  nameTamil: string;
  nameEnglish: string;
  descriptionTamil: string;
  descriptionEnglish: string;
  chaptersCount: number;
  kuralsCount: number;
  color: string;
}

export interface Kural {
  number: number;
  line1: string;
  line2: string;
  translation: string;
  transliteration: string;
  paal: string;
  paalId: PaalId;
  iyal: string;
  athigaram: string;
  athigaramNumber: number;
  explanationMuVa: string;
  explanationSolomon: string;
  explanationParimel: string;
  kidExplanation: string;
  teenExplanation: string;
  adultExplanation: string;
  keywords: string[];
  audioUrl?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'valluvar' | 'system';
  text: string;
  kural?: Kural;
  timestamp: string;
  audioAvailable?: boolean;
  suggestions?: string[];
}

export interface VoiceAgeEstimationResult {
  ageGroup: AgeGroup;
  confidence: number;
  estimatedAge: number;
  pitchHz: number;
  jitter: number;
  breakdown: {
    children: number;
    teenagers: number;
    adults: number;
  };
  features: {
    fundamentalFrequency: number;
    spectralCentroid: number;
    energy: number;
  };
}

export interface QuizQuestion {
  id: string;
  kuralNumber: number;
  questionTamil: string;
  questionEnglish: string;
  optionsTamil: string[];
  optionsEnglish: string[];
  correctIndex: number;
  explanationTamil: string;
  explanationEnglish: string;
  moralLesson: string;
}

export interface TeenChallenge {
  id: string;
  titleTamil: string;
  titleEnglish: string;
  descriptionTamil: string;
  descriptionEnglish: string;
  kural: Kural;
  actionItem: string;
  completed: boolean;
  xpPoints: number;
  category: 'friendship' | 'focus' | 'integrity' | 'kindness' | 'growth';
}

export interface UserStats {
  kuralsRead: number[];
  bookmarks: number[];
  completedQuizzes: number;
  earnedStars: number;
  completedChallenges: string[];
  currentStreak: number;
  xpPoints: number;
}
