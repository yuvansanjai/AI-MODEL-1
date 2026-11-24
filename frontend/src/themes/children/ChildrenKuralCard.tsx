import React, { useState } from 'react';
import { Kural } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useApp } from '../../contexts/AppContext';
import { Volume2, VolumeX, Star, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChildrenKuralCard: React.FC<{ kural: Kural }> = ({ kural }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { isBookmarked, toggleBookmark } = useApp();
  const [liked, setLiked] = useState(false);

  const bookmarked = isBookmarked(kural.number);

  const handleAudio = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(`${kural.line1}. ${kural.line2}. நீதி கதை: ${kural.kidExplanation}`, 'ta');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative rounded-3xl bg-white p-6 sm:p-8 border-4 border-orange-200 shadow-xl overflow-hidden"
    >
      {/* Decorative Ribbon */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-black text-sm tracking-wide shadow-sm flex items-center gap-1.5">
          <Sparkles size={16} />
          <span>குறள் எண்: {kural.number}</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Audio Button */}
          <button
            type="button"
            onClick={handleAudio}
            className={`p-3 rounded-2xl transition-all ${
              isSpeaking
                ? 'bg-orange-500 text-white animate-bounce'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
            title="குறளைக் கேளுங்கள்"
          >
            {isSpeaking ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {/* Star Bookmark */}
          <button
            type="button"
            onClick={() => toggleBookmark(kural.number)}
            className={`p-3 rounded-2xl transition-all ${
              bookmarked ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <Star size={22} fill={bookmarked ? '#78350f' : 'none'} />
          </button>

          {/* Heart Button */}
          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-2xl transition-all ${
              liked ? 'bg-pink-500 text-white shadow-sm' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
            }`}
          >
            <Heart size={22} fill={liked ? 'white' : 'none'} />
          </button>
        </div>
      </div>

      {/* Couplet Text in Big Friendly Font */}
      <div className="my-6 p-4 sm:p-6 rounded-2xl bg-[#fff9c4]/50 border-2 border-amber-200 text-center">
        <p className="text-xl sm:text-2xl font-black text-amber-900 leading-relaxed mb-2 font-children">
          🌸 {kural.line1}
        </p>
        <p className="text-xl sm:text-2xl font-black text-amber-900 leading-relaxed font-children">
          {kural.line2} 🌸
        </p>
      </div>

      {/* Kid Story & Moral */}
      <div className="p-4 sm:p-5 rounded-2xl bg-orange-50 border-2 border-orange-100 mb-4">
        <h4 className="text-base font-black text-orange-800 flex items-center gap-2 mb-2">
          <span>📖</span>
          <span>தாத்தாவின் கதை & நீதி:</span>
        </h4>
        <p className="text-base sm:text-lg text-stone-800 font-medium leading-relaxed">
          {kural.kidExplanation}
        </p>
      </div>

      {/* English Meaning Box */}
      <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-sm text-teal-900">
        <span className="font-bold block text-xs text-teal-700 mb-0.5">Simple English:</span>
        {kural.translation}
      </div>
    </motion.div>
  );
};
