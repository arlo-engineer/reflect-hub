# Vercel デプロイガイド

このガイドでは、Reflect Hub アプリケーションを Vercel にデプロイする方法を説明します。

## 🚀 自動設定済みの項目

以下の項目は既に設定済みで、自動で Vercel に適用されます：

- ✅ `vercel.json` - デプロイメント設定
- ✅ `next.config.js` - Next.js 最適化設定
- ✅ ビルド設定 - Node.js/npm 環境
- ✅ 静的/動的ページルーティング設定
- ✅ 環境変数のテンプレート設定
- ✅ **プリレンダリングエラー対策** - 認証ページの動的レンダリング設定

## 📋 手動で行う必要のある作業

### 1. GitHub リポジトリの準備

```bash
# リポジトリの初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリを作成し、プッシュ
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reflect-hub.git
git push -u origin main
```

### 2. Vercel アカウントの作成・ログイン

1. [Vercel](https://vercel.com/)にアクセス
2. GitHub アカウントでサインアップ/ログイン
3. GitHub リポジトリへのアクセス権限を許可

### 3. Vercel プロジェクトの作成

1. Vercel ダッシュボードで「New Project」をクリック
2. GitHub リポジトリ「reflect-hub」を選択
3. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install`

### 4. 環境変数の設定

Vercel プロジェクトの設定で以下の環境変数を設定してください：

#### 必須環境変数

| 変数名                          | 値                                        | 説明                      |
| ------------------------------- | ----------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://YOUR_PROJECT.supabase.co`        | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 匿名キー         |

#### Supabase 環境変数の取得方法

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左サイドバーの「Settings」→「API」をクリック
4. 以下の値をコピー：
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`に設定
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

### 5. デプロイの実行

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待機（約 2-5 分）
3. デプロイが成功すると、URL が表示される

### 6. ドメイン設定（オプション）

カスタムドメインを使用する場合：

1. Vercel プロジェクトの「Settings」→「Domains」
2. 「Add Domain」でドメインを追加
3. DNS の設定を行う（CNAME または A レコード）

## 🔧 トラブルシューティング

### ❌ プリレンダリングエラー（解決済み）

```
Error occurred prerendering page "/auth/callback"
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**解決方法**: このエラーは既に修正済みです。以下の対策が実装されています：

- ✅ 認証ページで動的レンダリングを強制設定
- ✅ Supabase クライアントのサーバーサイド初期化を防止
- ✅ 環境変数のフォールバック値を設定

### ビルドエラーが発生した場合

```bash
# ローカルでビルドテスト
npm run build
```

### 環境変数が正しく設定されているか確認

1. Vercel プロジェクトの「Settings」→「Environment Variables」
2. 設定した変数が表示されていることを確認
3. 変数を更新した場合は、再デプロイが必要

### GitHub OAuth 設定の更新

Vercel にデプロイした後、GitHub OAuth 設定を更新する必要があります：

1. [GitHub Developer Settings](https://github.com/settings/developers)
2. OAuth App を選択
3. 「Authorization callback URL」を更新：
   ```
   https://YOUR_VERCEL_DOMAIN.vercel.app/auth/callback
   ```

## 🌐 デプロイ後の確認事項

- [ ] アプリケーションが正常に表示される
- [ ] GitHub ログイン機能が動作する
- [ ] 振り返り作成・保存機能が動作する
- [ ] モバイルでの表示・操作が正常

## 📚 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. Vercel のデプロイログ
2. ブラウザのコンソールエラー
3. 環境変数の設定
4. GitHub OAuth 設定

---

**注意**: このガイドに従ってデプロイを行った後は、環境変数の設定と GitHub OAuth 設定の更新を忘れずに行ってください。
