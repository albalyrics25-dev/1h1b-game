(function (root) {
  "use strict";
  const KEY = "lblia_1h1b_sound_v1";
  let ctx = null;
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== "off"; } catch (e) {  }

  function ac() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type = "sine", vol = 0.12, slideTo = null) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G4: 392, E4: 329.63, C4: 261.63, A4: 440, B4: 493.88, C3: 130.81, F3: 174.61, G3: 196 };

  const SOUNDS = {
    tap: () => tone(1400, 0, 0.05, "triangle", 0.06),
    erase: () => tone(700, 0, 0.06, "triangle", 0.05, 500),
    call: () => tone(N.G5, 0, 0.08, "square", 0.04),
    result: (hit = 0) => {
      const scale = [N.C5, N.E5, N.G5, N.C6];
      if (hit === 0) { tone(N.G4, 0.05, 0.12, "sine", 0.07); return; }
      for (let i = 0; i < hit; i++) tone(scale[i], 0.05 + i * 0.08, 0.14, "sine", 0.1);
    },
    cpu: () => tone(N.E5, 0, 0.07, "sine", 0.05),
    correct: () => [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(f, i * 0.07, 0.22, "triangle", 0.11)),
    win: () => {
      const mel = [
        [N.G4, 0.00, 0.10], [N.G4, 0.12, 0.10], [N.G4, 0.24, 0.10], [N.C5, 0.36, 0.38],
        [N.A4, 0.80, 0.10], [N.B4, 0.92, 0.10], [N.C5, 1.04, 0.10], [N.E5, 1.16, 0.22],
        [N.D5, 1.40, 0.12], [N.E5, 1.54, 0.12], [N.G5, 1.68, 0.80]
      ];
      mel.forEach(([f, t, d]) => tone(f, t, d, "square", 0.10));
      [[N.E4, 0.36, 0.38], [N.G4, 0.36, 0.38], [N.G4, 1.16, 0.22], [N.C5, 1.16, 0.22],
       [N.C5, 1.68, 0.80], [N.E5, 1.68, 0.80]].forEach(([f, t, d]) => tone(f, t, d, "triangle", 0.09));
      [[N.C3, 0.36, 0.38], [N.F3, 0.80, 0.30], [N.G3, 1.16, 0.40], [N.C3, 1.68, 0.80]].forEach(([f, t, d]) => tone(f, t, d, "triangle", 0.14));
      tone(N.C6, 1.68, 0.80, "sine", 0.07);
    },
    lose: () => [N.G4, N.E4, N.C4].forEach((f, i) => tone(f, i * 0.16, 0.25, "triangle", 0.09)),
    draw: () => { tone(N.E5, 0, 0.18, "triangle", 0.08); tone(N.E5, 0.22, 0.25, "triangle", 0.08); },
    tick: () => tone(1000, 0, 0.04, "square", 0.03),
    timeout: () => tone(N.A4, 0, 0.3, "sawtooth", 0.04, 220),
    dice: () => tone(450 + Math.random() * 350, 0, 0.06, "triangle", 0.14),
    diceEnd: () => { tone(N.C5, 0, 0.12, "triangle", 0.14); tone(N.G5, 0.11, 0.2, "triangle", 0.14); },
    select: () => { tone(N.E5, 0, 0.1, "sine", 0.08); tone(N.A5, 0.08, 0.16, "sine", 0.08); }
  };

  function play(name, arg) {
    if (!enabled || !SOUNDS[name]) return;
    try { SOUNDS[name](arg); } catch (e) {  }
  }
  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem(KEY, enabled ? "on" : "off"); } catch (e) {  }
    if (enabled) play("select");
  }

  root.H1B_SOUND = { play, setEnabled, isEnabled: () => enabled, names: Object.keys(SOUNDS) };
})(typeof window !== "undefined" ? window : this);
