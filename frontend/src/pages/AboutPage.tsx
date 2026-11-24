import React from 'react';
import { ThemeLayout } from '../components/ThemeLayout';
import { ThiruvalluvarSVG } from '../components/ThiruvalluvarSVG';
import { TamilPattern } from '../components/TamilPattern';
import { BookOpen, Sparkles, Feather, Globe, MapPin, Milestone } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <ThemeLayout>
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="rounded-3xl bg-[#faf6ee] dark:bg-slate-900 border border-[#dfd4bf] dark:border-amber-600/30 p-6 sm:p-10 shadow-xl text-center flex flex-col items-center">
          <ThiruvalluvarSVG size={220} showAura={true} className="mb-4" />

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e] mb-2">
            திருவள்ளுவர் & திருக்குறள்
          </h2>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-800 dark:text-amber-400 font-serif font-semibold">
            உலகப் பொதுமறை • The Universal Code of Human Ethics
          </p>

          <p className="mt-4 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl font-serif">
            இரண்டாயிரம் ஆண்டுகளுக்கு முன்பே மதம், சாதி, இனம், நாடு கடந்த உலகளாவிய வாழ்வியல் விழுமியங்களை ஏழு சீர்களில் அள்ளித்தந்த தமிழ்ஞானி திருவள்ளுவர்.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Globe size={22} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a1f36] dark:text-[#e5cb8e]">
              சமயச்சார்பற்ற பொதுமறை
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif">
              திருக்குறளில் எங்கும் ஒரு குறிப்பிட்ட மதத்தின் பெயரோ, கடவுளின் பெயரோ குறிப்பிடப்படவில்லை. மனித நேயம், அன்பு மற்றும் அறமே அதன் மைய அச்சு.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Feather size={22} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a1f36] dark:text-[#e5cb8e]">
              குறள் வெண்பா இலக்கணம்
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif">
              முதல் அடியில் நான்கு சீர்களும், இரண்டாம் அடியில் மூன்று சீர்களுமாக மொத்தம் ஏழு சீர்களில் அணுவைத் துளைத்து ஏழ்கடலைப் புகட்டிய ஒப்பற்ற சுருக்க வடிவம்.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#dfd4bf] dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a1f36] dark:text-[#e5cb8e]">
              முப்பால் அமைப்பு
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif">
              அறத்துப்பால் (380), பொருட்பால் (700), காமத்துப்பால் (250) என மொத்தம் 133 அதிகாரங்களில் மனித வாழ்வின் முழுப் பரிமாணத்தையும் முழுமையாகக் கையாள்கிறது.
            </p>
          </div>
        </div>

        {/* Cultural Monuments & Palm-Leaf Heritage */}
        <div className="rounded-2xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-[#dfd4bf] dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#dfd4bf] dark:border-slate-800 pb-3">
            <Milestone size={24} className="text-[#b45309]" />
            <h3 className="text-xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
              வரலாற்றுத் தொன்மையும் நினைவுச் சின்னங்களும்
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <MapPin size={16} />
                <span>கன்னியாகுமரி 133 அடி திருவள்ளுவர் சிலை</span>
              </h4>
              <p>
                முக்கடல் சங்கமிக்கும் கன்னியாகுமரி பாறையில் 133 அதிகாரங்களைக் குறிக்கும் வகையில் 133 அடி உயரத்தில் எழுந்து நிற்கும் பிரம்மாண்ட திருவள்ளுவர் திருவுருவச் சிலை தமிழகத்தின் பண்பாட்டு அடையாளம்.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <MapPin size={16} />
                <span>சென்னை வள்ளுவர் கோட்டம்</span>
              </h4>
              <p>
                சென்னையில் உள்ள வள்ளுவர் கோட்டம் பழங்காலத் தேரின் வடிவில் அமைக்கப்பட்டு, அதன் கருங்கல் தூண்களில் 1330 குறள்களும் பொறிக்கப்பட்டு நிலைபெற்றுள்ளது.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThemeLayout>
  );
};
