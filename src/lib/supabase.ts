"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfigSafe } from "./env";

// 環境変数のチェック
const config = getSupabaseConfigSafe();

// クライアントサイド用のSupabaseクライアント
export const supabase = createBrowserClient(
  config.url,
  config.anonKey
);

// GitHub OAuth認証
export const signInWithGitHub = async () => {
  if (!config.url || !config.anonKey) {
    throw new Error("Supabase configuration is missing");
  }
  
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
  if (!config.url || !config.anonKey) {
    throw new Error("Supabase configuration is missing");
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};
