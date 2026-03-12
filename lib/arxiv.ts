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

const pickAttr = (tag: string, attr: string) => {
  const match = tag.match(new RegExp(`${attr}="([^"]+)"`, 'i'));
  return match?.[1] ?? '';
};

const pickLink = (entry: string) => {
  const linkTags = entry.match(/<link\b[^>]*>/gi) ?? [];

  for (const linkTag of linkTags) {
    const title = pickAttr(linkTag, 'title');
    const href = pickAttr(linkTag, 'href');
    if (title.toLowerCase() === 'pdf' && href) return href;
  }

  for (const linkTag of linkTags) {
    const rel = pickAttr(linkTag, 'rel');
    const href = pickAttr(linkTag, 'href');
    if (rel.toLowerCase() === 'alternate' && href) return href;
  }

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

export class ArxivRequestError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(status: number, retryAfterSeconds?: number) {
    super(`arXiv request failed with ${status}`);
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchArxivResponse = async (url: string) =>
  fetch(url, {
    headers: {
      Accept: 'application/atom+xml',
      'User-Agent': 'paper-easyreader/1.0 (+https://example.com; educational app)'
    },
    cache: 'no-store'
  });

export const fetchArxivPapers = async (query: string, maxResults = 20): Promise<Paper[]> => {
  const search = encodeURIComponent(query.trim() || 'machine learning');
  const url = `https://export.arxiv.org/api/query?search_query=all:${search}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

  let response = await fetchArxivResponse(url);

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? 0);
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000;
    await sleep(waitMs);
    response = await fetchArxivResponse(url);
  }

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('retry-after') ?? 0);
    const retryAfterSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined;
    throw new ArxivRequestError(response.status, retryAfterSeconds);
  }

  const xml = await response.text();
  return parseArxivAtom(xml);
};
