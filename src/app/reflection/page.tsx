"use client";

import { useState } from 'react';
import { ReflectionEditor } from '@/components/features/reflection-editor';
import { Button } from '@/components/ui/button';
import { MobileNavigation, useMobileNavigation } from '@/components/layout/mobile-navigation';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { ReflectionData } from '@/types/github';

export default function ReflectionPage() {
  const mobileNav = useMobileNavigation();
  const { toast } = useToast();
  const [saveState, setSaveState] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
    data: any | null;
  }>({
    isLoading: false,
    error: null,
    success: false,
    data: null,
  });

  const [lastSaveOptions, setLastSaveOptions] = useState<{
    content: string;
    fileName: string;
  } | null>(null);

  const handleSave = async (content: string, fileName: string) => {
    setSaveState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      success: false,
    }));

    setLastSaveOptions({ content, fileName });

    try {
      // Validate inputs
      if (!content.trim()) {
        throw new Error('振り返り内容が空です');
      }

      if (!fileName.trim()) {
        throw new Error('ファイル名が空です');
      }

      if (!fileName.endsWith('.md')) {
        throw new Error('ファイル名は .md 形式である必要があります');
      }

      // Show loading toast
      toast({
        title: "保存中...",
        description: "振り返りをGitHubに保存しています",
        variant: "default",
      });

      // Prepare request data
      const requestData: ReflectionData = {
        content,
        fileName,
        date: new Date().toISOString().split('T')[0],
        repository: '', // Will use default repository
      };

      // Call the API
      const response = await fetch('/api/github/save-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存に失敗しました');
      }

      // Success
      setSaveState({
        isLoading: false,
        error: null,
        success: true,
        data: result.data,
      });

      // Show success toast
      toast({
        title: "✅ 保存完了！",
        description: "振り返りが正常にGitHubに保存されました",
        variant: "default",
        action: result.data?.url ? (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="ml-2"
          >
            <a href={result.data.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              確認
            </a>
          </Button>
        ) : undefined,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';
      
      setSaveState({
        isLoading: false,
        error: errorMessage,
        success: false,
        data: null,
      });

      // Show error toast with retry option
      toast({
        title: "❌ 保存に失敗しました",
        description: errorMessage,
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={saveState.isLoading}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            再試行
          </Button>
        ),
      });
    }
  };

  const handleRetry = async () => {
    if (lastSaveOptions) {
      await handleSave(lastSaveOptions.content, lastSaveOptions.fileName);
    }
  };

  const resetState = () => {
    setSaveState({
      isLoading: false,
      error: null,
      success: false,
      data: null,
    });
  };

  return (
    <>
      <MobileNavigation
        isOpen={mobileNav.isOpen}
        onToggle={mobileNav.toggle}
        onClose={mobileNav.close}
      />
      
      <div className="notion-editor">
        <div className="notion-page">
          <div className="notion-block">
            <h1 className="notion-h1 mb-6 sm:mb-8 pl-12 sm:pl-0">振り返り作成</h1>
          </div>
          
          <div className="notion-block">
            <p className="notion-text text-muted-foreground mb-4 sm:mb-6 pl-12 sm:pl-0">
              今日の振り返りを書いて、ワンクリックでGitHubに保存しましょう。
            </p>
          </div>

          {/* Success State Display */}
          {saveState.success && (
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">保存完了！</span>
              </div>
            </div>
          )}

          {/* Reflection Editor */}
          <ReflectionEditor
            onSave={handleSave}
            isSaving={saveState.isLoading}
          />

          {/* Reset Button */}
          {saveState.success && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={resetState}
                className="text-sm"
              >
                新しい振り返りを作成
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}