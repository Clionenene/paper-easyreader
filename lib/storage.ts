import { calcNextReviewAt, type LikedPaper, type Paper } from '@/lib/papers';

const LIKED_KEY = 'liked-papers-v2';
const LEGACY_LIKED_KEY = 'liked-papers';
const SETTINGS_KEY = 'reader-settings-v1';

export type ReaderSettings = {
  soundEnabled: boolean;
  animationEnabled: boolean;
};

export const defaultSettings: ReaderSettings = {
  soundEnabled: true,
  animationEnabled: true
};

const isPaper = (item: unknown): item is Paper => {
  const candidate = item as Paper | undefined;
  return !!candidate &&
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.abstract === 'string' &&
    typeof candidate.link === 'string';
};

const toLikedPaper = (item: Paper | LikedPaper): LikedPaper => {
  const candidate = item as Partial<LikedPaper>;
  const reviewCount = typeof candidate.reviewCount === 'number' ? candidate.reviewCount : 0;

  return {
    id: item.id,
    title: item.title,
    abstract: item.abstract,
    link: item.link,
    likedAt: typeof candidate.likedAt === 'string' ? candidate.likedAt : new Date().toISOString(),
    note: typeof candidate.note === 'string' ? candidate.note : '',
    oneLineSummary: typeof candidate.oneLineSummary === 'string' ? candidate.oneLineSummary : '',
    reviewCount,
    nextReviewAt:
      typeof candidate.nextReviewAt === 'string'
        ? candidate.nextReviewAt
        : calcNextReviewAt(reviewCount)
  };
};

export const loadLikedPapers = (): LikedPaper[] => {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(LIKED_KEY) ?? window.localStorage.getItem(LEGACY_LIKED_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isPaper).map((item) => toLikedPaper(item));
  } catch {
    return [];
  }
};

export const saveLikedPapers = (papers: LikedPaper[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIKED_KEY, JSON.stringify(papers));
};

export const loadSettings = (): ReaderSettings => {
  if (typeof window === 'undefined') return defaultSettings;

  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : defaultSettings.soundEnabled,
      animationEnabled:
        typeof parsed.animationEnabled === 'boolean'
          ? parsed.animationEnabled
          : defaultSettings.animationEnabled
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: ReaderSettings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
