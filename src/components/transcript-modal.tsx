import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string | null;
  videoTitle: string;
  isLoading: boolean;
}

export function TranscriptModal({ 
  isOpen, 
  onClose, 
  transcript, 
  videoTitle,
  isLoading 
}: TranscriptModalProps) {
  const { toast } = useToast();

  const handleCopyTranscript = async () => {
    if (transcript) {
      try {
        await navigator.clipboard.writeText(transcript);
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

  const handleDownloadTranscript = () => {
    if (transcript) {
      const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoTitle.replace(/[^\w\s]/gi, '')}_transcript.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 success-green rounded-lg flex items-center justify-center">
              <FileText className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">영상 대본 추출</DialogTitle>
              <p className="text-gray-500 text-sm line-clamp-1">{videoTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Card className="min-h-[500px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">추출된 대본</h4>
                {transcript && !isLoading && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCopyTranscript}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      복사
                    </Button>
                    <Button
                      onClick={handleDownloadTranscript}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      다운로드
                    </Button>
                  </div>
                )}
              </div>
              
              <ScrollArea className="h-[450px] w-full rounded-lg border">
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-500">대본을 추출하고 있습니다...</p>
                      </div>
                    </div>
                  ) : transcript ? (
                    <div className="prose max-w-none text-sm whitespace-pre-line">
                      {transcript}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">대본을 추출할 수 없습니다.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}