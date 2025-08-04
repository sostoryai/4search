import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Target, Star, Edit, FileText, Save, Loader2 } from "lucide-react";
import type { AIAnalysis } from "../types/youtube";

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateScript: () => void;
  analysis: AIAnalysis | null;
  isLoading: boolean;
}

export function AIRecommendationModal({ 
  isOpen, 
  onClose, 
  onGenerateScript, 
  analysis,
  isLoading 
}: AIRecommendationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 info-blue rounded-lg flex items-center justify-center">
              <Lightbulb className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">AI 콘텐츠 추천</DialogTitle>
              <p className="text-gray-500">고성과 영상 분석 기반 아이디어 제안</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-500">AI가 영상을 분석하고 있습니다...</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Trends Analysis */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="text-yellow-500 mr-2 h-4 w-4" />
                    트렌드 분석
                  </h4>
                  <div className="text-sm text-gray-700">
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.trends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Target Audience */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="text-green-500 mr-2 h-4 w-4" />
                      추천 타깃
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {analysis.targets.map((target, index) => (
                        <li key={index}>• {target}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Hook Points */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Star className="text-purple-500 mr-2 h-4 w-4" />
                      핵심 후킹 포인트
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {analysis.hooks.map((hook, index) => (
                        <li key={index}>• {hook}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Suggested Titles */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Edit className="text-orange-500 mr-2 h-4 w-4" />
                    제안 제목 (5개)
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestedTitles.map((title, index) => (
                      <div key={index} className="bg-white border rounded p-3 text-sm">
                        <span className="font-medium">{index + 1}.</span> {title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">분석할 영상을 선택해주세요.</p>
            </div>
          )}

          {/* Action Buttons */}
          {analysis && (
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={onGenerateScript}
                className="info-blue hover:bg-blue-600 text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                대본 생성
              </Button>
              <Button
                variant="secondary"
                className="success-green hover:bg-green-600 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                저장하기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
