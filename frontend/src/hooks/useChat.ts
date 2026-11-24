import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/api';

export function useChat() {
  const { ageGroup, language } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Initialize greeting based on ageGroup
  useEffect(() => {
    let initialGreeting = '';
    let initialSuggestions: string[] = [];

    if (ageGroup === 'children') {
      initialGreeting = 'வணக்கம் செல்லங்களே! நான் உங்கள் வள்ளுவர் தாத்தா. என்னிடம் கதை கேட்க விரும்புகிறீர்களா, அல்லது நல்ல அறிவுரைகள் வேண்டுமா? உங்கள் கேள்வியைக் கேளுங்கள்!';
      initialSuggestions = [
        'வள்ளுவர் தாத்தா, நல்ல பழக்கங்கள் சொல்லுங்கள்!',
        'நட்பு என்றால் என்ன தாத்தா?',
        'அன்பு பற்றி ஒரு கதை சொல்லுங்க!',
      ];
    } else if (ageGroup === 'teenagers') {
      initialGreeting = 'Hey! I am Thiruvalluvar AI. Real timeless wisdom adapted for your challenges—exams, peer pressure, habits, focus, and future dreams. What is on your mind?';
      initialSuggestions = [
        'How to maintain relentless focus?',
        'How to spot fake friends vs real allies?',
        'Managing anxiety and building confidence.',
      ];
    } else {
      initialGreeting = 'வணக்கம் அன்பரே. திருக்குறளின் ஆழமான அறநெறி, பொருளியல் ஆளுமை, மற்றும் வாழ்வியல் விழுமியங்களை கலந்துரையாட நான் சித்தமாக உள்ளேன். எவ்வகையான சிந்தனையை ஆராய விழைகிறீர்கள்?';
      initialSuggestions = [
        'அறத்துப்பாலின் அடிப்படை நெறிகள் யாவை?',
        'தலைமைத்துவமும் முடிவெடுத்தலும் பற்றி வள்ளுவர் கூறுவது என்ன?',
        'குடும்ப நல்லிணக்கம் மற்றும் சமூகம் குறித்த குறள்கள்.',
      ];
    }

    setMessages([
      {
        id: 'msg-init',
        sender: 'valluvar',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: initialSuggestions,
      },
    ]);
    setSuggestions(initialSuggestions);
  }, [ageGroup]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await apiService.chatWithThiruvalluvar(text, ageGroup, language);

        const aiMessage: ChatMessage = {
          id: `val-${Date.now()}`,
          sender: 'valluvar',
          text: response.reply,
          kural: response.kural,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: response.suggestions,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setSuggestions(response.suggestions || []);
      } catch (err) {
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [ageGroup, language, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    clearChat,
  };
}
