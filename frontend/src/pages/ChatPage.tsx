import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useChat } from '../hooks/useChat';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { ThemeLayout } from '../components/ThemeLayout';
import { ChildrenChatBubble } from '../themes/children/ChildrenChatBubble';
import { TeenagerChatBubble } from '../themes/teenagers/TeenagerChatBubble';
import { AdultChatBubble } from '../themes/adults/AdultChatBubble';
import { MicrophoneButton } from '../components/MicrophoneButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Send, Trash2, Mic, Sparkles } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { ageGroup } = useApp();
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition('ta-IN');

  // When voice speech recognition receives text, populate input
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    resetTranscript();
    if (isListening) stopListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const renderBubble = (msg: typeof messages[0]) => {
    if (ageGroup === 'children') {
      return (
        <ChildrenChatBubble
          key={msg.id}
          message={msg}
          onSuggestionClick={handleSuggestionClick}
        />
      );
    }

    if (ageGroup === 'teenagers') {
      return (
        <TeenagerChatBubble
          key={msg.id}
          message={msg}
          onSuggestionClick={handleSuggestionClick}
        />
      );
    }

    return (
      <AdultChatBubble
        key={msg.id}
        message={msg}
        onSuggestionClick={handleSuggestionClick}
      />
    );
  };

  return (
    <ThemeLayout>
      <div className="flex flex-col h-[calc(100vh-180px)] max-h-[820px] rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-amber-600/20 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Chat Window Header */}
        <div className="px-5 py-3.5 border-b border-amber-600/15 flex items-center justify-between bg-black/5 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {ageGroup === 'children'
                  ? 'வள்ளுவர் தாத்தாவிடம் பேசுங்கள் 🎈'
                  : ageGroup === 'teenagers'
                  ? 'Valluvar AI // Timeless Mentor'
                  : 'திருவள்ளுவர் மெய்யியல் உரையாடல்'}
              </h3>
              <p className="text-[11px] opacity-70">
                {ageGroup === 'children'
                  ? 'கதைகளும் அறிவுரைகளும் கேளுங்கள்'
                  : ageGroup === 'teenagers'
                  ? 'Online • Real-time wisdom engine'
                  : 'செவ்வியல் குறள் மேற்கோள்கள் மற்றும் தத்துவ விளக்கம்'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            title="உரையாடலை அழிக்க"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {messages.map(renderBubble)}

          {isLoading && (
            <div className="my-4">
              <LoadingSpinner
                messageTamil="வள்ளுவர் அருளுரையைச் சிந்தித்து வழங்குகிறார்..."
                messageEnglish="Thiruvalluvar is formulating the answer..."
                size={40}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Recording Active Notice */}
        {isListening && (
          <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 animate-pulse">
            <span className="flex items-center gap-1.5 font-bold">
              <Mic size={14} />
              <span>உங்கள் குரல் கேட்கப்படுகிறது... பேசுங்கள்</span>
            </span>
            <button
              type="button"
              onClick={stopListening}
              className="text-xs font-bold underline"
            >
              நிறுத்து
            </button>
          </div>
        )}

        {/* Input Dock */}
        <div className="p-3 sm:p-4 border-t border-amber-600/15 bg-white/90 dark:bg-slate-900/90 flex items-center gap-2">
          <MicrophoneButton
            isListening={isListening}
            onClick={handleMicToggle}
            size="sm"
            theme={ageGroup === 'children' ? 'children' : ageGroup === 'teenagers' ? 'teenager' : 'adult'}
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              ageGroup === 'children'
                ? 'தாத்தாவிடம் எதாவது கேளுங்கள்...'
                : ageGroup === 'teenagers'
                ? 'Ask about focus, friends, choices, habits...'
                : 'அறம், பொருளியல், அல்லது வாழ்வியல் ஐயங்களைக் கேட்க...'
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
          />

          <button
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={handleSend}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <Send size={16} />
            <span className="hidden sm:inline">அனுப்புக</span>
          </button>
        </div>
      </div>
    </ThemeLayout>
  );
};
