"use client";

import { useState } from 'react';
import { ReflectionEditor } from '@/components/features/reflection-editor';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ReflectionData } from '@/types/github';

export default function ReflectionPage() {
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';
      
      setSaveState({
        isLoading: false,
        error: errorMessage,
        success: false,
        data: null,
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
    <div className="notion-editor">
      <div className="notion-page">
        <div className="notion-block">
          <h1 className="notion-h1 mb-8">振り返り作成</h1>
        </div>
        
        <div className="notion-block">
          <p className="notion-text text-muted-foreground mb-6">
            今日の振り返りを書いて、ワンクリックでGitHubに保存しましょう。
          </p>
        </div>
        
        {/* Success Alert */}
        {saveState.success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              振り返りが正常に保存されました！
              {saveState.data?.url && (
                <a
                  href={saveState.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline hover:text-green-900"
                >
                  GitHubで確認
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {saveState.error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {saveState.error}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2 h-6 text-xs"
                disabled={saveState.isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                再試行
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Reflection Editor */}
        <ReflectionEditor
          onSave={handleSave}
          isSaving={saveState.isLoading}
        />

        {/* Reset Button */}
        {(saveState.success || saveState.error) && (
          <div className="mt-4 flex justify-center">
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
  );
}