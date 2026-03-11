'use client';

import { useMemo, useState } from 'react';
import PaperCard from '@/components/PaperCard';
import { papers } from '@/lib/papers';
import { loadLikedPaperIds, saveLikedPaperIds } from '@/lib/storage';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPaperIds, setLikedPaperIds] = useState<string[]>(() => loadLikedPaperIds());

  const currentPaper = papers[currentIndex % papers.length];

  const isCurrentLiked = useMemo(
    () => likedPaperIds.includes(currentPaper.id),
    [currentPaper.id, likedPaperIds]
  );

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % papers.length);
  };

  const likeCurrent = () => {
    if (likedPaperIds.includes(currentPaper.id)) {
      return;
    }

    const next = [...likedPaperIds, currentPaper.id];
    setLikedPaperIds(next);
    saveLikedPaperIds(next);
  };

  return (
    <section className="flex flex-1 flex-col gap-4">
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
