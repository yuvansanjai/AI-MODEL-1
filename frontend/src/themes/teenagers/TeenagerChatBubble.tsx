import React from 'react';
import { ChatMessage } from '../../types';
import { ThiruvalluvarSVG } from '../../components/ThiruvalluvarSVG';
import { Volume2, Zap } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface TeenagerChatBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export const TeenagerChatBubble: React.FC<TeenagerChatBubbleProps> = ({
  message,
  onSuggestionClick,
}) => {
  const isValluvar = message.sender === 'valluvar';
  const { speak } = useSpeechSynthesis();

  return (
    <div className={`flex gap-3 my-4 ${isValluvar ? 'items-start' : 'items-end flex-row-reverse'}`}>
      {/* Avatar */}
      {isValluvar ? (
        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-teal-500/40 p-0.5 shadow-md flex items-center justify-center">
          <ThiruvalluvarSVG size={32} showAura={false} />
        </div>
      ) : (
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center text-xs shadow-md font-black">
          YOU
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isValluvar ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-mono font-bold text-teal-400">
            {isValluvar ? 'Valluvar AI' : 'You'}
          </span>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>

        <div
          className={`p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-lg ${
            isValluvar
              ? 'bg-slate-900 border border-teal-500/30 text-slate-200 rounded-tl-sm'
              : 'bg-teal-600 text-white rounded-tr-sm font-medium'
          }`}
        >
          <p>{message.text}</p>

          {/* Kural snippet if attached */}
          {message.kural && (
            <div className="mt-3 p-3 rounded-xl bg-[#0b1320] border border-teal-500/20 text-xs font-mono">
              <span className="text-teal-400 font-bold block mb-1">
                📜 Kural #{message.kural.number} ({message.kural.athigaram})
              </span>
              <p className="text-slate-100 font-semibold mb-1">
                "{message.kural.line1} {message.kural.line2}"
              </p>
              <p className="text-slate-400 italic">"{message.kural.translation}"</p>
            </div>
          )}

          {isValluvar && (
            <div className="mt-2.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => speak(message.text, 'en')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 hover:bg-slate-700 text-xs font-mono transition-all"
              >
                <Volume2 size={13} />
                <span>Listen</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestionClick && onSuggestionClick(sug)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-teal-500/30 text-teal-300 transition-all hover:scale-102"
              >
                <Zap size={12} className="text-amber-400" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
