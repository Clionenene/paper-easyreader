import type { Paper } from '@/lib/papers';

const LIKED_KEY = 'liked-papers';

export const loadLikedPapers = (): Paper[] => {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(LIKED_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is Paper =>
        typeof item?.id === 'string' &&
        typeof item?.title === 'string' &&
        typeof item?.abstract === 'string' &&
        typeof item?.link === 'string'
    );
  } catch {
    return [];
  }
};

export const saveLikedPapers = (papers: Paper[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIKED_KEY, JSON.stringify(papers));
};
