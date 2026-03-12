'use client';

import { useEffect, useMemo, useState } from 'react';
import PaperCard from '@/components/PaperCard';
import type { Paper } from '@/lib/papers';
import { fallbackPapers } from '@/lib/papers';
import { loadLikedPapers, saveLikedPapers } from '@/lib/storage';

export default function Home() {
  const [query, setQuery] = useState('llm');
  const [papers, setPapers] = useState<Paper[]>(fallbackPapers);
  const [source, setSource] = useState<'arxiv' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPapers, setLikedPapers] = useState<Paper[]>(() => loadLikedPapers());

  const currentPaper = papers[currentIndex % papers.length];

  const isCurrentLiked = useMemo(
    () => likedPapers.some((paper) => paper.id === currentPaper.id),
    [currentPaper.id, likedPapers]
  );

  const fetchPapers = async (nextQuery: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/papers?query=${encodeURIComponent(nextQuery)}`);
      const data = (await response.json()) as { papers: Paper[]; source: 'arxiv' | 'fallback' };
      setPapers(data.papers.length > 0 ? data.papers : fallbackPapers);
      setSource(data.source);
      setCurrentIndex(0);
    } catch {
      setPapers(fallbackPapers);
      setSource('fallback');
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPapers('llm');
  }, []);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % papers.length);

  const likeCurrent = () => {
    if (likedPapers.some((paper) => paper.id === currentPaper.id)) return;
    const next = [currentPaper, ...likedPapers];
    setLikedPapers(next);
    saveLikedPapers(next);
  };

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs text-slate-400">自動収集（arXiv）: {source === 'arxiv' ? 'ON' : 'Fallback data'}</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: diffusion, llm, multimodal"
          />
          <button
            className="rounded-lg border border-cyan-500 px-3 py-2 text-sm"
            type="button"
            onClick={() => void fetchPapers(query)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>
      </div>

      <PaperCard paper={currentPaper} onLike={likeCurrent} />

      <div className="grid grid-cols-2 gap-3">
        <button
          className="rounded-xl border border-pink-500 bg-pink-500/20 px-4 py-3 font-medium"
          onClick={likeCurrent}
          type="button"
        >
          {isCurrentLiked ? 'Liked ✓' : 'Like'}
        </button>
        <button
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-medium"
          onClick={goNext}
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}
