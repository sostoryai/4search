import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatKoreanNumber, formatDuration, formatDate, getPerformanceBadge } from "../lib/formatters";
import type { YouTubeVideo } from "../types/youtube";
import { Search, TrendingUp } from "lucide-react";

interface VideoTableProps {
  videos: YouTubeVideo[];
  onAnalyzeVideo: (video: YouTubeVideo) => void;
  onExtractTranscript: (video: YouTubeVideo) => void;
  onBatchProcess: (videos: YouTubeVideo[]) => void;
  onChannelViralAnalysis?: (channelIds: string[]) => void;
  onSelectedChannelsViralAnalysis?: (channelIds: string[]) => void;
  isLoading?: boolean;
  selectedVideos?: Set<string>;
  onVideoSelect?: (videoId: string, selected: boolean) => void;
}

export function VideoTable({ 
  videos, 
  onAnalyzeVideo, 
  onExtractTranscript, 
  onBatchProcess,
  onChannelViralAnalysis,
  onSelectedChannelsViralAnalysis,
  isLoading,
  selectedVideos = new Set(),
  onVideoSelect
}: VideoTableProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-gray-500">영상을 검색중입니다...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500 mb-6">다른 키워드로 검색해보세요</p>
        </div>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      // Deselect all
      videos.forEach(video => onVideoSelect?.(video.videoId, false));
    } else {
      // Select all
      videos.forEach(video => onVideoSelect?.(video.videoId, true));
    }
  };

  const handleBatchProcess = () => {
    const selectedVideoList = videos.filter(video => selectedVideos.has(video.videoId));
    if (selectedVideoList.length > 0) {
      onBatchProcess(selectedVideoList);
    }
  };

  const handleChannelViralAnalysis = () => {
    const selectedVideoList = videos.filter(video => selectedVideos.has(video.videoId));
    const uniqueChannelIds = Array.from(new Set(selectedVideoList.map(video => video.channelId)));
    if (uniqueChannelIds.length > 0 && onChannelViralAnalysis) {
      onChannelViralAnalysis(uniqueChannelIds);
    }
  };

  const handleSelectedChannelsViralAnalysis = () => {
    const selectedVideoList = videos.filter(video => selectedVideos.has(video.videoId));
    const uniqueChannelIds = Array.from(new Set(selectedVideoList.map(video => video.channelId)));
    if (uniqueChannelIds.length > 0 && onSelectedChannelsViralAnalysis) {
      onSelectedChannelsViralAnalysis(uniqueChannelIds);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      {videos.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedVideos.size === videos.length && videos.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                전체 선택 ({selectedVideos.size}/{videos.length})
              </span>
            </div>
          </div>
          {selectedVideos.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBatchProcess}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Search className="h-4 w-4" />
                선택 영상 일괄 분석 ({selectedVideos.size}개)
              </button>
              <button
                onClick={handleChannelViralAnalysis}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
              >
                <TrendingUp className="h-4 w-4" />
                선택된 채널 바이럴 분석
              </button>
              <button
                onClick={handleSelectedChannelsViralAnalysis}
                disabled={selectedVideos.size === 0}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm ${
                  selectedVideos.size === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                100만+ 조회수 바이럴 분석 ({selectedVideos.size}개 선택)
              </button>
            </div>
          )}
        </div>
      )}
      
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">선택</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">N</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">썸네일</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">채널</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">채널 개설일</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">게시일</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">재생 시간</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">조회수</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">좋아요</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">CII</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">구독자 수</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">참여율</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">액션</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {videos.map((video, index) => {
            const badge = getPerformanceBadge(video.performanceLevel);
            return (
              <tr key={video.videoId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={selectedVideos.has(video.videoId)}
                    onChange={(e) => onVideoSelect?.(video.videoId, e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-32 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {video.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {video.channelTitle}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {video.channelTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.channelCreatedAt ? formatDate(video.channelCreatedAt) : "정보 없음"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(video.publishedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(video.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatKoreanNumber(video.viewCount)}회
                  </div>
                  <div className="flex items-center mt-1">
                    <Badge className={`${badge.color} text-white text-xs`}>
                      {badge.text}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatKoreanNumber(video.likeCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {video.cii.toFixed(1)}배
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatKoreanNumber(video.subscriberCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {video.engagementRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => onAnalyzeVideo(video)}
                      variant="link" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium p-0"
                    >
                      분석
                    </Button>
                    {video.performanceLevel === "great" && (
                      <Button 
                        onClick={() => onExtractTranscript(video)}
                        variant="link" 
                        className="text-green-600 hover:text-green-800 text-sm font-medium p-0"
                      >
                        대본추출
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
