const LIKED_KEY = 'liked-paper-ids';

export const loadLikedPaperIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(LIKED_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLikedPaperIds = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
};
