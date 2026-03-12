import type { Paper } from '@/lib/papers';

const cleanText = (text: string) =>
  text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pickTag = (entry: string, tag: string) => {
  const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? cleanText(match[1]) : '';
};

const pickLink = (entry: string) => {
  const direct = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/i);
  if (direct?.[1]) return direct[1];

  const alternate = entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/i);
  if (alternate?.[1]) return alternate[1];

  return '';
};

export const parseArxivAtom = (xml: string): Paper[] => {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries
    .map((entry) => {
      const idRaw = pickTag(entry, 'id');
      const title = pickTag(entry, 'title');
      const abstract = pickTag(entry, 'summary');
      const link = pickLink(entry);
      const id = idRaw.split('/abs/')[1] ?? idRaw;

      if (!id || !title || !abstract || !link) return null;

      return { id, title, abstract, link } satisfies Paper;
    })
    .filter((paper): paper is Paper => paper !== null);
};

export const fetchArxivPapers = async (query: string, maxResults = 20): Promise<Paper[]> => {
  const search = encodeURIComponent(query.trim() || 'machine learning');
  const url = `https://export.arxiv.org/api/query?search_query=all:${search}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

  const response = await fetch(url, {
    headers: { Accept: 'application/atom+xml' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`arXiv request failed with ${response.status}`);
  }

  const xml = await response.text();
  return parseArxivAtom(xml);
};
