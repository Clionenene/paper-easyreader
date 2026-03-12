export type Paper = {
  id: string;
  title: string;
  abstract: string;
  link: string;
};

export type ReviewStage = 0 | 1 | 2;

export type LikedPaper = Paper & {
  likedAt: string;
  note: string;
  oneLineSummary: string;
  reviewCount: number;
  nextReviewAt: string;
};

const REVIEW_INTERVAL_DAYS = [1, 3, 7] as const;

export const calcNextReviewAt = (reviewCount: number, from = new Date()): string => {
  const stage = Math.min(reviewCount, REVIEW_INTERVAL_DAYS.length - 1);
  const days = REVIEW_INTERVAL_DAYS[stage];
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next.toISOString();
};

export const createLikedPaper = (paper: Paper): LikedPaper => ({
  ...paper,
  likedAt: new Date().toISOString(),
  note: '',
  oneLineSummary: '',
  reviewCount: 0,
  nextReviewAt: calcNextReviewAt(0)
});

export const completeReview = (paper: LikedPaper): LikedPaper => {
  const nextCount = paper.reviewCount + 1;
  return {
    ...paper,
    reviewCount: nextCount,
    nextReviewAt: calcNextReviewAt(nextCount)
  };
};

export const isReviewDue = (paper: LikedPaper, now = new Date()) => new Date(paper.nextReviewAt) <= now;

// Fallback data when API is unavailable.
export const fallbackPapers: Paper[] = [
  {
    id: '2401.00001',
    title: 'Attention Is All You Need for Fast Summarization in Scientific Text',
    abstract:
      'We propose a lightweight transformer variant optimized for summarizing long scientific documents with reduced latency while preserving factual consistency.',
    link: 'https://arxiv.org/abs/2401.00001'
  },
  {
    id: '2402.01234',
    title: 'Retrieval-Augmented Reading for Dense Academic Knowledge',
    abstract:
      'This work studies retrieval-augmented generation pipelines for understanding domain-specific papers and demonstrates strong gains on expert QA tasks.',
    link: 'https://arxiv.org/abs/2402.01234'
  },
  {
    id: '2403.10293',
    title: 'Contrastive Citation Embeddings for Paper Recommendation',
    abstract:
      'We learn citation-aware embeddings with contrastive objectives and show improved nearest-neighbor quality for paper discovery and ranking.',
    link: 'https://arxiv.org/abs/2403.10293'
  }
];
