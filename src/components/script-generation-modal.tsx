import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Wand2, Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScriptOptions } from "../types/youtube";

interface ScriptGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateScript: (options: ScriptOptions) => void;
  generatedScript: string | null;
  isLoading: boolean;
}

export function ScriptGenerationModal({ 
  isOpen, 
  onClose, 
  onGenerateScript, 
  generatedScript,
  isLoading 
}: ScriptGenerationModalProps) {
  const { toast } = useToast();
  const [scriptOptions, setScriptOptions] = useState<ScriptOptions>({
    format: "short",
    tone: "friendly",
    keywords: "",
    audience: "",
    title: ""
  });

  const handleGenerate = () => {
    if (!scriptOptions.title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        description: "대본 생성을 위해 영상 제목이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    onGenerateScript(scriptOptions);
  };

  const handleCopyScript = async () => {
    if (generatedScript) {
      try {
        await navigator.clipboard.writeText(generatedScript);
        toast({
          title: "복사 완료",
          description: "대본이 클립보드에 복사되었습니다."
        });
      } catch (error) {
        toast({
          title: "복사 실패",
          description: "대본 복사 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownloadScript = () => {
    if (generatedScript) {
      const blob = new Blob([generatedScript], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${scriptOptions.title || "script"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 success-green rounded-lg flex items-center justify-center">
              <FileText className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">AI 대본 생성기</DialogTitle>
              <p className="text-gray-500">맞춤형 유튜브 스크립트 자동 생성</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Script Options */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">영상 제목</Label>
                <Input
                  type="text"
                  placeholder="영상 제목을 입력하세요"
                  value={scriptOptions.title}
                  onChange={(e) => setScriptOptions({ ...scriptOptions, title: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">영상 형식</Label>
                <Select 
                  value={scriptOptions.format} 
                  onValueChange={(value: any) => setScriptOptions({ ...scriptOptions, format: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shorts">쇼츠 (60초 이하)</SelectItem>
                    <SelectItem value="short">짧은 영상 (5분 이하)</SelectItem>
                    <SelectItem value="long">롱폼 (10분 이상)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">말투/톤</Label>
                <Select 
                  value={scriptOptions.tone} 
                  onValueChange={(value: any) => setScriptOptions({ ...scriptOptions, tone: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">친근한</SelectItem>
                    <SelectItem value="professional">전문적인</SelectItem>
                    <SelectItem value="casual">캐주얼한</SelectItem>
                    <SelectItem value="enthusiastic">열정적인</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">주요 키워드</Label>
                <Input
                  type="text"
                  placeholder="키워드를 입력하세요"
                  value={scriptOptions.keywords}
                  onChange={(e) => setScriptOptions({ ...scriptOptions, keywords: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">타깃 관객</Label>
                <Input
                  type="text"
                  placeholder="20-30대 직장인"
                  value={scriptOptions.audience}
                  onChange={(e) => setScriptOptions({ ...scriptOptions, audience: e.target.value })}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !scriptOptions.title.trim()}
                className="w-full info-blue hover:bg-blue-600 text-white py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성중...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    대본 생성
                  </>
                )}
              </Button>
            </div>

            {/* Generated Script */}
            <div className="lg:col-span-2">
              <Card className="min-h-[400px]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">생성된 대본</h4>
                    {generatedScript && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCopyScript}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          복사
                        </Button>
                        <Button
                          onClick={handleDownloadScript}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          다운로드
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="min-h-[350px] bg-gray-50 rounded-lg p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                          <p className="text-gray-500">AI가 대본을 생성하고 있습니다...</p>
                        </div>
                      </div>
                    ) : generatedScript ? (
                      <div className="prose max-w-none text-sm whitespace-pre-line">
                        {generatedScript}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">대본 생성 옵션을 설정하고 생성 버튼을 눌러주세요.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
