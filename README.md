# Paper EasyReader

TikTokのように論文を1件ずつ流し読みして、気になった論文をLike保存できるミニマルなMVPです。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 主な機能

- ホーム画面で論文カード（Title / Abstract / Link）を1件ずつ表示
- `Next` ボタンで次の論文へ
- `Like` ボタンまたはカードのダブルタップでLike保存
- Liked画面で保存済み論文の一覧表示と削除
- Like状態は `localStorage` で永続化

## ファイル構成

```txt
app/
  layout.tsx       # 共通レイアウト（ヘッダー + ナビ）
  page.tsx         # ホーム画面（カード表示、Next/Like操作）
  liked/page.tsx   # Like済み論文一覧画面
  globals.css      # Tailwind + 最小グローバルスタイル
components/
  PaperCard.tsx    # 論文カード
lib/
  papers.ts        # ダミー論文データ
  storage.ts       # localStorageへの保存・復元
```

## 今後の拡張ポイント

- `lib/papers.ts` のデータ取得を arXiv API 呼び出しへ差し替え
- スワイプジェスチャー（`Next`）の追加
- Like済みデータにメモやタグを付ける


## npm install がタイムアウトする場合

ネットワーク状況により `npm ERR! code ERR_SOCKET_TIMEOUT` が出ることがあります。
このリポジトリには `.npmrc` で以下を設定済みです。

- `fetch-timeout=300000`
- `fetch-retries=5`
- `fetch-retry-mintimeout=20000`
- `fetch-retry-maxtimeout=120000`
- `registry=https://registry.npmjs.org/`

それでも失敗する場合は、次を試してください。

```bash
npm cache clean --force
npm install --prefer-online
```

プロキシ配下の場合は `npm config get proxy` / `npm config get https-proxy` を確認し、
必要に応じて適切な値を設定してください。
