import { apiRequest } from "./queryClient";
import type { SearchParams, SearchResults, AIAnalysis, ScriptOptions } from "../types/youtube";

export async function searchVideos(params: SearchParams): Promise<SearchResults> {
  const response = await apiRequest("POST", "/api/search", params);
  return response.json();
}

export async function applyGreatFilter(videos: any[]): Promise<{ videos: any[] }> {
  const response = await apiRequest("POST", "/api/filter-great", { videos });
  return response.json();
}

export async function generateAIAnalysis(videoData: {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
}): Promise<AIAnalysis> {
  const response = await apiRequest("POST", "/api/ai-analysis", videoData);
  return response.json();
}

export async function generateScript(options: ScriptOptions): Promise<{ content: string; id: number }> {
  const response = await apiRequest("POST", "/api/generate-script", options);
  return response.json();
}

export async function getUserScripts(): Promise<any[]> {
  const response = await apiRequest("GET", "/api/scripts");
  return response.json();
}

export async function extractTranscript(videoId: string): Promise<{ videoId: string; transcript: string }> {
  const response = await apiRequest("POST", "/api/extract-transcript", { videoId });
  return response.json();
}
