import React, { useState } from 'react';
import { MOCK_QUIZZES } from '../../services/mockData';
import { useApp } from '../../contexts/AppContext';
import { Star, Award, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChildrenQuiz: React.FC = () => {
  const { addQuizScore } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentQuiz = MOCK_QUIZZES[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQuiz.correctIndex) {
      setScore((prev) => prev + 1);
      addQuizScore(1);
    }
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUIZZES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowCelebration(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowCelebration(false);
  };

  if (showCelebration) {
    return (
      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-100 border-4 border-amber-300 text-center shadow-xl">
        <motion.div
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <h3 className="text-2xl font-black text-amber-900 mb-2">
          சபாஷ் செல்லமே! அற்புதமான வெற்றி!
        </h3>
        <p className="text-base text-amber-800 font-bold mb-6">
          நீ {MOCK_QUIZZES.length} கேள்விகளில் {score} கேள்விகளுக்கு சரியாக விடையளித்தாய்!
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: score }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            >
              <Star size={36} fill="#f59e0b" className="text-amber-500" />
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg transition-all hover:scale-105"
        >
          <RotateCcw size={20} />
          <span>மீண்டும் விளையாடு!</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 border-4 border-amber-200 shadow-xl">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={24} className="text-orange-500" />
          <span className="font-black text-lg text-amber-900">
            குறள் வினாடி வினா ({currentIndex + 1} / {MOCK_QUIZZES.length})
          </span>
        </div>
        <div className="flex items-center gap-1 font-bold text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
          <Star size={16} fill="#f59e0b" className="text-amber-600" />
          <span>மதிப்பெண்: {score}</span>
        </div>
      </div>

      {/* Question */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 mb-6">
        <h4 className="text-lg sm:text-xl font-black text-stone-800 leading-relaxed">
          ❓ {currentQuiz.questionTamil}
        </h4>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-sans">
          {currentQuiz.questionEnglish}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQuiz.optionsTamil.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQuiz.correctIndex;

          let btnClass = 'bg-stone-50 hover:bg-amber-50 border-2 border-stone-200 text-stone-800';

          if (isAnswered) {
            if (isCorrect) {
              btnClass = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-black shadow-md';
            } else if (isSelected) {
              btnClass = 'bg-rose-100 border-2 border-rose-400 text-rose-950 font-bold';
            } else {
              btnClass = 'bg-stone-50 border-stone-200 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(idx)}
              className={`p-4 rounded-2xl text-left transition-all flex items-center justify-between ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white border border-stone-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-base font-bold leading-tight">{option}</span>
              </div>
              {isAnswered && isCorrect && <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={22} className="text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next Button */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-bold text-orange-950">
                {selectedOption === currentQuiz.correctIndex ? '🎉 மிகச் சரி!' : '💡 தாத்தாவின் விளக்கம்:'}
              </p>
              <p className="text-xs text-stone-700 mt-0.5">{currentQuiz.explanationTamil}</p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 shrink-0"
            >
              <span>அடுத்த கேள்வி</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
