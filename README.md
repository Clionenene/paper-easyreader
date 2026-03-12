# Paper EasyReader

TikTokのように論文を1件ずつ流し読みしつつ、
「一行要約 + メモ + 復習」で理解を積み上げるためのミニマルWebアプリです。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 主な機能

- ホーム画面で論文カード（Title / Abstract / Link）を1件ずつ表示
- キーワード入力 + `Fetch` で arXiv API から論文を自動収集
- `Like` ボタンまたはカードのダブルタップで保存
- Like論文ごとに **一行要約** と **自由メモ** を保存（localStorage）
- 復習スケジュール（1日後 / 3日後 / 7日後）で復習対象を優先表示
- 復習中は「前回の要約/メモ」を先に表示し、`復習した` で次回へ進める
- 効果音/アニメーションの ON/OFF 設定（localStorage）
- Like時ハート演出、カード遷移の軽いアニメーション、メモ保存チェック表示

## ファイル構成

```txt
app/
  api/papers/route.ts   # arXiv取得API（fallbackあり）
  layout.tsx            # 共通レイアウト
  page.tsx              # ホーム（閲覧/Like/復習/設定）
  liked/page.tsx        # Like一覧（要約/メモ編集）
  globals.css           # グローバル + 軽量アニメーション
components/
  PaperCard.tsx         # 論文カード（復習情報/バッジ表示対応）
lib/
  arxiv.ts              # arXiv Atomレスポンスの取得・パース
  papers.ts             # Paper/LikedPaper型 + 復習ロジック + fallbackデータ
  storage.ts            # liked data / settings のlocalStorage保存
```

## 復習ロジック（MVP）

- `reviewCount = 0` → 次回は1日後
- `reviewCount = 1` → 次回は3日後
- `reviewCount >= 2` → 次回は7日後

## npm install がタイムアウトする場合

ネットワーク状況により `npm ERR! code ERR_SOCKET_TIMEOUT` が出ることがあります。
このリポジトリには `.npmrc` で以下を設定済みです。

- `fetch-timeout=300000`
- `fetch-retries=5`
- `fetch-retry-mintimeout=20000`
- `fetch-retry-maxtimeout=120000`
- `registry=https://registry.npmjs.org/`

それでも失敗する場合は次を試してください。

```bash
npm cache clean --force
npm install --prefer-online
```
