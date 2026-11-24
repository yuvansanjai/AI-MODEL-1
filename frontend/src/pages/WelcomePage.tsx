import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThiruvalluvarSVG } from '../components/ThiruvalluvarSVG';
import { TamilPattern } from '../components/TamilPattern';
import { LanguageToggle } from '../components/LanguageToggle';
import { Mic, UserCheck, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a1f36] flex flex-col justify-between selection:bg-amber-200 relative overflow-hidden">
      {/* Decorative Temple Pattern Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

      <div className="absolute -top-20 -left-20 text-amber-900/5 pointer-events-none">
        <TamilPattern variant="gopuram" size={320} />
      </div>
      <div className="absolute -bottom-20 -right-20 text-amber-900/5 pointer-events-none">
        <TamilPattern variant="kolam" size={340} />
      </div>

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <TamilPattern variant="lotus" size={32} color="#b45309" />
          <span className="font-serif font-bold text-sm sm:text-base text-amber-900 tracking-wide">
            தமிழ் மறைக் களம்
          </span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Hero Section */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center text-center relative z-10">
        {/* Traditional Thiruvalluvar Sage Portrait */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="relative">
            <ThiruvalluvarSVG size={260} showAura={true} className="drop-shadow-2xl" />
          </div>

          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-serif shadow-xs">
            <span>ஓலைச்சுவடி ஏந்திய பெருந்தகை</span>
            <span>•</span>
            <span>பொதுமறை அருளிய ஞானி</span>
          </div>
        </motion.div>

        {/* Title & Cultural Salutation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3 max-w-2xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#1a1f36] tracking-tight leading-tight">
            திருவள்ளுவர் <span className="text-[#b45309]">AI</span>
          </h1>

          <p className="text-base sm:text-lg font-serif text-amber-950/80 leading-relaxed">
            குரல்வழி வயது கணிப்புடன் இயங்கும் உலகளாவிய தமிழ் பொதுமறை கல்வித்தளம்.
            சிறுவர்கள், இளைஞர்கள் மற்றும் பெரியவர்களுக்கேற்ப தகவமைக்கும் தனித்துவமான அறிவுத்தளம்.
          </p>

          <p className="text-xs sm:text-sm text-stone-600 font-sans italic">
            "Universal Thirukkural platform with AI voice-adaptive learning for Children, Teens & Adults."
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center"
        >
          {/* Voice Detection Entry */}
          <button
            type="button"
            onClick={() => navigate('/voice-estimation')}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-base shadow-lg shadow-amber-900/20 transition-all hover:scale-102 active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Mic size={18} className="animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-sm leading-tight">குரல் வழி தொடங்குக</span>
              <span className="text-[11px] font-sans opacity-80 leading-none">Voice Age Detection</span>
            </div>
            <ArrowRight size={18} className="ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Manual Selection Entry */}
          <button
            type="button"
            onClick={() => navigate('/manual-selection')}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 text-[#1a1f36] border-2 border-[#dfd4bf] font-serif font-bold text-base shadow-sm transition-all hover:scale-102 active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <UserCheck size={18} />
            </div>
            <div className="text-left">
              <span className="block text-sm leading-tight">சுய தேர்வு செய்க</span>
              <span className="text-[11px] font-sans text-stone-500 leading-none">Choose Age Group</span>
            </div>
            <ArrowRight size={18} className="ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Feature Highlights Banner */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-2xl bg-white/80 border border-[#dfd4bf] shadow-xs flex items-start gap-3">
            <span className="text-2xl">👶</span>
            <div>
              <h4 className="font-bold text-sm text-[#1a1f36]">சிறுவர்கள் பகுதி</h4>
              <p className="text-xs text-stone-600 mt-0.5">எளிய நீதிக்கதைகள், வண்ணமயமான தோற்றம், விளையாட்டு வினாக்கள்.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#dfd4bf] shadow-xs flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-bold text-sm text-[#1a1f36]">இளைஞர்கள் களம்</h4>
              <p className="text-xs text-stone-600 mt-0.5">நவீன வாழ்வியல் நுணுக்கங்கள், சவால்கள், புதிய சிந்தனைத் தளம்.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#dfd4bf] shadow-xs flex items-start gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h4 className="font-bold text-sm text-[#1a1f36]">பெரியவர்கள் உரை</h4>
              <p className="text-xs text-stone-600 mt-0.5">பரிமேலழகர், மு.வ. செவ்வியல் உரைகள் மற்றும் தத்துவ ஆய்வு.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto p-4 text-center text-xs text-stone-500 font-serif border-t border-[#dfd4bf]">
        <span>திருக்குறள் உலகப் பொதுமறை • 1330 குறள்கள் • ஆஃப்லைன் கல்வி தளம்</span>
      </footer>
    </div>
  );
};
