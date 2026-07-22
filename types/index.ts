export interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: string;
}

export interface Topic {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
}

export interface Article {
  id: string;
  topicId: number | null;
  authorId: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stage: 'idea' | 'early' | 'growth' | 'scale';
  readingTime: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  topic?: Topic;
}

export interface Resource {
  id: string;
  topicId: number | null;
  title: string;
  description: string | null;
  url: string;
  type: 'tool' | 'template' | 'guide' | 'video';
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  topic?: Topic;
}

export interface SearchRecord {
  id: string;
  userId: string | null;
  sessionId: string | null;
  query: string;
  response: string | null;
  sources: { articleId: string; title: string; similarity: number }[];
  tokensUsed: number | null;
  responseTime: number | null;
  isCached: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
