import { NextRequest, NextResponse } from 'next/server';
import { ArxivRequestError, fetchArxivPapers } from '@/lib/arxiv';
import { fallbackPapers, type Paper } from '@/lib/papers';

type SourceReason = 'ok' | 'empty_result' | 'fetch_error' | 'rate_limited' | 'cached';

type PapersResponse = {
  papers: Paper[];
  source: 'arxiv' | 'fallback';
  sourceReason: SourceReason;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_FETCH_INTERVAL_MS = 1200;

const queryCache = new Map<string, { papers: Paper[]; fetchedAt: number }>();
let lastUpstreamFetchAt = 0;

const getCached = (query: string) => {
  const hit = queryCache.get(query);
  if (!hit) return null;
  if (Date.now() - hit.fetchedAt > CACHE_TTL_MS) {
    queryCache.delete(query);
    return null;
  }
  return hit;
};

const fallbackPayload = (reason: SourceReason): PapersResponse => ({
  papers: fallbackPapers,
  source: 'fallback',
  sourceReason: reason
});

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('query') ?? 'machine learning').trim().toLowerCase();

  const cached = getCached(query);
  if (cached) {
    return NextResponse.json({ papers: cached.papers, source: 'arxiv', sourceReason: 'cached' } satisfies PapersResponse);
  }

  if (Date.now() - lastUpstreamFetchAt < MIN_FETCH_INTERVAL_MS) {
    return NextResponse.json(fallbackPayload('rate_limited'));
  }

  try {
    lastUpstreamFetchAt = Date.now();
    const papers = await fetchArxivPapers(query);

    if (papers.length === 0) {
      return NextResponse.json(fallbackPayload('empty_result'));
    }

    queryCache.set(query, { papers, fetchedAt: Date.now() });
    return NextResponse.json({ papers, source: 'arxiv', sourceReason: 'ok' } satisfies PapersResponse);
  } catch (error) {
    const isRateLimited = error instanceof ArxivRequestError && error.status === 429;

    if (isRateLimited) {
      const stale = queryCache.get(query);
      if (stale) {
        return NextResponse.json({ papers: stale.papers, source: 'arxiv', sourceReason: 'cached' } satisfies PapersResponse);
      }
      return NextResponse.json(fallbackPayload('rate_limited'));
    }

    console.error('[api/papers] arXiv fetch failed:', error);
    return NextResponse.json(fallbackPayload('fetch_error'));
  }
}
