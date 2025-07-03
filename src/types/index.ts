// 振り返りデータの型定義
export interface ReflectionData {
  content: string;
  date: string;
  fileName: string;
  title?: string;
  tags?: string[];
}

// 保存ステータスの型定義
export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

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
export interface UserProfile {
  id: string;
  email: string;
  github_username?: string;
  github_token?: string;
  preferred_repo?: string;
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