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
      image: "assets/fairy_aqua_stand.webp", icon: "assets/fairy_aqua_icon.webp", iconShift: "translateY(-14%) scale(1.3)", face: { x: 0.46, y: 0.31, zoom: 1.7 }, locked: false
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

  const TALK = {
    "flare": {
    "wand": ["うおお！炎の杖だ！これでもっと燃えられるぞ！"],
    "daily_end": ["今日はよく燃えたな！続きはまた明日だ！"],
      "greet": [
        "今日も全力でいくぞ！",
        "燃えてきた！早く勝負しよう！",
        "準備はいいか？熱い一戦にしよう！"
      ],
      "morning": [
        "おはよう！朝から元気にいこう！"
      ],
      "noon": [
        "よし、今日も燃えていこう！"
      ],
      "night": [
        "夜でも元気だぞ！あと一勝負いこう！"
      ],
      "back": [
        "おかえり、{名前}！勝負、見てたぞ！",
        "おかえり！次の作戦を立てよう！"
      ],
      "win": [
        "よっしゃー！最高の勝利だ！",
        "完全燃焼！かっこよかったぞ！",
        "やったな、{名前}！"
      ],
      "lose": [
        "くやしい！次こそ燃やしてやる！",
        "まだまだ！ここからだぞ！"
      ],
      "draw": [
        "互角か！燃える展開だな！"
      ],
      "correct": [
        "ナイス推理！一直線だったな！",
        "{名前}、燃えてるな！"
      ],
      "streak": [
        "{名前}、連勝だ！止まらないぞ！"
      ],
      "rankup": [
        "{名前}、進級おめでとう！まだまだ上を目指そう！"
      ],
      "longtime": [
        "{名前}！待ってたぞ！また一緒に燃えよう！"
      ]
    },
    "aqua": {
    "wand": ["きれいな水の杖…ありがとう。大切にするね"],
    "daily_end": ["今日はたくさん遊んだね。続きはまた明日ね"],
      "greet": [
        "今日もいっしょにがんばろう",
        "ひと息ついてから始めようか"
      ],
      "morning": [
        "おはよう。今日もよろしくね"
      ],
      "noon": [
        "こんにちは。少しずつ進もうね"
      ],
      "night": [
        "こんばんは。無理しすぎないでね"
      ],
      "back": [
        "おかえり、{名前}。おつかれさま",
        "おかえり。少し休んでいく？"
      ],
      "win": [
        "落ち着いていて、かっこよかったよ",
        "うれしいな、{名前}"
      ],
      "lose": [
        "いい勝負だったよ。また挑戦しよう",
        "くやしい気持ちも、大事だね"
      ],
      "draw": [
        "最後まで、よくがんばったね"
      ],
      "correct": [
        "ひとつずつ考えたからだね",
        "よく見つけたね、{名前}"
      ],
      "streak": [
        "{名前}、連勝だね。すごいよ"
      ],
      "rankup": [
        "進級おめでとう、{名前}。いっしょにここまで来られてうれしいな"
      ],
      "longtime": [
        "{名前}、ひさしぶり。また会えてうれしいよ"
      ]
    },
    "aeru": {
    "wand": ["ぼ、僕に…？風の杖…！う、うれしい…！"],
    "daily_end": ["きょ、今日はいっぱい遊んだね…また明日も、会えるよね…？"],
      "greet": [
        "き、今日もよろしくね…",
        "ど、どきどきするね…"
      ],
      "morning": [
        "お、おはよう…ねむくない…？"
      ],
      "noon": [
        "こ、こんにちは…がんばろうね"
      ],
      "night": [
        "こ、こんばんは…夜もいっしょだよ"
      ],
      "back": [
        "お、おかえり、{名前}…！待ってたよ",
        "おかえり…ぶ、無事でよかった…"
      ],
      "win": [
        "か、勝った…！すごい…！",
        "{名前}、ほ、ほんとに勝っちゃった…！"
      ],
      "lose": [
        "く、くやしいね…でも、またやろう…？",
        "ぼ、僕がついてるから…！"
      ],
      "draw": [
        "ど、どっちも、すごかった…"
      ],
      "correct": [
        "わ、わかったんだね…！",
        "{名前}、す、すごい…！"
      ],
      "streak": [
        "れ、連勝…！{名前}、すごすぎるよ…！"
      ],
      "rankup": [
        "し、進級おめでとう、{名前}…！僕、ずっと応援してたよ"
      ],
      "longtime": [
        "{名前}…！ひ、ひさしぶり…会いたかった…"
      ]
    },
    "terra": {
    "wand": ["大地の杖か！積み重ねの証だな、ありがとう！"],
    "daily_end": ["今日の積み重ねはここまでだ！明日もコツコツいこう！"],
      "greet": [
        "今日も一歩ずつだ！",
        "コツコツいこう！"
      ],
      "morning": [
        "おはよう！朝の一歩が大事だ！"
      ],
      "noon": [
        "よし、今日も積み重ねていこう！"
      ],
      "night": [
        "夜まで頑張るとは、根性あるな！"
      ],
      "back": [
        "おかえり、{名前}！よく戻ったな！",
        "おかえり！次の一歩を踏み出そう！"
      ],
      "win": [
        "積み重ねが実ったな！",
        "堂々とした勝利だ、{名前}！"
      ],
      "lose": [
        "負けも積み重ねのひとつだ！",
        "立ち上がれば、それでいい！"
      ],
      "draw": [
        "粘り強かったな！"
      ],
      "correct": [
        "ヒントを積み重ねた成果だ！",
        "見事だ、{名前}！"
      ],
      "streak": [
        "{名前}、連勝だ！コツコツの力だな！"
      ],
      "rankup": [
        "{名前}、進級だ！ここまでの積み重ねを誇っていいぞ！"
      ],
      "longtime": [
        "{名前}！また会えたな！ここからまた積み重ねよう！"
      ]
    }
  };
  FAIRIES.forEach((f) => { f.talk = TALK[f.id] || {}; });

  const REVEAL_LINE = "答えを確認して、次の勝負に活かそう！";

  const FACE_HINATA = { x: 0.5, y: 0.40, zoom: 1.2, aspect: 638 / 550 };
  const FACE_SOUMA = { x: 0.5, y: 0.40, zoom: 1.2, aspect: 634 / 551 };
  const FACE_SOUMA_TRUE = { x: 0.52, y: 0.40, zoom: 1.2, aspect: 632 / 563 };

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
      id: "soft", name: "花音", reading: "かのん", level: "soft", levelLabel: "とてもやさしい", mark: "花", color: "#b9a0e0",
      profile: "おっとり優しく、初心者を迎える女の子",
      lines: { win: "わぁ、勝てちゃった。もう一回遊ぼう？", lose: "すごいね！次も一緒に遊んでね", draw: "同じだったね。なんだか嬉しいな" }, image: "assets/opp_soft_icon.webp", icon: "assets/opp_soft_icon.webp", iconFace: { x: 0.5, y: 0.5, zoom: 1.08, aspect: 1 }, ready: true
    },
    {
      id: "mid", name: "律", reading: "りつ", level: "mid", levelLabel: "ふつうの手前", mark: "律", color: "#8cc49a",
      profile: "明るい負けず嫌いの男の子",
      lines: { win: "よっしゃ！次も負けないぜ！", lose: "くっそ〜！次は絶対勝つからな！", draw: "いい勝負！次こそ決着つけようぜ！" }, image: "assets/opp_mid_icon.webp", icon: "assets/opp_mid_icon.webp", iconFace: { x: 0.5, y: 0.5, zoom: 1.08, aspect: 1 }, ready: true,
      unlock: { opponent: "hinata", wins: 2, text: "陽向に2回勝つと登場" }
    },
    {
      id: "rival", name: "澪", reading: "みお", level: "rival", levelLabel: "ふつう", mark: "澪", color: "#4a4f8f",
      profile: "冷静な分析家の女の子",
      lines: { win: "あなたの考え方、少し読めたわ", lose: "なるほど。私の予測を超えたのね", draw: "互角ね。次は違う手を試すわ" }, image: "assets/opp_rival_icon.webp", icon: "assets/opp_rival_icon.webp", iconFace: { x: 0.5, y: 0.5, zoom: 1.08, aspect: 1 }, ready: true,
      unlock: { opponent: "souma", wins: 1, text: "蒼真に1回勝つと登場" }
    },
    {
      id: "strong", name: "朔夜", reading: "さくや", level: "strong", levelLabel: "つよい", mark: "朔", color: "#a8323e",
      profile: "寡黙な実力者の男の子",
      lines: { win: "……まだ、本気じゃないだろう？", lose: "……見事だ。お前の勝ちだ", draw: "……悪くない。また来い" }, image: "assets/opp_strong_icon.webp", icon: "assets/opp_strong_icon.webp", iconFace: { x: 0.5, y: 0.5, zoom: 1.08, aspect: 1 }, ready: true,
      unlock: { opponent: "rival", wins: 2, text: "澪に2回勝つと登場" }
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

  const PLAYERS = [
    { id: "boy", name: "男の子", mark: "🧑", color: "#4f78b8", image: "assets/player_boy_icon.webp", icon: "assets/player_boy_icon.webp", iconFace: { x: 0.5, y: 0.52, zoom: 1.12, aspect: 881 / 847 } },
    { id: "girl", name: "女の子", mark: "🧑", color: "#c98a78", image: "assets/player_girl_icon.webp", icon: "assets/player_girl_icon.webp", iconFace: { x: 0.5, y: 0.52, zoom: 1.12, aspect: 877 / 850 } }
  ];

  const RANKS = [
    { min: 0, name: "新入生", frame: "bronze", badge: "" },
    { min: 3, name: "1年生", frame: "bronze", badge: "🔰" },
    { min: 8, name: "2年生", frame: "silver", badge: "⭐" },
    { min: 15, name: "3年生", frame: "gold", badge: "🌟" },
    { min: 25, name: "優等生", frame: "platinum", badge: "🏅" },
    { min: 40, name: "首席", frame: "rainbow", badge: "👑" }
  ];
  const WIN_POINTS = { hinata: 1, soft: 1, mid: 2, souma: 2, rival: 2, strong: 3, souma_true: 3 };

  const ORDER = ["soft", "hinata", "mid", "souma", "rival", "strong", "souma_true"];
  OPPONENTS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const SHOW_DRAFT = typeof location !== "undefined" && /[?&]draft=1/.test(location.search);
  const ACTIVE = OPPONENTS.filter((o) => o.ready !== false || SHOW_DRAFT);
  OPPONENTS.length = 0; ACTIVE.forEach((o) => OPPONENTS.push(o));

  const BOND_THEME = {
    flare: { main: "#e8553a", light: "#ffb08a", bg: "#fff1ea", ink: "#9a3a22", border: "#f7b79c" },
    aqua: { main: "#2f86d6", light: "#8cc8f5", bg: "#eef7ff", ink: "#225a8f", border: "#a9d3f5" },
    aeru: { main: "#2fa66e", light: "#8fdcb3", bg: "#eefaf3", ink: "#22704b", border: "#a6e0c1" },
    terra: { main: "#b8862e", light: "#f0cf7a", bg: "#fff8e8", ink: "#7a5418", border: "#ead197" }
  };

  const BOND_FRAME = {
    flare: { image: "assets/bond_frame_flare.webp", w: 837, h: 412, dy: 0 },
    aqua: { image: "assets/bond_frame_aqua.webp", w: 838, h: 412, dy: 0 },
    aeru: { image: "assets/bond_frame_aeru.webp", w: 845, h: 402, dy: -1.5 },
    terra: { image: "assets/bond_frame_terra.webp", w: 842, h: 402, dy: -1.5 }
  };

  const WANDS = { flare: "assets/wand_flare.webp", aqua: "assets/wand_aqua.webp", aeru: "assets/wand_aeru.webp", terra: "assets/wand_terra.webp" };
  const WAND_POS = { flare: { x: 55, bottom: 9, h: 24, r: 8 }, aqua: { x: 55, bottom: 9, h: 24, r: 8 }, aeru: { x: 55, bottom: 9, h: 24, r: 8 }, terra: { x: 56, bottom: 9, h: 24, r: 8 } };

  const BOND_REWARDS = [
    { at: 5, id: "wand", name: "魔法の杖（宝箱から）", short: "魔法の杖", ready: true },
    { at: 15, id: "secret", name: "特別なセリフ", short: "特別なセリフ", ready: true },
    { at: 30, id: "title", name: "称号「相棒」", short: "相棒の称号", ready: true },
    { at: 50, id: "sparkle", name: "キラキラ光る", short: "キラキラ", ready: true },
    { at: 100, id: "figure", name: "フィギュア", short: "フィギュア", ready: false }
  ];
  const BOND_SECRET = {
    flare: "実はな、最初は緊張してたんだ。でも{名前}と一緒だと、毎回燃えられる！ありがとな！",
    aqua: "{名前}と過ごす時間、とても落ち着くんだ。これからも、そばにいさせてね",
    aeru: "ぼ、僕ね…{名前}のパートナーになれて、ほんとに、ほんとに嬉しいんだ…！",
    terra: "{名前}が毎日積み重ねてきたこと、ちゃんと見てたぞ。お前は俺の自慢だ！"
  };

  const api = { WAND_POS, WANDS, BOND_FRAME, BOND_THEME, BOND_REWARDS, BOND_SECRET, FAIRIES, OPPONENTS, REVEAL_LINE, FURNITURE, PLAYERS, RANKS, WIN_POINTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.H1B_CHARS = api;
})(typeof window !== "undefined" ? window : this);
