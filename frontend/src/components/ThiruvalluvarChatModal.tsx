import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, Mic, MicOff, X, Sparkles, BookOpen, RotateCcw, Bot } from './LucideIcons';
import { useTheme } from '../contexts/ThemeContext';
import { ChatMessage, Kural } from '../types';
import { apiService } from '../services/api';

export const ThiruvalluvarChatModal: React.FC = () => {
  const { isChatOpen, setIsChatOpen, ageGroup, language, playKuralAudio } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message based on ageGroup
  useEffect(() => {
    let welcomeText = '';
    let suggestions: string[] = [];

    if (ageGroup === 'children') {
      welcomeText = 'வணக்கம் செல்லமே! நான் உங்கள் வள்ளுவர் தாத்தா. என்னிடம் கதை கேட்க வேண்டுமா, அல்லது குறள் பற்றி ஏதாவது தெரிந்துகொள்ள வேண்டுமா? கேளுங்கள்!';
      suggestions = [
        'தாத்தா, கல்வி பற்றி சொல்லுங்கள்!',
        'நட்பு என்றால் என்ன தாத்தா?',
        'அன்பு பற்றி ஒரு குறள் சொல்லுங்க!',
      ];
    } else if (ageGroup === 'teenagers') {
      welcomeText = 'வணக்கம் நண்பா! இன்றைய வேகமான உலகில் கல்வி, நட்பு, மன உறுதி மற்றும் இலக்குகளை அடைய வள்ளுவத்தின் நடைமுறை வழிகாட்டல்களைப் பேசலாம்.';
      suggestions = [
        'படிப்பு & இலக்குகளில் கவனம் செலுத்த குறள் என்ன சொல்கிறது?',
        'உண்மையான நட்புக்கான இலக்கணம் என்ன?',
        'மன அழுத்தத்தை எப்படி கையாள்வது?',
      ];
    } else {
      welcomeText = 'வணக்கம் அன்பரே. அறம், பொருள், இன்பம் ஆகிய முப்பாலின் ஆழமான தத்துவார்த்த விழுமியங்களையும், வாழ்வியல் நெறிகளையும் ஆய்ந்தறிய வினவலாம்.';
      suggestions = [
        'தலைமைத்துவத்திற்கு வள்ளுவர் கூறும் முதன்மை நெறிகள் யாவை?',
        'காலமறிந்து செயல்படுவதன் சிறப்பை விளக்குக.',
        'அறத்துப்பாலின் அடிப்படை கோட்பாடு என்ன?',
      ];
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'valluvar',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      },
    ]);
  }, [ageGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice Speech Recognition Setup
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('உங்கள் உலாவியில் குரல் அறிதல் அம்சம் இயங்கவில்லை. தயவுசெய்து தட்டச்சு செய்யவும்.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.chatWithThiruvalluvar(textToSend, ageGroup, language);

      const valluvarMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'valluvar',
        text: response.reply,
        kural: response.kural,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, valluvarMsg]);

      // Step 3: Automatic Clear Tamil Voice Response when result loads
      if (response.kural) {
        playKuralAudio(response.kural);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'valluvar',
        text: 'மன்னிக்கவும், உமது வினாவை ஆராய்வதில் சிறு தாமதம். மீண்டும் வினவவும்.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl h-[88vh] max-h-[750px] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  திருவள்ளுவர் AI உரையாடல்
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Offline Local
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {ageGroup === 'children'
                    ? 'வள்ளுவர் தாத்தா சிறுவர் தளம்'
                    : ageGroup === 'teenagers'
                    ? 'இளைஞர் வழிகாட்டல் தளம்'
                    : 'முப்பால் மெய்யியல் ஆய்வுக்கூடம்'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'valluvar' && (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300 text-xs font-bold">
                    வ
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded Kural Card inside Chat */}
                  {msg.kural && (
                    <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-200">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          குறள் எண்: {msg.kural.number} ({msg.kural.athigaram})
                        </span>
                        <button
                          onClick={() => playKuralAudio(msg.kural)}
                          className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors flex items-center gap-1"
                          title="கேட்க"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">கேள்</span>
                        </button>
                      </div>
                      <p className="font-semibold text-white text-xs sm:text-sm">
                        {msg.kural.line1}
                        <br />
                        {msg.kural.line2}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1 italic">
                        "{msg.kural.translation}"
                      </p>
                    </div>
                  )}

                  <span className="text-[10px] opacity-60 block mt-2 text-right">
                    {msg.timestamp}
                  </span>

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs border border-amber-500/20 transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300 text-xs">
                  வ
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  வள்ளுவர் சிந்தித்துக்கொண்டிருக்கிறார்...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-white/10 z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-2xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                }`}
                title={isListening ? 'குரல் பதிவை நிறுத்து' : 'குரல் மூலம் பேசு'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  ageGroup === 'children'
                    ? 'வள்ளுவர் தாத்தாவிடம் கேளுங்கள்...'
                    : 'திருக்குறள் அல்லது வாழ்வியல் வினாக்களைக் கேட்கவும்...'
                }
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
