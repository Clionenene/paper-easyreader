'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { papers } from '@/lib/papers';
import { loadLikedPaperIds, saveLikedPaperIds } from '@/lib/storage';

export default function LikedPage() {
  const [likedPaperIds, setLikedPaperIds] = useState<string[]>(() => loadLikedPaperIds());

  const likedPapers = useMemo(
    () => papers.filter((paper) => likedPaperIds.includes(paper.id)),
    [likedPaperIds]
  );

  const removeLike = (id: string) => {
    const next = likedPaperIds.filter((likedId) => likedId !== id);
    setLikedPaperIds(next);
    saveLikedPaperIds(next);
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
            <li key={paper.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="font-medium leading-snug">{paper.title}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <a className="text-cyan-300 underline" href={paper.link} target="_blank" rel="noreferrer">
                  Link
                </a>
                <button
                  className="rounded-full border border-slate-600 px-3 py-1 text-slate-200"
                  type="button"
                  onClick={() => removeLike(paper.id)}
                >
                  Remove
                </button>
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
