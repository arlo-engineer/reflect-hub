"use client";

import { createBrowserClient } from "@supabase/ssr";

// クライアントサイド用のSupabaseクライアント
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GitHub OAuth認証
export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo user:email",
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

// ログアウト
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
