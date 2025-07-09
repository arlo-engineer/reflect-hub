# Reflect Hub

**スマホで作成した振り返りを簡単にGitHubにpushできるサービス**

## 概要

Reflect Hubは、日々の振り返りを効率的に管理し、GitHubと連携してバージョン管理を行うWebアプリケーションです。

## 機能

- 📝 **振り返り作成**: スマホやPCから簡単に振り返りを作成
- 🔗 **GitHub連携**: 作成した振り返りを自動的にGitHubリポジトリにpush
- 📊 **履歴管理**: 過去の振り返りを時系列で確認・管理
- 📈 **分析機能**: 振り返りの傾向を分析して成長をサポート

## 技術スタック

- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: GitHub OAuth
- **Deployment**: Vercel
- **Code Quality**: ESLint
- **Version Control**: Git + GitHub

## 🚀 Vercelデプロイ

### クイックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Freflect-hub&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20required&demo-title=Reflect%20Hub&demo-description=GitHub%E9%80%A3%E6%90%BA%E6%8C%AF%E3%82%8A%E8%BF%94%E3%82%8A%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9)

### 詳細な手順

詳しいデプロイ手順については、[VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)を参照してください。

## 開発環境のセットアップ

### 必要な環境
- Node.js 18.0以上
- npm またはyarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/reflect-hub.git
cd reflect-hub
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.local.example .env.local
# .env.localファイルを編集して、Supabase設定を追加
```

4. 開発サーバーを起動
```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で確認できます。

## 環境変数

以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用ビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

## プロジェクト構成

```
reflect-hub/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── api/               # API Routes
│   │   └── ...
│   ├── components/            # UIコンポーネント
│   ├── hooks/                 # カスタムフック
│   ├── lib/                   # ユーティリティ関数
│   └── types/                 # TypeScript型定義
├── public/                    # 静的ファイル
├── database/                  # データベース設定
├── docs/                      # ドキュメント
├── vercel.json               # Vercelデプロイ設定
├── next.config.js            # Next.js設定
├── tailwind.config.js        # Tailwind CSS設定
├── tsconfig.json             # TypeScript設定
└── package.json              # パッケージ設定
```

## Contributing

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。