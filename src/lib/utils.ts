import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付フォーマット関数
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

// ファイル名生成関数
export function generateFileName(title?: string, date?: Date): string {
  const dateStr = formatDate(date || new Date());
  const titleSlug = title 
    ? title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : 'reflection';
  
  return `${dateStr}-${titleSlug}.md`;
}

// APIエラーハンドリング
export function handleApiError(error: any): { message: string; status: number; code?: string } {
  if (error.response) {
    return {
      message: error.response.data?.message || error.message,
      status: error.response.status,
      code: error.response.data?.code
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500
  };
}