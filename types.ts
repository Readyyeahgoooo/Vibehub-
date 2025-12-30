
export type AppCategory = 'Productivity & Tools' | 'Design & Creative' | 'AI & Experimental' | 'Lifestyle & Niche';

export type Language = 'en' | 'zh-TW' | 'zh-CN';

export type SortKey = 'name' | 'summary' | 'tags' | 'creator' | 'source';
export type SortDirection = 'asc' | 'desc';

export interface VibeApp {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  creator: string;
  category: AppCategory;
  githubUrl?: string;
  threadsUrl?: string;
}

export interface SearchResult {
  appId: string;
  relevance: string;
}
