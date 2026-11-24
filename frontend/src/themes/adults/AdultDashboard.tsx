import React from 'react';
import { NavLink } from 'react-router-dom';
import { PAAL_DATA, MOCK_KURALS } from '../../services/mockData';
import { useApp } from '../../contexts/AppContext';
import { AdultKuralCard } from './AdultKuralCard';
import { BookOpen, Compass, Award, BookmarkCheck, ArrowRight, Sparkles } from 'lucide-react';
import { TamilPattern } from '../../components/TamilPattern';

export const AdultDashboard: React.FC = () => {
  const { userStats } = useApp();
  const kuralOfDay = MOCK_KURALS[3]; // Kural 391

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a1f36] via-[#242b4a] to-[#1a1f36] text-[#f5f0e1] p-6 sm:p-8 border border-[#c4a35a]/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-4">
          <TamilPattern variant="gopuram" size={240} color="#c4a35a" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-serif tracking-widest text-[#c4a35a] font-bold">
              தமிழ் அறவியல் தத்துவ ஆய்வு மையம்
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4a35a]" />
            <span className="text-xs text-stone-300 font-sans">முப்பால் பேரறிவு</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#e5cb8e] mb-3 leading-snug">
            வாழ்வியல் நெறியும் ஆளுமை மேன்மையும்
          </h2>

          <p className="text-sm text-[#dfd4bf] leading-relaxed mb-6 font-serif">
            திருக்குறள் உலகப் பொதுமறை. மனித குலத்தின் அறம், சமூக அரசியல் பொருளியல், மற்றும் அகவாழ்வின் மெய்ப்பொருளை ஆராய்ந்து வழிநடத்தும் காலத்தால் அழியாத தமிழ் சிந்தனை கருவூலம்.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/chat"
              className="px-5 py-2.5 rounded-xl bg-[#c4a35a] hover:bg-[#b38f45] text-[#1a1f36] font-serif font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>வள்ளுவருடன் மெய்யியல் உரையாடல்</span>
              <ArrowRight size={16} />
            </NavLink>

            <NavLink
              to="/topics"
              className="px-5 py-2.5 rounded-xl bg-[#0f1322]/80 hover:bg-[#0f1322] text-[#e5cb8e] border border-[#c4a35a]/50 font-serif text-sm transition-all"
            >
              அதிகாரங்கள் உலா
            </NavLink>
          </div>
        </div>
      </div>

      {/* Muppal: Aram, Porul, Inbam Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif font-bold text-[#1a1f36] flex items-center gap-2">
            <BookOpen size={20} className="text-[#b45309]" />
            <span>முப்பால் பகுப்பு (The Three Foundational Sections)</span>
          </h3>
          <span className="text-xs text-stone-500 font-serif">133 அதிகாரங்கள் • 1330 குறள்கள்</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAAL_DATA.map((paal) => (
            <div
              key={paal.id}
              className="rounded-2xl p-6 bg-white border border-[#dfd4bf] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-serif font-bold"
                    style={{ backgroundColor: `${paal.color}20`, color: paal.color }}
                  >
                    {paal.chaptersCount} அதிகாரங்கள்
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    {paal.kuralsCount} குறள்கள்
                  </span>
                </div>

                <h4 className="text-lg font-serif font-bold text-[#1a1f36] mb-1">
                  {paal.nameTamil}
                </h4>
                <p className="text-xs font-serif text-stone-500 mb-3">
                  {paal.nameEnglish}
                </p>

                <p className="text-xs text-stone-700 leading-relaxed font-serif">
                  {paal.descriptionTamil}
                </p>
              </div>

              <NavLink
                to={`/topics?paal=${paal.id}`}
                className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-serif font-semibold text-[#b45309] hover:text-[#78350f]"
              >
                <span>பாடல்களைப் பார்வையிடுக</span>
                <ArrowRight size={14} />
              </NavLink>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Couplet of Reflection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-serif font-bold text-[#1a1f36] flex items-center gap-2">
            <Sparkles size={20} className="text-[#b45309]" />
            <span>இன்றைய ஆய்வுச் சிந்தனை (Featured Couplet)</span>
          </h3>
          <NavLink
            to="/kural-of-day"
            className="text-xs font-serif text-[#b45309] hover:underline"
          >
            முழுமையான விளக்கம் &rarr;
          </NavLink>
        </div>

        <AdultKuralCard kural={kuralOfDay} />
      </div>

      {/* Progress & Saved Kurals Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 bg-white border border-[#dfd4bf] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <BookmarkCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-serif">குறிப்பெடுத்த குறள்கள்</span>
            <div className="text-2xl font-serif font-bold text-[#1a1f36]">
              {userStats.bookmarks.length}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5 bg-white border border-[#dfd4bf] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-serif">பயின்ற குறள்கள்</span>
            <div className="text-2xl font-serif font-bold text-[#1a1f36]">
              {userStats.kuralsRead.length}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5 bg-white border border-[#dfd4bf] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-serif">தொடர் சிந்தனை நாட்கள்</span>
            <div className="text-2xl font-serif font-bold text-[#1a1f36]">
              {userStats.currentStreak} நாட்கள்
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
