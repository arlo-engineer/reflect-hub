"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfigSafe } from "./env";

// 環境変数のチェック
const config = getSupabaseConfigSafe();

// クライアントサイド用のSupabaseクライアント（遅延初期化）
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは何もしない
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('SSR not supported') }),
        signOut: () => Promise.resolve({ error: null }),
      }
    } as any;
  }

  if (!supabaseClient && config.url && config.anonKey) {
    supabaseClient = createBrowserClient(config.url, config.anonKey);
  }

  return supabaseClient || {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    }
  } as any;
})();

// GitHub OAuth認証
export const signInWithGitHub = async () => {
  if (typeof window === 'undefined') {
    throw new Error("signInWithGitHub can only be called on the client side");
  }

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
  if (typeof window === 'undefined') {
    throw new Error("signOut can only be called on the client side");
  }

  if (!config.url || !config.anonKey) {
    throw new Error("Supabase configuration is missing");
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};
