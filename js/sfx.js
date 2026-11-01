/* Âm thanh tổng hợp bằng Web Audio API – không dùng file nhạc có bản quyền */
window.SFX = (function () {
  let ctx = null, master = null, on = localStorage.getItem('dhbc_sound') !== '0', lastJoin = 0;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, d, o) {
    o = o || {};
    const c = ac(); if (!c || !on) return;
    const t = c.currentTime + (o.at || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + d + 0.05);
  }
  function noise(d, o) {
    o = o || {};
    const c = ac(); if (!c || !on) return;
    const t = c.currentTime + (o.at || 0);
    const len = Math.max(1, Math.floor(c.sampleRate * d));
    const buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.freq || 1000; f.Q.value = o.q || 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(o.vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + d + 0.05);
  }
  const arp = (notes, step, o) => notes.forEach((n, i) => tone(n, o.d || 0.25, Object.assign({}, o, { at: (o.at || 0) + i * step })));
  return {
    unlock: ac,
    get on() { return on; },
    toggle() { on = !on; localStorage.setItem('dhbc_sound', on ? '1' : '0'); return on; },
    tick() { tone(1250, 0.05, { type: 'square', vol: 0.05 }); },
    tickUrgent() { tone(1650, 0.08, { type: 'square', vol: 0.1 }); },
    count() { tone(660, 0.2, { type: 'triangle', vol: 0.28 }); noise(0.08, { freq: 2500, vol: 0.08 }); },
    go() { arp([523, 784, 1047, 1568], 0.07, { type: 'triangle', vol: 0.22 }); noise(0.5, { freq: 3000, vol: 0.1 }); },
    correct() { arp([659, 880, 1175, 1568], 0.075, { type: 'triangle', vol: 0.22, d: 0.22 }); },
    wrong() { tone(233, 0.35, { type: 'sawtooth', to: 110, vol: 0.14 }); tone(196, 0.4, { type: 'square', to: 98, vol: 0.07, at: 0.06 }); },
    join() { const n = performance.now(); if (n - lastJoin < 90) return; lastJoin = n; tone(880 + Math.random() * 500, 0.12, { vol: 0.1 }); },
    timeUp() { tone(392, 0.5, { type: 'square', to: 196, vol: 0.1 }); },
    reveal() { noise(0.6, { freq: 1800, vol: 0.2 }); arp([392, 523, 659, 784], 0.06, { type: 'triangle', vol: 0.18, at: 0.1 }); },
    drumroll(sec) { const n = Math.floor(sec * 24); for (let i = 0; i < n; i++) noise(0.05, { freq: 180 + Math.random() * 80, vol: 0.1 + (i / n) * 0.35, at: i / 24, q: 1.2 }); },
    fanfare() {
      arp([523, 659, 784, 1047], 0.12, { type: 'sawtooth', vol: 0.12, d: 0.3 });
      [523, 659, 784, 1047].forEach((f) => tone(f, 1.6, { type: 'triangle', vol: 0.14, at: 0.55 }));
      [1319, 1568].forEach((f, i) => tone(f, 1.2, { type: 'sine', vol: 0.08, at: 0.75 + i * 0.1 }));
      noise(1.2, { freq: 4000, vol: 0.08, at: 0.55 });
    },
    boom() { tone(120, 0.9, { to: 38, vol: 0.6 }); noise(0.35, { freq: 260, vol: 0.35 }); },
    gong() { [98, 147, 196, 294, 392].forEach((f, i) => tone(f, 3.5, { vol: 0.16 / (i + 1) + 0.04 })); noise(1.4, { freq: 900, vol: 0.08 }); }
  };
})();
