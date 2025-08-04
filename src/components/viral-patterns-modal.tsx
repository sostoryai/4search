import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatKoreanNumber, formatDate } from "../lib/formatters";
import { ExternalLink, Users, Calendar, TrendingUp, Eye } from "lucide-react";

interface ViralVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  channelCreatedAt: Date;
  viewCount: number;
  subscriberCount: number;
  thumbnailUrl: string;
}

interface ViralPattern {
  theme: string;
  pattern: string;
  videos: ViralVideo[];
  keywords: string[];
  avgViews: number;
  successFactors?: string[];
  engagementRate?: string;
  channelDiversity?: number;
}

interface ChannelAnalysis {
  channelTitle: string;
  channelCreatedAt: Date;
  subscriberCount: number;
  viralVideoCount: number;
  maxViews: number;
  viralVideos?: Array<{
    title: string;
    viewCount: number;
    videoId: string;
    publishedAt: Date;
  }>;
}

interface ViralPatternsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  data: {
    viralPatterns: ViralPattern[];
    channelAnalysis: ChannelAnalysis[];
    titleInsights?: {
      topKeywords: Array<{ word: string; count: number; percentage: number }>;
      topPhrases: Array<{ phrase: string; count: number; percentage: number }>;
      patterns: any;
      insights: string[];
      recommendations: string[];
      topPerformingTitles: Array<{ title: string; viewCount: number; channelTitle: string }>;
    };
    summary: {
      totalVideos: number;
      newChannels: number;
      viralVideos: number;
    };
  } | null;
  isLoading: boolean;
  onChannelViralAnalysis?: (channelIds: string[]) => void;
  isChannelViralAnalysisLoading?: boolean;
}

