# Python Coding Learning Tool

大学生向けのPythonプログラミング教育支援ツール

Meta Llama Academy in Japan 2025 ハッカソンプロジェクト

## 機能

- **コードエディタ**: Monaco Editorを使用したPythonコードエディタ
- **ブラウザ内Python実行**: Pyodideを使用して完全にローカルでPythonコードを実行
- **ターミナル**: Python実行結果をリアルタイムで表示
- **AI相談機能**: LLMを使った学習サポート（答えは教えず、ヒントを提供）
- **問題管理**: 複数の練習問題を切り替えて学習

## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript
- **UIライブラリ**: shadcn/ui (Radix UI + Tailwind CSS)
- **コードエディタ**: Monaco Editor
- **Python実行環境**: Pyodide (WebAssembly)
- **LLM**: モック実装（SambaNova APIに差し替え予定）

## セットアップ

### 前提条件

- Node.js 20以上
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

ブラウザで http://localhost:3000 を開く

## プロジェクト構成

```
/
├── app/                    # Next.js App Router
│   ├── page.tsx           # メインページ
│   ├── layout.tsx         # ルートレイアウト
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── code-editor.tsx   # Monaco Editorラッパー
│   ├── terminal.tsx      # ターミナル表示
│   ├── ai-chat-dialog.tsx # AI相談ダイアログ
│   ├── problem-display.tsx # 問題表示
│   └── split-layout.tsx  # 左右分割レイアウト
├── lib/                   # ユーティリティ
│   ├── pyodide-runner.ts # Pyodide実行ロジック
│   ├── mock-llm.ts       # モックLLMロジック
│   └── utils.ts          # ヘルパー関数
├── types/                 # TypeScript型定義
│   └── problem.ts        # 問題データ型
└── data/                  # データ
    └── problems.ts       # 問題データ
```

## 使い方

1. **問題を選択**: 上部のタブで問題を選択
2. **コードを書く**: 左側のエディタでPythonコードを記述
3. **実行**: 右側の「実行」ボタンでコードを実行
4. **AI相談**: 右下の「AIに相談」ボタンでヒントを取得

## 今後の拡張

- [ ] SambaNova APIの統合
- [ ] テストケースの自動採点機能
- [ ] 進捗管理機能
- [ ] より多くの問題の追加
- [ ] コードのハイライト・補完機能の強化

## ライセンス

MIT
