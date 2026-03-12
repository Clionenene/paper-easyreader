import { NextRequest, NextResponse } from 'next/server';
import { fetchArxivPapers } from '@/lib/arxiv';
import { fallbackPapers } from '@/lib/papers';

type PapersResponse = {
  papers: typeof fallbackPapers;
  source: 'arxiv' | 'fallback';
  sourceReason?: 'ok' | 'empty_result' | 'fetch_error';
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') ?? 'machine learning';

  try {
    const papers = await fetchArxivPapers(query);

    if (papers.length === 0) {
      const payload: PapersResponse = {
        papers: fallbackPapers,
        source: 'fallback',
        sourceReason: 'empty_result'
      };
      return NextResponse.json(payload);
    }

    const payload: PapersResponse = { papers, source: 'arxiv', sourceReason: 'ok' };
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/papers] arXiv fetch failed:', error);

    const payload: PapersResponse = {
      papers: fallbackPapers,
      source: 'fallback',
      sourceReason: 'fetch_error'
    };
    return NextResponse.json(payload);
  }
}
