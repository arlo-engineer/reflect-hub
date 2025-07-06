"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("認証エラー:", error);
          router.push("/login?error=auth_callback_failed");
          return;
        }

        if (data.session) {
          // GitHubアクセストークンを取得・保存
          await saveGitHubAccessToken(data.session);
          router.push("/setup");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("予期しないエラー:", error);
        router.push("/login?error=unexpected_error");
      }
    };

    const saveGitHubAccessToken = async (session: any) => {
      try {
        const response = await fetch("/api/auth/github/save-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save GitHub token");
        }
      } catch (error) {
        console.error("Token save error:", error);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">認証処理中...</p>
      </div>
    </div>
  );
}
