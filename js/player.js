(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN');
  const fmtSec = (ms) => (ms / 1000).toFixed(1).replace('.', ',') + 's';
  const MSG = {
    NOT_FOUND: 'MC chưa mở trò chơi. Chờ MC rồi thử lại nhé.', LATE: 'Trò chơi đã bắt đầu – không thể tham gia muộn.',
    FULL: 'Trò chơi đã đủ người.', BAD_NAME: 'Tên không hợp lệ.', NO_SESSION: 'Phiên cũ đã hết, hãy nhập tên để vào lại.',
    CLOSED: 'Câu hỏi đã đóng.', TOO_FAST: 'Chậm lại một chút rồi gửi tiếp nhé!', NO_ATTEMPTS: 'Bạn đã dùng hết 3 lượt đoán.',
    ALREADY_CORRECT: 'Bạn đã trả lời đúng câu này.', EMPTY: 'Hãy nhập đáp án.', INVALID: 'Đáp án không hợp lệ.',
    RATE_LIMIT: 'Bạn thao tác quá nhanh.', NOT_PLAYER: 'Phiên chơi không hợp lệ, hãy tải lại trang.'
  };
  const RING_C = 2 * Math.PI * 54;
  const params = new URLSearchParams(location.search);
  // không cần mã phòng: server đưa người chơi vào trò chơi MC đang mở (?room= vẫn dùng được nếu cần)
  const code = (params.get('room') || '').replace(/\D/g, '').slice(0, 6);
  let socket, S = null, me = null, offset = 0, joined = false, pending = false, DEMO = false, lastSec = -1, lastCd = -1;
  const now = () => Date.now() + offset;
  const key = () => 'dhbc_p_' + (code || 'auto');
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });

  function show(id) { document.querySelectorAll('.p-scr').forEach((s) => s.classList.toggle('on', s.id === 'p-' + id)); }

  async function boot() {
    DrumArt.mount($('#bgDrum'), 'bg'); DrumArt.mount($('#pDrum'), 'pd'); DrumArt.mount($('#pDrum2'), 'pd2');
    try { await loadScript('socket.io/socket.io.js'); } catch (_) { /* demo */ }
    DEMO = typeof window.io !== 'function';
    if (DEMO) {
      await loadScript('../config/game.config.js');
      await loadScript('js/demo.js');
      socket = DemoServer.connect('player');
    } else {
      socket = io({ transports: ['websocket', 'polling'] });
    }
    $('#nameInput').value = localStorage.getItem('dhbc_name') || '';
    socket.on('connect', () => {
      $('#connBar').classList.remove('on');
      const tok = localStorage.getItem(key());
      if (tok) join('', tok);
    });
    socket.on('disconnect', () => $('#connBar').classList.add('on'));
    socket.on('state', (s) => { offset = s.serverNow - Date.now(); const p = S; S = s; render(p); });
    socket.on('me', (m) => { me = m; renderMe(); });
    socket.on('room:closed', () => { localStorage.removeItem(key()); joined = false; show('join'); $('#joinErr').textContent = 'Trò chơi đã đóng. Chờ MC mở lại rồi vào lại nhé.'; });
    $('#joinForm').addEventListener('submit', onJoinSubmit);
    $('#ansForm').addEventListener('submit', (e) => { e.preventDefault(); submitAnswer(); });
    requestAnimationFrame(tick);
  }

  function onJoinSubmit(e) {
    e.preventDefault();
    SFX.unlock();
    const err = $('#joinErr');
    const name = $('#nameInput').value.replace(/\s+/g, ' ').trim();
    if (!name) { err.textContent = 'Hãy nhập tên của bạn.'; return; }
    if (Array.from(name).length > 20) { err.textContent = 'Tên tối đa 20 ký tự.'; return; }
    localStorage.setItem('dhbc_name', name);
    err.textContent = '';
    join(name, localStorage.getItem(key()));
  }

  function join(name, token) {
    $('#joinBtn').disabled = true;
    socket.emit('player:join', { code, name, token }, (r) => {
      $('#joinBtn').disabled = false;
      if (!r || !r.ok) {
        const e = r && r.error;
        if (token && (e === 'NO_SESSION' || e === 'NOT_FOUND')) localStorage.removeItem(key());
        if (e === 'LATE') { show('late'); return; }
        if (!token || name) $('#joinErr').textContent = MSG[e] || 'Không thể tham gia.';
        show('join');
        return;
      }
      localStorage.setItem(key(), r.token);
      joined = true;
      $('#hello').textContent = r.name;
      if (S) render(null);
    });
  }

  function buildPattern(box, pattern) {
    box.innerHTML = '';
    pattern.forEach((len) => { const w = el('div', 'w'); for (let i = 0; i < len; i++) w.appendChild(el('span', 'l')); box.appendChild(w); });
  }
  function fillPattern(box, answer) {
    const words = answer.trim().split(/\s+/);
    [...box.children].forEach((w, wi) => {
      const chars = Array.from(words[wi] || '');
      [...w.children].forEach((l, li) => { l.textContent = chars[li] || ''; l.style.animationDelay = (wi * 4 + li) * 0.06 + 's'; l.classList.add('on'); });
    });
  }

  function render(prevS) {
    if (!joined || !S) return;
    const changed = !prevS || prevS.phase !== S.phase || prevS.qIndex !== S.qIndex;
    switch (S.phase) {
      case 'lobby': show('wait'); $('#waitCount').textContent = S.playerCount; break;
      case 'countdown': show('count'); break;
      case 'question': case 'reveal': show('play'); if (changed) renderPlay(prevS); break;
      case 'final': case 'top3': show('final'); if (changed && S.phase === 'top3') SFX.fanfare(); break;
      case 'finale':
        show('finale');
        if (changed && S.finale) { $('#pfL1').textContent = S.finale.line1; $('#pfL2').textContent = S.finale.line2; $('#pfT').textContent = S.finale.title; Confetti.rain(4000); }
        break;
    }
    renderMe();
  }

  function renderPlay(prevS) {
    const q = S.question;
    if (!q) return;
    const rv = S.phase === 'reveal';
    const newQ = !prevS || prevS.qIndex !== S.qIndex || !['question', 'reveal'].includes(prevS.phase);
    if (newQ) {
      $('#ppLabel').textContent = `CÂU ${q.number}/${S.total}`;
      const img = $('#ppImg'); img.src = q.image; img.alt = q.alt;
      buildPattern($('#ppPattern'), q.pattern);
      $('#ansInput').value = '';
      setFb('', '');
    }
    $('#pReveal').classList.toggle('on', rv);
    if (rv && S.reveal) {
      fillPattern($('#ppPattern'), S.reveal.answer);
      $('#pAnswer').textContent = S.reveal.answer;
      setFb('', '');
      if (prevS && prevS.phase === 'question') SFX.reveal();
    } else if (S.phase === 'question' && !newQ) { /* giữ nguyên */ }
    if (S.phase === 'question' && newQ) { SFX.go(); setTimeout(() => { if (!lockedNow()) $('#ansInput').focus(); }, 300); }
  }

  const lockedNow = () => !S || S.phase !== 'question' || (me && me.qIndex === S.qIndex && (me.current.correct || me.current.attemptsLeft <= 0));

  function renderMe() {
    if (!me) return;
    $('#ppScore').textContent = fmtNum(me.score);
    const cur = me.qIndex === (S && S.qIndex) ? me.current : { attempts: 0, attemptsLeft: S ? S.scoring.maxAttempts : 3, correct: false, points: 0 };
    const locked = lockedNow();
    $('#ansInput').disabled = locked; $('#ansBtn').disabled = locked || pending;
    const tries = $('#tries'); tries.innerHTML = '';
    if (S && S.phase === 'question' && !cur.correct) {
      const max = S.scoring.maxAttempts;
      for (let i = 0; i < max; i++) { const d = el('i'); if (i < cur.attempts) d.className = 'used'; tries.appendChild(d); }
      tries.append(` còn ${cur.attemptsLeft} lượt`);
    }
    if (S && S.phase === 'question' && cur.correct && !$('#fb').classList.contains('ok')) setFb(`CHÍNH XÁC! +${fmtNum(cur.points)} điểm`, 'ok');
    if (S && S.phase === 'reveal') $('#pRound').textContent = cur.correct ? `Bạn đúng · +${fmtNum(cur.points)} điểm · tổng ${fmtNum(me.score)}` : `Bạn chưa giải được câu này · tổng ${fmtNum(me.score)}`;
    $('#fScore').textContent = fmtNum(me.score);
    $('#fDetail').textContent = `${me.correct} câu đúng · ${me.correct ? fmtSec(me.timeMs) : '—'} thời gian đúng`;
    const rb = $('#rankBox'), rb2 = $('#rankBox2');
    rb.className = rb2.className = 'rank-box';
    if (me.rank) {
      $('#rankLabel').textContent = `Thứ hạng của bạn / ${me.playerCount} người chơi`;
      $('#rankN').hidden = false; $('#rankN').textContent = '#' + me.rank;
      $('#rankLabel2').textContent = `Bạn xếp hạng #${me.rank} với ${fmtNum(me.score)} điểm`;
      if (me.rank <= 3) { rb.classList.add('g' + me.rank); rb2.classList.add('g' + me.rank); }
    } else { $('#rankLabel').textContent = 'Chờ MC công bố thứ hạng…'; $('#rankN').hidden = true; $('#rankLabel2').textContent = ''; }
  }

  function setFb(text, cls) { const f = $('#fb'); f.textContent = text; f.className = 'fb' + (text ? ' on ' + cls : ''); }

  function submitAnswer() {
    if (pending || lockedNow()) return;
    const input = $('#ansInput'), text = input.value.trim();
    if (!text) { setFb(MSG.EMPTY, 'warn'); return; }
    SFX.unlock();
    pending = true; $('#ansBtn').disabled = true;
    socket.emit('player:answer', { text }, (r) => {
      pending = false;
      if (!r || !r.ok) { setFb(MSG[r && r.error] || 'Có lỗi xảy ra.', 'warn'); renderMe(); return; }
      if (r.correct) {
        SFX.correct(); setFb(`CHÍNH XÁC! +${fmtNum(r.points)} điểm`, 'ok');
        Confetti.burst(0.5, 0.55, 90);
        if (navigator.vibrate) navigator.vibrate([40, 40, 80]);
      } else {
        SFX.wrong();
        const f = $('#ansForm'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
        if (navigator.vibrate) navigator.vibrate(160);
        setFb(r.attemptsLeft > 0 ? `Chưa đúng! Còn ${r.attemptsLeft} lượt · thưởng tối đa còn ${r.maxBonus}` : 'Chưa đúng – bạn đã hết lượt cho câu này.', 'bad');
        input.select();
      }
      renderMe();
    });
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!S || !joined) return;
    const t = now();
    if (S.phase === 'question') {
      const total = S.closesAt - S.openedAt, left = Math.max(0, S.closesAt - t), sec = Math.ceil(left / 1000);
      $('#ppRingFg').style.strokeDashoffset = RING_C * (1 - left / total);
      $('#ppTime').textContent = sec;
      $('#ppRing').classList.toggle('warn', sec <= 5);
      if (sec !== lastSec) { if (sec <= 5 && sec > 0) SFX.tick(); lastSec = sec; }
    } else if (S.phase === 'reveal') {
      $('#ppRingFg').style.strokeDashoffset = RING_C; $('#ppTime').textContent = 0;
    } else if (S.phase === 'countdown') {
      const n = Math.ceil((S.countdownEndsAt - t) / 1000);
      if (n !== lastCd) { lastCd = n; const c = $('#pCd'); c.textContent = n > 0 ? n : 'GO!'; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); if (n > 0) SFX.count(); }
    }
  }

  boot();
})();
