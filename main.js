(function () {
  "use strict";
  const H = window.H1B;
  const $ = (id) => document.getElementById(id);
  const TURN_SECONDS = 60;
  const CPU_THINK_MS = 900;
  const STATS_KEY = "lblia_1h1b_stats_v1";
  const PARTNER_KEY = "lblia_1h1b_partner_v1";
  const C = window.H1B_CHARS;
  const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLScvvz28U3uoSHag8P7O8I6kNaXPeHzBkB5ozZs5PR_6K0dHjw/viewform";
  const SND = window.H1B_SOUND || { play() {}, setEnabled() {}, isEnabled: () => false };
  const BGM = window.H1B_BGM || { setScene() {}, setEnabled() {}, isEnabled: () => false, duck() {}, jingle() {}, stopJingle() {}, prepareJingles() {} };

  function loadPartnerId() {
    try { return localStorage.getItem(PARTNER_KEY); } catch (e) { return null; }
  }
  let partnerId = loadPartnerId();
  function partner() {
    return C.FAIRIES.find((f) => f.id === partnerId && !f.locked) || C.FAIRIES[0];
  }
  function savePartner(id) {
    partnerId = id;
    try { localStorage.setItem(PARTNER_KEY, id); } catch (e) {  }
  }
  const AVATAR_KEY = "lblia_1h1b_avatar_v1";
  let avatarId = null;
  try { avatarId = localStorage.getItem(AVATAR_KEY); } catch (e) {  }
  function playerAvatar() { return (C.PLAYERS || []).find((p) => p.id === avatarId) || null; }
  function saveAvatar(id) {
    avatarId = id;
    try { localStorage.setItem(AVATAR_KEY, id); } catch (e) {  }
  }
  let setupFlow = false;
  function setupNext() {
    if (!howtoSeen) return show("howto");
    if (!playerAvatar()) return show("avatar");
    if (!nameAsked()) return show("name");
    if (!partnerId) return show("partner");
    setupFlow = false;
    show("room");
  }
  const NAME_KEY = "lblia_1h1b_name_v1";
  const NAME_ASKED_KEY = "lblia_1h1b_name_asked_v1";
  function playerName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } }
  function nameAsked() { try { return localStorage.getItem(NAME_ASKED_KEY) === "yes"; } catch (e) { return true; } }
  function saveName(name) {
    try { localStorage.setItem(NAME_ASKED_KEY, "yes"); if (name) localStorage.setItem(NAME_KEY, name); else localStorage.removeItem(NAME_KEY); } catch (e) {  }
  }
  function say(p, scene, base) {
    const n = playerName();
    let list = [].concat(base ? [base] : [], (p.talk && p.talk[scene]) || []);
    if (!n) list = list.filter((t) => !t.includes("{名前}"));
    if (!list.length) return base || "";
    const t = list[Math.floor(Math.random() * list.length)];
    return t.replace(/\{名前\}/g, n);
  }
  function sayNamed(p, scene, base) {
    const n = playerName(), list = (p.talk && p.talk[scene]) || [];
    const named = list.filter((t) => t.includes("{名前}"));
    if (n && named.length) return named[Math.floor(Math.random() * named.length)].replace(/\{名前\}/g, n);
    return say(p, scene, base);
  }
  function timeScene() { const h = new Date().getHours(); return h >= 5 && h <= 10 ? "morning" : h >= 11 && h <= 17 ? "noon" : "night"; }
  function greet(p) { return Math.random() < 0.35 ? say(p, timeScene()) : say(p, "greet", p.greeting); }
  const LAST_VISIT_KEY = "lblia_1h1b_last_visit_v1";
  const longTimeNoSee = (() => {
    let last = 0; try { last = Number(localStorage.getItem(LAST_VISIT_KEY)) || 0; localStorage.setItem(LAST_VISIT_KEY, String(Date.now())); } catch (e) {  }
    return last > 0 && Date.now() - last >= 3 * 24 * 60 * 60 * 1000;
  })();
  let longTimeShown = false;
  let backFromPlay = false;

  function rankFor(wins) { let r = C.RANKS[0]; C.RANKS.forEach((x) => { if (wins >= x.min) r = x; }); return r; }
  function nextRank(wins) { return C.RANKS.find((x) => x.min > wins) || null; }
  function schoolPoints(st) {
    st = st || loadStats(); let pts = 0;
    Object.entries(st.byOpp || {}).forEach(([id, r]) => { pts += (r.win || 0) * (C.WIN_POINTS[id] || 1); });
    return pts;
  }

  function opponentById(id) { return C.OPPONENTS.find((o) => o.id === id) || C.OPPONENTS[0]; }
  function isUnlocked(o, st) {
    if (!o.unlock) return true;
    const rec = (st || loadStats()).byOpp[o.unlock.opponent];
    return !!rec && rec.win >= o.unlock.wins;
  }

  function renderAvatar(el, ch, mode = "face") {
    el.style.setProperty("--c", ch.color);
    el.textContent = "";
    el.classList.toggle("is-stand", !!(ch.image && mode === "stand"));
    el.classList.toggle("has-img", !!ch.image);
    if (ch.image) {
      const img = document.createElement("img");
      img.src = ch.image; img.alt = ch.name; img.draggable = false;
      if (mode === "face" && ch.icon && ch.iconFace) {
        const f = ch.iconFace;
        img.src = ch.icon; img.className = "face";
        img.style.width = f.zoom * 100 + "%";
        img.style.left = 50 - f.x * f.zoom * 100 + "%";
        img.style.top = 50 - f.y * f.zoom * 100 * f.aspect + "%";
      } else if (mode === "face" && ch.icon) {
        img.src = ch.icon; img.className = "icon";
      } else if (mode === "face" && ch.face) {
        const f = ch.face, aspect = 724 / 543;
        img.className = "face";
        img.style.width = f.zoom * 100 + "%";
        img.style.left = 50 - f.x * f.zoom * 100 + "%";
        img.style.top = 50 - f.y * f.zoom * 100 * aspect + "%";
      }
      el.appendChild(img);
    } else {
      el.textContent = ch.mark;
    }
    el.title = ch.name;
  }

  function loadStats() {
    const empty = { practice: { games: 0, totalMoves: 0, best: null }, battle: { win: 0, lose: 0, draw: 0 }, byOpp: {} };
    try {
      const raw = localStorage.getItem(STATS_KEY);
      const st = raw ? Object.assign(empty, JSON.parse(raw)) : empty;
      st.byOpp = st.byOpp || {};
      return st;
    } catch (e) {
      return empty;
    }
  }
  function saveStats(stats) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {  }
  }

  let S = null;
  let secretInput = [];
  let timerId = null;
  let cpuTimeoutId = null;

  let homeScreen = "title";
  function show(name) {
    if (name === "home") name = homeScreen;
    if (name === "room" && S && S.over) { backFromPlay = true; S = null; }
    if (name === "room" || name === "title") homeScreen = name;
    document.querySelectorAll(".screen").forEach((el) => { el.hidden = el.id !== "screen-" + name; });
    if (name !== "play") stopTimers();
    BGM.stopJingle();
    BGM.setScene(name === "practice" ? "battle" : name === "room" ? "avatar" : "main");
    if (name === "stats") { renderStats(); $("reset-confirm").hidden = true; $("reset-btn").hidden = false; }
    if (name === "title") renderTitle();
    if (name === "room") renderRoom();
    if (name === "partner") renderPartner();
    if (name === "avatar") renderAvatarChoice();
    if (name === "name") { $("name-input").value = playerName(); $("name-msg").textContent = ""; }
    if (name === "howto") renderHowto(0);
    if (name === "battle-setup") { renderOpponentOptions(); secretInput = []; renderSlots("secret-slots", secretInput); $("setup-msg").textContent = ""; renderKeypadUsed("secret", secretInput); }
    if (name === "dice") resetDice();
    if (name === "practice") { markPracticeDone(); startPractice(); return; }
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));

  function stopTimers() {
    clearInterval(timerId); timerId = null;
    clearTimeout(cpuTimeoutId); cpuTimeoutId = null;
  }

  function buildKeypad(kind, getInput, onChange) {
    const pad = document.querySelector(`[data-keypad="${kind}"]`);
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach((n) => {
      const b = document.createElement("button");
      b.textContent = n; b.dataset.n = n;
      b.addEventListener("click", () => {
        const input = getInput();
        if (!input) return;
        if (input.length >= 4) return msgFor(kind, "4桁まで入力できます");
        if (input.includes(n)) return msgFor(kind, "同じ数字は使えません");
        if (input.length === 0 && n === 0) return msgFor(kind, "先頭に0は使えません");
        input.push(n); msgFor(kind, ""); SND.play("tap"); onChange();
      });
      pad.appendChild(b);
    });
    const back = document.createElement("button");
    back.textContent = "↩ 1つ消す"; back.className = "wide";
    back.addEventListener("click", () => { const i = getInput(); if (i && i.length) { i.pop(); SND.play("erase"); onChange(); } });
    const clear = document.createElement("button");
    clear.textContent = "全消し"; clear.className = "wide clear";
    clear.addEventListener("click", () => { const i = getInput(); if (i) { i.length = 0; SND.play("erase"); onChange(); } });
    pad.append(back, clear);
  }
  function msgFor(kind, text) { $(kind === "secret" ? "setup-msg" : "play-msg").textContent = text; }
  function renderKeypadUsed(kind, input) {
    document.querySelectorAll(`[data-keypad="${kind}"] button[data-n]`).forEach((b) => {
      b.classList.toggle("used", input.includes(Number(b.dataset.n)));
    });
  }
  function renderSlots(id, input) {
    const box = $(id); box.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const d = document.createElement("div");
      d.className = "slot" + (input[i] === undefined ? " empty" : "");
      d.textContent = input[i] === undefined ? "＿" : input[i];
      box.appendChild(d);
    }
  }

  buildKeypad("secret", () => secretInput, () => { renderSlots("secret-slots", secretInput); renderKeypadUsed("secret", secretInput); });
  buildKeypad("guess", () => (S && !S.over && S.canInput ? S.input : null), () => { renderSlots("guess-slots", S.input); renderKeypadUsed("guess", S.input); });
  document.querySelector('[data-keypad="guess"]').appendChild($("call-btn"));

  function resetMemo() {
    const box = $("memo"); box.innerHTML = "";
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((n) => {
      const b = document.createElement("button");
      b.className = "memo-cell"; b.dataset.state = "";
      b.innerHTML = `<span class="d">${n}</span><span class="m"></span>`;
      b.addEventListener("click", () => {
        const next = { "": "ok", ok: "ng", ng: "" }[b.dataset.state];
        b.dataset.state = next;
        b.className = "memo-cell" + (next ? " " + next : "");
        b.querySelector(".m").textContent = { "": "", ok: "○", ng: "×" }[next];
      });
      box.appendChild(b);
    });
  }

  function renderHistory(listId, hist) {
    const ol = $(listId); ol.innerHTML = "";
    hist.forEach((h, i) => {
      const li = document.createElement("li");
      if (h.result && h.result.hit === 4) li.className = "solved";
      li.innerHTML = h.skip
        ? `<span class="n">${i + 1}</span><span class="g">時間切れ</span><span class="r">—</span>`
        : `<span class="n">${i + 1}</span><span class="g">${h.guess.join("")}</span><span class="r"><span class="hit">${h.result.hit}H</span> <span class="blow">${h.result.blow}B</span></span>`;
      ol.appendChild(li);
    });
    ol.scrollTop = ol.scrollHeight;
  }

  function startPractice() {
    stopTimers();
    BGM.stopJingle(); BGM.prepareJingles();
    S = { mode: "practice", secret: H.makeSecret(), input: [], hist: [], over: false, canInput: true };
    BGM.setScene("battle");
    document.querySelectorAll(".screen").forEach((el) => { el.hidden = el.id !== "screen-play"; });
    $("mode-label").textContent = "練習モード";
    $("round-label").textContent = "回数制限なし";
    $("turn-label").textContent = "答えを推理しよう！";
    $("timer").hidden = true;
    $("my-secret-box").hidden = true;
    $("hist-cpu-box").hidden = true;
    renderAvatar($("play-fairy"), playerAvatar() || partner());
    $("play-opp").hidden = true;
    document.querySelector(".histories").classList.add("single");
    $("giveup-btn").textContent = "答えを見る";
    resetPlayUI();
  }

  function resetPlayUI() {
    $("result").hidden = true;
    $("play-msg").textContent = "";
    renderSlots("guess-slots", S.input);
    renderKeypadUsed("guess", S.input);
    renderHistory("hist-player", S.mode === "practice" ? S.hist : S.pHist);
    renderHistory("hist-cpu", S.mode === "battle" ? S.cHist : []);
    resetMemo();
    setInputEnabled(S.canInput);
    window.scrollTo(0, 0);
  }

  function setInputEnabled(on) {
    $("call-btn").disabled = !on;
    document.querySelectorAll('[data-keypad="guess"] button').forEach((b) => { b.disabled = !on; });
  }

  $("secret-random").addEventListener("click", () => {
    secretInput = H.makeSecret();
    renderSlots("secret-slots", secretInput); renderKeypadUsed("secret", secretInput); $("setup-msg").textContent = "";
  });
  $("secret-ok").addEventListener("click", () => {
    if (!H.isValid(secretInput)) { $("setup-msg").textContent = "4桁の秘密の数字を決めてね"; return; }
    show("dice");
  });

  let dice = null;
  function resetDice() {
    dice = null;
    $("dice-opp-name").textContent = opponentById($("cpu-level").value).name;
    $("die-player").textContent = "?"; $("die-cpu").textContent = "?";
    $("dice-msg").textContent = "";
    $("dice-roll").hidden = false; $("dice-roll").disabled = false; $("dice-start").hidden = true;
  }
  $("dice-roll").addEventListener("click", () => {
    $("dice-roll").disabled = true;
    const dp = $("die-player"), dc = $("die-cpu");
    dp.classList.add("rolling"); dc.classList.add("rolling");
    let ticks = 0;
    const spin = setInterval(() => {
      dp.textContent = H.rollDie(); dc.textContent = H.rollDie(); SND.play("dice");
      if (++ticks < 10) return;
      clearInterval(spin);
      dp.classList.remove("rolling"); dc.classList.remove("rolling");
      const p = H.rollDie(), c = H.rollDie();
      dp.textContent = p; dc.textContent = c; SND.play("diceEnd");
      if (p === c) { $("dice-msg").textContent = "同じ目！もう一度ふってね"; $("dice-roll").disabled = false; return; }
      dice = p > c ? "player" : "cpu";
      $("dice-msg").textContent = dice === "player" ? "あなたが先攻！" : `${opponentById($("cpu-level").value).name}が先攻！`;
      $("dice-roll").hidden = true; $("dice-start").hidden = false;
    }, 70);
  });
  $("dice-start").addEventListener("click", () => startBattle(dice));

  function startBattle(first) {
    stopTimers();
    const opp = opponentById($("cpu-level").value);
    BGM.setScene("battle"); BGM.prepareJingles();
    S = {
      mode: "battle",
      opp, level: opp.level,
      pSecret: secretInput.slice(),
      cSecret: H.makeSecret(),
      first, current: first, round: 1,
      pHist: [], cHist: [],
      pSolved: false, cSolved: false,
      input: [], over: false, canInput: false
    };
    document.querySelectorAll(".screen").forEach((el) => { el.hidden = el.id !== "screen-play"; });
    $("mode-label").textContent = "対戦中！";
    $("timer").hidden = false;
    $("my-secret-box").hidden = false;
    $("my-secret").textContent = S.pSecret.join("");
    $("hist-cpu-box").hidden = false;
    $("hist-cpu-title").textContent = `${opp.name}のコール`;
    renderAvatar($("play-fairy"), playerAvatar() || partner());
    renderAvatar($("play-opp"), opp); $("play-opp").hidden = false;
    document.querySelector(".histories").classList.remove("single");
    $("giveup-btn").textContent = "あきらめる";
    resetPlayUI();
    startTurn();
  }

  function second() { return S.first === "player" ? "cpu" : "player"; }

  function startTurn() {
    $("round-label").textContent = `ラウンド ${S.round}`;
    if (S.current === "player") {
      S.canInput = true; setInputEnabled(true);
      $("turn-label").textContent = "あなたのターン";
      S.timeLeft = TURN_SECONDS; renderTimer();
      timerId = setInterval(() => {
        S.timeLeft--; renderTimer();
        if (S.timeLeft > 0 && S.timeLeft <= 5) SND.play("tick");
        if (S.timeLeft <= 0) {
          clearInterval(timerId); timerId = null;
          S.pHist.push({ skip: true }); SND.play("timeout");
          S.input = []; renderSlots("guess-slots", S.input); renderKeypadUsed("guess", S.input);
          renderHistory("hist-player", S.pHist);
          $("play-msg").textContent = "時間切れ！ターンはスキップ";
          endTurn();
        }
      }, 1000);
    } else {
      S.canInput = false; setInputEnabled(false);
      $("turn-label").textContent = `${S.opp.name}が考え中…`;
      $("timer").textContent = "⏱ --"; $("timer").classList.remove("danger");
      cpuTimeoutId = setTimeout(cpuTurn, CPU_THINK_MS);
    }
  }

  function renderTimer() {
    $("timer").textContent = "⏱ " + S.timeLeft;
    $("timer").classList.toggle("danger", S.timeLeft <= 10);
  }

  function cpuTurn() {
    cpuTimeoutId = null;
    const guess = H.cpuGuess(S.level, S.cHist);
    const result = H.judge(guess, S.pSecret);
    S.cHist.push({ guess, result }); SND.play("cpu");
    if (result.hit === 4) S.cSolved = true;
    renderHistory("hist-cpu", S.cHist);
    endTurn();
  }

  function endTurn() {
    if (S.current === second()) {
      const outcome = H.roundOutcome(S.pSolved, S.cSolved);
      if (outcome) return finishBattle(outcome);
      S.round++;
    }
    S.current = S.current === "player" ? "cpu" : "player";
    startTurn();
  }

  $("call-btn").addEventListener("click", () => {
    if (!S || S.over || !S.canInput) return;
    if (S.input.length !== 4) { $("play-msg").textContent = "4桁入力してね！"; return; }
    const guess = S.input.slice();
    S.input = []; renderSlots("guess-slots", S.input); renderKeypadUsed("guess", S.input);
    if (S.mode === "practice") {
      const result = H.judge(guess, S.secret);
      S.hist.push({ guess, result });
      renderHistory("hist-player", S.hist);
      $("play-msg").textContent = "";
      SND.play(result.hit === 4 ? "correct" : "result", result.hit);
      if (result.hit === 4) { setTimeout(() => { if (SND.isEnabled()) BGM.jingle("win"); }, 450); finishPractice(false); }
      return;
    }
    stopTimers();
    const result = H.judge(guess, S.cSecret);
    S.pHist.push({ guess, result });
    if (result.hit === 4) S.pSolved = true;
    SND.play(result.hit === 4 ? "correct" : "result", result.hit);
    renderHistory("hist-player", S.pHist);
    $("play-msg").textContent = "";
    S.canInput = false; setInputEnabled(false);
    endTurn();
  });

  function finishPractice(revealed) {
    S.over = true; S.canInput = false; setInputEnabled(false);
    const moves = S.hist.length;
    if (!revealed) {
      const st = loadStats();
      st.practice.games++; st.practice.totalMoves += moves;
      st.practice.best = st.practice.best === null ? moves : Math.min(st.practice.best, moves);
      saveStats(st);
    }
    const p = partner();
    showResult(revealed ? "答え" : "正解！🎉",
      revealed ? `答えは ${S.secret.join("")} でした` : `${moves}手で正解！（答え ${S.secret.join("")}）`,
      revealed ? C.REVEAL_LINE : say(p, "correct", p.lines.correct), null, "", { win: !revealed });
  }

  function finishBattle(outcome, gaveUp) {
    stopTimers();
    S.over = true; S.canInput = false; setInputEnabled(false);
    const st = loadStats();
    const before = C.OPPONENTS.filter((o) => isUnlocked(o, st)).map((o) => o.id);
    st.battle[outcome]++;
    st.streak = outcome === "win" ? (st.streak || 0) + 1 : 0;
    const rec = st.byOpp[S.opp.id] || (st.byOpp[S.opp.id] = { win: 0, lose: 0, draw: 0 });
    rec[outcome]++;
    saveStats(st);
    const newly = C.OPPONENTS.filter((o) => isUnlocked(o, st) && !before.includes(o.id));
    setTimeout(() => { if (outcome === "draw") SND.play("draw"); else if (SND.isEnabled()) BGM.jingle(outcome); }, 350);
    if (newly.length) { setTimeout(() => SND.play("correct"), 1300); renderOpponentOptions(); }
    const title = { win: "勝ち！🎉", lose: gaveUp ? "降参…" : "負け…", draw: "引き分け" }[outcome];
    $("turn-label").textContent = title;
    $("timer").textContent = "⏱ --"; $("timer").classList.remove("danger");
    const oppView = { win: "lose", lose: "win", draw: "draw" }[outcome];
    const ptsNow = schoolPoints(st), ptsGot = outcome === "win" ? (C.WIN_POINTS[S.opp.id] || 1) : 0;
    const rankBefore = rankFor(ptsNow - ptsGot), rankNow = rankFor(ptsNow);
    const rankMsg = rankNow !== rankBefore ? `\n🎓 「${rankNow.name}」に進級しました！` : "";
    if (rankMsg && !newly.length) setTimeout(() => SND.play("correct"), 1300);
    const unlockMsg = rankMsg + newly.map((o) => o.hidden ? `\n🔓 隠しボス「${o.name}」が解放されました！` : `\n✨ 新しい対戦相手「${o.name}」が現れた！`).join("");
    const games = st.battle.win + st.battle.lose + st.battle.draw;
    let askFeedback = false;
    try { askFeedback = !!FEEDBACK_URL && games >= 3 && localStorage.getItem(ASK_KEY) !== "done"; if (askFeedback) localStorage.setItem(ASK_KEY, "done"); } catch (e) {  }
    showResult(title, `${S.opp.name}の数字は ${S.cSecret.join("")}（ラウンド ${S.round}）${unlockMsg}`,
      rankMsg ? sayNamed(partner(), "rankup") : outcome === "win" && st.streak >= 3 ? sayNamed(partner(), "streak") : say(partner(), outcome, partner().lines[outcome]),
      S.opp, S.opp.lines[oppView] || "",
      { win: outcome === "win", boss: outcome === "win" && !!S.opp.hidden, logo: { win: "victory", lose: "lose" }[outcome], ask: askFeedback });
  }

  function celebrate(fx) {
    const card = document.querySelector(".result-card"), box = $("confetti");
    card.classList.remove("win", "boss"); box.innerHTML = "";
    void card.offsetWidth;
    if (!fx || !fx.win) return;
    card.classList.add("win"); if (fx.boss) card.classList.add("boss");
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = fx.boss ? ["#f6d36b", "#ffe9a8", "#d4a017", "#ffffff", "#b58cf0"] : ["#f6d36b", "#f29bb8", "#8cc4f2", "#9be28c", "#ffffff", "#f28b82"];
    const n = fx.boss ? 90 : 55;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = Math.random() < 0.3 ? "star" : "";
      c.textContent = c.className ? "★" : "";
      c.style.left = Math.random() * 100 + "%";
      c.style.setProperty("--c", colors[i % colors.length]);
      c.style.setProperty("--d", (2.2 + Math.random() * 1.8).toFixed(2) + "s");
      c.style.setProperty("--w", (Math.random() * 1.2).toFixed(2) + "s");
      c.style.setProperty("--x", ((Math.random() - 0.5) * 120).toFixed(0) + "px");
      c.style.setProperty("--r", ((Math.random() - 0.5) * 900).toFixed(0) + "deg");
      box.appendChild(c);
    }
    setTimeout(() => { box.innerHTML = ""; }, 5200);
  }

  const ASK_KEY = "lblia_1h1b_feedback_ask_v1";
  function showResult(title, detail, fairyLine, opp, oppLine, fx) {
    $("feedback-ask").hidden = !(fx && fx.ask);
    $("result-title").textContent = title;
    const logo = fx && fx.logo;
    $("result-logo").hidden = !logo;
    if (logo) { $("result-logo").src = { victory: "assets/logo_victory.webp", lose: "assets/logo_lose.webp" }[logo]; $("result-logo").alt = title; $("result-logo").className = "result-logo " + logo; }
    $("result-title").classList.toggle("sr-only", !!logo);
    $("result-detail").textContent = detail;
    renderAvatar($("result-fairy"), partner(), "stand");
    $("result-bubble").textContent = fairyLine;
    $("result-opp-row").hidden = !(opp && oppLine);
    if (opp && oppLine) { renderAvatar($("result-opp"), opp); $("result-opp-bubble").textContent = `${opp.name}「${oppLine}」`; }
    $("result").hidden = false;
    celebrate(fx);
  }
  $("result-close").addEventListener("click", () => { $("result").hidden = true; });
  $("result-again").addEventListener("click", () => newGame());

  function newGame() {
    $("result").hidden = true;
    if (!S || S.mode === "practice") startPractice();
    else show("battle-setup");
  }
  $("newgame-btn").addEventListener("click", newGame);

  $("giveup-btn").addEventListener("click", () => {
    if (!S || S.over) return;
    if (S.mode === "practice") finishPractice(true);
    else finishBattle("lose", true);
  });

  function renderStats() {
    const st = loadStats();
    const avg = st.practice.games ? (st.practice.totalMoves / st.practice.games).toFixed(1) : "—";
    const total = st.battle.win + st.battle.lose + st.battle.draw;
    const rate = total ? Math.round((st.battle.win / total) * 100) + "%" : "—";
    $("stats-body").innerHTML =
      `<p>🎓 称号：${rankFor(schoolPoints(st)).name}（成績 ${schoolPoints(st)}点）</p>` +
      `<p class="sub">陽向に勝つと1点、蒼真は2点、隠しボスは3点</p>` +
      `<p>⚔ 対戦：${st.battle.win}勝 ${st.battle.lose}敗 ${st.battle.draw}分（勝率 ${rate}）</p>` +
      C.OPPONENTS.filter((o) => isUnlocked(o, st)).map((o) => {
        const r = st.byOpp[o.id] || { win: 0, lose: 0, draw: 0 };
        return `<p class="sub">・${o.name}：${r.win}勝 ${r.lose}敗 ${r.draw}分</p>`;
      }).join("") +
      `<p>✎ 練習：${st.practice.games}回 正解／平均 ${avg}手／最短 ${st.practice.best ?? "—"}手</p>` +
      `<p class="note">成績はこの端末にだけ保存されます</p>`;
  }

  function renderTitle() {
    const p = partner();
    renderAvatar($("title-fairy"), p, "stand");
    $("title-bubble").textContent = longTimeNoSee && !longTimeShown ? (longTimeShown = true, sayNamed(p, "longtime", p.greeting)) : greet(p);
    $("title-partner").textContent = `パートナー：${p.name}（${p.element}の妖精）`;
  }

  function renderRoom() {
    const box = $("room-furniture"); box.innerHTML = "";
    (C.FURNITURE || []).filter((f) => f.image && f.initial).forEach((f) => {
      const img = document.createElement("img");
      img.className = "furn"; img.src = f.image; img.alt = f.name; img.draggable = false;
      img.style.left = f.x + "%"; img.style.top = f.y + "%"; img.style.width = f.w + "%";
      img.style.zIndex = f.z || 1;
      img.dataset.furn = f.id;
      if (f.id === "closet") { img.classList.add("tappable"); img.alt = "クローゼット（着せ替え・準備中）"; }
      if (f.skewY) { img.style.transformOrigin = "left top"; img.style.transform = `skewY(${f.skewY}deg)`; }
      box.appendChild(img);
    });
    const p = partner();
    renderAvatar($("room-fairy"), p, "stand");
    const guide = !practiceDone();
    let line;
    if (guide) line = ROOM_LINES.guide;
    else if (longTimeNoSee && !longTimeShown) { longTimeShown = true; line = sayNamed(p, "longtime", p.greeting); }
    else if (backFromPlay) line = say(p, "back");
    else line = greet(p);
    backFromPlay = false;
    $("room-bubble").textContent = line;
    renderProfile();
    $("room-practice").classList.toggle("guide", guide);
  }
  function renderProfile() {
    const wins = schoolPoints(), r = rankFor(wins), nx = nextRank(wins);
    const face = $("profile-face");
    renderAvatar(face, playerAvatar() || partner());
    face.className = face.className.replace(/\brank-\S+/g, "").trim() + " rank-" + r.frame;
    $("profile-name").textContent = playerName() || "名前なし";
    $("profile-rank").textContent = "🎓 " + r.name + (r.badge ? " " + r.badge : "");
    const from = r.min, to = nx ? nx.min : r.min;
    $("profile-bar-fill").style.width = nx ? Math.round(((wins - from) / (to - from)) * 100) + "%" : "100%";
    $("profile-next").textContent = nx ? `「${nx.name}」まで あと${nx.min - wins}点` : `成績${wins}点・最高の称号！`;
  }
  $("profile-card").addEventListener("click", () => { SND.play("tap"); show("avatar"); });

  const ROOM_LINES = { guide: "まずは練習してみよう！", closet: "着せ替えはもうすぐ！楽しみにしててね" };
  const PRACTICE_KEY = "lblia_1h1b_practiced_v1";
  function practiceDone() { try { return localStorage.getItem(PRACTICE_KEY) === "yes"; } catch (e) { return false; } }
  function markPracticeDone() { try { localStorage.setItem(PRACTICE_KEY, "yes"); } catch (e) {  } }
  $("room-furniture").addEventListener("click", (e) => {
    if (!e.target.closest('[data-furn="closet"]')) return;
    SND.play("tap");
    $("room-bubble").textContent = say(partner(), "closet", ROOM_LINES.closet);
  });

  function partnerCard(f) {
    const b = document.createElement("button");
    b.className = "partner-card" + (f.id === partnerId ? " selected" : "");
    b.type = "button";
    const av = document.createElement("span"); av.className = "avatar"; renderAvatar(av, f, "stand");
    const name = document.createElement("span"); name.className = "pname"; name.textContent = (f.locked ? "🔒 " : "") + f.name;
    const elem = document.createElement("span"); elem.className = "pelem"; elem.textContent = `${f.element}の妖精`;
    const trait = document.createElement("span"); trait.className = "ptrait"; trait.textContent = f.locked ? f.unlock : f.trait;
    b.append(av, name, elem, trait);
    if (f.locked) b.disabled = true;
    else b.addEventListener("click", () => { savePartner(f.id); SND.play("select"); setupFlow ? setupNext() : show("home"); });
    return b;
  }

  function renderAvatarChoice() {
    const grid = $("avatar-grid"); grid.innerHTML = "";
    (C.PLAYERS || []).forEach((pl) => {
      const b = document.createElement("button");
      b.className = "partner-card avatar-card" + (pl.id === avatarId ? " selected" : ""); b.type = "button";
      const av = document.createElement("span"); av.className = "avatar"; renderAvatar(av, pl);
      const name = document.createElement("span"); name.className = "pname"; name.textContent = pl.name;
      b.append(av, name);
      b.addEventListener("click", () => {
        saveAvatar(pl.id); SND.play("select");
        setupFlow ? setupNext() : show("home");
      });
      grid.appendChild(b);
    });
    $("avatar-back").hidden = !playerAvatar();
    $("avatar-name-btn").hidden = !playerAvatar() || setupFlow;
  }

  function finishName(name) {
    saveName(name); SND.play("select");
    setupFlow ? setupNext() : show("home");
  }
  $("name-ok").addEventListener("click", () => {
    const name = $("name-input").value.replace(/\s+/g, " ").trim().slice(0, 8);
    if (!name) { $("name-msg").textContent = "名前を入れるか、「あとで決める」を押してね"; return; }
    finishName(name);
  });
  $("name-skip").addEventListener("click", () => finishName(playerName()));
  $("name-input").addEventListener("keydown", (e) => { if (e.key === "Enter") $("name-ok").click(); });

  function renderPartner() {
    const grid = $("partner-grid"), locked = $("partner-locked");
    grid.innerHTML = ""; locked.innerHTML = "";
    C.FAIRIES.forEach((f) => (f.locked ? locked : grid).appendChild(partnerCard(f)));
    $("partner-back").hidden = !partnerId;
  }

  function renderOpponentOptions() {
    const sel = $("cpu-level"); const prev = sel.value; const st = loadStats();
    sel.innerHTML = "";
    C.OPPONENTS.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.id;
      if (isUnlocked(o, st)) { const won = (st.byOpp[o.id] || {}).win > 0; opt.textContent = `${won ? "✅ " : ""}${o.name}（${o.levelLabel}）`; }
      else { opt.textContent = `🔒 ？？？（${o.unlock.text}）`; opt.disabled = true; }
      sel.appendChild(opt);
    });
    sel.value = prev && !sel.querySelector(`option[value="${prev}"]`).disabled ? prev : "souma";
  }
  renderOpponentOptions();

  function renderSoundButtons() {
    $("bgm-btn").textContent = BGM.isEnabled() ? "🎵 BGM：オン" : "🎵 BGM：オフ";
    const on = SND.isEnabled();
    $("sound-btn").textContent = on ? "🔊 音：オン" : "🔇 音：オフ";
    $("sound-btn2").textContent = on ? "🔊" : "🔇";
    $("sound-btn2").setAttribute("aria-label", on ? "音をオフにする" : "音をオンにする");
  }
  ["sound-btn", "sound-btn2"].forEach((id) => $(id).addEventListener("click", () => { SND.setEnabled(!SND.isEnabled()); renderSoundButtons(); }));
  $("bgm-btn").addEventListener("click", () => { BGM.setEnabled(!BGM.isEnabled()); renderSoundButtons(); });
  renderSoundButtons();

  const HOWTO_KEY = "lblia_1h1b_howto_v1";
  const W = (t) => t.replace(/\|/g, "<wbr>");
  const HOWTO = [
    W(`<p class="big-text">相手の|<b>秘密の4桁の数字</b>を|推理して|当てるゲームです。</p>
     <div class="demo secret"><span>？</span><span>？</span><span>？</span><span>？</span></div>
     <p class="ex"><b>先に|当てた方が|勝ち！</b></p>
     <small>あなたも|秘密の数字を|決めて、|相手と|交代で|当て合います。</small>`),
    W(`<p class="big-text">対戦の|流れ</p>
     <ol class="howto-steps">
       <li>あなたの|<b>秘密の数字</b>を|決める|（相手には|見えません）</li>
       <li>サイコロで|先攻・後攻を|決める</li>
       <li>交代で、|相手の数字を|予想して|<b>コール</b>する</li>
       <li>ヒントを|見ながら、|答えを|しぼりこむ</li>
     </ol>`),
    W(`<p class="big-text">数字の|決まり</p>
     <small>0〜9の|数字を|1回ずつ|使います。|同じ数字は|2回|使えません。</small>
     <p class="zero-rule"><b>0</b>だけは|いちばん左に|置けません！<br><span class="ng">✕ 0123</span>　<span class="ok">○ 1023</span></p>`),
    W(`<p class="big-text">コールすると|ヒントが|出ます。</p>
     <p class="ex">❤️ <b class="hit">H（ヒット）</b>…|数字も|場所も|大正解！</p>
     <p class="ex">💙 <b class="blow">B（ブロー）</b>…|数字は|当たり！|でも|場所が|違う</p>
     <div class="hb-example">
       <div class="hb-row"><em>秘密の数字</em><span>1</span><span>3</span><span>5</span><span>7</span></div>
       <div class="hb-row"><em>コール</em><span class="h">1</span><span class="b">5</span><span class="b">3</span><span class="x">2</span></div>
       <p class="hb-result">→ <b class="hit">1H</b>（1）<b class="blow">2B</b>（5と3）</p>
     </div>`),
    W(`<p class="big-text"><b class="hit">4H</b>に|なったら|大正解！🎉</p>
     <small>まずは|「練習モード」で|試してみよう！</small>`)
  ];
  let howtoPage = 0;
  function renderHowto(i) {
    howtoPage = i;
    $("howto-card").innerHTML = HOWTO[i];
    $("howto-dots").innerHTML = HOWTO.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
    $("howto-prev").textContent = i === 0 ? "とばす" : "もどる";
    $("howto-next").textContent = i === HOWTO.length - 1 ? "はじめる！" : "つぎへ";
    const box = $("howto-fairies"); box.innerHTML = "";
    C.FAIRIES.filter((f) => !f.locked).forEach((f) => { const a = document.createElement("span"); a.className = "avatar"; renderAvatar(a, f, "stand"); box.appendChild(a); });
  }
  function finishHowto() {
    try { localStorage.setItem(HOWTO_KEY, "seen"); } catch (e) {  }
    howtoSeen = true;
    setupFlow ? setupNext() : show("home");
  }
  $("howto-next").addEventListener("click", () => { SND.play("tap"); howtoPage < HOWTO.length - 1 ? renderHowto(howtoPage + 1) : finishHowto(); });
  $("howto-prev").addEventListener("click", () => { howtoPage === 0 ? finishHowto() : renderHowto(howtoPage - 1); });
  let howtoSeen = false;
  try { howtoSeen = localStorage.getItem(HOWTO_KEY) === "seen"; } catch (e) {  }

  $("start-btn").addEventListener("click", () => { setupFlow = true; setupNext(); });
  show("title");

  $("reset-btn").addEventListener("click", () => { $("reset-confirm").hidden = false; $("reset-btn").hidden = true; });
  $("reset-no").addEventListener("click", () => { $("reset-confirm").hidden = true; $("reset-btn").hidden = false; });
  $("reset-yes").addEventListener("click", () => {
    try { localStorage.removeItem(STATS_KEY); } catch (e) {  }
    $("reset-confirm").hidden = true; $("reset-btn").hidden = false;
    renderStats(); renderOpponentOptions();
  });

  document.querySelectorAll(".feedback-link").forEach((el) => {
    if (FEEDBACK_URL) { el.href = FEEDBACK_URL; el.hidden = false; } else { el.hidden = true; }
  });
  document.querySelectorAll(".feedback-section").forEach((el) => { el.hidden = !FEEDBACK_URL; });

  (function splash() {
    const el = $("splash"); if (!el) return;
    const close = () => { el.classList.add("hide"); setTimeout(() => el.remove(), 600); };
    const t = setTimeout(close, 1800);
    el.addEventListener("click", () => { clearTimeout(t); close(); });
  })();

  window.__h1b = { state: () => S };
})();
