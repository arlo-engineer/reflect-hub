# Vercelデプロイ手順

## 事前準備
1. GitHub リポジトリが作成済みであること
2. Supabase プロジェクトが作成済みであること
3. GitHub OAuth アプリが作成済みであること

## デプロイ手順

### 1. Vercel アカウントの準備
1. [Vercel](https://vercel.com) にアクセス
2. GitHub アカウントでログイン
3. Vercel ダッシュボードにアクセス

### 2. プロジェクトの作成
1. Vercel ダッシュボードで「New Project」をクリック
2. GitHub リポジトリを選択
3. 「Import」をクリック

### 3. プロジェクト設定
1. **Framework Preset**: Next.js（自動検出）
2. **Build and Output Settings**: デフォルト設定のまま
3. **Root Directory**: `.`（プロジェクトルート）

### 4. 環境変数の設定
以下の環境変数を Vercel プロジェクトに設定してください：

#### 必須環境変数
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

#### 環境変数の設定方法
1. Vercel ダッシュボードでプロジェクトを選択
2. 「Settings」タブをクリック
3. 「Environment Variables」セクションに移動
4. 各環境変数を「Production」「Preview」「Development」すべてに設定

### 5. Supabase の設定更新
1. Supabase ダッシュボードの「Authentication」→「URL Configuration」で以下を設定：
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

### 6. GitHub OAuth アプリの設定更新
1. GitHub の「Settings」→「Developer settings」→「OAuth Apps」
2. 対象のアプリを選択
3. 以下を更新：
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Authorization callback URL**: `https://your-domain.vercel.app/auth/callback`

### 7. デプロイ実行
1. Vercel で「Deploy」をクリック
2. ビルドとデプロイが完了するまで待機
3. デプロイ完了後、提供されたURLでアクセス確認

## 設定済みファイル
- `vercel.json`: Vercel の設定ファイル（作成済み）
- `package.json`: ビルドスクリプトが設定済み

## トラブルシューティング

### ビルドエラー
- 環境変数が正しく設定されているか確認
- TypeScript エラーがないか `npm run build` で確認

### 認証エラー
- Supabase と GitHub OAuth の URL 設定を確認
- 環境変数の値が正しいか確認

### GitHub API エラー
- GitHub OAuth の設定が正しいか確認
- GITHUB_CLIENT_ID と GITHUB_CLIENT_SECRET が正しいか確認

## 継続的デプロイ
- main ブランチへの push で自動デプロイが実行されます
- プレビューデプロイは PR 作成時に自動実行されます

## ドメインの設定（任意）
1. Vercel ダッシュボードで「Settings」→「Domains」
2. カスタムドメインを追加
3. DNS 設定を更新
4. 上記の環境変数とOAuth設定のURLを新しいドメインに更新