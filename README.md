# 放送委員会 備品管理システム Vercel版

Vercelで公開して、PC・スマホから同じ備品データを使う版です。

## 構成

- `index.html`: 画面本体
- `api/data.js`: 共有データの読み書き
- Vercel Marketplace の Redis: 備品、保管場所、貸出履歴、写真、見取り図の保存先

## 必要なもの

- Vercelアカウント
- GitHubアカウント
- Vercel Marketplace の Redis 連携

## 公開手順

1. この `broadcast-equipment-vercel` フォルダをGitHubにアップロードします。
2. Vercelで「Add New Project」を押します。
3. GitHubのリポジトリを選びます。
4. デプロイします。
5. Vercel Marketplace から Redis 連携を追加し、このプロジェクトへ接続します。
6. もう一度デプロイします。

## 使い方

公開されたVercel URLをPCやスマホで開きます。
同じVercel URLから開いた端末は、同じデータを読み書きします。

## 注意

写真や見取り図はデータとして保存されるため、たくさん入れると重くなります。
大量の写真を扱う場合は、次の段階で Vercel Blob に分けるのがおすすめです。
