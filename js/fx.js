/* Hiệu ứng hình ảnh: hoa văn trống đồng (SVG sinh bằng code), pháo giấy */
(function () {
  const PAL = ['#e53935', '#f5c542', '#1e88e5', '#43a047', '#8e24aa', '#fb8c00', '#00acc1', '#d81b60'];

  function drumSVG(id) {
    const cx = 200, cy = 200, ink = '#5a3608', P = [];
    const g = 'dg' + (id || Math.random().toString(36).slice(2, 7));
    P.push(`<defs><radialGradient id="${g}" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#e2a83c"/><stop offset="1" stop-color="#8a5a12"/></radialGradient></defs>`);
    P.push(`<circle cx="200" cy="200" r="197" fill="url(#${g})"/>`);
    [197, 187, 176, 130, 122, 94, 86].forEach((r) => P.push(`<circle cx="200" cy="200" r="${r}" fill="none" stroke="${ink}" stroke-width="2.4" opacity=".75"/>`));
    const n = 14, pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, rr = i % 2 ? 22 : 82;
      pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
    }
    P.push(`<polygon points="${pts.join(' ')}" fill="#fff1c4" stroke="${ink}" stroke-width="2"/>`);
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      P.push(`<line x1="${(cx + 98 * c).toFixed(1)}" y1="${(cy + 98 * s).toFixed(1)}" x2="${(cx + 118 * c).toFixed(1)}" y2="${(cy + 118 * s).toFixed(1)}" stroke="${ink}" stroke-width="2" opacity=".7"/>`);
    }
    for (let i = 0; i < 8; i++) {
      P.push(`<g transform="rotate(${i * 45} 200 200)" fill="${ink}" opacity=".78"><path d="M176 52 Q190 40 208 47 L240 42 L212 54 Q196 62 176 52 Z"/><path d="M182 50 L168 40 L174 52 Z"/></g>`);
    }
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      P.push(`<circle cx="${(cx + 181.5 * Math.cos(a)).toFixed(1)}" cy="${(cy + 181.5 * Math.sin(a)).toFixed(1)}" r="2.6" fill="${ink}" opacity=".7"/>`);
    }
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${P.join('')}</svg>`;
  }

  function mount(el, id) { if (el) el.innerHTML = drumSVG(id); }

  // vòng 54 ô thổ cẩm – mỗi ô tượng trưng một dân tộc
  function ring54(el) {
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 54; i++) {
      const t = document.createElement('i');
      const a = (i / 54) * 360;
      t.style.cssText = `--a:${a}deg;--c:${PAL[i % PAL.length]};--d:${(i * 0.025).toFixed(3)}s`;
      el.appendChild(t);
    }
  }

  const Confetti = (function () {
    let cv, cx, parts = [], raf = 0, rainUntil = 0;
    function ensure() {
      if (cv) return;
      cv = document.getElementById('confetti');
      if (!cv) return;
      cx = cv.getContext('2d');
      const size = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
      size(); addEventListener('resize', size);
    }
    function add(x, y, vx, vy) {
      parts.push({ x, y, vx, vy, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: PAL[(Math.random() * PAL.length) | 0], life: 1 });
    }
    function loop() {
      const W = cv.width, Hh = cv.height, d = devicePixelRatio;
      cx.clearRect(0, 0, W, Hh);
      if (performance.now() < rainUntil) for (let i = 0; i < 4; i++) add(Math.random() * W, -20, (Math.random() - 0.5) * 2, 2 + Math.random() * 3);
      parts = parts.filter((p) => p.y < Hh + 40 && p.life > 0);
      for (const p of parts) {
        p.vy += 0.12 * d; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
        cx.fillRect(-p.w * d / 2, -p.h * d / 2, p.w * d, p.h * d * Math.abs(Math.cos(p.r * 2)) + d);
        cx.restore();
      }
      raf = parts.length || performance.now() < rainUntil ? requestAnimationFrame(loop) : 0;
    }
    function run() { if (!raf) raf = requestAnimationFrame(loop); }
    return {
      burst(xr, yr, n) {
        ensure(); if (!cv) return;
        const d = devicePixelRatio, x = (xr == null ? 0.5 : xr) * cv.width, y = (yr == null ? 0.6 : yr) * cv.height;
        for (let i = 0; i < (n || 160); i++) { const a = Math.random() * Math.PI * 2, s = (4 + Math.random() * 12) * d; add(x, y, Math.cos(a) * s, Math.sin(a) * s - 8 * d); }
        run();
      },
      rain(ms) { ensure(); if (!cv) return; rainUntil = performance.now() + (ms || 5000); run(); },
      stop() { parts = []; rainUntil = 0; }
    };
  })();

  window.DrumArt = { svg: drumSVG, mount, ring54, PAL };
  window.Confetti = Confetti;
})();
