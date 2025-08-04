import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Calendar, BarChart3, Users, Hash, Search } from "lucide-react";

interface TrendingData {
  summary: {
    totalVideos: number;
    analysisDate: string;
    period: string;
  };
  topKeywords: Array<{ keyword: string; count: number }>;
  topChannels: Array<{ channel: string; count: number }>;
  categoryStats: Array<{
    category: string;
    videoCount: number;
    totalViews: number;
    averageViews: number;
  }>;
  insights: string[];
  ageGroups?: {
    [key: string]: {
      keywords: string[];
      videos: any[];
      score: number;
    };
  };
}

export function TrendingTopics({ onSearch }: { onSearch: (keyword: string, ageGroup?: string) => void }) {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [customKeyword, setCustomKeyword] = useState<string>("");

  const handleCustomSearch = () => {
    if (customKeyword.trim()) {
      onSearch(customKeyword.trim(), selectedAgeGroup || undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSearch();
    }
  };

  const fetchTrendingTopics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/trending-topics');
      if (!response.ok) {
        throw new Error('Failed to fetch trending topics');
      }
      
      const data = await response.json();
      setTrendingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const ageGroups = ['10대', '20대', '30대', '40대', '50대', '60대', '70대'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            이번주 인기 주제 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            이번주 인기 주제 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-600 mb-4">데이터를 불러오는데 실패했습니다</p>
            <Button onClick={fetchTrendingTopics} variant="outline">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendingData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Custom Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            키워드 검색
          </CardTitle>
          <CardDescription>
            원하는 키워드를 직접 입력하여 YouTube 영상을 검색해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="검색할 키워드를 입력하세요 (예: 요리, 운동, 게임)"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleCustomSearch}
              disabled={!customKeyword.trim()}
              className="px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            이번주 인기 주제 분석
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(trendingData.summary.analysisDate).toLocaleDateString('ko-KR')} 기준
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Age Group Filter Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">연령대별 인기 순위</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedAgeGroup === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgeGroup(null)}
                className="text-xs"
              >
                전체
              </Button>
              {ageGroups.map((ageGroup) => (
                <Button
                  key={ageGroup}
                  variant={selectedAgeGroup === ageGroup ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgeGroup(ageGroup)}
                  className="text-xs"
                >
                  {ageGroup}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{trendingData.summary.totalVideos}</div>
              <div className="text-sm text-gray-600">분석된 영상</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{trendingData.topKeywords.length}</div>
              <div className="text-sm text-gray-600">인기 키워드</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{trendingData.topChannels.length}</div>
              <div className="text-sm text-gray-600">활발한 채널</div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              주요 인사이트
            </h4>
            <ul className="space-y-1">
              {trendingData.insights.map((insight, index) => (
                <li key={index} className="text-sm">{insight}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Age Group Content or Top Keywords */}
      {selectedAgeGroup && trendingData.ageGroups && trendingData.ageGroups[selectedAgeGroup] ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedAgeGroup} 맞춤 콘텐츠
            </CardTitle>
            <CardDescription>
              {selectedAgeGroup} 연령층이 선호하는 영상과 키워드 분석
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Age-specific search */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">{selectedAgeGroup} 맞춤 키워드 검색</h4>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder={`${selectedAgeGroup}가 관심 있을 키워드를 입력하세요`}
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCustomSearch}
                    disabled={!customKeyword.trim()}
                    size="sm"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    검색
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">추천 키워드</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {trendingData.ageGroups[selectedAgeGroup].keywords.slice(0, 12).map((keyword, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onSearch(keyword, selectedAgeGroup || undefined)}
                      className="text-xs h-auto p-2"
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">
                  추천 영상 ({trendingData.ageGroups[selectedAgeGroup].videos.length}개)
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {trendingData.ageGroups[selectedAgeGroup].videos.slice(0, 8).map((video, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="font-medium text-sm mb-1 line-clamp-2">{video.title}</div>
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span>{video.channelTitle}</span>
                        <span>{video.viewCount?.toLocaleString()} 조회수</span>
                      </div>
                      {video.relevanceScore && (
                        <div className="text-xs text-blue-600 mt-1">
                          관련도 점수: {video.relevanceScore}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              인기 키워드 순위
            </CardTitle>
            <CardDescription>
              가장 많이 언급된 키워드들 (클릭하면 검색됩니다)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {trendingData.topKeywords.map((item, index) => (
                <Button
                  key={item.keyword}
                  variant="outline"
                  size="sm"
                  onClick={() => onSearch(item.keyword)}
                  className="justify-between h-auto p-3"
                >
                  <span className="font-medium">{item.keyword}</span>
                  <Badge variant="secondary" className="ml-2">
                    {item.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            활발한 채널 순위
          </CardTitle>
          <CardDescription>
            가장 많은 영상을 업로드한 채널들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingData.topChannels.slice(0, 8).map((item, index) => (
              <div key={item.channel} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <span className="font-medium truncate">{item.channel}</span>
                </div>
                <Badge variant="outline">
                  {item.count}개 영상
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            카테고리별 성과
          </CardTitle>
          <CardDescription>
            카테고리별 총 조회수와 평균 조회수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingData.categoryStats.map((stat, index) => (
              <div key={stat.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{stat.category}</div>
                    <div className="text-sm text-gray-600">{stat.videoCount}개 영상</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stat.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">총 조회수</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}