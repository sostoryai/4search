import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "../components/sidebar";
import { VideoTable } from "../components/video-table";
import { AIRecommendationModal } from "../components/ai-recommendation-modal";
import { ScriptGenerationModal } from "../components/script-generation-modal";
import { TranscriptModal } from "../components/transcript-modal";
import { BatchAnalysisModal } from "../components/batch-analysis-modal";
import { 
  searchVideos, 
  applyGreatFilter, 
  generateAIAnalysis, 
  generateScript,
  extractTranscript 
} from "../lib/youtube-api";
import { TrendingTopics } from "../components/trending-topics";
import { ViralPatternsModal } from "../components/viral-patterns-modal";
import { HybridAnalysisModal } from "../components/hybrid-analysis-modal";
import { ChannelViralAnalysisModal } from "../components/channel-viral-analysis-modal";
import type { 
  SearchParams, 
  YouTubeVideo, 
  AIAnalysis, 
  ScriptOptions, 
  SearchResults 
} from "../types/youtube";
import { Download, Bot, Settings } from "lucide-react";
import { Link } from "wouter";
import { QuotaStatus } from "../components/quota-status";
import { OfflineFeatures } from "../components/offline-features";

// Helper functions for state persistence
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
};

const clearAllStorage = () => {
  const keys = [
    'tubelens_searchResults', 'tubelens_filteredVideos', 'tubelens_selectedVideo',
    'tubelens_aiAnalysis', 'tubelens_generatedScript', 'tubelens_extractedTranscript',
    'tubelens_selectedVideos', 'tubelens_cachedTrendingData', 'tubelens_viralPatternsData',
    'tubelens_viralPatternsKeyword', 'tubelens_hybridAnalysisData', 'tubelens_hybridAnalysisKeyword',
    'tubelens_channelViralData', 'tubelens_shoppingChannelViralData', 'tubelens_titleAnalysis',
    'tubelens_thumbnailAnalysis', 'tubelens_popularTitles', 'tubelens_contentRecommendations',
    'tubelens_channelViralKeyword'
  ];
  keys.forEach(key => localStorage.removeItem(key));
};

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize state with localStorage data
  const [searchResults, setSearchResults] = useState<SearchResults | null>(() => 
    loadFromStorage('tubelens_searchResults')
  );
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>(() => 
    loadFromStorage('tubelens_filteredVideos') || []
  );
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(() => 
    loadFromStorage('tubelens_selectedVideo')
  );
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(() => 
    loadFromStorage('tubelens_aiAnalysis')
  );
  const [generatedScript, setGeneratedScript] = useState<string | null>(() => 
    loadFromStorage('tubelens_generatedScript')
  );
  const [extractedTranscript, setExtractedTranscript] = useState<string | null>(() => 
    loadFromStorage('tubelens_extractedTranscript')
  );
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(() => {
    const saved = loadFromStorage('tubelens_selectedVideos');
    return saved ? new Set(saved) : new Set();
  });
  const [showTrendingTopics, setShowTrendingTopics] = useState(false);
  const [cachedTrendingData, setCachedTrendingData] = useState(() => 
    loadFromStorage('tubelens_cachedTrendingData')
  );
  const [viralPatternsData, setViralPatternsData] = useState<any>(() => 
    loadFromStorage('tubelens_viralPatternsData')
  );
  const [viralPatternsKeyword, setViralPatternsKeyword] = useState<string>(() => 
    loadFromStorage('tubelens_viralPatternsKeyword') || ""
  );
  const [hybridAnalysisData, setHybridAnalysisData] = useState<any>(() => 
    loadFromStorage('tubelens_hybridAnalysisData')
  );
  const [hybridAnalysisKeyword, setHybridAnalysisKeyword] = useState<string>(() => 
    loadFromStorage('tubelens_hybridAnalysisKeyword') || ""
  );
  const [channelViralData, setChannelViralData] = useState<any>(() => 
    loadFromStorage('tubelens_channelViralData')
  );
  const [shoppingChannelViralData, setShoppingChannelViralData] = useState<any>(() => 
    loadFromStorage('tubelens_shoppingChannelViralData')
  );
  const [titleAnalysis, setTitleAnalysis] = useState<any>(() => 
    loadFromStorage('tubelens_titleAnalysis')
  );
  const [thumbnailAnalysis, setThumbnailAnalysis] = useState<any>(() => 
    loadFromStorage('tubelens_thumbnailAnalysis')
  );
  const [popularTitles, setPopularTitles] = useState<any[]>(() => 
    loadFromStorage('tubelens_popularTitles') || []
  );
  const [contentRecommendations, setContentRecommendations] = useState<any[]>(() => 
    loadFromStorage('tubelens_contentRecommendations') || []
  );
  const [channelViralKeyword, setChannelViralKeyword] = useState<string>(() => 
    loadFromStorage('tubelens_channelViralKeyword') || ""
  );
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isViralPatternsModalOpen, setIsViralPatternsModalOpen] = useState(false);
  const [isHybridAnalysisModalOpen, setIsHybridAnalysisModalOpen] = useState(false);
  const [isChannelViralAnalysisModalOpen, setIsChannelViralAnalysisModalOpen] = useState(false);

  // Auto-save state to localStorage
  useEffect(() => {
    saveToStorage('tubelens_searchResults', searchResults);
  }, [searchResults]);

  useEffect(() => {
    saveToStorage('tubelens_filteredVideos', filteredVideos);
  }, [filteredVideos]);

  useEffect(() => {
    saveToStorage('tubelens_selectedVideo', selectedVideo);
  }, [selectedVideo]);

  useEffect(() => {
    saveToStorage('tubelens_aiAnalysis', aiAnalysis);
  }, [aiAnalysis]);

  useEffect(() => {
    saveToStorage('tubelens_generatedScript', generatedScript);
  }, [generatedScript]);

  useEffect(() => {
    saveToStorage('tubelens_extractedTranscript', extractedTranscript);
  }, [extractedTranscript]);

  useEffect(() => {
    saveToStorage('tubelens_selectedVideos', Array.from(selectedVideos));
  }, [selectedVideos]);

  useEffect(() => {
    saveToStorage('tubelens_cachedTrendingData', cachedTrendingData);
  }, [cachedTrendingData]);

  useEffect(() => {
    saveToStorage('tubelens_viralPatternsData', viralPatternsData);
  }, [viralPatternsData]);

  useEffect(() => {
    saveToStorage('tubelens_viralPatternsKeyword', viralPatternsKeyword);
  }, [viralPatternsKeyword]);

  useEffect(() => {
    saveToStorage('tubelens_hybridAnalysisData', hybridAnalysisData);
  }, [hybridAnalysisData]);

  useEffect(() => {
    saveToStorage('tubelens_hybridAnalysisKeyword', hybridAnalysisKeyword);
  }, [hybridAnalysisKeyword]);

  useEffect(() => {
    saveToStorage('tubelens_channelViralData', channelViralData);
  }, [channelViralData]);

  useEffect(() => {
    saveToStorage('tubelens_shoppingChannelViralData', shoppingChannelViralData);
  }, [shoppingChannelViralData]);

  useEffect(() => {
    saveToStorage('tubelens_titleAnalysis', titleAnalysis);
  }, [titleAnalysis]);

  useEffect(() => {
    saveToStorage('tubelens_thumbnailAnalysis', thumbnailAnalysis);
  }, [thumbnailAnalysis]);

  useEffect(() => {
    saveToStorage('tubelens_popularTitles', popularTitles);
  }, [popularTitles]);

  useEffect(() => {
    saveToStorage('tubelens_contentRecommendations', contentRecommendations);
  }, [contentRecommendations]);

  useEffect(() => {
    saveToStorage('tubelens_channelViralKeyword', channelViralKeyword);
  }, [channelViralKeyword]);

  // Show restore notification on page load
  useEffect(() => {
    const hasStoredData = loadFromStorage('tubelens_searchResults') || 
                         loadFromStorage('tubelens_filteredVideos')?.length > 0 ||
                         loadFromStorage('tubelens_viralPatternsData') ||
                         loadFromStorage('tubelens_channelViralData');
    
    if (hasStoredData) {
      toast({
        title: "데이터 복원됨",
        description: "이전 검색 결과와 분석 데이터가 자동으로 복원되었습니다.",
      });
    }
  }, []); // Only run on mount

  // Search videos mutation
  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => searchVideos(params),
    onSuccess: (data) => {
      setSearchResults(data);
      setFilteredVideos(data.videos);
      toast({
        title: "검색 완료",
        description: `${data.videos.length}개의 영상을 찾았습니다.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "검색 실패",
        description: error.message || "영상 검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // Great filter mutation
  const greatFilterMutation = useMutation({
    mutationFn: (videos: YouTubeVideo[]) => applyGreatFilter(videos),
    onSuccess: (data) => {
      setFilteredVideos(data.videos);
      toast({
        title: "필터 적용 완료",
        description: `Great!! 영상 ${data.videos.length}개를 찾았습니다.`
      });
    },
    onError: () => {
      toast({
        title: "필터 적용 실패",
        description: "Great!! 필터 적용 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // AI analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: (videoData: {
      videoId: string;
      title: string;
      description: string;
      tags: string[];
    }) => generateAIAnalysis(videoData),
    onSuccess: (data) => {
      setAiAnalysis(data);
      setIsAIModalOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "AI 분석 실패",
        description: error.message || "AI 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // Script generation mutation
  const scriptMutation = useMutation({
    mutationFn: (options: ScriptOptions) => generateScript(options),
    onSuccess: (data) => {
      setGeneratedScript(data.content);
      toast({
        title: "대본 생성 완료",
        description: "AI가 맞춤형 대본을 생성했습니다."
      });
    },
    onError: (error: any) => {
      toast({
        title: "대본 생성 실패",
        description: error.message || "대본 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // Transcript extraction mutation
  const transcriptMutation = useMutation({
    mutationFn: (videoId: string) => extractTranscript(videoId),
    onSuccess: (data) => {
      setExtractedTranscript(data.transcript);
      setIsTranscriptModalOpen(true);
      toast({
        title: "대본 추출 완료",
        description: "영상의 대본을 성공적으로 추출했습니다."
      });
    },
    onError: (error: any) => {
      toast({
        title: "대본 추출 실패",
        description: error.message || "대본 추출 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // Viral patterns analysis mutation
  const viralPatternsMutation = useMutation({
    mutationFn: async ({ keyword, excludeKeywords }: { keyword: string; excludeKeywords?: string }) => {
      const response = await fetch('/api/analyze-new-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, excludeKeywords })
      });
      if (!response.ok) throw new Error('분석 실패');
      return response.json();
    },
    onSuccess: (data) => {
      setViralPatternsData(data);
      setIsViralPatternsModalOpen(true);
      toast({
        title: "바이럴 패턴 분석 완료",
        description: `${data.summary.viralVideos}개의 바이럴 콘텐츠를 발견했습니다.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "분석 실패",
        description: error.message || "바이럴 패턴 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // Channel viral analysis mutation
  const channelViralMutation = useMutation({
    mutationFn: async (channelIds: string[]) => {
      const response = await fetch('/api/analyze-channels-viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelIds })
      });
      if (!response.ok) throw new Error('채널 분석 실패');
      return response.json();
    },
    onSuccess: (data) => {
      setViralPatternsData(data);
      setViralPatternsKeyword("선택된 채널");
      setIsViralPatternsModalOpen(true);
      toast({
        title: "채널 바이럴 분석 완료",
        description: `${data.summary.viralVideos}개의 바이럴 콘텐츠를 발견했습니다.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "채널 분석 실패",
        description: error.message || "채널 바이럴 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (params: SearchParams) => {
    setShowTrendingTopics(false);
    searchMutation.mutate(params);
  };

  const handleTrendingSearch = (keyword: string, ageGroup?: string) => {
    setShowTrendingTopics(false);
    const searchParams: SearchParams = {
      keyword,
      sortOrder: "relevance",
      publishTime: "week",
      videoDuration: "any",
      excludeKeywords: ""
    };
    searchMutation.mutate(searchParams);
  };

  const handleGreatFilter = () => {
    if (searchResults && searchResults.videos.length > 0) {
      greatFilterMutation.mutate(searchResults.videos);
    } else {
      toast({
        title: "필터 적용 불가",
        description: "먼저 영상을 검색해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleClearFilters = () => {
    if (searchResults) {
      setFilteredVideos(searchResults.videos);
    }
    setSelectedVideo(null);
    setAiAnalysis(null);
    setGeneratedScript(null);
    setExtractedTranscript(null);
    setSelectedVideos(new Set());
    setViralPatternsData(null);
    setHybridAnalysisData(null);
    setChannelViralData(null);
    setShoppingChannelViralData(null);
    setTitleAnalysis(null);
    setThumbnailAnalysis(null);
    setPopularTitles([]);
    setContentRecommendations([]);
    
    // Clear localStorage
    clearAllStorage();
    
    toast({
      title: "모든 데이터 초기화",
      description: "검색 결과와 분석 데이터가 모두 지워졌습니다."
    });
  };

  const handleAnalyzeVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    aiAnalysisMutation.mutate({
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      tags: video.tags
    });
  };

  const handleGenerateScript = (options: ScriptOptions) => {
    scriptMutation.mutate(options);
  };

  const handleExtractTranscript = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    transcriptMutation.mutate(video.videoId);
  };

  const handleChannelViralAnalysis = (channelIds: string[]) => {
    channelViralAnalysisMutation.mutate(channelIds);
  };

  const handleVideoSelect = (videoId: string, selected: boolean) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(videoId);
      } else {
        newSet.delete(videoId);
      }
      return newSet;
    });
  };

  const handleBatchProcess = (videos: YouTubeVideo[]) => {
    setIsBatchModalOpen(true);
  };

  const handleAnalyzeViralPatterns = (keyword: string, excludeKeywords?: string) => {
    if (!keyword.trim()) {
      toast({
        title: "키워드 입력 필요",
        description: "분석할 키워드를 먼저 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    setViralPatternsKeyword(keyword);
    viralPatternsMutation.mutate({ keyword, excludeKeywords });
  };

  // Hybrid Analysis mutation
  const hybridAnalysisMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await fetch("/api/hybrid-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });
      
      if (!response.ok) {
        throw new Error(`하이브리드 분석 실패: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setHybridAnalysisData(data);
      setIsHybridAnalysisModalOpen(true);
      toast({
        title: "하이브리드 분석 완료",
        description: `기존 vs 신규 채널 비교 분석이 완료되었습니다.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "하이브리드 분석 실패",
        description: error.message || "하이브리드 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleHybridAnalysis = (keyword: string) => {
    if (!keyword.trim()) {
      toast({
        title: "키워드 입력 필요",
        description: "분석할 키워드를 먼저 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    setHybridAnalysisKeyword(keyword);
    hybridAnalysisMutation.mutate(keyword);
  };

  // Channel viral analysis mutation
  const channelViralAnalysisMutation = useMutation({
    mutationFn: async (channelIds: string[]) => {
      const response = await fetch("/api/analyze-selected-channels-viral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelIds }),
      });
      
      if (!response.ok) {
        throw new Error(`채널 바이럴 분석 실패: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setChannelViralData(data.channelData || []);
      setShoppingChannelViralData(data.shoppingChannelData || []);
      setTitleAnalysis(data.titleAnalysis);
      setThumbnailAnalysis(data.thumbnailAnalysis);
      setPopularTitles(data.popularTitles || []);
      setContentRecommendations(data.contentRecommendations || []);
      setChannelViralKeyword("선택된 채널");
      setIsChannelViralAnalysisModalOpen(true);
      toast({
        title: "100만+ 조회수 바이럴 분석 완료",
        description: `${data.summary?.totalViralVideos || 0}개의 바이럴 영상을 발견했습니다.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "채널 바이럴 분석 실패",
        description: error.message || "채널 바이럴 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleSelectedChannelsViralAnalysis = (channelIds: string[]) => {
    if (channelIds.length === 0) {
      toast({
        title: "채널 선택 필요",
        description: "분석할 채널을 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    channelViralAnalysisMutation.mutate(channelIds);
  };

  const handleOpenAIRecommendations = () => {
    if (!selectedVideo) {
      toast({
        title: "영상을 선택해주세요",
        description: "AI 분석을 위해 먼저 영상을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    setIsAIModalOpen(true);
  };

  const handleScriptModalOpen = () => {
    setIsAIModalOpen(false);
    setIsScriptModalOpen(true);
  };

  const handleExportData = () => {
    if (filteredVideos.length === 0) {
      toast({
        title: "내보낼 데이터가 없습니다",
        description: "먼저 영상을 검색해주세요.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      "제목,채널,조회수,좋아요,구독자수,CII,참여율,성과등급",
      ...filteredVideos.map(video => 
        `"${video.title}","${video.channelTitle}",${video.viewCount},${video.likeCount},${video.subscriberCount},${video.cii.toFixed(1)},${video.engagementRate.toFixed(1)}%,${video.performanceLevel}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tubelens_analysis.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "내보내기 완료",
      description: "분석 결과가 CSV 파일로 저장되었습니다."
    });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-md shadow-lg border-2 border-white text-xl font-bold lg:hidden hover:bg-blue-700 transition-colors"
        style={{ 
          minWidth: '48px', 
          minHeight: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar - Only show on desktop or when mobile menu is open */}
      {(!isMobile || isMobileMenuOpen) && (
        <div 
          className={`
            w-80 
            ${isMobile 
              ? 'fixed inset-y-0 left-0 z-40 shadow-xl'
              : 'relative shadow-none'
            }
          `}
        >
        <Sidebar
          onSearch={handleSearch}
          onGreatFilter={handleGreatFilter}
          onClearFilters={handleClearFilters}
          onShowTrending={() => setShowTrendingTopics(true)}
          onAnalyzeViralPatterns={handleAnalyzeViralPatterns}
          onHybridAnalysis={handleHybridAnalysis}
          isLoading={searchMutation.isPending || viralPatternsMutation.isPending || hybridAnalysisMutation.isPending}
          searchResults={searchResults?.summary}
        />
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {/* Header Bar */}
        <div className={`bg-white border-b border-gray-200 px-4 lg:px-6 py-4 ${isMobile ? 'pt-20' : 'pt-4'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTrendingTopics(true)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  ← 트렌딩 분석
                </Button>
                <Link href="/settings">
                  <Button variant="outline" className="flex items-center gap-2" size="sm">
                    <Settings className="h-4 w-4" />
                    API 설정
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchResults(null);
                    setFilteredVideos([]);
                    setSelectedVideos(new Set());
                    setSelectedVideo(null);
                    setAiAnalysis(null);
                    setGeneratedScript(null);
                    setExtractedTranscript(null);
                  }}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  🏠 처음으로
                </Button>
              </div>
              <div className="lg:block">
                <QuotaStatus />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">영상 분석 결과</h2>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">키워드별 고성과 영상을 발견하고 AI 분석을 받아보세요</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleExportData}
                variant="outline"
                disabled={filteredVideos.length === 0}
                size="sm"
              >
                <Download className="mr-1 lg:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">내보내기</span>
                <span className="sm:hidden">📊</span>
              </Button>
              <Button
                onClick={handleOpenAIRecommendations}
                className="info-blue hover:bg-blue-600 text-white"
                disabled={!selectedVideo}
                size="sm"
              >
                <Bot className="mr-1 lg:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">AI 추천</span>
                <span className="sm:hidden">🤖</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {showTrendingTopics ? (
            <div>
              <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTrendingTopics(false)}
                  className="flex items-center gap-2 w-fit"
                  size="sm"
                >
                  ← 검색 결과로 돌아가기
                </Button>
                <div className="text-xs text-gray-500">
                  💡 팁: 이 버튼은 무료입니다. 사이드바 "인기 주제 분석"은 새로운 API 호출로 비용이 발생합니다.
                </div>
              </div>
              <TrendingTopics onSearch={handleTrendingSearch} />
            </div>
          ) : filteredVideos.length > 0 ? (
            <VideoTable
              videos={filteredVideos}
              onAnalyzeVideo={handleAnalyzeVideo}
              onExtractTranscript={handleExtractTranscript}
              onBatchProcess={handleBatchProcess}
              onChannelViralAnalysis={handleChannelViralAnalysis}
              onSelectedChannelsViralAnalysis={handleSelectedChannelsViralAnalysis}
              isLoading={searchMutation.isPending}
              selectedVideos={selectedVideos}
              onVideoSelect={handleVideoSelect}
            />
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  YouTube 영상을 검색해보세요
                </h3>
                <p className="text-gray-500 mb-4">
                  <span className="lg:hidden">햄버거 메뉴(☰)를 눌러 검색 옵션을 확인하세요</span>
                  <span className="hidden lg:inline">좌측 검색창에서 키워드를 입력하여 고성과 영상을 찾아보세요</span>
                </p>
                <Button 
                  onClick={() => setShowTrendingTopics(true)}
                  variant="outline"
                  className="mt-4"
                  size="sm"
                >
                  이번주 인기 주제 보기
                </Button>
              </div>
              <OfflineFeatures />
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendation Modal */}
      <AIRecommendationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerateScript={handleScriptModalOpen}
        analysis={aiAnalysis}
        isLoading={aiAnalysisMutation.isPending}
      />

      {/* Script Generation Modal */}
      <ScriptGenerationModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        onGenerateScript={handleGenerateScript}
        generatedScript={generatedScript}
        isLoading={scriptMutation.isPending}
      />

      {/* Transcript Modal */}
      <TranscriptModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        transcript={extractedTranscript}
        videoTitle={selectedVideo?.title || ""}
        isLoading={transcriptMutation.isPending}
      />

      {/* Batch Analysis Modal */}
      <BatchAnalysisModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        videos={filteredVideos.filter(video => selectedVideos.has(video.videoId))}
        onStartAnalysis={() => {}}
      />

      {/* Viral Patterns Modal */}
      <ViralPatternsModal
        isOpen={isViralPatternsModalOpen}
        onClose={() => setIsViralPatternsModalOpen(false)}
        keyword={viralPatternsKeyword}
        data={viralPatternsData}
        isLoading={viralPatternsMutation.isPending}
        onChannelViralAnalysis={handleChannelViralAnalysis}
        isChannelViralAnalysisLoading={channelViralAnalysisMutation.isPending}
      />

      {/* Hybrid Analysis Modal */}
      <HybridAnalysisModal
        isOpen={isHybridAnalysisModalOpen}
        onClose={() => setIsHybridAnalysisModalOpen(false)}
        keyword={hybridAnalysisKeyword}
        data={hybridAnalysisData}
        isLoading={hybridAnalysisMutation.isPending}
        onChannelViralAnalysis={handleChannelViralAnalysis}
      />

      {/* Channel Viral Analysis Modal */}
      <ChannelViralAnalysisModal
        isOpen={isChannelViralAnalysisModalOpen}
        onClose={() => setIsChannelViralAnalysisModalOpen(false)}
        channelData={channelViralData}
        shoppingChannelData={shoppingChannelViralData}
        titleAnalysis={titleAnalysis}
        thumbnailAnalysis={thumbnailAnalysis}
        popularTitles={popularTitles}
        contentRecommendations={contentRecommendations}
        isLoading={channelViralAnalysisMutation.isPending}
        keyword={channelViralKeyword}
      />

      {/* Trending Topics Modal */}
      {showTrendingTopics && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <TrendingTopics 
            onSearch={(keyword: string) => {
              setShowTrendingTopics(false);
              const searchParams = {
                keyword,
                sortOrder: "viewCount" as const,
                publishTime: "month" as const,
                videoDuration: "any" as const,
              };
              handleSearch(searchParams);
            }} 
          />
        </div>
      )}
    </div>
  );
}
