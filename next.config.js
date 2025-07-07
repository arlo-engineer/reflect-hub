/** @type {import('next').NextConfig} */
const nextConfig = {
  // 環境変数が設定されていない場合のビルドエラーを回避
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Vercelデプロイ用に最適化
  output: 'standalone',
  // 画像最適化
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig