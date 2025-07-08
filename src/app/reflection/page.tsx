"use client";

import { useState, useEffect, Suspense } from 'react';
import { ReflectionEditor } from '@/components/features/reflection-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MobileNavigation, useMobileNavigation } from '@/components/layout/mobile-navigation';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, RefreshCw, ExternalLink, GitBranch, Settings, Globe } from 'lucide-react';
import { ReflectionData } from '@/types/github';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserProfile {
  id: string;
  github_username: string | null;
  default_repo_owner: string | null;
  default_repo_name: string | null;
  avatar_url: string | null;
}

function ReflectionPageContent() {
  const mobileNav = useMobileNavigation();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
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

  // ユーザープロファイルの取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);

        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('プロファイルの取得に失敗しました');
        }

        const { profile: userProfile } = await response.json();
        setProfile(userProfile);

        // デフォルトリポジトリが設定されていない場合の警告
        if (!userProfile.default_repo_owner || !userProfile.default_repo_name) {
          setProfileError('デフォルトリポジトリが設定されていません。設定画面でリポジトリを選択してください。');
        }

      } catch (err) {
        console.error('Profile fetch error:', err);
        setProfileError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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

      // Check if default repository is configured
      if (!profile?.default_repo_owner || !profile?.default_repo_name) {
        throw new Error('デフォルトリポジトリが設定されていません。設定画面でリポジトリを選択してください。');
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

  const handleConfigureRepository = () => {
    router.push('/setup');
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

          {/* Repository Configuration Card */}
          <div className="notion-block mb-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="h-4 w-4" />
                  保存先リポジトリ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    読み込み中...
                  </div>
                ) : profileError ? (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {profileError}
                    </AlertDescription>
                  </Alert>
                ) : profile?.default_repo_owner && profile?.default_repo_name ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {profile.default_repo_owner}/{profile.default_repo_name}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleConfigureRepository}
                      className="text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      変更
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      リポジトリが設定されていません
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleConfigureRepository}
                      className="text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      設定
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error State Display */}
          {profileError && (
            <div className="mb-6 flex justify-center">
              <Alert className="max-w-2xl">
                <AlertDescription>
                  {profileError}
                </AlertDescription>
              </Alert>
            </div>
          )}

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
            initialFileName={searchParams.get('file') || undefined}
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

export default function ReflectionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <ReflectionPageContent />
    </Suspense>
  );
}