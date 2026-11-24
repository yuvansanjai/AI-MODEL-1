import React from 'react';
import { ChatMessage } from '../../types';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface ChildrenChatBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChildrenChatBubble: React.FC<ChildrenChatBubbleProps> = ({
  message,
  onSuggestionClick,
}) => {
  const isValluvar = message.sender === 'valluvar';
  const { speak } = useSpeechSynthesis();

  return (
    <div className={`flex gap-3 my-4 ${isValluvar ? 'items-start' : 'items-end flex-row-reverse'}`}>
      {/* Avatar */}
      {isValluvar ? (
        <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 p-0.5 shadow-md flex items-center justify-center">
          <ThiruvalluvarSVG size={40} showAura={false} />
        </div>
      ) : (
        <div className="shrink-0 w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center text-lg shadow-md font-bold">
          🧒
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isValluvar ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-black text-amber-900">
            {isValluvar ? 'வள்ளுவர் தாத்தா' : 'நீ'}
          </span>
          <span className="text-[10px] text-stone-400">{message.timestamp}</span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl text-base sm:text-lg leading-relaxed shadow-md ${
            isValluvar
              ? 'bg-white border-2 border-orange-200 text-stone-800 rounded-tl-sm'
              : 'bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-tr-sm font-semibold'
          }`}
        >
          <p>{message.text}</p>

          {/* Kural Quote card inside bubble */}
          {message.kural && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-950 font-bold">
              <span className="text-xs text-orange-600 block mb-1">📜 திருக்குறள்:</span>
              <p>"{message.kural.line1}</p>
              <p>{message.kural.line2}"</p>
            </div>
          )}

          {/* Audio Playback button */}
          {isValluvar && (
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => speak(message.text, 'ta')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs font-bold transition-all"
              >
                <Volume2 size={14} />
                <span>தாத்தா குரலில் கேட்க</span>
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
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border-2 border-amber-200 text-amber-900 shadow-sm transition-all hover:scale-105"
              >
                🎈 {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
