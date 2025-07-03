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
- **Code Quality**: ESLint
- **Version Control**: Git + GitHub

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

3. 開発サーバーを起動
```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で確認できます。

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用ビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

## プロジェクト構成

```
reflect-hub/
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Contributing

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。