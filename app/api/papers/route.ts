import { NextRequest, NextResponse } from 'next/server';
import { fetchArxivPapers } from '@/lib/arxiv';
import { fallbackPapers } from '@/lib/papers';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') ?? 'machine learning';

  try {
    const papers = await fetchArxivPapers(query);

    if (papers.length === 0) {
      return NextResponse.json({ papers: fallbackPapers, source: 'fallback' });
    }

    return NextResponse.json({ papers, source: 'arxiv' });
  } catch {
    return NextResponse.json({ papers: fallbackPapers, source: 'fallback' });
  }
}
