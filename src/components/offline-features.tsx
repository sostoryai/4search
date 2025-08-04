import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Lightbulb, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OfflineFeatures() {
  const [videoUrl, setVideoUrl] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const { toast } = useToast();

  const extractVideoIdFromUrl = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const generateVideoAnalysis = () => {
    const videoId = extractVideoIdFromUrl(videoUrl);
    if (!videoId) {
      toast({
        title: "잘못된 URL",
        description: "올바른 YouTube URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const analysis = `
📊 YouTube 영상 분석 가이드 (Video ID: ${videoId})

🎯 제목 최적화 체크리스트:
• 호기심 유발 요소 포함 여부
• 숫자나 구체적 정보 사용
• 감정적 반응을 이끄는 단어
• 검색 키워드 포함 여부
• 제목 길이 (50자 이내 권장)

📈 콘텐츠 성능 예측 요소:
• 썸네일의 시각적 임팩트
• 첫 15초 후킹 강도
• 콘텐츠 구성과 흐름
• 시청자 참여 유도 요소
• 트렌드 반영 정도

🚀 개선 권장사항:
• A/B 테스트용 제목 변형 3가지 준비
• 썸네일 색상 대비 최적화
• 설명란 키워드 최적화
• 적절한 업로드 시간 설정
• 커뮤니티 탭 활용 계획

💡 바이럴 잠재성 평가:
• 공유 가능성: ★★★☆☆
• 트렌드 적합성: ★★★★☆
• 타겟층 명확성: ★★★☆☆
• 감정적 연결: ★★★★☆

📋 액션 플랜:
1. 제목 A/B 테스트 실행
2. 썸네일 디자인 개선
3. 태그 및 설명 최적화
4. 업로드 스케줄 조정
5. 성과 지표 모니터링
`;

    setAnalysisText(analysis);
    toast({
      title: "분석 완료",
      description: "영상 분석 가이드가 생성되었습니다."
    });
  };

  const exportAnalysis = () => {
    if (!analysisText) {
      toast({
        title: "내용 없음",
        description: "먼저 분석을 생성해주세요.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-analysis-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "내보내기 완료",
      description: "분석 결과가 파일로 저장되었습니다."
    });
  };

  const trendingTopics = [
    { topic: "AI 도구 활용법", score: 95, icon: "🤖" },
    { topic: "재테크 노하우", score: 92, icon: "💰" },
    { topic: "건강 관리 팁", score: 88, icon: "🏃‍♂️" },
    { topic: "요리 레시피", score: 85, icon: "👨‍🍳" },
    { topic: "운동 루틴", score: 82, icon: "💪" },
    { topic: "독서 리뷰", score: 78, icon: "📚" }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          오프라인 콘텐츠 도구
        </h2>
        <p className="text-gray-600">
          API 할당량 대기 중에도 사용할 수 있는 콘텐츠 분석 도구
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Analysis Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              영상 분석 가이드 생성기
            </CardTitle>
            <CardDescription>
              YouTube URL을 입력하여 콘텐츠 분석 가이드를 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                YouTube URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              onClick={generateVideoAnalysis}
              className="w-full"
              disabled={!videoUrl}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              분석 가이드 생성
            </Button>

            {analysisText && (
              <div className="space-y-2">
                <Textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  rows={10}
                  className="text-sm"
                />
                <Button 
                  onClick={exportAnalysis}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  텍스트 파일로 내보내기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              인기 콘텐츠 주제
            </CardTitle>
            <CardDescription>
              현재 트렌드 기반 추천 주제 목록
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingTopics.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(item.topic);
                    toast({
                      title: "복사 완료",
                      description: `"${item.topic}" 주제가 클립보드에 복사되었습니다.`
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.topic}</span>
                  </div>
                  <Badge variant="secondary">
                    {item.score}점
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            콘텐츠 제작 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "제목 최적화",
                tips: ["호기심 유발", "숫자 포함", "감정 어필", "키워드 삽입"]
              },
              {
                title: "썸네일 디자인",
                tips: ["대비 강조", "얼굴 표정", "텍스트 최소화", "브랜드 컬러"]
              },
              {
                title: "콘텐츠 구성",
                tips: ["후킹 15초", "명확한 구조", "참여 유도", "CTA 포함"]
              }
            ].map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-900">
                  {category.title}
                </h4>
                <ul className="space-y-2">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}