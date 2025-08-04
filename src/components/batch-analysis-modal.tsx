import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import type { YouTubeVideo } from "../types/youtube";

interface BatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: YouTubeVideo[];
  onStartAnalysis: (videos: YouTubeVideo[]) => void;
}

interface AnalysisResult {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcript?: string;
  translation?: string;
  analysis?: string;
  error?: string;
}

export function BatchAnalysisModal({ isOpen, onClose, videos, onStartAnalysis }: BatchAnalysisModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleStartAnalysis = async () => {
    setIsProcessing(true);
    setCurrentVideoIndex(0);
    
    // Initialize results
    const initialResults: Record<string, AnalysisResult> = {};
    videos.forEach(video => {
      initialResults[video.videoId] = { videoId: video.videoId, status: 'pending' };
    });
    setResults(initialResults);

    // Process each video sequentially
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      setCurrentVideoIndex(i);
      
      // Update status to processing
      setResults(prev => ({
        ...prev,
        [video.videoId]: { ...prev[video.videoId], status: 'processing' }
      }));

      try {
        // Extract transcript
        const transcriptResponse = await fetch('/api/extract-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: video.videoId })
        });
        
        const transcriptData = await transcriptResponse.json();
        
        if (transcriptData.transcript) {
          // Translate if needed (detect if transcript is not in Korean)
          let translation = transcriptData.transcript;
          if (!isKoreanText(transcriptData.transcript)) {
            try {
              const translateResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: transcriptData.transcript,
                  targetLanguage: 'ko'
                })
              });
              
              const translateData = await translateResponse.json();
              translation = translateData.translation || transcriptData.transcript;
            } catch (translateError) {
              console.log('Translation failed, using original text');
            }
          }

          // Analyze success patterns
          const analysisResponse = await fetch('/api/analyze-patterns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              videoId: video.videoId,
              transcript: translation,
              metadata: {
                title: video.title,
                viewCount: video.viewCount,
                cii: video.cii,
                engagementRate: video.engagementRate
              }
            })
          });
          
          const analysisData = await analysisResponse.json();

          setResults(prev => ({
            ...prev,
            [video.videoId]: {
              ...prev[video.videoId],
              status: 'completed',
              transcript: transcriptData.transcript,
              translation: translation,
              analysis: analysisData.analysis
            }
          }));
        } else {
          throw new Error('Failed to extract transcript');
        }
      } catch (error) {
        setResults(prev => ({
          ...prev,
          [video.videoId]: {
            ...prev[video.videoId],
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
  };

  const isKoreanText = (text: string): boolean => {
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text);
  };

  const getStatusIcon = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">완료</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">처리중</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">대기중</Badge>;
    }
  };

  const completedCount = Object.values(results).filter(r => r.status === 'completed').length;
  const failedCount = Object.values(results).filter(r => r.status === 'failed').length;
  const progress = videos.length > 0 ? ((completedCount + failedCount) / videos.length) * 100 : 0;

  const downloadResults = () => {
    const successfulResults = Object.values(results)
      .filter(r => r.status === 'completed')
      .map(r => ({
        videoId: r.videoId,
        video: videos.find(v => v.videoId === r.videoId),
        transcript: r.transcript,
        translation: r.translation,
        analysis: r.analysis
      }));

    const dataStr = JSON.stringify(successfulResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-analysis-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>일괄 영상 분석</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{videos.length}</div>
              <div className="text-sm text-gray-600">총 영상 수</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-gray-600">실패</div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>진행률</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentVideoIndex < videos.length && (
                <p className="text-sm text-gray-600">
                  현재 처리중: {videos[currentVideoIndex]?.title}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {videos.map((video, index) => {
              const result = results[video.videoId];
              return (
                <div key={video.videoId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(result?.status || 'pending')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{video.title}</div>
                    <div className="text-xs text-gray-500">{video.channelTitle}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(result?.status || 'pending')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between">
            <div>
              {completedCount > 0 && (
                <Button onClick={downloadResults} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  결과 다운로드 ({completedCount}개)
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline">
                닫기
              </Button>
              {!isProcessing ? (
                <Button onClick={handleStartAnalysis} disabled={videos.length === 0}>
                  분석 시작
                </Button>
              ) : (
                <Button disabled>
                  처리중... ({currentVideoIndex + 1}/{videos.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}