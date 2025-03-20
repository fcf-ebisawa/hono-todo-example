# Hono Todo Example

このリポジトリは勉強会で使用するサンプルTodo APIアプリケーションです。

## 技術スタック

- [Hono](https://hono.dev/) - 軽量で高速なWebフレームワーク
- [Cloudflare Workers](https://workers.cloudflare.com/) - エッジでJavaScript/TypeScriptを実行するサーバーレス環境
- [Cloudflare KV](https://developers.cloudflare.com/kv/) - キーバリューストア

## セットアップと実行方法

### 依存関係のインストール

```bash
npm install
```

### ローカル開発サーバーの起動

```bash
npm run dev
```

このコマンドを実行すると、`http://localhost:8787` でローカル開発サーバーが起動します。

## API仕様

このアプリケーションは以下のエンドポイントを提供するRESTful APIです：

- `GET /todos` - 全てのTodoアイテムを取得
- `GET /todos/:id` - 特定のTodoアイテムを取得
- `POST /todos` - 新しいTodoアイテムを作成
- `PUT /todos/:id` - 既存のTodoアイテムを更新
- `DELETE /todos/:id` - Todoアイテムを削除

## テスト

APIのテストには付属のPostmanコレクション（`postman.json`）を使用できます。

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
