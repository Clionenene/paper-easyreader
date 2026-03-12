'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { LikedPaper } from '@/lib/papers';
import { loadLikedPapers, saveLikedPapers } from '@/lib/storage';

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ja-JP');
};

export default function LikedPage() {
  const [likedPapers, setLikedPapers] = useState<LikedPaper[]>(() => loadLikedPapers());
  const [savedId, setSavedId] = useState<string | null>(null);

  const removeLike = (id: string) => {
    const next = likedPapers.filter((paper) => paper.id !== id);
    setLikedPapers(next);
    saveLikedPapers(next);
  };

  const updateField = (id: string, field: 'oneLineSummary' | 'note', value: string) => {
    setLikedPapers((prev) => prev.map((paper) => (paper.id === id ? { ...paper, [field]: value } : paper)));
  };

  const savePaperMemo = (id: string) => {
    saveLikedPapers(likedPapers);
    setSavedId(id);
    window.setTimeout(() => setSavedId((prev) => (prev === id ? null : prev)), 900);
  };

  return (
    <section className="flex flex-1 flex-col gap-3">
      <h2 className="text-xl font-semibold">Liked Papers ({likedPapers.length})</h2>
      {likedPapers.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          まだLikeした論文はありません。Homeで気になる論文を保存しましょう。
        </p>
      ) : (
        <ul className="space-y-3">
          {likedPapers.map((paper) => (
            <li key={paper.id} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <p className="font-medium leading-snug">{paper.title}</p>
                <p className="mt-1 text-xs text-slate-400">次回復習日: {formatDate(paper.nextReviewAt)}</p>
              </div>

              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={paper.oneLineSummary}
                onChange={(e) => updateField(paper.id, 'oneLineSummary', e.target.value)}
                placeholder="この論文を一言でいうと？ / 何が分かった論文？"
              />

              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={paper.note}
                onChange={(e) => updateField(paper.id, 'note', e.target.value)}
                placeholder="自由メモ（後で見返す要点）"
              />

              <div className="flex items-center gap-2 text-sm">
                <a className="text-cyan-300 underline" href={paper.link} target="_blank" rel="noreferrer">
                  Link
                </a>
                <button
                  className="rounded-full border border-emerald-500 px-3 py-1 text-emerald-200"
                  type="button"
                  onClick={() => savePaperMemo(paper.id)}
                >
                  Save Note
                </button>
                <button
                  className="rounded-full border border-slate-600 px-3 py-1 text-slate-200"
                  type="button"
                  onClick={() => removeLike(paper.id)}
                >
                  Remove
                </button>
                {savedId === paper.id && <span className="text-emerald-300">✓ 保存しました</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/" className="mt-auto text-center text-sm text-slate-400 underline">
        Homeへ戻る
      </Link>
    </section>
  );
}
