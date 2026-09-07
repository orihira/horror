/**
 * ==========================================================================
 *  LEVELS.js — 「監視カメラチェック」1件 = 1オブジェクト。
 *  ここに追加していくだけで巡回するカメラを増やせます。
 * ==========================================================================
 *
 * CAM_LIST … サイドバーに出すカメラ一覧（実際の建物の並び＝カメラ番号順）。
 *            表示用のラベルのみで、ゲーム進行順とは別。
 *
 * LEVELS   … 実際にプレイする順番（＝異常を検知した順、という設定なので
 *            カメラ番号どおりではなく「怖さの強い順」に並んでいます）。
 *            各レベルは type: "check"（2枚見比べて異常をタップ）
 *            最後の1件だけ type: "finale"（全カメラ同時異変・タップで見る）。
 *
 *   - cam        … CAM_LIST と対応させるカメラ番号（"01"〜"12"）
 *   - corruption … 0〜1。上げるほど画面のノイズ・走査線・赤みが強くなる
 *   - log.before … 映像を確認する前に表示するログ風テキスト
 *   - log.after  … 異常を見つけたあとに表示するテキスト
 *   - images     … normal（基準映像）/ anomaly（現在の映像）のパス
 *   - diffs      … 異常の位置。x,y は画像の幅・高さに対する%、rは許容半径(%)
 * ==========================================================================
 */

const CAM_LIST = [
  { cam: "01", label: "エントランス" },
  { cam: "02", label: "1F 廊下" },
  { cam: "03", label: "階段（1F-2F）" },
  { cam: "04", label: "エレベーター" },
  { cam: "05", label: "駐車場" },
  { cam: "06", label: "2F 廊下" },
  { cam: "07", label: "和室" },
  { cam: "08", label: "リビング" },
  { cam: "09", label: "裏口" },
  { cam: "10", label: "階段（2F-3F）" },
  { cam: "11", label: "3F 廊下" },
  { cam: "12", label: "屋上" }
];

