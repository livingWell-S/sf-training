# Salesforce 開発練習用リポジトリ

このリポジトリは Salesforce 開発の練習用コードを管理するためのものです。

## プロジェクト構成

このプロジェクトは Salesforce DX (SFDX) の標準的なプロジェクト構造に従っています。

```
sf-training/
├── force-app/
│   └── main/
│       └── default/
│           ├── classes/          # Apex クラス
│           ├── triggers/         # Apex トリガー
│           ├── lwc/              # Lightning Web Components
│           ├── aura/             # Aura Components
│           ├── objects/          # カスタムオブジェクト
│           ├── tabs/             # タブ定義
│           ├── applications/     # アプリケーション
│           ├── flexipages/       # Lightning ページ
│           ├── layouts/          # ページレイアウト
│           ├── permissionsets/   # 権限セット
│           ├── profiles/         # プロファイル
│           └── staticresources/  # 静的リソース
├── .forceignore
└── sfdx-project.json
```

## 必要な環境

- Salesforce CLI (sf または sfdx)
- Node.js
- Git

## セットアップ

1. Salesforce CLI で組織を認証:
   ```bash
   sf org login web
   ```

2. ソースをデプロイ:
   ```bash
   sf project deploy start
   ```

3. ソースを取得:
   ```bash
   sf project retrieve start
   ```

## 開発ワークフロー

1. コードを編集
2. 組織にデプロイ
   ```bash
   sf project deploy start --source-dir force-app
   ```
3. 変更を確認
4. Git にコミット

## 参考リンク

- [Salesforce DX 開発者ガイド](https://developer.salesforce.com/docs/atlas.ja-jp.sfdx_dev.meta/sfdx_dev/)
- [Salesforce CLI コマンドリファレンス](https://developer.salesforce.com/docs/atlas.ja-jp.sfdx_cli_reference.meta/sfdx_cli_reference/)
