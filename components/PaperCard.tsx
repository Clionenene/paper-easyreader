'use client';

import type { LikedPaper, Paper } from '@/lib/papers';

type PaperCardProps = {
  paper: Paper;
  onLike: () => void;
  isReviewMode: boolean;
  reviewContext?: LikedPaper;
  cardKey: string;
  animationEnabled: boolean;
};

export default function PaperCard({
  paper,
  onLike,
  isReviewMode,
  reviewContext,
  cardKey,
  animationEnabled
}: PaperCardProps) {
  return (
    <article
      key={cardKey}
      className={`relative flex h-[68vh] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg ${
        animationEnabled ? 'card-enter' : ''
      }`}
      onDoubleClick={onLike}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Paper ID: {paper.id}</p>
        {isReviewMode && (
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[11px] text-amber-200">
            復習中
          </span>
        )}
      </div>

      {isReviewMode && reviewContext && (
        <div className={`mt-3 space-y-2 rounded-xl border border-amber-300/20 bg-amber-50/5 p-3 ${animationEnabled ? 'fade-in' : ''}`}>
          <p className="text-xs text-amber-200/90">前回の一行要約</p>
          <p className="text-sm text-slate-100">{reviewContext.oneLineSummary || '未入力'}</p>
          <p className="pt-1 text-xs text-amber-200/90">前回のメモ</p>
          <p className="line-clamp-4 text-sm text-slate-200">{reviewContext.note || '未入力'}</p>
        </div>
      )}

      <h2 className="mt-3 text-xl font-semibold leading-snug">{paper.title}</h2>
      <p className="mt-4 overflow-y-auto text-sm leading-6 text-slate-200">{paper.abstract}</p>
      <a
        className="mt-auto inline-flex w-fit rounded-full border border-cyan-400 px-4 py-2 text-sm text-cyan-300"
        href={paper.link}
        target="_blank"
        rel="noreferrer"
      >
        Open Paper
      </a>
      <p className="mt-3 text-xs text-slate-500">ダブルタップでもLikeできます</p>
    </article>
  );
}
