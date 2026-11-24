import React, { useState } from 'react';
import { ThemeLayout } from '../components/ThemeLayout';
import { useApp } from '../contexts/AppContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { AgeGroupSwitcher } from '../components/AgeGroupSwitcher';
import { Settings, Globe, Volume2, RotateCcw, Database, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    voiceGender,
    setVoiceGender,
    voiceSpeed,
    setVoiceSpeed,
    userStats,
    resetProgress,
  } = useApp();

  const { speak, isSpeaking } = useSpeechSynthesis();
  const [resetDone, setResetDone] = useState(false);

  const handleTestVoice = () => {
    speak('வணக்கம், திருவள்ளுவர் செயற்கை நுண்ணறிவு தளம் தங்களை அன்புடன் வரவேற்கிறது.', 'ta');
  };

  const handleReset = () => {
    if (window.confirm('உங்கள் அனைத்து வாசிப்பு பதிவுகளையும் மீட்டமைக்க விரும்புகிறீர்களா?')) {
      resetProgress();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2000);
    }
  };

  return (
    <ThemeLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e] flex items-center justify-center gap-2">
            <Settings size={24} className="text-amber-600" />
            <span>அமைப்புகள் / Settings</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            மொழி, ஒலி வாசிப்பு, மற்றும் வயதுப் பிரிவு விருப்பங்களை நிர்வகிக்கவும்.
          </p>
        </div>

        {/* 1. Age Group Switcher Section */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
            வயதுப் பிரிவு முறைமை (Active Interface)
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            இங்கு மாற்றினால் தளத்தின் வடிவமைப்பு, வண்ணங்கள் மற்றும் விளக்கங்கள் உடனடியாக மாறும்.
          </p>
          <div className="pt-2">
            <AgeGroupSwitcher />
          </div>
        </div>

        {/* 2. Language Selection */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
              மொழி விருப்பம் (Language Mode)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                language === 'ta'
                  ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-sm'
                  : 'bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm">தமிழ் மட்டும்</div>
              <div className="text-[11px] opacity-75">Pure Tamil Experience</div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                language === 'en'
                  ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-sm'
                  : 'bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm">English Translation</div>
              <div className="text-[11px] opacity-75">With Transliteration</div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('bilingual')}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                language === 'bilingual'
                  ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-sm'
                  : 'bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm">இருமொழி / Bilingual</div>
              <div className="text-[11px] opacity-75">Tamil & English Dual</div>
            </button>
          </div>
        </div>

        {/* 3. Text to Speech / Voice Customization */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
              குரல் மற்றும் ஒலி வாசிப்பு (Speech Synthesis)
            </h3>
          </div>

          <div className="space-y-4">
            {/* Voice Gender */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                குரல் வகை (Voice Tone):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceGender('male')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    voiceGender === 'male'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  ஆண் குரல் (Male)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender('female')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    voiceGender === 'female'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  பெண் குரல் (Female)
                </button>
              </div>
            </div>

            {/* Voice Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
                <span>வாசிப்பு வேகம் (Speech Rate):</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {voiceSpeed}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>பொறுமையாக (0.7x)</span>
                <span>இயல்பான வேகம் (1.0x)</span>
                <span>வேகமாக (1.3x)</span>
              </div>
            </div>

            {/* Test Voice Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Volume2 size={15} />
                <span>{isSpeaking ? 'வாசிக்கப்படுகிறது...' : 'குரல் மாதிரி கேட்க (Test Voice)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Offline Storage & Reset */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-[#dfd4bf] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-slate-800 text-emerald-700 flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1a1f36] dark:text-[#e5cb8e] flex items-center gap-1.5">
                <span>ஆஃப்லைன் தளம் தயார்</span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </h4>
              <p className="text-xs text-stone-500">
                அனைத்து குறள்களும் உங்கள் சாதனத்தில் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளன.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            {resetDone ? <Check size={14} /> : <RotateCcw size={14} />}
            <span>{resetDone ? 'மீட்டமைக்கப்பட்டது!' : 'முன்னேற்றத்தை மீட்டமை'}</span>
          </button>
        </div>
      </div>
    </ThemeLayout>
  );
};
