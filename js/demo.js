/*
 * CHẾ ĐỘ DEMO OFFLINE – chỉ chạy khi mở file HTML trực tiếp (không có server).
 * Giả lập server ngay trong trình duyệt bằng chính GameCore, kèm người chơi ảo,
 * để MC tập dượt giao diện. Khi chạy thật với Node.js, file này không được dùng.
 */
(function () {
  'use strict';
  const cfg = window.GAME_CONFIG, Core = window.GameCore;
  const NAMES = ['Minh Anh', 'Quốc Bảo', 'Thu Hà', 'Gia Huy', 'Ngọc Lan', 'Đức Thắng', 'Khánh Linh', 'Hoàng Nam', 'Phương Thảo', 'Tuấn Kiệt', 'Bảo Ngọc', 'Văn Long', 'Mai Chi', 'Hữu Phước', 'Thanh Tâm', 'Diễm My', 'Trọng Nhân', 'Hải Yến', 'Công Vinh', 'Lan Hương', 'Nhật Minh', 'Tú Uyên', 'Đăng Khoa', 'Kim Ngân', 'Anh Thư', 'Quang Hải', 'Bích Phượng', 'Thế Sơn', 'Hồng Nhung', 'Minh Triết'];
  let room = null, sockets = [], botQ = -1, autoPlay = false, autoTimer = null;
  const tok = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const later = (fn, ms) => setTimeout(fn, ms || 0);

  function push() {
    if (!room) return;
    sockets.forEach((s) => {
      if (s.role === 'host') s.fire('host:state', Object.assign(room.hostView(), { joinUrl: 'Chạy server Node.js để có link tham gia thật' }));
      else { s.fire('state', room.publicView()); if (s.pid) s.fire('me', room.playerView(s.pid)); }
    });
  }
  function newRoom() {
    if (room) room.clear();
    botQ = -1;
    const r = new Core.Room({
      code: String(100000 + Math.floor(Math.random() * 900000)), config: cfg, makeToken: tok,
      onChange: () => { if (r.game.phase === 'lobby') botQ = -1; driveBots(r); autoFlow(r); later(push); }
    });
    room = r;
  }
  function addBots(n, gap) {
    const r = room;
    NAMES.slice(0, n).forEach((name, i) => later(() => { if (room === r && r.game.phase === 'lobby') { const j = r.game.join(name); if (j.ok) j.player.conns = 1; push(); } }, 300 + i * gap));
  }
  function driveBots(r) {
    const g = r.game;
    if (g.phase !== 'question' || botQ === g.qIndex) return;
    botQ = g.qIndex;
    const q = cfg.questions[g.qIndex], win = cfg.timeline.answerSec * 1000;
    const send = (p, text, ms) => later(() => { if (room === r) { r.submit(p.id, text); push(); } }, ms);
    for (const p of g.players.values()) {
      if (p.human) continue;
      const skill = 0.35 + Math.random() * 0.65;
      if (Math.random() > skill + 0.2) { send(p, 'khong biet', 4000 + Math.random() * win * 0.6); continue; }
      const t = 3000 + Math.random() * win * 0.8 * (1.25 - skill);
      if (Math.random() < 0.3) send(p, 'doan bua', t - 1800);
      send(p, Core.normalizeAnswer(q.answer), t);
    }
  }
  // khi chỉ demo màn hình người chơi: tự chạy hết kịch bản
  function autoFlow(r) {
    if (!autoPlay) return;
    clearTimeout(autoTimer);
    if (r.game.phase === 'final') autoTimer = later(() => r.action('top3'), 5000);
    if (r.game.phase === 'top3') autoTimer = later(() => r.action('finale'), 6000);
  }

  function handle(s, ev, p, cb) {
    if (ev === 'host:create') { newRoom(); cb({ ok: true, code: room.code, hostToken: 'demo' }); push(); addBots(30, 220); return; }
    if (ev === 'host:resume') { if (room && p.hostToken === 'demo' && p.code === room.code) { cb({ ok: true }); push(); } else cb({ ok: false, error: 'FORBIDDEN' }); return; }
    if (ev === 'host:action') {
      if (!room) return cb({ ok: false, error: 'NOT_FOUND' });
      if (p.action === 'close') { room.clear(); room = null; return cb({ ok: true }); }
      return cb(room.action(p.action));
    }
    if (ev === 'player:join') {
      if (!room) newRoom();
      const r = room.game.join(p.name, p.token);
      if (!r.ok) return cb(r);
      r.player.human = true; r.player.conns = 1; s.pid = r.player.id;
      cb({ ok: true, token: r.player.token, name: r.player.name, id: r.player.id });
      push();
      if (!autoPlay && !sockets.some((x) => x.role === 'host')) {
        autoPlay = true; addBots(12, 250);
        later(() => room && room.action('start'), 6000);
      }
      return;
    }
    if (ev === 'player:answer') {
      if (!s.pid || !room) return cb({ ok: false, error: 'NOT_PLAYER' });
      const r = room.submit(s.pid, p.text); cb(r); push(); return;
    }
    cb({ ok: false, error: 'BAD_EVENT' });
  }

  class FakeSocket {
    constructor(role) { this.role = role; this.h = {}; sockets.push(this); later(() => this.fire('connect'), 60); }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); return this; }
    fire(e, d) { (this.h[e] || []).forEach((f) => f(d)); }
    emit(e, payload, cb) { later(() => handle(this, e, payload || {}, (r) => later(() => (cb || (() => {}))(r), 20)), 20); }
  }

  window.DemoServer = { connect: (role) => new FakeSocket(role) };
})();
