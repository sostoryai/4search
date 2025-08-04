import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, TrendingDown, Lightbulb, Target, BarChart3, Eye } from "lucide-react";

interface HybridAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  data: {
    establishedChannels: any[];
    newChannels: any[];
    comparison: any;
    summary: any;
  } | null;
  isLoading: boolean;
  onChannelViralAnalysis?: (channelIds: string[]) => void;
}

export function HybridAnalysisModal({ 
  isOpen, 
  onClose, 
  keyword, 
  data, 
  isLoading,
  onChannelViralAnalysis
}: HybridAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState("comparison");
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const handleChannelSelect = (channelId: string, selected: boolean) => {
    setSelectedChannels(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(channelId);
      } else {
        newSet.delete(channelId);
      }
      return newSet;
    });
  };

  const handleAnalyzeSelected = () => {
    if (onChannelViralAnalysis && selectedChannels.size > 0) {
      onChannelViralAnalysis(Array.from(selectedChannels));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            하이브리드 채널 분석: "{keyword}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">기존 vs 신규 채널 비교 분석 중...</p>
            </div>
          </div>
        ) : data ? (
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comparison">비교 분석</TabsTrigger>
                <TabsTrigger value="established">기존 성공 채널</TabsTrigger>
                <TabsTrigger value="new">신규 급성장 채널</TabsTrigger>
                <TabsTrigger value="insights">전략적 인사이트</TabsTrigger>
              </TabsList>

              {/* Comparison Analysis */}
              <TabsContent value="comparison" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Established Patterns */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        기존 성공 채널 패턴
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.comparison?.establishedPatterns && (
                        <>
                          <div>
                            <h4 className="font-medium mb-2">주요 키워드</h4>
                            <div className="flex flex-wrap gap-2">
                              {data.comparison.establishedPatterns.keywords?.map((keyword: string, index: number) => (
                                <Badge key={index} variant="secondary">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">제목 패턴</h4>
                            <ul className="space-y-1">
                              {data.comparison.establishedPatterns.titlePatterns?.map((pattern: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600">• {pattern}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">핵심 강점</h4>
                            <ul className="space-y-1">
                              {data.comparison.establishedPatterns.strengths?.map((strength: string, index: number) => (
                                <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* New Channel Patterns */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-orange-600" />
                        신규 급성장 채널 패턴
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.comparison?.newChannelPatterns && (
                        <>
                          <div>
                            <h4 className="font-medium mb-2">주요 키워드</h4>
                            <div className="flex flex-wrap gap-2">
                              {data.comparison.newChannelPatterns.keywords?.map((keyword: string, index: number) => (
                                <Badge key={index} variant="outline" className="border-orange-500">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">제목 패턴</h4>
                            <ul className="space-y-1">
                              {data.comparison.newChannelPatterns.titlePatterns?.map((pattern: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600">• {pattern}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">혁신적 요소</h4>
                            <ul className="space-y-1">
                              {data.comparison.newChannelPatterns.innovations?.map((innovation: string, index: number) => (
                                <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                                  {innovation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Key Differences */}
                {data.comparison?.keyDifferences && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        핵심 차이점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {data.comparison.keyDifferences.map((difference: string, index: number) => (
                          <div key={index} className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                            <p className="text-sm">{difference}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Established Channels */}
              <TabsContent value="established" className="space-y-4">
                <div className="grid gap-4">
                  {data.establishedChannels?.map((video: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">{video.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{video.channelTitle}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>{(video.viewCount / 1000000).toFixed(1)}M 조회수</span>
                              <span>{(video.subscriberCount / 1000).toFixed(0)}K 구독자</span>
                              <span>비율: {video.ratio.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* New Channels */}
              <TabsContent value="new" className="space-y-4">
                {/* Analysis Button - Always show if callback exists */}
                {onChannelViralAnalysis && (
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium text-blue-900">채널별 100만+ 조회수 바이럴 분석</h3>
                      <p className="text-sm text-blue-700">선택된 신규 채널들의 바이럴 영상을 분석합니다</p>
                    </div>
                    <Button 
                      onClick={handleAnalyzeSelected}
                      disabled={selectedChannels.size === 0}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      선택된 채널 분석 ({selectedChannels.size})
                    </Button>
                  </div>
                )}

                <div className="grid gap-4">
                  {data.newChannels?.map((video: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {onChannelViralAnalysis && (
                            <div className="flex items-start pt-1">
                              <Checkbox
                                checked={selectedChannels.has(video.channelId)}
                                onCheckedChange={(checked) => 
                                  handleChannelSelect(video.channelId, !!checked)
                                }
                              />
                            </div>
                          )}
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">{video.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{video.channelTitle}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>{(video.viewCount / 1000000).toFixed(1)}M 조회수</span>
                              <span>{(video.subscriberCount / 1000).toFixed(0)}K 구독자</span>
                              <span>비율: {video.ratio.toFixed(1)}</span>
                              <Badge variant="outline" className="text-xs">
                                신규 {Math.round((Date.now() - new Date(video.channelCreatedAt).getTime()) / (1000 * 60 * 60 * 24))}일
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Strategic Insights */}
              <TabsContent value="insights" className="space-y-6">
                {/* Opportunities */}
                {data.comparison?.opportunities && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        발견된 기회
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.comparison.opportunities.map((opportunity: string, index: number) => (
                          <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                            <p className="text-sm">{opportunity}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {data.comparison?.recommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        실행 권장사항
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.comparison.recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Insights */}
                {data.comparison?.marketInsights && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        시장 인사이트
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.comparison.marketInsights.map((insight: string, index: number) => (
                          <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">분석 결과가 없습니다.</p>
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