const LEVELS = [
  {
    id: 1, cam: "02", type: "check", corruption: 0.05,
    log: {
      before: "深夜0時。ローテーション監視、開始。\n1F廊下、変わった様子はない……はず。",
      after:  "奥に何か立っている気がした。\n映像のノイズだと思うことにする。"
    },
    images: { normal: "assets/cctv/cam02_normal.png", anomaly: "assets/cctv/cam02_anomaly.png" },
    diffs: [{ x: 50, y: 42, r: 12 }]
  },
  {
    id: 2, cam: "04", type: "check", corruption: 0.12,
    log: {
      before: "エレベーターホールを確認。\n特に呼び出し履歴もない時間帯のはず。",
      after:  "壁に、何か付着している。\n……映像の劣化だと思いたい。"
    },
    images: { normal: "assets/cctv/cam04_normal.png", anomaly: "assets/cctv/cam04_anomaly.png" },
    diffs: [{ x: 65, y: 58, r: 12 }]
  },
  {
    id: 3, cam: "11", type: "check", corruption: 0.20,
    log: {
      before: "3階の廊下。ここは普段から人通りが少ない。",
      after:  "床に黒い染みのようなものが広がっている。\n清掃記録には、何もない。"
    },
    images: { normal: "assets/cctv/cam11_normal.png", anomaly: "assets/cctv/cam11_anomaly.png" },
    diffs: [{ x: 50, y: 78, r: 13 }]
  },
  {
    id: 4, cam: "03", type: "check", corruption: 0.28,
    log: {
      before: "階段室のカメラに切り替える。\n窓には、夜の闇が映るだけのはず。",
      after:  "窓の奥に、顔のようなものが見えた。\n瞬きするあいだに消えていた。"
    },
    images: { normal: "assets/cctv/cam03_normal.png", anomaly: "assets/cctv/cam03_anomaly.png" },
    diffs: [{ x: 55, y: 36, r: 12 }]
  },
  {
    id: 5, cam: "10", type: "check", corruption: 0.36,
    log: {
      before: "2階から3階への階段。\n照明が一つ、切れかけている。",
      after:  "白いものが、階段の途中に立っている。\n動いては、いない。"
    },
    images: { normal: "assets/cctv/cam10_normal.png", anomaly: "assets/cctv/cam10_anomaly.png" },
    diffs: [{ x: 35, y: 40, r: 12 }]
  },
  {
    id: 6, cam: "06", type: "check", corruption: 0.46,
    log: {
      before: "2階の廊下に切り替える。\nさっきより、空気が重い気がする。",
      after:  "廊下の真ん中に、誰か立っている。\n住民には、見えない。"
    },
    images: { normal: "assets/cctv/cam06_normal.png", anomaly: "assets/cctv/cam06_anomaly.png" },
    diffs: [{ x: 50, y: 55, r: 12 }]
  },
  {
    id: 7, cam: "09", type: "check", corruption: 0.55,
    log: {
      before: "裏口のカメラ。\n施錠確認のため、毎晩必ずチェックする場所。",
      after:  "ドアの前に、誰かが立っている。\n中に入ろうとしている、ように見えた。"
    },
    images: { normal: "assets/cctv/cam09_normal.png", anomaly: "assets/cctv/cam09_anomaly.png" },
    diffs: [{ x: 65, y: 55, r: 12 }]
  },
  {
    id: 8, cam: "08", type: "check", corruption: 0.64,
    log: {
      before: "空き部屋のはずのリビング。\n家具は、そのまま残されている。",
      after:  "カーテンのそばに、誰か立っている。\nこの部屋に、鍵はかけたはずだった。"
    },
    images: { normal: "assets/cctv/cam08_normal.png", anomaly: "assets/cctv/cam08_anomaly.png" },
    diffs: [{ x: 50, y: 45, r: 12 }]
  },
  {
    id: 9, cam: "07", type: "check", corruption: 0.72,
    log: {
      before: "和室のカメラ。\nこの部屋だけ、なぜか電気がついている。",
      after:  "部屋の奥に、白い人影がある。\nさっきまでは、誰もいなかったのに。"
    },
    images: { normal: "assets/cctv/cam07_normal.png", anomaly: "assets/cctv/cam07_anomaly.png" },
    diffs: [{ x: 85, y: 38, r: 12 }]
  },
  {
    id: 10, cam: "05", type: "check", corruption: 0.80,
    log: {
      before: "駐車場を見回す。\n契約車両は、1台だけのはず。",
      after:  "車の後ろに、人が立っている。\n住民の誰とも、背格好が違う。"
    },
    images: { normal: "assets/cctv/cam05_normal.png", anomaly: "assets/cctv/cam05_anomaly.png" },
    diffs: [{ x: 50, y: 70, r: 12 }]
  },
  {
    id: 11, cam: "01", type: "check", corruption: 0.88,
    log: {
      before: "最後にエントランスを確認する。\nここを通らなければ、外には出られない。",
      after:  "白い服の誰かが、郵便受けの前に立っている。\n……この時間に、誰が。"
    },
    images: { normal: "assets/cctv/cam01_normal.png", anomaly: "assets/cctv/cam01_anomaly.png" },
    diffs: [{ x: 65, y: 35, r: 12 }]
  },
  {
    id: 12, cam: "12", type: "check", corruption: 0.95,
    log: {
      before: "屋上カメラ、最後の1台。\n本来、施錠されていて誰も入れない場所のはず。",
      after:  "手すりのそばに、白い人影が立っている。\n……全部のカメラを、見終えてしまった。"
    },
    images: { normal: "assets/cctv/cam12_normal.png", anomaly: "assets/cctv/cam12_anomaly.png" },
    diffs: [{ x: 55, y: 50, r: 12 }]
  },
  {
    id: 13, cam: null, type: "finale", corruption: 1,
    log: {
      before: "巡回を終えた直後、全カメラのモニターが一斉に切り替わった。\n\n……タップすると、表示されます。",
      after:  "12台すべてに、何かが映っている。\n\n通信が、途切れた。"
    },
    image: "assets/cctv/finale_anomaly.jpg"
  }

  // ▼▼ 新しいカメラチェックを追加する場合はここに ▼▼
  // {
  //   id: 14,
  //   cam: "06",              // CAM_LISTに無い番号なら CAM_LIST にも追記する
  //   type: "check",
  //   corruption: 0.5,
  //   log: { before: "……", after: "……" },
  //   images: { normal: "assets/cctv/camXX_normal.png", anomaly: "assets/cctv/camXX_anomaly.png" },
  //   diffs: [{ x: 50, y: 50, r: 12 }]
  // },
];

window.CAM_LIST = CAM_LIST;
window.LEVELS = LEVELS;
