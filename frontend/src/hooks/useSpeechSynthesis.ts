import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

export function useSpeechSynthesis() {
  const { voiceSpeed, voiceGender } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, lang: 'ta' | 'en' = 'ta') => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis not supported');
        return;
      }

      window.speechSynthesis.cancel();

      // Clean special characters for better TTS clarity
      const cleanText = text.replace(/[*_#`[\]()]/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = voiceSpeed;
      utterance.pitch = voiceGender === 'female' ? 1.2 : 0.9;

      // Match voice
      const targetLang = lang === 'ta' ? 'ta' : 'en';
      const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voices, voiceSpeed, voiceGender]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    hasVoices: voices.length > 0,
  };
}
