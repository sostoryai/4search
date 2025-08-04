import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Search, RotateCcw, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import type { SearchParams } from "../types/youtube";

interface SidebarProps {
  onSearch: (params: SearchParams) => void;
  onGreatFilter: () => void;
  onClearFilters: () => void;
  onShowTrending: () => void;
  onAnalyzeViralPatterns: (keyword: string, excludeKeywords?: string) => void;
  onHybridAnalysis: (keyword: string) => void;
  isLoading: boolean;
  searchResults?: {
    total: number;
    great: number;
    good: number;
    normal: number;
  };
}

export function Sidebar({ 
  onSearch, 
  onGreatFilter, 
  onClearFilters, 
  onShowTrending, 
  onAnalyzeViralPatterns, 
  onHybridAnalysis, 
  isLoading, 
  searchResults 
}: SidebarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: "",
    sortOrder: "viewCount",
    publishTime: "month",
    videoDuration: "any",
    excludeKeywords: "",
  });

  const handleSearch = () => {
    if (searchParams.keyword.trim()) {
      onSearch(searchParams);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="w-80 sidebar-dark text-white flex-shrink-0 flex flex-col h-screen md:h-full overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 info-blue rounded-lg flex items-center justify-center">
            <Video className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">search.ai</h1>
            <p className="text-sm text-gray-300">유튜브 영상 분석 툴</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mobile-scroll">
        {/* Search Section */}
        <div className="p-4 md:p-6 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">검색</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="키워드 검색"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 sidebar-darker border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">정렬 기준</Label>
              <Select value={searchParams.sortOrder} onValueChange={(value: any) => setSearchParams({ ...searchParams, sortOrder: value })}>
                <SelectTrigger className="w-full sidebar-darker border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewCount">조회수순</SelectItem>
                  <SelectItem value="date">최신순</SelectItem>
                  <SelectItem value="relevance">관련성순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">기간</Label>
              <Select value={searchParams.publishTime} onValueChange={(value: any) => setSearchParams({ ...searchParams, publishTime: value })}>
                <SelectTrigger className="w-full sidebar-darker border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">1주일</SelectItem>
                  <SelectItem value="month">1개월</SelectItem>
                  <SelectItem value="year">1년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">영상 길이</Label>
              <Select value={searchParams.videoDuration} onValueChange={(value: any) => setSearchParams({ ...searchParams, videoDuration: value })}>
                <SelectTrigger className="w-full sidebar-darker border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">전체</SelectItem>
                  <SelectItem value="short">4분 미만</SelectItem>
                  <SelectItem value="medium">4-20분</SelectItem>
                  <SelectItem value="long">20분 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">제외 키워드</Label>
              <Input
                type="text"
                placeholder="제외할 키워드 (쉼표로 구분)"
                value={searchParams.excludeKeywords}
                onChange={(e) => setSearchParams({ ...searchParams, excludeKeywords: e.target.value })}
                className="w-full px-4 py-2 sidebar-darker border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchParams.keyword.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? "검색 중..." : "검색"}
            </Button>

            <Button
              onClick={onGreatFilter}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              Great!! 필터
            </Button>

            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              필터 초기화
            </Button>
          </div>
        </div>

        {/* Advanced Analysis Section */}
        <div className="p-4 md:p-6 space-y-4 border-t border-gray-600">
          <h3 className="text-lg font-semibold mb-3">고급 분석</h3>
          
          <div className="space-y-2">
            <Button
              onClick={() => onAnalyzeViralPatterns(searchParams.keyword, searchParams.excludeKeywords)}
              disabled={isLoading || !searchParams.keyword.trim()}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              바이럴 패턴 분석
            </Button>

            <Button
              onClick={() => onHybridAnalysis(searchParams.keyword)}
              disabled={isLoading || !searchParams.keyword.trim()}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              하이브리드 분석
            </Button>

            <Button
              onClick={onShowTrending}
              disabled={isLoading}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              트렌딩 토픽
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 md:p-6 space-y-4">
          <Card className="sidebar-darker border-gray-600">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3 text-white">성과 지표 범례</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 success-green rounded"></span>
                  <span>Great!! (조회수 ≥ 1만, 배율 ≥ 30)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 warning-yellow rounded"></span>
                  <span>Good (배율 ≥ 10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-gray-500 rounded"></span>
                  <span>보통</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {searchResults && (
            <Card className="sidebar-darker border-gray-600">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 text-white">검색 결과</h3>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>총 영상: {searchResults.total}개</div>
                  <div>Great!! 영상: {searchResults.great}개</div>
                  <div>Good 영상: {searchResults.good}개</div>
                  <div>보통 영상: {searchResults.normal}개</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}