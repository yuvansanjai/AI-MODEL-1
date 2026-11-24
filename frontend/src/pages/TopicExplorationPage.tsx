import React, { useState } from 'react';
import { ThemeLayout } from '../components/ThemeLayout';
import { PAAL_DATA, MOCK_KURALS } from '../services/mockData';
import { KuralDisplay } from '../components/KuralDisplay';
import { BookOpen, Layers, Compass, Sparkles } from 'lucide-react';

interface TopicCategory {
  id: string;
  titleTamil: string;
  titleEnglish: string;
  icon: string;
  keywords: string[];
  description: string;
}

export const TopicExplorationPage: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string>('kalvi');

  const topicCategories: TopicCategory[] = [
    {
      id: 'kalvi',
      titleTamil: 'கல்வி & மெய்யறிவு',
      titleEnglish: 'Education & Intellect',
      icon: '📚',
      keywords: ['கல்வி', 'அறிவு', 'கற்க', 'எண்'],
      description: 'கற்றலின் பெருமை, நுண்ணறிவு, அறியாமை நீக்குதல் மற்றும் ஆய்வுத் திறன்.',
    },
    {
      id: 'natpu',
      titleTamil: 'நட்பு & தோழமை',
      titleEnglish: 'Friendship & Camaraderie',
      icon: '🤝',
      keywords: ['நட்பு', 'உடுக்கை', 'தோழமை'],
      description: 'உண்மையான நண்பனின் இலக்கணம், துன்பத்தில் ஓடிவந்து காக்கும் உன்னத உறவு.',
    },
    {
      id: 'anbu',
      titleTamil: 'அன்பு & ஈகை',
      titleEnglish: 'Love & Altruism',
      icon: '❤️',
      keywords: ['அன்பு', 'ஈகை', 'பகிர்வு'],
      description: 'சுயநலமற்ற பரிவு, பிறருக்காகத் தன் உடலையும் தரும் உன்னத மனித நேயம்.',
    },
    {
      id: 'nandri',
      titleTamil: 'செய்ந்நன்றி அறிதல்',
      titleEnglish: 'Gratitude & Timely Help',
      icon: '🌱',
      keywords: ['நன்றி', 'காலம்', 'உதவி'],
      description: 'உரிய காலத்தில் பெற்ற சிறு உதவியையும் உலகத்தை விடப் பெரிதாகப் போற்றுதல்.',
    },
    {
      id: 'uzhavu',
      titleTamil: 'உழவு & உற்பத்தி',
      titleEnglish: 'Agriculture & Sustenance',
      icon: '🌾',
      keywords: ['உழவு', 'ஏர்', 'விவசாயம்'],
      description: 'உலக இயக்கம் அனைத்திற்கும் அடிப்படையான வேளாண்மையின் தலையாய மாண்பு.',
    },
    {
      id: 'aadi',
      titleTamil: 'பிரபஞ்சத் தொடக்கம்',
      titleEnglish: 'Cosmic Wisdom & Origins',
      icon: '🌌',
      keywords: ['அகரம்', 'ஆதி பகவன்'],
      description: 'பேரறிவு மற்றும் அறத்தின் தொடக்கத்தை விளக்கும் தத்துவக் கோட்பாடுகள்.',
    },
  ];

  const currentTopic = topicCategories.find((t) => t.id === activeTopic) || topicCategories[0];

  const filteredKurals = MOCK_KURALS.filter((k) =>
    currentTopic.keywords.some((kw) =>
      k.keywords.some((kkw) => kkw.toLowerCase().includes(kw.toLowerCase())) ||
      k.line1.includes(kw) ||
      k.athigaram.includes(kw)
    )
  );

  return (
    <ThemeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
            பொருள் வாரியாக குறள் உலா
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            மனித வாழ்வின் அடிப்படை கருப்பொருட்கள் வாரியாக திருக்குறளைப் பயிலுங்கள்.
          </p>
        </div>

        {/* Thematic Topic Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {topicCategories.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopic(topic.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold scale-102'
                    : 'bg-white/80 dark:bg-slate-900/80 border-stone-200 dark:border-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                }`}
              >
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-xs font-bold leading-tight">{topic.titleTamil}</span>
                <span className="text-[10px] opacity-75 font-sans leading-none">{topic.titleEnglish}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Topic Banner */}
        <div className="rounded-2xl p-5 bg-white/70 dark:bg-slate-900/70 border border-amber-600/20 shadow-sm flex items-start gap-4">
          <span className="text-4xl">{currentTopic.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
              {currentTopic.titleTamil} — {currentTopic.titleEnglish}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
              {currentTopic.description}
            </p>
          </div>
        </div>

        {/* Display Kurals matching this topic */}
        <div className="space-y-4">
          {filteredKurals.length > 0 ? (
            filteredKurals.map((k) => <KuralDisplay key={k.number} kural={k} />)
          ) : (
            <div className="text-center p-8 bg-white/50 rounded-2xl">
              <p className="text-stone-500 text-sm">இக்கருப்பொருளுக்குரிய குறள்கள் தொகுக்கப்பட்டு வருகின்றன.</p>
            </div>
          )}
        </div>
      </div>
    </ThemeLayout>
  );
};
