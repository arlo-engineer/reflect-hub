# Supabase セットアップ手順

## 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHub でサインイン
4. 「New project」をクリック
5. プロジェクト名: `reflect-hub` (任意)
6. データベースパスワードを設定
7. リージョンを選択（推奨: Tokyo/Asia）
8. プロジェクトを作成

## 2. データベーススキーマの適用

1. Supabase ダッシュボード → 「SQL Editor」
2. `database/schema.sql` の内容をコピー＆ペースト
3. 「Run」をクリックして実行

## 3. GitHub OAuth Provider 設定

### GitHub OAuth App 作成

1. GitHub → Settings → Developer settings → OAuth Apps
2. 「New OAuth App」をクリック
3. 設定値:
   - Application name: `Reflect Hub`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
4. 「Register application」をクリック
5. Client ID と Client Secret をメモ

### Supabase での GitHub Provider 設定

1. Supabase ダッシュボード → Authentication → Providers
2. GitHub を有効にする
3. GitHub OAuth の Client ID と Client Secret を入力
4. 「Save」をクリック

## 4. 環境変数設定

1. `.env.example` を `.env.local` にコピー
2. Supabase ダッシュボード → Settings → API から以下を取得:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. GitHub OAuth の情報を設定:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. `NEXTAUTH_SECRET` をランダムな文字列で設定

## 5. 動作確認

```bash
npm run dev
```

- ログインページでGitHub認証が動作することを確認
- ユーザープロファイルが自動作成されることを確認

## 注意事項

- **本番環境では**: callback URL を本番ドメインに変更
- **セキュリティ**: `.env.local` は `.gitignore` に含まれていることを確認
- **RLS**: Row Level Security が正しく動作していることを確認