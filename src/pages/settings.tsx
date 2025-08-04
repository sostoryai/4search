import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  quotaExceeded: boolean;
  lastChecked?: string;
}

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch("/api/settings/api-keys");
      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  };

  const addApiKey = async () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      toast({
        title: "오류",
        description: "키 이름과 API 키를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          key: newKeyValue,
        }),
      });

      if (response.ok) {
        setNewKeyName("");
        setNewKeyValue("");
        loadApiKeys();
        toast({
          title: "성공",
          description: "새 API 키가 추가되었습니다.",
        });
      } else {
        throw new Error("Failed to add API key");
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const removeApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadApiKeys();
        toast({
          title: "성공",
          description: "API 키가 삭제되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const setActiveKey = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/api-keys/${id}/activate`, {
        method: "POST",
      });

      if (response.ok) {
        loadApiKeys();
        toast({
          title: "성공",
          description: "활성 API 키가 변경되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 활성화에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const testApiKey = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/settings/api-keys/${id}/test`, {
        method: "POST",
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "테스트 성공",
          description: `API 키가 정상 작동합니다. 남은 할당량: ${result.quotaInfo || '확인 불가'}`,
        });
      } else {
        toast({
          title: "테스트 실패",
          description: result.error || "API 키가 작동하지 않습니다.",
          variant: "destructive",
        });
      }
      
      loadApiKeys();
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 테스트에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoSwitchNext = async () => {
    try {
      const response = await fetch("/api/settings/api-keys/switch-next", {
        method: "POST",
      });

      if (response.ok) {
        loadApiKeys();
        toast({
          title: "성공",
          description: "다음 사용 가능한 API 키로 전환되었습니다.",
        });
      } else {
        toast({
          title: "알림",
          description: "사용 가능한 다른 API 키가 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 전환에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          YouTube API 키를 관리하고 자동 전환 설정을 구성하세요.
        </p>
      </div>

      {/* Add New API Key */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            새 API 키 추가
          </CardTitle>
          <CardDescription>
            Google Cloud Console에서 발급받은 YouTube Data API v3 키를 추가하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyName">키 이름</Label>
              <Input
                id="keyName"
                placeholder="예: 프로젝트A, 메인키 등"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="keyValue">API 키</Label>
              <Input
                id="keyValue"
                type="password"
                placeholder="AIza..."
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addApiKey} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            API 키 추가
          </Button>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>API 키 목록</CardTitle>
              <CardDescription>
                등록된 API 키들을 관리하고 상태를 확인하세요.
              </CardDescription>
            </div>
            <Button onClick={autoSwitchNext} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              다음 키로 전환
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 API 키가 없습니다. 위에서 새 키를 추가해주세요.
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className={`border rounded-lg p-4 ${
                    apiKey.isActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        {apiKey.isActive && (
                          <Badge variant="default">활성</Badge>
                        )}
                        {apiKey.quotaExceeded ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            할당량 초과
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            사용가능
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {apiKey.key.substring(0, 10)}...{apiKey.key.substring(apiKey.key.length - 4)}
                      </p>
                      {apiKey.lastChecked && (
                        <p className="text-xs text-gray-500 mt-1">
                          마지막 확인: {new Date(apiKey.lastChecked).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testApiKey(apiKey.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      {!apiKey.isActive && (
                        <Button
                          size="sm"
                          onClick={() => setActiveKey(apiKey.id)}
                          disabled={apiKey.quotaExceeded}
                        >
                          활성화
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>사용법 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>• 각 YouTube API 키는 하루 10,000 단위의 할당량을 가집니다</div>
          <div>• 바이럴 분석 1회당 약 102-103 단위를 소모합니다</div>
          <div>• 할당량이 초과된 키는 자동으로 다음 사용 가능한 키로 전환됩니다</div>
          <div>• 매일 자정(한국시간)에 할당량이 리셋됩니다</div>
          <div>• 여러 개의 Google Cloud 프로젝트에서 API 키를 발급받아 등록하시면 더 많이 사용할 수 있습니다</div>
        </CardContent>
      </Card>
    </div>
  );
}