import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  quotaExceeded: boolean;
}

export function QuotaStatus() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/settings/api-keys');
      const data = await response.json();
      setApiKeys(data.apiKeys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const testAllKeys = async () => {
    setIsLoading(true);
    try {
      for (const key of apiKeys) {
        const response = await fetch(`/api/settings/api-keys/${key.id}/test`, {
          method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
          // Activate the working key
          await fetch(`/api/settings/api-keys/${key.id}/activate`, {
            method: 'POST'
          });
          
          toast({
            title: "API 키 활성화됨",
            description: `${key.name}가 다시 사용 가능합니다.`
          });
          
          fetchApiKeys();
          return;
        }
      }
      
      toast({
        title: "모든 키 할당량 초과",
        description: "모든 YouTube API 키의 일일 할당량이 초과되었습니다.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "테스트 실패",
        description: "API 키 테스트 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
    // Check every 5 minutes
    const interval = setInterval(fetchApiKeys, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeKey = apiKeys.find(key => key.isActive);
  const availableKeys = apiKeys.filter(key => !key.quotaExceeded);
  const totalKeys = apiKeys.length;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Badge variant={availableKeys.length > 0 ? "default" : "destructive"}>
          {availableKeys.length > 0 ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <AlertCircle className="h-3 w-3 mr-1" />
          )}
          API 상태: {availableKeys.length}/{totalKeys}
        </Badge>
        
        {activeKey && (
          <Badge variant="outline">
            활성: {activeKey.name}
          </Badge>
        )}
      </div>
      
      <Button
        onClick={testAllKeys}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="ml-auto"
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? '테스트 중...' : '키 테스트'}
      </Button>
    </div>
  );
}