export function ViralPatternsModal({ 
  isOpen, 
  onClose, 
  keyword, 
  data, 
  isLoading,
  onChannelViralAnalysis,
  isChannelViralAnalysisLoading = false
}: ViralPatternsModalProps) {
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const handleChannelSelect = (channelTitle: string, selected: boolean) => {
    setSelectedChannels(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(channelTitle);
      } else {
        newSet.delete(channelTitle);
      }
      return newSet;
    });
  };

  const handleAnalyzeSelected = () => {
    if (onChannelViralAnalysis && selectedChannels.size > 0 && data?.channelAnalysis) {
      // Extract channel IDs from selected channel titles
      const selectedChannelIds = data.channelAnalysis
        .filter(channel => selectedChannels.has(channel.channelTitle))
        .map(channel => {
          // Find channel ID from viral patterns data
          const foundVideo = data.viralPatterns
            .flatMap(pattern => pattern.videos)
            .find(video => video.channelTitle === channel.channelTitle);
          return foundVideo?.channelId;
        })
        .filter(Boolean) as string[];
      
      if (selectedChannelIds.length > 0) {
        onChannelViralAnalysis(selectedChannelIds);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            바이럴 패턴 분석: "{keyword}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4 mx-auto"></div>
              <p className="text-gray-500">신규 채널의 바이럴 콘텐츠를 분석중입니다...</p>
              <p className="text-sm text-gray-400 mt-1">최근 3개월 내 개설 채널 + 100만 조회수 이상</p>
            </div>
          </div>
        ) : !data ? (
          <div className="text-center py-8">
            <p className="text-gray-500">분석 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.summary.totalVideos}</div>
                <div className="text-sm text-gray-600">전체 쇼츠 영상</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.summary.newChannels}</div>
                <div className="text-sm text-gray-600">신규 채널 (3개월)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{data.summary.viralVideos}</div>
                <div className="text-sm text-gray-600">바이럴 영상 (100만+)</div>
              </div>
            </div>

            {data.summary.viralVideos === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">바이럴 콘텐츠가 없습니다</p>
                  <p className="text-sm">최근 3개월 내 개설된 채널에서 100만 조회수 이상의 "{keyword}" 쇼츠가 없습니다.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Viral Patterns */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    바이럴 콘텐츠 패턴 ({data.viralPatterns.length}개)
                  </h3>
                  <div className="space-y-4">
                    {data.viralPatterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-2">{pattern.theme}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">{pattern.pattern}</p>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {pattern.videos.length}개 영상
                              </Badge>
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                평균 {(pattern.avgViews / 1000000).toFixed(1)}M 조회수
                              </Badge>
                            </div>
                            {pattern.keywords && pattern.keywords.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">🏷️ 핵심 키워드:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {pattern.keywords.map((keyword, keyIndex) => (
                                    <span 
                                      key={keyIndex}
                                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium border border-purple-200"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {pattern.successFactors && pattern.successFactors.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">🎯 성공 요인:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {pattern.successFactors.map((factor, factorIndex) => (
                                    <span 
                                      key={factorIndex}
                                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200"
                                    >
                                      {factor}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {(pattern.engagementRate || pattern.channelDiversity) && (
                              <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                                {pattern.engagementRate && (
                                  <span>📊 참여율: {pattern.engagementRate}%</span>
                                )}
                                {pattern.channelDiversity && (
                                  <span>📺 채널 다양성: {pattern.channelDiversity}개</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">📹 바이럴 영상 목록 (조회수 순):</h5>
                          <div className="grid gap-3 max-h-96 overflow-y-auto">
                            {pattern.videos
                              .sort((a, b) => b.viewCount - a.viewCount)
                              .map((video, videoIndex) => (
                              <div key={video.videoId} className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="relative">
                                  <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title}
                                    className="w-24 h-18 object-cover rounded-md"
                                  />
                                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold min-w-[28px] text-center">
                                    #{videoIndex + 1}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 mb-1">{video.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    <Users className="h-3 w-3" />
                                    <span>{video.channelTitle}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(video.channelCreatedAt)}</span>
                                  </div>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
                                      🔥 {(video.viewCount / 1000000).toFixed(1)}M 조회수
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      구독자 {(video.subscriberCount / 10000).toFixed(0)}만
                                    </span>
                                  </div>
                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    영상 보기
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channel Analysis */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      성공 신규 채널 분석
                    </h3>
                    {onChannelViralAnalysis && (
                      <Button 
                        onClick={handleAnalyzeSelected}
                        disabled={selectedChannels.size === 0 || isChannelViralAnalysisLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        {isChannelViralAnalysisLoading ? "분석 중..." : `선택된 채널 100만+ 조회수 분석 (${selectedChannels.size})`}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.channelAnalysis.map((channel, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          {onChannelViralAnalysis && (
                            <Checkbox
                              checked={selectedChannels.has(channel.channelTitle)}
                              onCheckedChange={(checked) => 
                                handleChannelSelect(channel.channelTitle, !!checked)
                              }
                            />
                          )}
                          <h4 className="font-medium text-gray-900 flex-1">{channel.channelTitle}</h4>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>개설일:</span>
                            <span>{formatDate(channel.channelCreatedAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>구독자:</span>
                            <span>{formatKoreanNumber(channel.subscriberCount)}명</span>
                          </div>
                          <div className="flex justify-between">
                            <span>바이럴 영상:</span>
                            <span className="font-medium text-blue-600">{channel.viralVideoCount}개</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최고 조회수:</span>
                            <span className="font-medium text-red-600">
                              {formatKoreanNumber(channel.maxViews)}회
                            </span>
                          </div>
                        </div>
                        
                        {/* Viral Videos List */}
                        {channel.viralVideos && channel.viralVideos.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <h5 className="text-sm font-semibold text-gray-800 mb-2">💎 100만+ 조회수 영상:</h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {channel.viralVideos.map((video, videoIndex) => (
                                <div key={videoIndex} className="bg-gray-50 rounded p-2 text-xs">
                                  <div className="font-medium text-gray-900 truncate mb-1">
                                    {video.title}
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>👁️ {formatKoreanNumber(video.viewCount)}회</span>
                                    <a 
                                      href={`https://youtube.com/watch?v=${video.videoId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      보기
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Title Insights Analysis */}
            {data.titleInsights && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 제목 분석 인사이트</h3>
                
                {/* Top Keywords */}
                {data.titleInsights.topKeywords && data.titleInsights.topKeywords.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">🔥 인기 키워드</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.titleInsights.topKeywords.slice(0, 10).map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
                        >
                          {keyword.word} ({keyword.count}회, {keyword.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Phrases */}
                {data.titleInsights.topPhrases && data.titleInsights.topPhrases.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">📝 효과적인 문구</h4>
                    <div className="space-y-2">
                      {data.titleInsights.topPhrases.slice(0, 5).map((phrase, index) => (
                        <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                          <span className="font-medium">"{phrase.phrase}"</span>
                          <span className="text-gray-600 ml-2">({phrase.count}회 사용, {phrase.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights & Recommendations */}
                {data.titleInsights.insights && data.titleInsights.insights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">💡 핵심 인사이트</h4>
                    <div className="space-y-2">
                      {data.titleInsights.insights.map((insight, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <p className="text-sm text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {data.titleInsights.recommendations && data.titleInsights.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">🚀 콘텐츠 제작 권장사항</h4>
                    <div className="space-y-2">
                      {data.titleInsights.recommendations.map((rec, index) => (
                        <div key={index} className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Performing Titles */}
                {data.titleInsights.topPerformingTitles && data.titleInsights.topPerformingTitles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">🏆 최고 성과 제목 예시</h4>
                    <div className="space-y-2">
                      {data.titleInsights.topPerformingTitles.map((title, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm font-medium text-gray-900 mb-1">{title.title}</p>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{title.channelTitle}</span>
                            <span>{(title.viewCount / 1000000).toFixed(1)}M 조회수</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                닫기
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}