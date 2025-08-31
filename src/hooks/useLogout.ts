import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ログアウトに失敗しました');
      }
      
      toast({
        title: "ログアウトしました",
        description: "またのご利用をお待ちしています",
      });
      
      // ログインページにリダイレクト
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : 'ログアウトに失敗しました',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}