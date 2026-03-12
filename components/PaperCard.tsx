'use client';

import type { Paper } from '@/lib/papers';

type PaperCardProps = {
  paper: Paper;
  onLike: () => void;
};

export default function PaperCard({ paper, onLike }: PaperCardProps) {
  return (
    <article
      className="flex h-[68vh] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg"
      onDoubleClick={onLike}
    >
      <p className="text-xs text-slate-400">Paper ID: {paper.id}</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug">{paper.title}</h2>
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
