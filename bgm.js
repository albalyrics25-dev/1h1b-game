(function (root) {
  "use strict";
  const KEY = "lblia_1h1b_bgm_v1";
  const VOLUME = 0.32;
  const TRACKS = {
    main: "assets/bgm_main.m4a",
    avatar: "assets/bgm_avatar.m4a",
    battle: "assets/bgm_battle.m4a"
  };
  const LOOP_END = {
    "assets/bgm_avatar.m4a": 145.6,
    "assets/bgm_battle.m4a": 198.2
  };
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== "off"; } catch (e) {  }
  const players = {};
  let current = null;
  let unlocked = false;

  function player(name) {
    let src = TRACKS[name] || TRACKS.main;
    if (!players[src]) {
      const a = new Audio(src);
      a.loop = true; a.preload = "auto"; a.volume = VOLUME;
      const end = LOOP_END[src];
      if (end) a.addEventListener("timeupdate", () => { if (a.currentTime >= end) a.currentTime = 0; });
      players[src] = a;
    }
    return players[src];
  }
  function apply() {
    const target = current && enabled && unlocked ? player(current) : null;
    Object.values(players).forEach((a) => { if (a !== target && !a.paused) a.pause(); });
    if (!target || !enabled || !unlocked) return;
    if (target.paused) {
      const p = target.play();
      if (p && p.catch) p.catch(() => {  });
    }
  }
  function setScene(name) { current = name; apply(); }
  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem(KEY, enabled ? "on" : "off"); } catch (e) {  }
    apply();
  }
  let duckTimer = null;
  function restore() { clearTimeout(duckTimer); duckTimer = null; Object.values(players).forEach((a) => { a.volume = VOLUME; }); }
  function duck(ms) {
    const a = current ? players[TRACKS[current] || TRACKS.main] : null;
    if (!a) return;
    a.volume = VOLUME * 0.15;
    clearTimeout(duckTimer); duckTimer = setTimeout(restore, ms);
  }

  const JINGLES = { win: "assets/jingle_win.m4a", lose: "assets/jingle_lose.m4a" };
  const JINGLE_SEC = { win: 12.5, lose: 6.8 };
  const JINGLE_VOLUME = 0.6;
  const jingles = {};
  let jingleNow = null;
  function prepareJingles() {
    Object.keys(JINGLES).forEach((k) => {
      if (!jingles[k]) { const a = new Audio(JINGLES[k]); a.preload = "auto"; a.volume = JINGLE_VOLUME; jingles[k] = a; }
    });
  }
  function stopJingle() {
    if (jingleNow) { jingleNow.pause(); jingleNow = null; restore(); }
  }
  function jingle(name) {
    prepareJingles();
    const a = jingles[name]; if (!a) return;
    stopJingle();
    try { a.currentTime = 0; } catch (e) {  }
    const p = a.play(); if (p && p.catch) p.catch(() => {  });
    jingleNow = a;
    duck(JINGLE_SEC[name] * 1000);
    a.onended = () => { if (jingleNow === a) { jingleNow = null; restore(); } };
  }
  function unlock() { if (!unlocked) { unlocked = true; apply(); } }
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => root.addEventListener(ev, unlock, { once: false, passive: true }));

  root.H1B_BGM = { setScene, setEnabled, isEnabled: () => enabled, duck, jingle, stopJingle, prepareJingles, state: () => ({ current, enabled, unlocked }) };
})(typeof window !== "undefined" ? window : this);
