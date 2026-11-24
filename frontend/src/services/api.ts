import { Kural, AgeGroup, VoiceAgeEstimationResult } from '../types';
import { MOCK_KURALS, PAAL_DATA } from './mockData';
import { VoiceFeatureExtractor } from './audioAnalyzer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiService = {
  // Get all Kurals (offline fallback to rich mock data)
  async getKurals(): Promise<Kural[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/kurals`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return MOCK_KURALS;
    }
  },

  // Get Kural by number
  async getKuralByNumber(num: number): Promise<Kural | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/kurals/${num}`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      const found = MOCK_KURALS.find((k) => k.number === num);
      return found || MOCK_KURALS[0];
    }
  },

  // Get Kural of the Day
  async getKuralOfDay(): Promise<Kural> {
    try {
      const res = await fetch(`${API_BASE_URL}/kural-of-the-day`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      // Pick based on day of year
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % MOCK_KURALS.length;
      return MOCK_KURALS[index];
    }
  },

  // Search Kurals
  async searchKurals(query: string, paalId?: string): Promise<Kural[]> {
    const q = query.trim().toLowerCase();
    return MOCK_KURALS.filter((k) => {
      const matchesPaal = !paalId || k.paalId === paalId;
      if (!q) return matchesPaal;

      const matchesText =
        k.number.toString() === q ||
        k.line1.toLowerCase().includes(q) ||
        k.line2.toLowerCase().includes(q) ||
        k.translation.toLowerCase().includes(q) ||
        k.athigaram.toLowerCase().includes(q) ||
        k.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
        (k.tags && k.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesPaal && matchesText;
    });
  },

  // Voice Age Estimation
  async estimateAgeFromAudio(audioBlob: Blob): Promise<VoiceAgeEstimationResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'sample.wav');
      const res = await fetch(`${API_BASE_URL}/estimate-age`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('Voice API unavailable');
      return await res.json();
    } catch {
      // Offline fallback: Use feature analyzer simulation
      return VoiceFeatureExtractor.getPresetSimulation('teenagers');
    }
  },

  // Send message to Thiruvalluvar AI
  async chatWithThiruvalluvar(message: string, ageGroup: AgeGroup, _language: string): Promise<{
    reply: string;
    kural?: Kural;
    suggestions: string[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          age_group: ageGroup === 'children' ? 'child' : ageGroup === 'teenagers' ? 'teenager' : 'adult',
          language: _language === 'ta' ? 'ta' : 'en',
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        const refKural = data.referenced_kurals && data.referenced_kurals.length > 0 ? data.referenced_kurals[0] : undefined;
        let mappedKural: Kural | undefined;
        if (refKural) {
          mappedKural = {
            number: refKural.number,
            line1: refKural.line1,
            line2: refKural.line2,
            translation: refKural.translation,
            transliteration: refKural.transliteration || '',
            paal: refKural.section_tamil || 'அறத்துப்பால்',
            paalId: (refKural.section_tamil?.includes('பொருள்') ? 'porul' : refKural.section_tamil?.includes('இன்பம்') ? 'inbam' : 'aram') as any,
            iyal: refKural.group_tamil || '',
            athigaram: refKural.chapter_tamil || '',
            athigaramNumber: refKural.chapter_number || 1,
            explanationMuVa: refKural.mv_explanation || refKural.meaning_ta || '',
            explanationSolomon: refKural.sp_explanation || '',
            explanationParimel: refKural.mk_explanation || '',
            kidExplanation: refKural.translation || '',
            teenExplanation: refKural.translation || '',
            adultExplanation: refKural.translation || '',
            keywords: [],
          };
        }
        return {
          reply: data.reply,
          kural: mappedKural,
          suggestions: data.suggested_followups || [],
        };
      }
    } catch {
      // Fallback to offline intelligent conversational agent
    }

    const msgLower = message.toLowerCase();
    let relevantKural = MOCK_KURALS[0];

    if (msgLower.includes('கல்வி') || msgLower.includes('study') || msgLower.includes('learn') || msgLower.includes('படிப்ப')) {
      relevantKural = MOCK_KURALS[3]; // Kural 391
    } else if (msgLower.includes('நட்பு') || msgLower.includes('friend') || msgLower.includes('தோழ')) {
      relevantKural = MOCK_KURALS[6]; // Kural 788
    } else if (msgLower.includes('உதவி') || msgLower.includes('help') || msgLower.includes('நன்றி') || msgLower.includes('thanks')) {
      relevantKural = MOCK_KURALS[2]; // Kural 102
    } else if (msgLower.includes('அன்பு') || msgLower.includes('love') || msgLower.includes('பாசம்')) {
      relevantKural = MOCK_KURALS[1]; // Kural 78
    } else if (msgLower.includes('உண்மை') || msgLower.includes('truth') || msgLower.includes('அறிவு') || msgLower.includes('wise')) {
      relevantKural = MOCK_KURALS[5]; // Kural 423
    } else if (msgLower.includes('விவசாயம்') || msgLower.includes('farmer') || msgLower.includes('உழவு')) {
      relevantKural = MOCK_KURALS[7]; // Kural 1031
    }

    // Adaptive persona response
    if (ageGroup === 'children') {
      return {
        reply: `அன்புக் குழந்தையே! உன் கேள்வி எனக்கு மிகுந்த மகிழ்ச்சியைத் தருகிறது. "${relevantKural.line1} ${relevantKural.line2}" என்று நான் எழுதியிருக்கிறேன். ${relevantKural.kidExplanation} எப்போதும் அன்போடும் சிரிப்போடும் நல்ல பிள்ளையாக இருக்க வேண்டும், சரியா?`,
        kural: relevantKural,
        suggestions: [
          'வள்ளுவர் தாத்தா, நட்பு பற்றி சொல்லுங்க!',
          'படிப்பு ஏன் முக்கியம் தாத்தா?',
          'அன்பு என்றால் என்ன தாத்தா?',
        ],
      };
    } else if (ageGroup === 'teenagers') {
      return {
        reply: `Hey there! That's a sharp and relevant question. In today's hyper-connected world, ancient Tamil wisdom cuts through the noise: "${relevantKural.line1} ${relevantKural.line2}". ${relevantKural.teenExplanation}`,
        kural: relevantKural,
        suggestions: [
          'How do I stay focused on my goals?',
          'What makes an unbreakable real friendship?',
          'How to handle peer pressure and self-doubt?',
        ],
      };
    } else {
      return {
        reply: `வணக்கம் அன்பரே. வாழ்வியல் நெறிகளை ஆய்ந்தறியும் உமது வினா போற்றுதலுக்குரியது. குறள் எண் ${relevantKural.number}: "${relevantKural.line1} ${relevantKural.line2}". ${relevantKural.adultExplanation} இல்லறத்திலும் சமூக நிர்வாகத்திலும் அறவழி நிற்றலே நிலையான அமைதியை ஈட்டும்.`,
        kural: relevantKural,
        suggestions: [
          'அறத்துப்பாலின் முக்கிய நெறிகள் யாவை?',
          'தலைமைத்துவத்திற்கு வள்ளுவர் கூறும் இலக்கணம் என்ன?',
          'காலமறிந்து செயல்படுவதன் நுணுக்கங்கள் யாவை?',
        ],
      };
    }
  },

  getPaals() {
    return PAAL_DATA;
  },
};
