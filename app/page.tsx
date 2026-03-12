'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PaperCard from '@/components/PaperCard';
import {
  completeReview,
  createLikedPaper,
  fallbackPapers,
  isReviewDue,
  type LikedPaper,
  type Paper
} from '@/lib/papers';
import { defaultSettings, loadLikedPapers, loadSettings, saveLikedPapers, saveSettings } from '@/lib/storage';

const playSoftPop = (volume = 0.04) => {
  if (typeof window === 'undefined') return;

  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 740;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(context.destination);

  const now = context.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  oscillator.start(now);
  oscillator.stop(now + 0.14);
};

export default function Home() {
  const [query, setQuery] = useState('llm');
  const [papers, setPapers] = useState<Paper[]>(fallbackPapers);
  const [source, setSource] = useState<'arxiv' | 'fallback'>('fallback');
  const [sourceReason, setSourceReason] = useState<string>('fetch_error');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPapers, setLikedPapers] = useState<LikedPaper[]>(() => loadLikedPapers());
  const [settings, setSettings] = useState(() => loadSettings());
  const [showLikeFx, setShowLikeFx] = useState(false);

  const soundCooldownRef = useRef(0);

  const dueReviews = useMemo(() => likedPapers.filter((paper) => isReviewDue(paper)), [likedPapers]);
  const currentReview = dueReviews[0];
  const isReviewMode = !!currentReview;

  const currentPaper = isReviewMode ? currentReview : papers[currentIndex % papers.length];

  const isCurrentLiked = useMemo(
    () => likedPapers.some((paper) => paper.id === currentPaper.id),
    [currentPaper.id, likedPapers]
  );

  const triggerPositiveFx = () => {
    if (settings.animationEnabled) {
      setShowLikeFx(true);
      window.setTimeout(() => setShowLikeFx(false), 280);
    }

    const now = Date.now();
    if (settings.soundEnabled && now - soundCooldownRef.current > 250) {
      soundCooldownRef.current = now;
      playSoftPop();
    }
  };

  const fetchPapers = async (nextQuery: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/papers?query=${encodeURIComponent(nextQuery)}`);
      const data = (await response.json()) as {
        papers: Paper[];
        source: 'arxiv' | 'fallback';
        sourceReason?: string;
      };
      setPapers(data.papers.length > 0 ? data.papers : fallbackPapers);
      setSource(data.source);
      setSourceReason(data.sourceReason ?? 'ok');
      setCurrentIndex(0);
    } catch {
      setPapers(fallbackPapers);
      setSource('fallback');
      setSourceReason('fetch_error');
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

    const newLiked = createLikedPaper(currentPaper);
    const next = [newLiked, ...likedPapers];
    setLikedPapers(next);
    saveLikedPapers(next);
    triggerPositiveFx();
  };

  const completeCurrentReview = () => {
    if (!currentReview) return;
    const next = likedPapers.map((paper) => (paper.id === currentReview.id ? completeReview(paper) : paper));
    setLikedPapers(next);
    saveLikedPapers(next);
    triggerPositiveFx();
  };

  const toggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(next);
    saveSettings(next);
  };

  const toggleAnimation = () => {
    const next = { ...settings, animationEnabled: !settings.animationEnabled };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <section className="relative flex flex-1 flex-col gap-4 overflow-hidden">
      {showLikeFx && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className={`text-6xl ${settings.animationEnabled ? 'heart-pop' : ''}`}>💗</div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs text-slate-400">自動収集（arXiv）: {source === 'arxiv' ? `ON (${sourceReason})` : `Fallback (${sourceReason})`}</p>
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

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className="rounded-full border border-slate-700 px-3 py-1"
            onClick={toggleSound}
          >
            Sound: {settings.soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-700 px-3 py-1"
            onClick={toggleAnimation}
          >
            Animation: {settings.animationEnabled ? 'ON' : 'OFF'}
          </button>
          <span className="rounded-full border border-amber-300/30 px-3 py-1 text-amber-200">
            Review due: {dueReviews.length}
          </span>
        </div>
      </div>

      <PaperCard
        paper={currentPaper}
        onLike={likeCurrent}
        isReviewMode={isReviewMode}
        reviewContext={currentReview}
        cardKey={`${currentPaper.id}-${isReviewMode ? 'review' : currentIndex}`}
        animationEnabled={settings.animationEnabled}
      />

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
          disabled={isReviewMode}
        >
          {isReviewMode ? 'Review First' : 'Next'}
        </button>
      </div>

      {isReviewMode && (
        <button
          type="button"
          className="rounded-xl border border-emerald-500 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-200"
          onClick={completeCurrentReview}
        >
          復習した（次回に進める）
        </button>
      )}
    </section>
  );
}
