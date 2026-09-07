# 監視カメラシステム

深夜の集合住宅、12台の監視カメラを1台ずつ確認していくホラーサイトです。
各カメラの「基準映像（正常時）」と「現在の映像」を見比べて、異常な箇所をタップすると
次のカメラに進みます。確認するカメラを重ねるごとに、画面のノイズや走査線が強くなり、
最後は全12台のカメラが同時に映る画面に辿り着きます。

新しいカメラ（＝画像ペア）を追加するだけで、いくらでも巡回を長くできる構成にしてあります。

## 遊び方をローカルで確認する

`index.html` を直接ダブルクリックすると画像の読み込みが正しく動かないことがあるので、
簡易サーバーを立てて確認してください。

```bash
# このフォルダの中で
python3 -m http.server 8000
# → http://localhost:8000 をブラウザで開く
```

## GitHub Pages に公開する

1. このフォルダの中身をリポジトリの直下（もしくは `docs/` フォルダ）にそのまま置く
2. GitHub にリポジトリを作って push する

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<あなたのアカウント>/<リポジトリ名>.git
git push -u origin main
```

3. リポジトリの **Settings → Pages** で
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`（`docs/` に置いた場合はそちらを選択）

   を選んで保存すると、しばらくして
   `https://<あなたのアカウント>.github.io/<リポジトリ名>/` で公開されます。

   （※ `github.com/...` のリポジトリ画面ではなく、`github.io` の方のURLを開く必要があります）

## フォルダ構成

```
horror-game/
├── index.html          ヘッダー（サイトタイトル）＋<script>を並べただけの構成
├── css/style.css        黒地・走査線・ノイズのCCTVモニター風の見た目一式
├── js/levels.js         ★ここに「カメラチェック」を追加していくだけで内容を増やせる★
├── js/main.js           一覧⇄チェック画面の表示とゲーム進行（基本さわらなくてOK）
└── assets/cctv/         カメラ映像素材（normal=基準映像 / anomaly=現在の映像）
```

## 新しいカメラチェックを追加する方法

1. `assets/cctv/` に「基準映像（normal）」と「現在の映像（anomaly）」のペアを追加する
   （同じ構図・同じカメラ位置で、異常のある/なしだけが違う2枚を用意するのがコツです）
2. カメラが `CAM_LIST`（`js/levels.js` 冒頭）に無ければ追記する
3. `js/levels.js` の `LEVELS` 配列の、`finale`（末尾）より前にオブジェクトを1つ追加する

```js
{
  id: 14,
  cam: "06",                // CAM_LIST の番号と対応させる
  type: "check",
  corruption: 0.5,          // 0〜1。上げるほど画面のノイズ・走査線・赤みが強くなる
  log: {
    before: "映像を確認する前に表示するテキスト。",
    after:  "異常を見つけたあとに表示するテキスト。"
  },
  images: {
    normal:  "assets/cctv/camXX_normal.png",
    anomaly: "assets/cctv/camXX_anomaly.png"
  },
  diffs: [
    // x, y は画像の幅・高さに対する% (0〜100)、r は許容半径(%)
    { x: 50, y: 50, r: 12 }
  ]
}
```

異常の座標(%)がわからないときは、`anomaly` 画像をブラウザで開いて大体の位置を
目分量で決めて `diffs` に追加 → ブラウザでタップして微調整、が一番早いです。
（`r` を大きめにしておくとタップしやすくなります）

## 最終画面（finale）について

`LEVELS` の最後の1件だけ `type: "finale"` にしてあります。これは差分タップをせず、
1枚の画像をドーンと見せる演出用です。`assets/cctv/finale_anomaly.jpg` は
アップロードしていただいた「全12カメラが同時に異常を示す」画像をそのまま使っています。
差し替えたい場合はファイルを置き換えるだけでOKです。

## 音について

効果音は外部ファイルを使わず、Web Audio APIでその場で生成しています
（タップ時のビープ音、異常検知時のアラート音、最終演出のノイズ音）。
右上のボタンでミュート可能です。
