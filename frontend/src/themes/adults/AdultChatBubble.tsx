import React from 'react';
import { ChatMessage } from '../../types';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { Volume2, BookMarked } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface AdultChatBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export const AdultChatBubble: React.FC<AdultChatBubbleProps> = ({
  message,
  onSuggestionClick,
}) => {
  const isValluvar = message.sender === 'valluvar';
  const { speak } = useSpeechSynthesis();

  return (
    <div className={`flex gap-3.5 my-5 ${isValluvar ? 'items-start' : 'items-end flex-row-reverse'}`}>
      {/* Avatar */}
      {isValluvar ? (
        <div className="shrink-0 w-11 h-11 rounded-full bg-[#1a1f36] border border-[#c4a35a] p-1 shadow-md flex items-center justify-center">
          <ThiruvalluvarSVG size={36} showAura={false} />
        </div>
      ) : (
        <div className="shrink-0 w-10 h-10 rounded-full bg-[#3d4465] text-[#f5f0e1] flex items-center justify-center text-xs shadow-md font-serif font-bold">
          ஆய்வாளர்
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isValluvar ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
            {isValluvar ? 'திருவள்ளுவர் பேரறிவு' : 'நீங்கள்'}
          </span>
          <span className="text-[10px] text-stone-500">{message.timestamp}</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm font-serif ${
            isValluvar
              ? 'bg-[#ffffff] border border-[#dfd4bf] text-[#1a1f36] rounded-tl-sm'
              : 'bg-[#1a1f36] text-[#f5f0e1] rounded-tr-sm font-sans'
          }`}
        >
          <p className="whitespace-pre-line">{message.text}</p>

          {/* Attached Kural Reference */}
          {message.kural && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#faf6ee] border border-[#dfd4bf] text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#b45309] mb-1.5">
                <BookMarked size={14} />
                <span>மேற்கோள் குறள் #{message.kural.number} ({message.kural.athigaram})</span>
              </div>
              <p className="text-[#1a1f36] font-bold text-sm mb-1 leading-normal">
                "{message.kural.line1} {message.kural.line2}"
              </p>
              <p className="text-stone-600 italic">
                உரை: {message.kural.explanationMuVa}
              </p>
            </div>
          )}

          {isValluvar && (
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => speak(message.text, 'ta')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#faf6ee] hover:bg-[#ede5d5] text-[#1a1f36] border border-[#dfd4bf] text-xs font-serif transition-all"
              >
                <Volume2 size={13} />
                <span>உரையை ஒலிவடிவில் கேட்க</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestionClick && onSuggestionClick(sug)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-[#faf6ee] border border-[#dfd4bf] text-[#1a1f36] font-serif shadow-xs transition-all hover:scale-101"
              >
                ⚜️ {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
