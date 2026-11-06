(function (root) {
  "use strict";

  const FAIRIES = [
    {
      id: "flare", name: "フレア", element: "火", gender: "女", trait: "熱血", mark: "🔥", color: "#e8735a",
      greeting: "まだまだいける！",
      lines: { win: "やった！この調子！", lose: "次は絶対勝つぞ！", draw: "いい勝負だったな！", correct: "大正解！熱くなってきた！" },
      image: "assets/fairy_flare_stand.webp", icon: "assets/fairy_flare_icon.webp", face: { x: 0.46, y: 0.32, zoom: 1.7 }, locked: false
    },
    {
      id: "aqua", name: "アクア", element: "水", gender: "男", trait: "優しい", mark: "💧", color: "#5aa8e8",
      greeting: "焦らなくていいからね",
      lines: { win: "やったね、おめでとう", lose: "大丈夫、次があるよ", draw: "どっちも頑張ったね", correct: "正解だよ、すごいね" },
      image: "assets/fairy_aqua_stand.webp", icon: "assets/fairy_aqua_icon.webp", face: { x: 0.46, y: 0.31, zoom: 1.7 }, locked: false
    },
    {
      id: "aeru", name: "エアル", element: "風", gender: "女", trait: "オドオド", mark: "🍃", color: "#5cc59a",
      greeting: "ぼ、僕も応援するよ",
      lines: { win: "や、やったね！", lose: "だ、大丈夫…次も応援するよ", draw: "ほっ、よかった…！", correct: "ぼ、僕も嬉しい！正解だよ" },
      image: "assets/fairy_aeru_stand.webp", icon: "assets/fairy_aeru_icon.webp", face: { x: 0.5, y: 0.33, zoom: 1.7 }, locked: false
    },
    {
      id: "terra", name: "テラ", element: "土", gender: "男", trait: "根性", mark: "⛰", color: "#c9a06a",
      greeting: "積み重ねが大事だ！",
      lines: { win: "努力の成果だ！", lose: "諦めずに続けよう！", draw: "積み重ねが次につながる！", correct: "よく考え抜いたな！" },
      image: "assets/fairy_terra_stand.webp", icon: "assets/fairy_terra_icon.webp", face: { x: 0.5, y: 0.32, zoom: 1.7 }, locked: false
    },
    {
      id: "luce", name: "ルーチェ", element: "光", gender: "", trait: "気品溢れる", mark: "✨", color: "#f0d27a",
      greeting: "あなたならできます",
      lines: { win: "お見事です。素晴らしい勝利ですね", lose: "次の挑戦も応援しています", draw: "互いに立派な戦いでした", correct: "素晴らしいお答えです" },
      image: "", locked: true, unlock: "全国ランク到達で解放"
    },
    {
      id: "noir", name: "ノワール", element: "闇", gender: "", trait: "無愛想だけど心が綺麗", mark: "🌙", color: "#9b7fd1",
      greeting: "……いいけど",
      lines: { win: "……やるな", lose: "……次がある", draw: "……悪くない勝負だ", correct: "……正解だ。頑張ったな" },
      image: "", locked: true, unlock: "100勝達成で解放"
    }
  ];

  const REVEAL_LINE = "答えを確認して、次の勝負に活かそう！";

  const FACE_HINATA = { x: 0.5, y: 0.44, zoom: 1.65, aspect: 638 / 550 };
  const FACE_SOUMA = { x: 0.5, y: 0.44, zoom: 1.65, aspect: 634 / 551 };
  const FACE_SOUMA_TRUE = { x: 0.52, y: 0.44, zoom: 1.65, aspect: 632 / 563 };

  const OPPONENTS = [
    {
      id: "hinata", name: "陽向", reading: "ひなた", level: "easy", levelLabel: "やさしい", mark: "陽", color: "#e9a35b",
      profile: "明るく親しみやすい新入生",
      lines: { win: "やった！また一緒に勝負しよう！", lose: "次こそ勝つよ！", draw: "すごい！次は決着つけようね！" },
      image: "assets/opp_hinata_icon.webp", icon: "assets/opp_hinata_icon.webp", iconFace: FACE_HINATA
    },
    {
      id: "souma", name: "蒼真", reading: "そうま", level: "normal", levelLabel: "ふつう", mark: "蒼", color: "#4f78b8",
      profile: "落ち着いた分析好きの生徒",
      lines: { win: "いい対戦だったね", lose: "見事だね。僕ももっと研究しないと。", draw: "互角か。次の一手が楽しみだね。" },
      image: "assets/opp_souma_icon.webp", icon: "assets/opp_souma_icon.webp", iconFace: FACE_SOUMA
    },
    {
      id: "souma_true", name: "蒼真・覚醒", reading: "そうま・かくせい", level: "hard", levelLabel: "最強", mark: "蒼", color: "#2b3f6b",
      profile: "隠しボス。蒼真の本気。全部のヒントを使って考える",
      lines: { win: "まだ、僕の本気には届かないよ。", lose: "……参った。君は本当に強いね。", draw: "ここまで互角とは……面白い。" },
      image: "assets/opp_souma_true_icon.webp", icon: "assets/opp_souma_true_icon.webp", iconFace: FACE_SOUMA_TRUE,
      hidden: true, unlock: { opponent: "souma", wins: 3, text: "蒼真に3回勝つと解放" }
    }
  ];

  const FURNITURE = [
    { id: "curtain", name: "カーテン", initial: true, image: "assets/furniture_curtain.webp", x: 18.7, y: 9.7, w: 49.7, skewY: 3.6, z: 1 },
    { id: "closet", name: "クローゼット", initial: true, image: "assets/furniture_closet.webp", x: 73.7, y: 18.6, w: 26.5, z: 2 },
    { id: "bed", name: "ベッド", initial: true, image: "assets/furniture_bed.webp", x: -13, y: 37.7, w: 40, z: 3 },
    { id: "armchair", name: "ひじ掛け椅子", initial: false, image: "assets/furniture_armchair.webp", x: 78.3, y: 50.8, w: 24, z: 4 }
  ];

  const api = { FAIRIES, OPPONENTS, REVEAL_LINE, FURNITURE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.H1B_CHARS = api;
})(typeof window !== "undefined" ? window : this);
