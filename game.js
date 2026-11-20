(function (root) {
  "use strict";

  const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  function isValid(nums) {
    if (!Array.isArray(nums) || nums.length !== 4) return false;
    if (nums[0] === 0) return false;
    return new Set(nums).size === 4 && nums.every((n) => DIGITS.includes(n));
  }

  function makeSecret(rng = Math.random, len = 4) {
    const nums = DIGITS.slice();
    const result = [];
    while (result.length < len) {
      const i = Math.floor(rng() * nums.length);
      const n = nums[i];
      if (result.length === 0 && n === 0) continue;
      nums.splice(i, 1);
      result.push(n);
    }
    return result;
  }

  function judge(guess, secret) {
    let hit = 0;
    let blow = 0;
    guess.forEach((n, i) => {
      if (n === secret[i]) hit++;
      else if (secret.includes(n)) blow++;
    });
    return { hit, blow };
  }

  function allCandidates() {
    const list = [];
    for (let a = 1; a <= 9; a++)
      for (let b = 0; b <= 9; b++)
        for (let c = 0; c <= 9; c++)
          for (let d = 0; d <= 9; d++) {
            const n = [a, b, c, d];
            if (new Set(n).size === 4) list.push(n);
          }
    return list;
  }

  function filterCandidates(candidates, guess, result) {
    return candidates.filter((c) => {
      const r = judge(guess, c);
      return r.hit === result.hit && r.blow === result.blow;
    });
  }

  const CPU_LEVELS = {
    soft: { gradual: true, r0: 0.65, rDec: 0.012, step: 12, full: 42 },
    easy: { gradual: true, r0: 0.55, rDec: 0.015, step: 10, full: 36 },
    mid: { gradual: true, r0: 0.45, rDec: 0.03, step: 6, full: 22 },
    normal: { gradual: true, r0: 0.35, rDec: 0.03, step: 5, full: 18 },
    rival: { gradual: true, r0: 0.4, rDec: 0.025, step: 5, full: 20 },
    strong: { gradual: true, r0: 0.2, rDec: 0.03, step: 4, full: 13 },
    hard: { memory: 2, fullAfter: 7, random: 0 }
  };
  const ALL = allCandidates();

  function cpuGuess(level, history, rng = Math.random) {
    const p = CPU_LEVELS[level] || CPU_LEVELS.normal;
    if (p.gradual) {
      const t = history.length;
      if (rng() < Math.max(0, p.r0 - t * p.rDec)) return makeSecret(rng);
      const used = t >= p.full ? history : history.slice(-(1 + Math.floor(t / p.step)));
      let c = ALL;
      for (const h of used) c = filterCandidates(c, h.guess, h.result);
      return c.length ? c[Math.floor(rng() * c.length)].slice() : makeSecret(rng);
    }
    const full = history.length >= p.fullAfter;
    if (!full && rng() < p.random) return makeSecret(rng);
    const used = full ? history : history.slice(-p.memory);
    let cands = ALL;
    for (const h of used) cands = filterCandidates(cands, h.guess, h.result);
    if (!cands.length) return makeSecret(rng);
    return cands[Math.floor(rng() * cands.length)].slice();
  }

  function rollDie(rng = Math.random) {
    return 1 + Math.floor(rng() * 6);
  }

  function roundOutcome(playerSolved, cpuSolved) {
    if (playerSolved && cpuSolved) return "draw";
    if (playerSolved) return "win";
    if (cpuSolved) return "lose";
    return null;
  }

  const api = { isValid, makeSecret, judge, allCandidates, filterCandidates, cpuGuess, rollDie, roundOutcome, CPU_LEVELS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.H1B = api;
})(typeof window !== "undefined" ? window : this);
