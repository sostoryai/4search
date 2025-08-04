export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  channelCreatedAt: Date | null;
  publishedAt: Date;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  subscriberCount: number;
  thumbnailUrl: string;
  description: string;
  tags: string[];
  performanceLevel: "great" | "good" | "normal";
  cii: number;
  engagementRate: number;
}

export interface SearchParams {
  keyword: string;
  sortOrder: "viewCount" | "date" | "relevance";
  publishTime: "week" | "month" | "year";
  videoDuration: "any" | "short" | "medium" | "long";
  excludeKeywords?: string;
}

export interface SearchResults {
  videos: YouTubeVideo[];
  summary: {
    total: number;
    great: number;
    good: number;
    normal: number;
  };
}

export interface AIAnalysis {
  trends: string[];
  targets: string[];
  hooks: string[];
  suggestedTitles: string[];
}

export interface ScriptOptions {
  format: "shorts" | "short" | "long";
  tone: "friendly" | "professional" | "casual" | "enthusiastic";
  keywords?: string;
  audience?: string;
  title: string;
}
