# GitHub 連携振り返りサービス MVP - 実装タスクリスト

## 🎯 MVP 核心機能

**「振り返り作成 → 保存ボタンクリック → GitHub 自動 Push」**

---

## 📋 Phase 1: 認証基盤（1-2 日）

### 1.1 プロジェクト初期化

- [x] Next.js 14+ プロジェクト作成
- [x] TypeScript 設定
- [x] Tailwind CSS + shadcn/ui セットアップ
- [x] ESLint/Prettier 設定
- [x] Git リポジトリ初期化

### 1.2 Supabase プロジェクト設定

- [x] Supabase アカウント作成・プロジェクト作成
- [x] データベーススキーマ設計・作成
  - [x] `user_profiles` テーブル作成
  - [x] RLS (Row Level Security) 設定
- [x] GitHub OAuth Provider 設定
- [x] 環境変数設定 (.env.local)

### 1.3 認証システム実装

- [x] Supabase Auth ヘルパー インストール・設定
- [x] `lib/supabase/client.ts` 作成
- [x] `hooks/use-auth.ts` カスタムフック作成
- [x] `middleware.ts` 保護されたルート設定
- [x] 認証コンテキスト Provider 作成

### 1.4 基本レイアウト・ページ

- [ ] `app/layout.tsx` ルートレイアウト
- [ ] `app/page.tsx` ランディングページ
- [ ] `app/(auth)/login/page.tsx` ログインページ
- [ ] ログイン・ログアウト機能

---

## 🚀 Phase 2: 核心機能（3-4 日）

### 2.1 GitHub API 統合

- [ ] GitHub OAuth App 作成・設定
- [ ] `lib/github/client.ts` GitHubClient クラス実装
- [ ] GitHub API エラーハンドリング
- [ ] API レート制限対応

### 2.2 リポジトリ管理機能

- [ ] `app/api/github/repos/route.ts` - リポジトリ一覧取得 API
- [ ] `app/(auth)/setup/page.tsx` - リポジトリ選択画面
- [ ] ユーザープロファイル管理
  - [ ] デフォルトリポジトリ選択・保存
  - [ ] `app/api/user/profile/route.ts` API

### 2.3 Markdown エディター実装

- [ ] `@uiw/react-md-editor` インストール・設定
- [ ] `components/features/reflection-editor.tsx` コンポーネント
- [ ] リアルタイムプレビュー機能
- [ ] 日付自動設定（今日の日付）
- [ ] ファイル名自動生成 (`YYYY-MM-DD.md`)

### 2.4 保存機能（核心機能）

- [ ] `app/api/github/save-reflection/route.ts` API
- [ ] GitHub ファイル作成・更新ロジック
- [ ] コミットメッセージ自動生成
- [ ] 保存状態管理 (idle/saving/success/error)
- [ ] エラーハンドリング・再試行機能

### 2.5 メイン画面統合

- [ ] `app/reflection/page.tsx` - 振り返り作成画面
- [ ] エディター + プレビュー レイアウト
- [ ] 保存ボタン実装
- [ ] 保存状態フィードバック UI

---

## 🎨 Phase 3: UI/UX（2-3 日）

### 3.1 Notion 風デザインシステム

- [ ] カラーパレット定義 (CSS Variables)
- [ ] タイポグラフィ設定
- [ ] `components/ui/` 共通コンポーネント
  - [ ] Button コンポーネント
  - [ ] Card コンポーネント
  - [ ] Loading Spinner
  - [ ] Toast 通知

### 3.2 レスポンシブデザイン

- [ ] モバイルファースト レイアウト
- [ ] ブレークポイント対応 (sm/md/lg)
- [ ] タッチ操作最適化
- [ ] モバイル用ナビゲーション

### 3.3 ユーザー体験改善

- [ ] ローディング状態改善
  - [ ] スケルトンローダー
  - [ ] 保存中アニメーション
- [ ] エラー表示改善
  - [ ] Toast 通知システム
  - [ ] インライン エラーメッセージ
- [ ] 成功時フィードバック

### 3.4 最終調整・テスト

- [ ] 3 クリック以内操作フロー確認
- [ ] 5 秒以内保存処理確認
- [ ] モバイル動作テスト
- [ ] エラーケーステスト

---

## 🔧 技術実装詳細

### 必要な依存関係

```bash
# Core
npm install next@latest react react-dom typescript
npm install @types/node @types/react @types/react-dom

# Styling
npm install tailwindcss @tailwindcss/typography
npm install @radix-ui/react-* (各種コンポーネント)

# Auth & Database
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# GitHub Integration
npm install @octokit/rest

# Markdown Editor
npm install @uiw/react-md-editor

# Form & Validation
npm install zod react-hook-form @hookform/resolvers

# State Management
npm install zustand (optional)
```

### ファイル構造

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── setup/page.tsx
│   ├── reflection/page.tsx
│   ├── api/
│   │   ├── github/
│   │   │   ├── repos/route.ts
│   │   │   └── save-reflection/route.ts
│   │   └── user/
│   │       └── profile/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui コンポーネント
│   ├── features/        # ビジネスロジック
│   └── layout/          # レイアウト
├── lib/
│   ├── supabase/
│   ├── github/
│   ├── utils.ts
│   └── validations.ts
├── types/
├── hooks/
└── providers/
```

---

## ✅ 成功定義（各フェーズ完了時）

### Phase 1 完了基準

- [ ] GitHub OAuth でログイン/ログアウトできる
- [ ] ユーザープロファイルが Supabase に保存される
- [ ] 保護されたルートが正常に動作する

### Phase 2 完了基準

- [ ] GitHub リポジトリ一覧が取得できる
- [ ] デフォルトリポジトリが設定できる
- [ ] Markdown エディターでテキスト入力・プレビューができる
- [ ] 保存ボタンクリックで GitHub にファイルが作成される

### Phase 3 完了基準

- [ ] 振り返り作成から保存まで 3 クリック以内
- [ ] 保存処理が 5 秒以内で完了
- [ ] モバイルでも正常に操作できる
- [ ] エラー時の適切なフィードバックが表示される

---

## 📝 タスク管理運用ルール

### 🔄 自動チェック運用

**実装完了時は必ずチェックボックスを更新:**

- `- [ ]` → `- [x]` に変更
- 完了時は即座にタスクリストを更新

### ✅ チェック更新のタイミング

- 機能が正常に動作することを確認後
- エラーなく実装が完了した時点
- 必要に応じてコミット前

### 📊 進捗確認

- 各 Phase 完了時に上記の成功定義を確認
- 完了したタスクから次に進むべきタスクを確認
- 優先順位に従って実装を進行

---

## 🚀 次のステップ

1. **Phase 1 から順次実装開始**
2. **各タスク完了時にチェック**
3. **問題発生時は適切にデバッグ・修正**
4. **MVP 完了後の拡張機能検討**

このタスクリストに沿って実装を進めましょう！どのフェーズから始めますか？
