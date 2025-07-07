"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, GitBranch, Lock, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GitHubRepository } from '@/types/github';

interface UserProfile {
  id: string;
  github_username: string | null;
  default_repo_owner: string | null;
  default_repo_name: string | null;
  avatar_url: string | null;
}

export default function SetupPage() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();

  // プロファイルとリポジトリを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 認証チェック
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/login');
          return;
        }

        // プロファイル取得
        const profileResponse = await fetch('/api/user/profile');
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }
        const { profile: userProfile } = await profileResponse.json();
        setProfile(userProfile);

        // リポジトリ取得
        const reposResponse = await fetch('/api/github/repos');
        if (!reposResponse.ok) {
          if (reposResponse.status === 401) {
            setError('GitHub認証が必要です。再度ログインしてください。');
            return;
          }
          throw new Error('Failed to fetch repositories');
        }
        const { repositories: repoList } = await reposResponse.json();
        setRepositories(repoList);
        setFilteredRepos(repoList);

        // デフォルトリポジトリが設定されている場合、それを選択状態にする
        if (userProfile.default_repo_owner && userProfile.default_repo_name) {
          const defaultRepo = repoList.find(
            (repo: GitHubRepository) => 
              repo.owner.login === userProfile.default_repo_owner && 
              repo.name === userProfile.default_repo_name
          );
          if (defaultRepo) {
            setSelectedRepo(defaultRepo);
          }
        }

      } catch (err) {
        console.error('Setup data fetch error:', err);
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRepos(repositories);
    } else {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRepos(filtered);
    }
  }, [searchTerm, repositories]);

  // デフォルトリポジトリの保存
  const handleSaveDefaultRepo = async () => {
    if (!selectedRepo) {
      setError('リポジトリを選択してください。');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoOwner: selectedRepo.owner.login,
          repoName: selectedRepo.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save default repository');
      }

      setSuccess('デフォルトリポジトリを保存しました！');
      
      // 3秒後にリフレクション画面に遷移
      setTimeout(() => {
        router.push('/reflection');
      }, 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>データを読み込み中...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">リポジトリ設定</h1>
          <p className="text-gray-600">
            振り返りを保存するデフォルトリポジトリを選択してください
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              リポジトリ選択
            </CardTitle>
            <CardDescription>
              プッシュ権限があるリポジトリのみ表示されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 検索フィールド */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="リポジトリを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* リポジトリリスト */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepo?.id === repo.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{repo.name}</h3>
                          {repo.private ? (
                            <Lock className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Globe className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {repo.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Owner: {repo.owner.login}</span>
                          {repo.language && <span>Language: {repo.language}</span>}
                          <span>Updated: {new Date(repo.updated_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          ⭐ {repo.stargazers_count}
                        </span>
                        <span className="text-xs text-gray-500">
                          🍴 {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRepos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? '検索結果がありません' : 'リポジトリが見つかりません'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作ボタン */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveDefaultRepo}
            disabled={!selectedRepo || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              'デフォルトリポジトリに設定'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}