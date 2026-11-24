import React, { useState } from 'react';
import { Kural } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useApp } from '../../contexts/AppContext';
import { Volume2, VolumeX, Bookmark, BookmarkCheck, Share2, BookOpen, Scroll, Check } from 'lucide-react';
import { PalmLeafBorder } from '../../components/PalmLeafBorder';

export const AdultKuralCard: React.FC<{ kural: Kural }> = ({ kural }) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { isBookmarked, toggleBookmark, language } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeCommentator, setActiveCommentator] = useState<'philosophical' | 'parimel' | 'muva' | 'solomon'>('philosophical');

  const bookmarked = isBookmarked(kural.number);

  const handleAudio = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(`${kural.line1}. ${kural.line2}. ${kural.explanationMuVa}`, 'ta');
    }
  };

  const handleCopyCitation = () => {
    const text = `திருக்குறள் (அதிகாரம்: ${kural.athigaram}, குறள்: ${kural.number}):\n"${kural.line1}\n${kural.line2}"\n\nபரிமேலழகர் உரை: ${kural.explanationParimel}\n\nஆங்கில மொழியாக்கம்: ${kural.translation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PalmLeafBorder variant="light" className="my-4">
      {/* Top Academic Metadata */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd4bf]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded bg-[#1a1f36] text-[#e5cb8e] font-serif font-bold text-xs tracking-wider">
            குறள் {kural.number}
          </span>
          <span className="text-xs font-serif font-semibold text-[#581825] px-2.5 py-0.5 rounded bg-[#f5ede0] border border-[#dfd4bf]">
            {kural.paal}
          </span>
          <span className="text-xs text-stone-600 font-serif">
            அதிகாரம் {kural.athigaramNumber}: <strong className="text-stone-900">{kural.athigaram}</strong>
          </span>
          <span className="text-[11px] text-stone-500 font-serif hidden md:inline">
            ({kural.iyal})
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAudio}
            className={`p-2 rounded-lg border transition-all ${
              isSpeaking
                ? 'bg-[#c4a35a] text-[#1a1f36] border-[#c4a35a] animate-pulse'
                : 'hover:bg-[#f0e6d2] text-[#1a1f36] border-transparent'
            }`}
            title="குறள் ஒலிக்கோப்பைக் கேட்க"
          >
            {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(kural.number)}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked
                ? 'text-[#b45309] bg-[#faedcd] border-[#d4a373]'
                : 'hover:bg-[#f0e6d2] text-stone-600 border-transparent'
            }`}
            title="நூல் குறிப்பில் சேமிக்க"
          >
            {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>

          <button
            type="button"
            onClick={handleCopyCitation}
            className="p-2 rounded-lg hover:bg-[#f0e6d2] text-stone-600 transition-all border-transparent"
            title="மேற்கோள் நகலெடுக்க"
          >
            {copied ? <Check size={17} className="text-emerald-700" /> : <Share2 size={17} />}
          </button>
        </div>
      </div>

      {/* Classical Couplet In Center */}
      <div className="my-6 text-center space-y-2">
        <p className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#1a1f36] leading-relaxed">
          {kural.line1}
        </p>
        <p className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#1a1f36] leading-relaxed">
          {kural.line2}
        </p>
      </div>

      {/* Academic Translation & Transliteration */}
      {(language === 'en' || language === 'bilingual') && (
        <div className="mb-5 p-4 rounded-xl bg-[#f5ede0]/60 border border-[#dfd4bf]">
          <p className="text-xs italic text-stone-600 font-sans mb-1.5">
            "{kural.transliteration}"
          </p>
          <p className="text-sm font-serif text-[#1a1f36] leading-relaxed">
            <strong className="text-stone-800">Philosophical Translation: </strong>
            {kural.translation}
          </p>
        </div>
      )}

      {/* Commentary Selection Tabs */}
      <div className="mt-4 pt-3 border-t border-[#dfd4bf]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-serif font-semibold">
          <button
            type="button"
            onClick={() => setActiveCommentator('philosophical')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCommentator === 'philosophical'
                ? 'bg-[#1a1f36] text-[#e5cb8e] shadow-sm'
                : 'bg-[#ede5d5] text-stone-700 hover:bg-[#e4dac6]'
            }`}
          >
            <Scroll size={13} />
            <span>தத்துவப் பகுப்பாய்வு</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCommentator('parimel')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCommentator === 'parimel'
                ? 'bg-[#1a1f36] text-[#e5cb8e] shadow-sm'
                : 'bg-[#ede5d5] text-stone-700 hover:bg-[#e4dac6]'
            }`}
          >
            <BookOpen size={13} />
            <span>பரிமேலழகர் உரை</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCommentator('muva')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCommentator === 'muva'
                ? 'bg-[#1a1f36] text-[#e5cb8e] shadow-sm'
                : 'bg-[#ede5d5] text-stone-700 hover:bg-[#e4dac6]'
            }`}
          >
            டாக்டர் மு. வரதராசனார்
          </button>

          <button
            type="button"
            onClick={() => setActiveCommentator('solomon')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCommentator === 'solomon'
                ? 'bg-[#1a1f36] text-[#e5cb8e] shadow-sm'
                : 'bg-[#ede5d5] text-stone-700 hover:bg-[#e4dac6]'
            }`}
          >
            சாலமன் பாப்பையா
          </button>
        </div>

        {/* Commentary Box */}
        <div className="p-4 rounded-xl bg-white border border-[#dfd4bf] text-sm text-[#1a1f36] leading-relaxed font-serif">
          {activeCommentator === 'philosophical' && (
            <div>
              <span className="text-xs font-sans font-bold text-[#b45309] uppercase tracking-wider block mb-1">
                வாழ்வியல் மற்றும் நிர்வாக அறநெறி விளக்கம்:
              </span>
              <p>{kural.adultExplanation}</p>
            </div>
          )}

          {activeCommentator === 'parimel' && (
            <div>
              <span className="text-xs font-sans font-bold text-[#581825] uppercase tracking-wider block mb-1">
                செம்மொழிச் செவ்வியல் உரை (பரிமேலழகர்):
              </span>
              <p>{kural.explanationParimel}</p>
            </div>
          )}

          {activeCommentator === 'muva' && (
            <div>
              <span className="text-xs font-sans font-bold text-stone-600 uppercase tracking-wider block mb-1">
                தெளிவுரை (மு. வ.):
              </span>
              <p>{kural.explanationMuVa}</p>
            </div>
          )}

          {activeCommentator === 'solomon' && (
            <div>
              <span className="text-xs font-sans font-bold text-stone-600 uppercase tracking-wider block mb-1">
                எளிய உரை (சாலமன் பாப்பையா):
              </span>
              <p>{kural.explanationSolomon}</p>
            </div>
          )}
        </div>
      </div>
    </PalmLeafBorder>
  );
};
