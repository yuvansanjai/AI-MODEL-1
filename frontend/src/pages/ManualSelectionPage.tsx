import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { AgeGroup } from '../types';
import { Sparkles, Zap, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const ManualSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAgeGroup } = useApp();

  const handleSelect = (group: AgeGroup) => {
    setAgeGroup(group);
    navigate('/dashboard');
  };

  const cards: {
    id: AgeGroup;
    titleTamil: string;
    titleEnglish: string;
    ageRange: string;
    descriptionTamil: string;
    descriptionEnglish: string;
    icon: string;
    bgCard: string;
    borderColor: string;
    btnClass: string;
    features: string[];
  }[] = [
    {
      id: 'children',
      titleTamil: 'சிறுவர் குறள் பூங்கா',
      titleEnglish: 'Children Edition',
      ageRange: '3 - 12 வயது',
      descriptionTamil: 'வள்ளுவர் தாத்தாவுடன் எளிய நீதிக்கதைகள், படங்கள், நட்சத்திர பரிசுகள் மற்றும் ஒலி வடிவிலான குறள்கள்.',
      descriptionEnglish: 'Playful animations, grandfatherly stories, rewards & fun interactive quizzes.',
      icon: '🎈',
      bgCard: 'bg-gradient-to-b from-[#fffde7] to-[#fff9c4]',
      borderColor: 'border-orange-300 hover:border-orange-500',
      btnClass: 'bg-orange-500 hover:bg-orange-600 text-white',
      features: ['தாத்தா கதை விளக்கம்', 'நட்சத்திரப் புள்ளிகள்', 'எளிய வினாடி வினா'],
    },
    {
      id: 'teenagers',
      titleTamil: 'இளைஞர் களப்பயிற்சி',
      titleEnglish: 'Teenager Edition',
      ageRange: '13 - 19 வயது',
      descriptionTamil: 'நவீன வாழ்வியல் சவால்கள், தேர்வு கவனம், மன உறுதி மற்றும் நட்பின் ஆழத்தை விளக்கும் நவீன தளம்.',
      descriptionEnglish: 'Relatable life hacks, daily protocol streaks, XP points & crisp mentorship.',
      icon: '⚡',
      bgCard: 'bg-gradient-to-b from-[#132238] to-[#0b1320] text-slate-100',
      borderColor: 'border-teal-500/40 hover:border-teal-400',
      btnClass: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold',
      features: ['Life Hacks & Focus', 'Daily XP Streaks', 'Peer Proof Wisdom'],
    },
    {
      id: 'adults',
      titleTamil: 'அறவியல் சிந்தனைப் பேரவை',
      titleEnglish: 'Adult Scholarly Edition',
      ageRange: '20+ வயது',
      descriptionTamil: 'பரிமேலழகர், மு.வ., சாலமன் பாப்பையா உரைகளுடன் கூடிய ஆழமான தத்துவ ஆய்வு மற்றும் நிர்வாக நெறிமுறைகள்.',
      descriptionEnglish: 'Comprehensive classical commentaries, ethical governance & philosophical reflections.',
      icon: '📜',
      bgCard: 'bg-gradient-to-b from-[#ffffff] to-[#faf6ee]',
      borderColor: 'border-[#dfd4bf] hover:border-[#b45309]',
      btnClass: 'bg-[#1a1f36] hover:bg-[#2b3353] text-[#e5cb8e] font-serif',
      features: ['முப்பால் விரிவுரை', 'பரிமேலழகர் உரை', 'நிர்வாக அறநெறி'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a1f36] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#dfd4bf]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft size={16} />
          <span>முகப்புக்குத் திரும்பு</span>
        </button>

        <span className="text-xs font-serif font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
          வயதுப் பிரிவு தேர்வு / Select Interface
        </span>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto my-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36]">
            தங்களுக்குப் பொருத்தமான தளத்தைத் தேர்ந்தெடுக்கவும்
          </h2>
          <p className="text-sm text-stone-600 font-serif">
            ஒவ்வொரு தளமும் தனித்துவமான மொழி நடை, வண்ணம் மற்றும் விளக்க உத்திகளுடன் வடிவமைக்கப்பட்டுள்ளது.
          </p>
        </div>

        {/* 3 Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-6 border-2 ${card.borderColor} ${card.bgCard} shadow-lg flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/10 backdrop-blur-xs">
                    {card.ageRange}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 leading-snug">
                  {card.titleTamil}
                </h3>
                <h4 className="text-xs font-medium opacity-70 mb-3 uppercase tracking-wider font-sans">
                  {card.titleEnglish}
                </h4>

                <p className="text-xs sm:text-sm leading-relaxed mb-6 opacity-90 font-serif">
                  {card.descriptionTamil}
                </p>

                {/* Bullet Highlights */}
                <div className="space-y-2 mb-6">
                  {card.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(card.id)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${card.btnClass}`}
              >
                <span>இத்தளத்தைத் தேர்வு செய்</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-md mx-auto text-center text-xs text-stone-500 font-serif pt-4">
        <span>தேர்ந்தெடுத்த பின்னரும் அமைப்புகளில் எப்போது வேண்டுமானாலும் மாற்றிக்கொள்ளலாம்.</span>
      </footer>
    </div>
  );
};
