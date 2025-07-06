# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code（claude.ai/code）へのガイダンスを提供します。

## 概要

Reflect Hubは、GitHub統合型リフレクションサービスで、ユーザーがMarkdownリフレクションを作成し、ワンクリックでGitHubリポジトリに直接保存できます。このアプリケーションは、シンプルさと効率性に焦点を当てたMVPとして構築されています。

## 開発コマンド

```bash
# 開発
npm run dev        # localhost:3000で開発サーバーを起動
npm run build      # プロダクション用ビルド
npm run start      # プロダクションサーバーを起動
npm run lint       # ESLintコード品質チェックを実行
```

## コアアーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 15 with App Router
- **言語**: TypeScript
- **データベース**: Supabase (PostgreSQL with RLS)
- **認証**: Supabase Auth with GitHub OAuth
- **GitHub統合**: Octokit/rest API client
- **スタイリング**: Tailwind CSS + shadcn/ui components
- **Markdownエディター**: @uiw/react-md-editor

### 主要ディレクトリ構造
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # 認証ルート（ログイン、セットアップ）
│   ├── api/               # APIルート（GitHub、ユーザープロフィール）
│   ├── dashboard/         # 保護されたダッシュボード
│   └── reflection/        # メインリフレクションエディター
├── components/
│   ├── auth/             # 認証コンポーネント
│   ├── features/         # ビジネスロジックコンポーネント
│   └── ui/               # 再利用可能なUIコンポーネント（shadcn/ui）
├── lib/
│   ├── github/           # GitHub APIクライアントとユーティリティ
│   └── supabase.ts       # Supabaseクライアント設定
├── types/                # TypeScript型定義
└── hooks/                # カスタムReactフック
```

### データベーススキーマ
- **user_profiles**: GitHub統合を含むメインユーザーテーブル
  - UUIDを介して`auth.users`にリンク
  - GitHubユーザー名、アクセストークン、デフォルトリポジトリを保存
  - ユーザー分離のためのRow Level Security（RLS）を有効化

### 認証フロー
1. Supabase AuthによるGitHub OAuth
2. データベーストリガーによるユーザープロフィール自動作成
3. セッションにGitHubアクセストークンを保存（`provider_token`）
4. ファイル操作前のリポジトリ権限チェック

### GitHub統合
- **GitHubClient**クラス（`lib/github/client.ts`）がすべてのGitHub API操作を処理
- 自動リトライロジック付きのレート制限保護
- 一般的なGitHub APIエラー（401、403、404、422）のエラーハンドリング
- ターゲットリポジトリ内の`reflections/`ディレクトリでのファイル操作

### APIパターン
すべてのAPIルートは一貫したパターンに従います：
- Supabaseセッションによる認証チェック
- 適切なエラーレスポンス付きの入力検証
- 標準化されたJSONレスポンス形式：`{ success, message, data?, error? }`
- ユーザーフレンドリーなメッセージ付きのGitHub APIエラーハンドリング

## 主要コンポーネント

### ReflectionEditor (`components/features/reflection-editor.tsx`)
- ライブプレビュー付きメインMarkdownエディター
- `YYYY-MM-DD.md`としてファイル名を自動生成
- 保存状態（idle/saving/success/error）を管理
- GitHub保存APIと統合

### GitHubClient (`lib/github/client.ts`)
- リポジトリリスト、ファイル操作、権限チェックを処理
- 内蔵のレート制限とエラーハンドリング
- ファイル作成と更新の両方をサポート（SHA検出による）

### APIルート
- `/api/github/repos` - ユーザーのリポジトリリスト
- `/api/github/save-reflection` - GitHubへのリフレクション保存
- `/api/user/profile` - ユーザープロフィールとデフォルトリポジトリの管理

## 開発ガイドライン

### コンポーネントアーキテクチャ
- デフォルトでサーバーコンポーネント（Next.js App Router）
- 必要な場合のみクライアントコンポーネント（`"use client"`）
- `components/features/`内のフィーチャーコンポーネント
- shadcn/uiパターンに従うUIコンポーネント

### 状態管理
- ローカル状態にReactフック
- グローバル認証状態にSupabase
- 追加の状態管理ライブラリなし（MVPのシンプルさを保持）

### エラーハンドリング
- GitHub APIエラーはユーザーフレンドリーなメッセージに変換
- 待機時間付きのレート制限の優雅な処理
- 認証エラーはログインにリダイレクト

### 環境変数
必要な環境変数：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（サーバーサイド操作用）

## MVP重点領域

### コアユーザーフロー
1. **ログイン** GitHub OAuth経由
2. **セットアップ** デフォルトリポジトリ（一回限り）
3. **作成** Markdownエディターでリフレクション
4. **保存** ワンクリックでGitHubに

### 設計制約
- ログインから保存まで最大3クリック
- 保存操作は5秒以内に完了
- Notion風のクリーンなデザイン
- スマートフォン使用に対応したモバイルレスポンシブ

### 現在の実装状況
- ✅ GitHub OAuthによる認証システム
- ✅ リポジトリ選択と管理
- ✅ ライブプレビュー付きMarkdownエディター
- ✅ GitHubファイル保存機能
- ✅ エラーハンドリングとユーザーフィードバック
- ⚠️ UI/UX改善が必要（フェーズ3）

## テスト戦略

現在、正式なテストフレームワークは設定されていません。開発時：
- 認証フローの手動テスト
- レート制限付きGitHub API統合テスト
- モバイルレスポンシブテスト
- エラーシナリオテスト（ネットワーク障害、API制限）

## デプロイ

- **プラットフォーム**: Vercel（Next.js最適化）
- **データベース**: Supabaseクラウドインスタンス
- **環境**: プロダクションビルドにはすべての環境変数が必要