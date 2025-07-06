"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGitHub } from "@/lib/supabase";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error("認証エラー:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            振り返りサービス
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            日々の振り返りをMarkdownで記録し、GitHub に自動保存
          </p>
          <button
            onClick={handleGitHubSignIn}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            GitHubでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
