import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ThemeLayout } from '../components/ThemeLayout';
import { apiService } from '../services/api';
import { Kural, PaalId } from '../types';
import { KuralDisplay } from '../components/KuralDisplay';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPaal = (searchParams.get('paal') as PaalId) || undefined;

  const [query, setQuery] = useState(initialQuery);
  const [selectedPaal, setSelectedPaal] = useState<PaalId | 'all'>(initialPaal || 'all');
  const [results, setResults] = useState<Kural[]>([]);

  const paals = apiService.getPaals();

  useEffect(() => {
    const fetchResults = async () => {
      const paalFilter = selectedPaal === 'all' ? undefined : selectedPaal;
      const data = await apiService.searchKurals(query, paalFilter);
      setResults(data);
    };

    fetchResults();
  }, [query, selectedPaal]);

  const quickTags = [
    { label: 'கல்வி (Education)', keyword: 'கல்வி' },
    { label: 'நட்பு (Friendship)', keyword: 'நட்பு' },
    { label: 'அன்பு (Love/Compassion)', keyword: 'அன்பு' },
    { label: 'உதவி (Gratitude)', keyword: 'நன்றி' },
    { label: 'மெய்யறிவு (Truth)', keyword: 'மெய்ப்பொருள்' },
    { label: 'உழவு (Agriculture)', keyword: 'உழவு' },
  ];

  return (
    <ThemeLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1f36] dark:text-[#e5cb8e]">
            குறள் ஆய்வு & தேடல்
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            குறள் எண், அதிகாரம், அல்லது சொற்கள் மூலம் 1330 குறள்களைத் தேடுங்கள்.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 border border-amber-600/20 shadow-lg backdrop-blur-md space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="எ.கா: 391, கல்வி, நட்பு, friendship, learn..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Paal Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter size={14} />
              <span>பால்:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedPaal('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedPaal === 'all'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              அனைத்தும் (All)
            </button>

            {paals.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPaal(p.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedPaal === p.id
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {p.nameTamil}
              </button>
            ))}
          </div>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-stone-400">விரைவு தேடல்:</span>
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(tag.keyword)}
                className="text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-slate-800/60 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-600/20 transition-all"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Stream */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              கண்டுபிடிக்கப்பட்ட குறள்கள்: {results.length}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-dashed border-stone-300 dark:border-slate-800">
              <span className="text-4xl block mb-2">📜</span>
              <h4 className="text-base font-bold text-stone-700 dark:text-stone-300">
                குறள்கள் ஏதும் கிடைக்கவில்லை
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                வேறு சொற்களைப் பயன்படுத்தி அல்லது மேலேயுள்ள விரைவு குறிச்சொற்களை அழுத்தித் தேடவும்.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((kural) => (
                <KuralDisplay key={kural.number} kural={kural} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ThemeLayout>
  );
};
