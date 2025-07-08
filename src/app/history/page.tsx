"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation, useMobileNavigation } from '@/components/layout/mobile-navigation';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  History, 
  Search, 
  Calendar, 
  FileText, 
  Eye, 
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReflectionFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
  date?: string;
  preview?: string;
}

export default function HistoryPage() {
  const mobileNav = useMobileNavigation();
  const { toast } = useToast();
  const router = useRouter();
  
  const [reflections, setReflections] = useState<ReflectionFile[]>([]);
  const [filteredReflections, setFilteredReflections] = useState<ReflectionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());
  const [visiblePreviews, setVisiblePreviews] = useState<Set<string>>(new Set());
  
  // Delete functionality state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReflections = filteredReflections.slice(startIndex, startIndex + itemsPerPage);

  // 振り返りファイル一覧を取得
  useEffect(() => {
    const fetchReflections = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/github/reflections');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('振り返り一覧の取得に失敗しました');
        }

        const { files } = await response.json();
        
        // ファイル名から日付を抽出してソート
        const reflectionsWithDate = files.map((file: ReflectionFile) => ({
          ...file,
          date: extractDateFromFilename(file.name),
        })).sort((a: ReflectionFile, b: ReflectionFile) => {
          return (b.date || '').localeCompare(a.date || '');
        });

        setReflections(reflectionsWithDate);
        setFilteredReflections(reflectionsWithDate);

      } catch (err) {
        console.error('Reflections fetch error:', err);
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchReflections();
  }, [router]);

  // 検索機能
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReflections(reflections);
    } else {
      const filtered = reflections.filter(reflection => 
        reflection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reflection.date?.includes(searchTerm) ||
        reflection.preview?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReflections(filtered);
    }
    setCurrentPage(1); // 検索時はページを最初に戻す
  }, [searchTerm, reflections]);

  // ファイル名から日付を抽出
  const extractDateFromFilename = (filename: string): string | undefined => {
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
    return match ? match[1] : undefined;
  };

  // プレビューのトグル機能
  const togglePreview = async (filename: string) => {
    // 既にプレビューが表示されている場合は閉じる
    if (visiblePreviews.has(filename)) {
      setVisiblePreviews(prev => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
      return;
    }

    // プレビューが表示されていない場合は取得して表示
    if (loadingPreviews.has(filename)) return;
    
    try {
      setLoadingPreviews(prev => new Set([...prev, filename]));
      
      const response = await fetch(`/api/github/reflections/${encodeURIComponent(filename)}`);
      if (response.ok) {
        const { content } = await response.json();
        const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
        
        setReflections(prev => prev.map(reflection => 
          reflection.name === filename 
            ? { ...reflection, preview }
            : reflection
        ));
        setFilteredReflections(prev => prev.map(reflection => 
          reflection.name === filename 
            ? { ...reflection, preview }
            : reflection
        ));

        // プレビューを表示状態に追加
        setVisiblePreviews(prev => new Set([...prev, filename]));
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setLoadingPreviews(prev => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
    }
  };

  // 編集ページに移動
  const handleEdit = (filename: string) => {
    router.push(`/reflection?file=${encodeURIComponent(filename)}`);
  };

  // 削除ダイアログを開く
  const handleDeleteClick = (filename: string) => {
    setFileToDelete(filename);
    setDeleteDialogOpen(true);
  };

  // 削除を実行
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/github/reflections/${encodeURIComponent(fileToDelete)}/delete`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '削除に失敗しました');
      }

      // 成功時の処理
      toast({
        title: "✅ 削除完了",
        description: `「${fileToDelete}」を削除しました`,
        variant: "default",
      });

      // リストから削除されたファイルを除去
      setReflections(prev => prev.filter(reflection => reflection.name !== fileToDelete));
      setFilteredReflections(prev => prev.filter(reflection => reflection.name !== fileToDelete));
      
      // プレビュー状態もクリア
      setVisiblePreviews(prev => {
        const next = new Set(prev);
        next.delete(fileToDelete);
        return next;
      });

      // ダイアログを閉じる
      setDeleteDialogOpen(false);
      setFileToDelete(null);

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "❌ 削除に失敗しました",
        description: error instanceof Error ? error.message : "予期しないエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 削除ダイアログを閉じる
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return dateString;
    }
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    return `${Math.round(bytes / 1024)}KB`;
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
          {/* ヘッダー */}
          <div className="notion-block">
            <h1 className="notion-h1 mb-6 sm:mb-8 pl-12 sm:pl-0 flex items-center gap-3">
              <History className="h-8 w-8 text-blue-600" />
              振り返り履歴
            </h1>
          </div>
          
          <div className="notion-block">
            <p className="notion-text text-muted-foreground mb-6 sm:mb-8 pl-12 sm:pl-0">
              過去の振り返りを一覧で確認し、編集することができます。
            </p>
          </div>

          {/* 検索バー */}
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ファイル名、日付、内容で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ローディング状態 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="ml-2 text-muted-foreground">読み込み中...</span>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* 振り返り一覧 */}
          {!loading && !error && (
            <>
              {filteredReflections.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? '検索条件に一致する振り返りが見つかりませんでした。' : '振り返りがまだありません。'}
                    </p>
                    {!searchTerm && (
                      <Button 
                        className="mt-4" 
                        onClick={() => router.push('/reflection')}
                      >
                        最初の振り返りを作成
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* 結果サマリー */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredReflections.length}件の振り返り
                      {searchTerm && ` (「${searchTerm}」で検索)`}
                    </p>
                    <Badge variant="outline">
                      {currentPage} / {totalPages}ページ
                    </Badge>
                  </div>

                  {/* 振り返りカード */}
                  <div className="space-y-4">
                    {currentReflections.map((reflection) => (
                      <Card key={reflection.name} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                {reflection.name}
                              </CardTitle>
                              {reflection.date && (
                                <CardDescription className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(reflection.date)}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {formatFileSize(reflection.size)}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant={visiblePreviews.has(reflection.name) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => togglePreview(reflection.name)}
                                  disabled={loadingPreviews.has(reflection.name)}
                                  title="プレビュー"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(reflection.name)}
                                  title="編集"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(reflection.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="削除"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {reflection.preview && visiblePreviews.has(reflection.name) && (
                          <CardContent>
                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {reflection.preview}
                              </p>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* ページネーション */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        前へ
                      </Button>
                      <span className="px-4 py-2 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        次へ
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={fileToDelete || undefined}
        isLoading={isDeleting}
        title="振り返りを削除しますか？"
        description="この振り返りファイルをGitHubリポジトリから完全に削除します。この操作は取り消すことができません。"
      />
    </>
  );
}