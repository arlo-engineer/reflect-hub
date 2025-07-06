import { User as SupabaseUser } from "@supabase/supabase-js";

// 振り返りデータの型定義
export interface ReflectionData {
  id: string;
  user_id: string;
  repository_id: string;
  title: string;
  content: string;
  file_path: string;
  commit_sha: string | null;
  commit_url: string | null;
  created_at: string;
  updated_at: string;
}

// 保存ステータスの型定義
export type SaveStatus = "idle" | "saving" | "success" | "error";

// APIエラーの型定義
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// GitHub関連の型定義
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  private: boolean;
  html_url: string;
  description: string | null;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

// Supabase User型の拡張
export interface User extends SupabaseUser {
  user_metadata: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    phone_verified?: boolean;
    preferred_username?: string;
    provider_id?: string;
    sub?: string;
    user_name?: string;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  github_access_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: string;
  user_id: string;
  github_repo_id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
}

// API Response型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// GitHub保存設定
export interface SaveSettings {
  repository: string;
  branch: string;
  directory: string;
  fileNamePattern: string;
}
