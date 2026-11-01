/*
 * Lõi trò chơi – logic thuần, dùng chung cho server Node.js và chế độ demo offline.
 * Không chứa đáp án; đáp án nằm trong config/game.config.js (chỉ server đọc).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GameCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ok = (extra) => Object.assign({ ok: true }, extra);
  const fail = (error, extra) => Object.assign({ ok: false, error }, extra);

  function stripMarks(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
  // "  Đoàn-Kết!! " -> "doan ket"
  function normalizeAnswer(input) {
    if (typeof input !== 'string') return '';
    return stripMarks(input.normalize('NFC')).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  const compactAnswer = (input) => normalizeAnswer(input).replace(/\s+/g, '');
  function isCorrectAnswer(input, question) {
    const c = compactAnswer(input);
    if (!c) return false;
    return [question.answer].concat(question.accept || []).some((a) => compactAnswer(a) === c);
  }
  // số ký tự mỗi từ, ví dụ "ĐOÀN KẾT" -> [4, 3]
  const answerPattern = (answer) => normalizeAnswer(answer).split(' ').filter(Boolean).map((w) => w.length);

  function sanitizeName(raw, maxLen) {
    if (typeof raw !== 'string') return '';
    let s = raw.normalize('NFC')
      .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff<>"`]/g, '')
      .replace(/\s+/g, ' ').trim();
    const chars = Array.from(s);
    if (chars.length > maxLen) s = chars.slice(0, maxLen).join('').trim();
    return s;
  }

  function computePoints(scoring, wrongBefore, elapsedMs, windowMs) {
    const maxBonus = Math.max(0, scoring.maxBonus - scoring.wrongPenalty * wrongBefore);
    const ratio = Math.max(0, Math.min(1, 1 - elapsedMs / windowMs));
    return scoring.base + Math.round(maxBonus * ratio);
  }

  // điểm cao hơn đứng trên; bằng điểm -> tổng thời gian đúng ít hơn; sau đó ai vào trước
  function rankPlayers(list) {
    return list.slice()
      .sort((a, b) => b.score - a.score || a.timeMs - b.timeMs || a.joinedAt - b.joinedAt)
      .map((p, i) => ({ rank: i + 1, id: p.id, name: p.name, score: p.score, correct: p.correct, timeMs: p.timeMs, connected: (p.conns || 0) > 0 }));
  }

  function defaultToken() {
    const a = new Uint8Array(24);
    (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 256; });
    return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  class Game {
    constructor(config, opts) {
      opts = opts || {};
      this.config = config;
      this.now = opts.now || (() => Date.now());
      this.makeToken = opts.makeToken || defaultToken;
      this.players = new Map();
      this.byToken = new Map();
      this.seq = 0;
      this.reset(true);
    }
    get questions() { return this.config.questions; }
    get t() { return this.config.timeline; }
    reset(clearPlayers) {
      this.phase = 'lobby';
      this.qIndex = -1;
      this.openedAt = this.closesAt = this.revealEndsAt = this.countdownEndsAt = 0;
      this.showStartedAt = this.phaseAt = this.now();
      if (clearPlayers) { this.players.clear(); this.byToken.clear(); }
      else for (const p of this.players.values()) Object.assign(p, { score: 0, correct: 0, timeMs: 0, answers: [] });
    }
    setPhase(ph) { this.phase = ph; this.phaseAt = this.now(); }

    uniqueName(name) {
      const taken = new Set(Array.from(this.players.values(), (p) => p.name.toLowerCase()));
      if (!taken.has(name.toLowerCase())) return name;
      const base = Array.from(name).slice(0, this.config.limits.maxNameLength - 4).join('').trim();
      let i = 2;
      while (taken.has(`${base} (${i})`.toLowerCase())) i++;
      return `${base} (${i})`;
    }
    join(rawName, token) {
      if (token && this.byToken.has(token)) return ok({ player: this.byToken.get(token), resumed: true });
      const name = sanitizeName(rawName, this.config.limits.maxNameLength);
      if (token && !name) return fail('NO_SESSION');
      if (this.phase !== 'lobby') return fail('LATE');
      if (this.players.size >= this.config.limits.maxPlayers) return fail('FULL');
      if (!name) return fail('BAD_NAME');
      const p = {
        id: 'p' + (++this.seq), token: this.makeToken(), name: this.uniqueName(name),
        joinedAt: this.now(), score: 0, correct: 0, timeMs: 0, answers: [], conns: 0
      };
      this.players.set(p.id, p);
      this.byToken.set(p.token, p);
      return ok({ player: p, resumed: false });
    }

    start() {
      if (this.phase !== 'lobby') return fail('BAD_PHASE');
      this.setPhase('countdown');
      this.countdownEndsAt = this.now() + this.t.countdownSec * 1000;
      return ok();
    }
    openQuestion(i) {
      if (i < 0 || i >= this.questions.length) return fail('BAD_QUESTION');
      if (!['countdown', 'reveal'].includes(this.phase)) return fail('BAD_PHASE');
      this.qIndex = i;
      this.setPhase('question');
      this.openedAt = this.now();
      this.closesAt = this.openedAt + this.t.answerSec * 1000;
      return ok();
    }
    closeQuestion() {
      if (this.phase !== 'question') return fail('BAD_PHASE');
      this.setPhase('reveal');
      this.revealEndsAt = this.now() + this.t.revealSec * 1000;
      return ok();
    }
    hasNext() { return this.qIndex + 1 < this.questions.length; }
    finish() { this.setPhase('final'); return ok(); }
    endEarly() {
      if (!['countdown', 'question', 'reveal'].includes(this.phase)) return fail('BAD_PHASE');
      return this.finish();
    }
    toTop3() {
      if (!['final', 'finale'].includes(this.phase)) return fail('BAD_PHASE');
      this.setPhase('top3'); return ok();
    }
    toFinale() {
      if (!['final', 'top3'].includes(this.phase)) return fail('BAD_PHASE');
      this.setPhase('finale'); return ok();
    }

    submit(playerId, text) {
      const t = this.now();
      if (this.phase !== 'question' || t > this.closesAt) return fail('CLOSED');
      const p = this.players.get(playerId);
      if (!p) return fail('NOT_PLAYER');
      const L = this.config.limits, S = this.config.scoring;
      if (typeof text !== 'string' || text.length > L.maxAnswerLength) return fail('INVALID');
      const qi = this.qIndex;
      const a = p.answers[qi] || (p.answers[qi] = { attempts: 0, wrong: 0, correct: false, points: 0, timeMs: null, lastAt: -Infinity });
      if (a.correct) return fail('ALREADY_CORRECT');
      if (a.attempts >= S.maxAttempts) return fail('NO_ATTEMPTS');
      if (t - a.lastAt < S.minSubmitIntervalMs) return fail('TOO_FAST', { retryInMs: S.minSubmitIntervalMs - (t - a.lastAt) });
      if (!normalizeAnswer(text)) return fail('EMPTY');
      a.lastAt = t;
      a.attempts++;
      const elapsed = t - this.openedAt;
      const windowMs = this.t.answerSec * 1000;
      if (isCorrectAnswer(text, this.questions[qi])) {
        const points = computePoints(S, a.wrong, elapsed, windowMs);
        Object.assign(a, { correct: true, points, timeMs: elapsed });
        p.score += points; p.correct += 1; p.timeMs += elapsed;
        return ok({ correct: true, points, elapsedMs: elapsed, attemptsLeft: S.maxAttempts - a.attempts, score: p.score });
      }
      a.wrong++;
      return ok({
        correct: false, points: 0, attemptsLeft: S.maxAttempts - a.attempts,
        maxBonus: Math.max(0, S.maxBonus - S.wrongPenalty * a.wrong), score: p.score
      });
    }

    stats() {
      let answered = 0, correct = 0;
      for (const p of this.players.values()) {
        const a = p.answers[this.qIndex];
        if (a && a.attempts > 0) answered++;
        if (a && a.correct) correct++;
      }
      return { answered, correct, total: this.players.size };
    }
    fastest() {
      let best = null;
      for (const p of this.players.values()) {
        const a = p.answers[this.qIndex];
        if (a && a.correct && (!best || a.timeMs < best.timeMs)) best = { name: p.name, timeMs: a.timeMs };
      }
      return best;
    }
    leaderboard() { return rankPlayers(Array.from(this.players.values())); }
  }

  // Room = Game + bộ hẹn giờ do server quản lý + các "view" gửi cho từng vai trò
  class Room {
    constructor(opts) {
      this.code = opts.code;
      this.config = opts.config;
      this.game = new Game(opts.config, { now: opts.now, makeToken: opts.makeToken });
      this.timers = opts.timers || { setTimeout: (f, ms) => setTimeout(f, ms), clearTimeout: (h) => clearTimeout(h) };
      this.onChange = opts.onChange || (() => {});
      this.handle = null;
      this.lastActivity = this.game.now();
    }
    schedule(ms, fn) {
      this.clear();
      this.handle = this.timers.setTimeout(() => { this.handle = null; fn(); }, ms);
    }
    clear() { if (this.handle) { this.timers.clearTimeout(this.handle); this.handle = null; } }
    touch() { this.lastActivity = this.game.now(); }
    emit() { this.touch(); this.onChange(this); }

    action(name) {
      const g = this.game;
      let r;
      switch (name) {
        case 'start':
          r = g.start();
          if (r.ok) this.schedule(g.t.countdownSec * 1000, () => this.open(0));
          break;
        case 'next':
          if (g.phase === 'countdown') { this.open(0); return ok(); }
          if (g.phase === 'question') { this.close(); return ok(); }
          if (g.phase === 'reveal') { this.advance(); return ok(); }
          r = fail('BAD_PHASE');
          break;
        case 'end': r = g.endEarly(); if (r.ok) this.clear(); break;
        case 'top3': r = g.toTop3(); break;
        case 'finale': r = g.toFinale(); break;
        case 'restart': this.clear(); g.reset(false); r = ok(); break;
        default: r = fail('BAD_ACTION');
      }
      if (r.ok) this.emit();
      return r;
    }
    open(i) {
      if (!this.game.openQuestion(i).ok) return;
      this.schedule(this.game.t.answerSec * 1000, () => this.close());
      this.emit();
    }
    close() {
      if (!this.game.closeQuestion().ok) return;
      if (this.game.t.autoAdvance) this.schedule(this.game.t.revealSec * 1000, () => this.advance());
      else this.clear();
      this.emit();
    }
    advance() {
      const g = this.game;
      if (g.phase !== 'reveal') return;
      if (g.hasNext()) this.open(g.qIndex + 1);
      else { this.clear(); g.finish(); this.emit(); }
    }
    submit(playerId, text) { const r = this.game.submit(playerId, text); this.touch(); return r; }

    baseView() {
      const g = this.game;
      const inQ = g.phase === 'question' || g.phase === 'reveal';
      const q = g.questions[g.qIndex];
      const v = {
        code: this.code, phase: g.phase, qIndex: g.qIndex, total: g.questions.length,
        serverNow: g.now(), openedAt: g.openedAt, closesAt: g.closesAt,
        countdownEndsAt: g.countdownEndsAt, revealEndsAt: g.revealEndsAt,
        autoAdvance: !!g.t.autoAdvance, playerCount: g.players.size,
        scoring: { base: g.config.scoring.base, maxBonus: g.config.scoring.maxBonus, wrongPenalty: g.config.scoring.wrongPenalty, maxAttempts: g.config.scoring.maxAttempts },
        question: inQ && q ? { index: g.qIndex, number: g.qIndex + 1, image: q.image, alt: q.alt || '', pattern: answerPattern(q.answer) } : null,
        reveal: null
      };
      // đáp án chỉ được gửi đi SAU khi câu hỏi đã đóng
      if (g.phase === 'reveal' && q) v.reveal = { answer: q.answer, explanation: q.explanation || '', fastest: g.fastest() };
      return v;
    }
    publicView() {
      const g = this.game, v = this.baseView();
      if (g.phase === 'top3' || g.phase === 'finale') v.top3 = g.leaderboard().slice(0, 3).map(({ rank, name, score, correct, timeMs }) => ({ rank, name, score, correct, timeMs }));
      if (g.phase === 'finale') v.finale = g.config.finale;
      return v;
    }
    hostView() {
      const g = this.game, v = this.baseView();
      v.showStartedAt = g.showStartedAt;
      v.timeline = g.t;
      v.players = Array.from(g.players.values(), (p) => ({ id: p.id, name: p.name, connected: (p.conns || 0) > 0 }));
      v.leaderboard = g.leaderboard();
      v.stats = g.stats();
      if (g.phase === 'top3' || g.phase === 'finale') v.finale = g.config.finale; // chứa chữ "BẢN SẮC" nên chỉ gửi ở cuối
      return v;
    }
    playerView(playerId) {
      const g = this.game, p = g.players.get(playerId);
      if (!p) return null;
      const S = g.config.scoring;
      const a = p.answers[g.qIndex] || { attempts: 0, wrong: 0, correct: false, points: 0 };
      const showRank = ['top3', 'finale'].includes(g.phase);
      const rank = showRank ? g.leaderboard().findIndex((r) => r.id === p.id) + 1 : null;
      return {
        id: p.id, name: p.name, score: p.score, correct: p.correct, timeMs: p.timeMs,
        rank, playerCount: g.players.size, qIndex: g.qIndex,
        current: { attempts: a.attempts, attemptsLeft: S.maxAttempts - a.attempts, correct: a.correct, points: a.points, maxBonus: Math.max(0, S.maxBonus - S.wrongPenalty * a.wrong) }
      };
    }
  }

  return { Game, Room, normalizeAnswer, compactAnswer, isCorrectAnswer, answerPattern, sanitizeName, computePoints, rankPlayers };
});
