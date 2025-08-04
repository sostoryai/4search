import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, Image, Hash, BarChart3, Users } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface ViralVideo {
  videoId: string;
  title: string;
  viewCount: number;
  publishedAt: string;
  thumbnailUrl: string;
  description: string;
}

interface ChannelViralData {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  totalViews: number;
  viralVideos: ViralVideo[];
  viralVideoCount: number;
  avgViewsPerViralVideo: number;
}

interface TitleAnalysis {
  commonWords: Array<{ word: string; count: number; percentage: number }>;
  commonPhrases: Array<{ phrase: string; count: number; percentage: number }>;
  titlePatterns: {
    hasNumbers: number;
    hasQuestions: number;
    hasExclamations: number;
    hasEmojis: number;
    avgLength: number;
  };
  insights: string[];
  recommendations: string[];
}

interface ThumbnailAnalysis {
  colorPatterns: Array<{ color: string; usage: number; percentage: number }>;
  visualElements: Array<{ element: string; frequency: number; description: string }>;
  designTrends: Array<{ trend: string; impact: string; examples: string[] }>;
  insights: string[];
}

interface PopularTitleSuggestion {
  title: string;
  reason: string;
  pattern: string;
  targetViews: string;
}

interface ContentRecommendation {
  topic: string;
  title: string;
  description: string;
  targetAudience: string;
  expectedViews: string;
  thumbnailTips: string;
  contentStructure: string;
  trendingElements: string[];
}

interface ChannelViralAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelData: ChannelViralData[] | null;
  shoppingChannelData: ChannelViralData[] | null;
  titleAnalysis: TitleAnalysis | null;
  thumbnailAnalysis: ThumbnailAnalysis | null;
  popularTitles: PopularTitleSuggestion[] | null;
  contentRecommendations: ContentRecommendation[] | null;
  isLoading: boolean;
  keyword: string;
}

