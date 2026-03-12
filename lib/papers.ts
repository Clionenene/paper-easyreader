export type Paper = {
  id: string;
  title: string;
  abstract: string;
  link: string;
};

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