export function ChannelViralAnalysisModal({ 
  isOpen, 
  onClose, 
  channelData, 
  shoppingChannelData,
  titleAnalysis,
  thumbnailAnalysis,
  popularTitles,
  contentRecommendations,
  isLoading,
  keyword
}: ChannelViralAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState("channels");

  const totalViralVideos = channelData?.reduce((sum, channel) => sum + channel.viralVideoCount, 0) || 0;
  const totalChannels = channelData?.length || 0;
  const totalShoppingVideos = shoppingChannelData?.reduce((sum, channel) => sum + channel.viralVideoCount, 0) || 0;
  const totalShoppingChannels = shoppingChannelData?.length || 0;

  // Debug logging
  console.log("Modal data:", { channelData, shoppingChannelData, totalChannels, totalShoppingChannels, totalViralVideos, totalShoppingVideos });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            채널별 100만+ 조회수 바이럴 분석: "{keyword}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">선택된 채널의 모든 영상을 분석 중...</p>
              <p className="text-sm text-gray-500 mt-2">100만 조회수 이상 영상을 추출하고 있습니다</p>
            </div>
          </div>
        ) : channelData !== null || shoppingChannelData !== null ? (
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalChannels}</div>
                  <div className="text-sm text-gray-600">콘텐츠 채널</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{totalShoppingChannels}</div>
                  <div className="text-sm text-gray-600">쇼핑 채널</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{totalViralVideos + totalShoppingVideos}</div>
                  <div className="text-sm text-gray-600">총 바이럴 영상</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(totalChannels + totalShoppingChannels) > 0 ? Math.round((totalViralVideos + totalShoppingVideos) / (totalChannels + totalShoppingChannels)) : 0}
                  </div>
                  <div className="text-sm text-gray-600">채널당 평균 바이럴 영상</div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="channels">콘텐츠 채널</TabsTrigger>
                <TabsTrigger value="shopping">쇼핑 채널</TabsTrigger>
                <TabsTrigger value="titles">제목 분석</TabsTrigger>
                <TabsTrigger value="thumbnails">썸네일 분석</TabsTrigger>
                <TabsTrigger value="suggestions">제목 추천</TabsTrigger>
                <TabsTrigger value="content">콘텐츠 추천</TabsTrigger>
                <TabsTrigger value="insights">종합 인사이트</TabsTrigger>
              </TabsList>

              {/* Content Channels */}
              <TabsContent value="channels" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">콘텐츠 창작 채널 ({totalChannels}개)</h3>
                  <p className="text-sm text-gray-600">순수 콘텐츠 제작에 집중하는 채널들의 바이럴 영상 분석</p>
                </div>
                {channelData?.map((channel, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span>{channel.channelTitle}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{formatNumber(channel.subscriberCount)} 구독자</span>
                          <span>{channel.viralVideoCount}개 바이럴 영상</span>
                          <span>평균 {formatNumber(channel.avgViewsPerViralVideo)} 조회수</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {channel.viralVideos.slice(0, 10).map((video, videoIndex) => (
                          <div key={videoIndex} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title}
                              className="w-32 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1 line-clamp-2">{video.title}</h4>
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {formatNumber(video.viewCount)} 조회수
                                </span>
                                <span>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {channel.viralVideos.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            +{channel.viralVideos.length - 10}개 더 보기
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Shopping Channels */}
              <TabsContent value="shopping" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">쇼핑 채널 ({totalShoppingChannels}개)</h3>
                  <p className="text-sm text-gray-600">제품 리뷰, 언박싱, 쇼핑 관련 콘텐츠 전문 채널들의 바이럴 영상 분석</p>
                </div>
                {shoppingChannelData && shoppingChannelData.length > 0 ? (
                  shoppingChannelData.map((channel, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-600" />
                            <span>{channel.channelTitle}</span>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">쇼핑</Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{formatNumber(channel.subscriberCount)} 구독자</span>
                            <span>{channel.viralVideoCount}개 바이럴 영상</span>
                            <span>평균 {formatNumber(channel.avgViewsPerViralVideo)} 조회수</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {channel.viralVideos.slice(0, 10).map((video, videoIndex) => (
                            <div key={videoIndex} className="flex gap-3 p-3 bg-orange-50 rounded-lg">
                              <img 
                                src={video.thumbnailUrl} 
                                alt={video.title}
                                className="w-32 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-2 line-clamp-2">{video.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {formatNumber(video.viewCount)} 조회수
                                  </span>
                                  <span>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {channel.viralVideos.length > 10 && (
                            <div className="text-center text-sm text-gray-500">
                              +{channel.viralVideos.length - 10}개 더 보기
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Users className="h-12 w-12 mx-auto mb-3" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">쇼핑 채널 없음</h3>
                      <p className="text-sm text-gray-500">
                        이 키워드로는 쇼핑 관련 바이럴 채널이 발견되지 않았습니다.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Title Analysis */}
              <TabsContent value="titles" className="space-y-6">
                {titleAnalysis && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Common Words */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Hash className="h-5 w-5 text-green-600" />
                            자주 사용되는 키워드
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {titleAnalysis.commonWords.slice(0, 15).map((word, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm font-medium">"{word.word}"</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">{word.count}회</span>
                                  <Badge variant="outline">{word.percentage.toFixed(1)}%</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Common Phrases */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            반복되는 문구 패턴
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {titleAnalysis.commonPhrases.slice(0, 10).map((phrase, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm font-medium">"{phrase.phrase}"</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">{phrase.count}회</span>
                                  <Badge variant="outline">{phrase.percentage.toFixed(1)}%</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Title Patterns */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          제목 패턴 분석
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{titleAnalysis.titlePatterns.hasNumbers}개</div>
                            <div className="text-xs text-gray-600">숫자 포함 제목</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">{titleAnalysis.titlePatterns.hasQuestions}개</div>
                            <div className="text-xs text-gray-600">질문형 제목</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded">
                            <div className="text-lg font-bold text-red-600">{titleAnalysis.titlePatterns.hasExclamations}개</div>
                            <div className="text-xs text-gray-600">느낌표 사용</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded">
                            <div className="text-lg font-bold text-yellow-600">{titleAnalysis.titlePatterns.hasEmojis}개</div>
                            <div className="text-xs text-gray-600">이모지 포함</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="text-lg font-bold text-purple-600">{Math.round(titleAnalysis.titlePatterns.avgLength)}자</div>
                            <div className="text-xs text-gray-600">평균 제목 길이</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Title Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle>제목 분석 인사이트</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {titleAnalysis.insights.map((insight, index) => (
                            <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                              <p className="text-sm">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Thumbnail Analysis */}
              <TabsContent value="thumbnails" className="space-y-6">
                {thumbnailAnalysis && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Color Patterns */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Image className="h-5 w-5 text-pink-600" />
                            주요 색상 패턴
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {thumbnailAnalysis.colorPatterns.map((color, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-6 h-6 rounded border"
                                    style={{ backgroundColor: color.color }}
                                  ></div>
                                  <span className="text-sm font-medium">{color.color}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">{color.usage}회</span>
                                  <Badge variant="outline">{color.percentage.toFixed(1)}%</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Visual Elements */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                            썸네일 요소 분석
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {thumbnailAnalysis.visualElements.map((element, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-sm">{element.element}</span>
                                  <Badge variant="secondary">{element.frequency}회</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{element.description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Design Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle>썸네일 디자인 트렌드</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {thumbnailAnalysis.designTrends.map((trend, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{trend.trend}</h4>
                                <Badge variant="outline">{trend.impact}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{trend.examples.join(", ")}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Title Suggestions Tab */}
              <TabsContent value="suggestions" className="space-y-6">
                {popularTitles && popularTitles.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        AI 추천 인기 제목 10선
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        바이럴 영상 분석 결과를 바탕으로 생성된 인기 예상 제목들입니다
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {popularTitles.map((suggestion, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-lg text-blue-700">
                                {index + 1}. {suggestion.title}
                              </h4>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {suggestion.targetViews}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {suggestion.pattern}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">제목 추천을 생성 중입니다...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Content Recommendations Tab */}
              <TabsContent value="content" className="space-y-6">
                {contentRecommendations && contentRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {contentRecommendations.map((recommendation, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-purple-600" />
                              <span>{recommendation.topic}</span>
                            </div>
                            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {recommendation.expectedViews}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">추천 제목</h4>
                            <p className="text-lg font-medium bg-green-50 p-3 rounded border-l-4 border-green-400">
                              {recommendation.title}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">콘텐츠 설명</h4>
                            <p className="text-sm text-gray-700">{recommendation.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-orange-700 mb-2">타겟 관객</h4>
                              <p className="text-sm bg-orange-50 p-2 rounded">{recommendation.targetAudience}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-red-700 mb-2">썸네일 팁</h4>
                              <p className="text-sm bg-red-50 p-2 rounded">{recommendation.thumbnailTips}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-indigo-700 mb-2">콘텐츠 구성</h4>
                            <p className="text-sm bg-indigo-50 p-3 rounded">{recommendation.contentStructure}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-pink-700 mb-2">트렌드 요소</h4>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.trendingElements.map((element, elementIndex) => (
                                <span 
                                  key={elementIndex}
                                  className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs"
                                >
                                  {element}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">콘텐츠 추천을 생성 중입니다...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Comprehensive Insights */}
              <TabsContent value="insights" className="space-y-6">
                <div className="grid gap-6">
                  {titleAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          제목 최적화 권장사항
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {titleAnalysis.recommendations.map((recommendation, index) => (
                            <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                              <p className="text-sm">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {thumbnailAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5 text-purple-600" />
                          썸네일 전략 인사이트
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {thumbnailAnalysis.insights.map((insight, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                              <p className="text-sm">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Success Formula Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-red-600" />
                        100만 조회수 성공 공식
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">핵심 성공 요인</h4>
                        <div className="space-y-2 text-sm">
                          <p>• <strong>제목:</strong> {titleAnalysis?.commonWords.slice(0, 3).map(w => w.word).join(", ")} 등 핵심 키워드 활용</p>
                          <p>• <strong>패턴:</strong> 평균 {titleAnalysis?.titlePatterns.avgLength}자 길이, 숫자와 질문형 제목 효과적</p>
                          <p>• <strong>썸네일:</strong> {thumbnailAnalysis?.colorPatterns.slice(0, 2).map(c => c.color).join(", ")} 계열 색상 선호</p>
                          <p>• <strong>콘텐츠:</strong> 채널당 평균 {Math.round(totalViralVideos / totalChannels)}개의 100만+ 조회수 영상 보유</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">바이럴 분석 결과가 없습니다.</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}