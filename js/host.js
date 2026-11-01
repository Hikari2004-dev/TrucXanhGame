(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN');
  const fmtSec = (ms) => (ms / 1000).toFixed(1).replace('.', ',') + 's';
  const fmtClock = (s) => { const neg = s < 0; s = Math.abs(Math.floor(s)); return (neg ? '-' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const ERR = { BAD_PIN: 'Sai mã PIN của MC', FORBIDDEN: 'Không có quyền MC (phiên đã hết hạn)', BAD_PHASE: 'Không thể thực hiện ở bước này', RATE_LIMIT: 'Thao tác quá nhanh', SERVER_FULL: 'Máy chủ đã đủ phòng', NOT_FOUND: 'Phòng không tồn tại' };
  const SCREEN = { lobby: 'lobby', countdown: 'countdown', question: 'question', reveal: 'question', final: 'final', top3: 'top3', finale: 'finale' };
  const RING_C = 2 * Math.PI * 54;

  let socket, S = null, prev = null, offset = 0, auth = null, creating = false, DEMO = false, lastSec = -1, lastCd = -1, seqTimers = [], ctlKey = '';
  const now = () => Date.now() + offset;

  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const readAuth = () => { try { return JSON.parse(localStorage.getItem('dhbc_host')); } catch (_) { return null; } };
  const saveAuth = (a) => localStorage.setItem('dhbc_host', JSON.stringify(a));
  const clearAuth = () => localStorage.removeItem('dhbc_host');

  async function boot() {
    DrumArt.mount($('#bgDrum'), 'bg'); DrumArt.mount($('#brandDrum'), 'br');
    try { await loadScript('socket.io/socket.io.js'); } catch (_) { /* không có server -> demo */ }
    DEMO = typeof window.io !== 'function';
    if (DEMO) {
      await loadScript('../config/game.config.js');
      await loadScript('js/demo.js');
      socket = DemoServer.connect('host');
      document.body.classList.add('is-demo');
    } else {
      socket = io({ transports: ['websocket', 'polling'] });
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', () => setConn(false));
    socket.on('host:state', onState);
    socket.on('rate_limited', () => toast('Thao tác quá nhanh'));
    socket.on('room:closed', () => { clearAuth(); auth = null; S = null; prev = null; show('welcome'); renderControls(true); createRoom(); });
    bindUI();
    renderControls(true);
    requestAnimationFrame(tick);
  }

  function setConn(on) { $('#conn').classList.toggle('on', on); }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 2600); }

  function onConnect() {
    setConn(true);
    const saved = auth || (DEMO ? null : readAuth());
    if (!saved) { if (!S) { show('welcome'); createRoom(); } return; }
    socket.emit('host:resume', saved, (r) => {
      if (r && r.ok) auth = saved;
      else { clearAuth(); auth = null; S = null; show('welcome'); renderControls(true); createRoom(); }
    });
  }
  // tự mở trò chơi khi vào màn MC; chỉ hỏi PIN nếu server có cấu hình HOST_PIN
  function createRoom() {
    if (creating || auth) return;
    creating = true;
    SFX.unlock();
    socket.emit('host:create', { pin: $('#pin').value.trim() }, (r) => {
      creating = false;
      if (!r || !r.ok) {
        if (r && r.error === 'BAD_PIN') { $('#pinBox').hidden = false; if ($('#pin').value) toast(ERR.BAD_PIN); $('#pin').focus(); return; }
        return toast(ERR[r && r.error] || 'Không mở được trò chơi');
      }
      auth = { code: r.code, hostToken: r.hostToken };
      if (!DEMO) saveAuth(auth);
    });
  }
  function act(action) {
    if (!auth) return;
    SFX.unlock();
    if (action === 'end' && !confirm('Kết thúc trò chơi sớm và chuyển sang bảng xếp hạng?')) return;
    socket.emit('host:action', Object.assign({}, auth, { action }), (r) => { if (!r || !r.ok) toast(ERR[r && r.error] || 'Có lỗi xảy ra'); });
  }

  function show(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
    if (name !== 'finale') resetFinale();
    if (name !== 'top3') { document.querySelectorAll('.pod').forEach((p) => p.classList.remove('show')); }
    if (name !== 'top3' && name !== 'finale') clearSeq();
    $('#controls').classList.toggle('dim', name === 'finale' || name === 'top3');
    document.body.classList.toggle('in-finale', name === 'finale');
  }

  function onState(s) {
    offset = s.serverNow - Date.now();
    prev = S; S = s;
    const changed = !prev || prev.phase !== s.phase || prev.qIndex !== s.qIndex || prev.code !== s.code;
    render(changed);
  }

  function render(changed) {
    if (changed) show(SCREEN[S.phase]);
    buildTimeline();
    renderControls(changed);
    if (S.phase === 'lobby') renderLobby();
    if (S.phase === 'question' || S.phase === 'reveal') renderQuestion(changed);
    renderBoard($('#liveBoard'), S.leaderboard.slice(0, 8), 'mini');
    $('#liveEmpty').hidden = S.leaderboard.some((r) => r.score > 0);
    if (S.phase === 'final') renderFinal();
    if (changed && S.phase === 'top3') runTop3();
    if (changed && S.phase === 'finale') runFinale();
    if (changed && prev) phaseSound();
  }

  function phaseSound() {
    if (S.phase === 'question') SFX.go();
    else if (S.phase === 'reveal') { SFX.timeUp(); setTimeout(() => SFX.reveal(), 350); }
    else if (S.phase === 'final') SFX.fanfare();
  }

  function renderLobby() {
    $('#joinUrl').textContent = (S.joinUrl || '').replace(/^https?:\/\//, '');
    const qr = $('#qr');
    if (DEMO) { qr.hidden = true; $('#qrDemo').hidden = false; }
    else if (qr.dataset.code !== S.code) { qr.dataset.code = S.code; qr.src = 'api/qr?code=' + S.code; }
    $('#playerCount').textContent = S.players.length;
    const box = $('#chips');
    const have = new Map([...box.children].map((c) => [c.dataset.id, c]));
    S.players.forEach((p) => {
      let c = have.get(p.id);
      if (!c) { c = el('span', 'chip', p.name); c.dataset.id = p.id; box.appendChild(c); if (prev) SFX.join(); }
      have.delete(p.id);
      c.classList.toggle('off', !p.connected);
    });
    have.forEach((c) => c.remove());
  }

  function buildPattern(box, pattern) {
    box.innerHTML = '';
    pattern.forEach((len) => { const w = el('div', 'w'); for (let i = 0; i < len; i++) w.appendChild(el('span', 'l')); box.appendChild(w); });
  }
  function fillPattern(box, answer) {
    const words = answer.trim().split(/\s+/);
    [...box.children].forEach((w, wi) => {
      const chars = Array.from(words[wi] || '');
      [...w.children].forEach((l, li) => { l.textContent = chars[li] || ''; l.style.animationDelay = (wi * 4 + li) * 0.08 + 's'; l.classList.add('on'); });
    });
  }

  function renderQuestion(changed) {
    const q = S.question;
    if (!q) return;
    const rv = S.phase === 'reveal';
    $('#qScreen').classList.toggle('revealed', rv);
    if (changed) {
      $('#qLabel').textContent = `CÂU ${q.number} / ${S.total}`;
      const img = $('#qImg');
      if (img.dataset.src !== q.image) {
        img.dataset.src = q.image; img.src = q.image; img.alt = q.alt;
        const f = $('#frame'); f.classList.remove('enter'); void f.offsetWidth; f.classList.add('enter');
      }
      buildPattern($('#pattern'), q.pattern);
      $('#explain').textContent = '';
      if (rv && S.reveal) {
        fillPattern($('#pattern'), S.reveal.answer);
        $('#explain').textContent = S.reveal.explanation;
        const f = S.reveal.fastest;
        $('#fastest').textContent = f ? `${f.name} · ${fmtSec(f.timeMs)}` : 'Chưa ai giải được';
      }
    }
    $('#answered').textContent = `${S.stats.answered}/${S.stats.total}`;
    $('#correctCount').textContent = S.stats.correct;
  }

  function renderBoard(box, rows, mode) {
    const map = new Map([...box.children].map((c) => [c.dataset.id, c]));
    rows.forEach((r, i) => {
      let row = map.get(r.id);
      if (!row) {
        row = el('div', 'row'); row.dataset.id = r.id;
        row.append(el('span', 'rk'), el('span', 'nm'));
        if (mode === 'full') row.append(el('span', 'ok'));
        row.append(el('span', 'sc'));
        if (mode === 'full') row.append(el('span', 'tm'));
        box.appendChild(row);
      }
      map.delete(r.id);
      row.style.setProperty('--i', i);
      row.className = 'row' + (r.rank <= 3 ? ' r' + r.rank : '') + (r.connected ? '' : ' off');
      if (row.dataset.score && +row.dataset.score < r.score) { row.classList.add('flash'); }
      row.dataset.score = r.score;
      row.querySelector('.rk').textContent = r.rank;
      row.querySelector('.nm').textContent = r.name;
      row.querySelector('.sc').textContent = fmtNum(r.score);
      if (mode === 'full') { row.querySelector('.ok').textContent = `${r.correct}/${S.total}`; row.querySelector('.tm').textContent = r.correct ? fmtSec(r.timeMs) : '—'; }
    });
    map.forEach((c) => c.remove());
    box.style.setProperty('--n', rows.length);
  }

  function renderFinal() {
    const rows = S.leaderboard.slice(0, 8);
    renderBoard($('#finalBoard'), rows, 'full');
    const more = S.leaderboard.length - rows.length;
    $('#finalMore').textContent = more > 0 ? `và ${more} người chơi khác` : (S.leaderboard.length ? '' : 'Chưa có người chơi');
  }

  function clearSeq() { seqTimers.forEach(clearTimeout); seqTimers = []; Confetti.stop(); }
  const seq = (ms, fn) => seqTimers.push(setTimeout(fn, ms));

  function runTop3() {
    clearSeq();
    const top = S.leaderboard.slice(0, 3);
    [1, 2, 3].forEach((n) => {
      const pod = $('#pod' + n), r = top[n - 1];
      pod.classList.remove('show');
      pod.querySelector('.pod-name').textContent = r ? r.name : '—';
      pod.querySelector('.pod-score').textContent = r ? `${fmtNum(r.score)} điểm · ${r.correct} câu · ${fmtSec(r.timeMs)}` : 'Chưa có người chơi';
    });
    seq(500, () => { $('#pod3').classList.add('show'); SFX.reveal(); });
    seq(2300, () => { $('#pod2').classList.add('show'); SFX.reveal(); });
    seq(3900, () => SFX.drumroll(2.2));
    seq(6200, () => { $('#pod1').classList.add('show'); SFX.fanfare(); Confetti.burst(0.5, 0.55, 220); });
    seq(6900, () => { Confetti.burst(0.2, 0.6, 120); Confetti.burst(0.8, 0.6, 120); Confetti.rain(7000); });
  }

  function resetFinale() {
    const f = $('#scr-finale');
    f.className = 'screen finale' + (f.classList.contains('on') ? ' on' : '');
  }
  function runFinale() {
    clearSeq();
    const f = $('#scr-finale'), F = S.finale || {};
    const stage = (...cls) => { f.className = 'screen finale on ' + cls.join(' '); };
    $('#finL1').textContent = F.line1 || ''; $('#finL2').textContent = F.line2 || '';
    $('#finKicker').textContent = F.kicker || ''; $('#finT').textContent = F.title || '';
    $('#finDrum').innerHTML = $('#finTDrum').innerHTML = '<img src="img/trong-dong.svg" alt="Trống đồng">'; DrumArt.ring54($('#finRing'));
    loadPhotos(F.photos || []);
    stage('s-dark');
    const cd = $('#finCount');
    [3, 2, 1].forEach((n, i) => seq(1200 + i * 1000, () => { stage('s-count'); cd.textContent = n; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); SFX.boom(); }));
    seq(4200, () => { stage('s-burst'); SFX.gong(); });
    seq(6600, () => { stage('s-burst', 's-l1'); SFX.fanfare(); Confetti.burst(0.5, 0.75, 180); });
    seq(9800, () => { stage('s-burst', 's-l1', 's-l2'); SFX.reveal(); Confetti.rain(5000); });
    seq(17500, () => { stage('s-title'); SFX.gong(); });
  }
  function loadPhotos(list) {
    const cols = $('#finPhotos').children;
    [...cols].forEach((c) => (c.innerHTML = ''));
    list.slice(0, 6).forEach((src, i) => {
      const im = new Image();
      im.onload = () => cols[i % 2].appendChild(im);
      im.alt = 'Văn hóa dân tộc Việt Nam'; im.src = src;
    });
  }

  function buildTimeline() {
    const tr = $('#tlTrack');
    if (tr.dataset.built) return;
    const tl = S.timeline, n = S.total;
    const segs = [tl.introSec, n * (tl.answerSec + tl.revealSec), tl.top3Sec, tl.finaleSec];
    const total = segs.reduce((a, b) => a + b, 0);
    segs.forEach((s) => { const i = el('i'); i.style.width = (s / total) * 100 + '%'; tr.insertBefore(i, $('#tlHead')); });
    tr.dataset.built = '1';
  }
  function updateTimeline(t) {
    const tl = S.timeline, n = S.total;
    const marks = [['Giới thiệu & tham gia', tl.introSec], [`${n} câu đố`, n * (tl.answerSec + tl.revealSec)], ['Công bố TOP 3', tl.top3Sec], ['Thông điệp cuối', tl.finaleSec]];
    const total = marks.reduce((a, m) => a + m[1], 0);
    const el_ = (t - S.showStartedAt) / 1000;
    let acc = 0, label = 'Hết giờ kịch bản';
    for (const [name, d] of marks) { if (el_ < acc + d) { label = `${name} · còn ${fmtClock(acc + d - el_)}`; break; } acc += d; }
    $('#tlSeg').textContent = label;
    $('#showClock').textContent = `${fmtClock(el_)} / ${fmtClock(total)}`;
    $('#tlHead').style.left = Math.min(100, (el_ / total) * 100) + '%';
    $('#timeline').classList.toggle('over', el_ > total);
    if (S.phase === 'lobby') {
      const left = tl.introSec - el_, il = $('#introLeft');
      il.textContent = left > 0 ? `Giới thiệu còn ${fmtClock(left)}` : 'Đến giờ bắt đầu!';
      il.classList.toggle('due', left <= 0);
    }
  }

  function setRing(frac, label) {
    $('#ring').style.strokeDashoffset = RING_C * (1 - Math.max(0, Math.min(1, frac)));
    $('#ringNum').textContent = label;
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!S) return;
    const t = now();
    updateTimeline(t);
    let note = '';
    if (S.phase === 'question') {
      const total = S.closesAt - S.openedAt, left = Math.max(0, S.closesAt - t), sec = Math.ceil(left / 1000);
      setRing(left / total, sec);
      $('#ringWrap').classList.toggle('warn', sec <= 5);
      if (sec !== lastSec) { if (sec <= 5 && sec > 0) SFX.tickUrgent(); else if (sec <= 10 && sec > 0) SFX.tick(); lastSec = sec; }
      note = `Tự đóng câu sau ${sec}s`;
    } else if (S.phase === 'reveal') {
      setRing(0, 0); $('#ringWrap').classList.remove('warn');
      if (S.autoAdvance) note = `Tự chuyển sau ${Math.max(0, Math.ceil((S.revealEndsAt - t) / 1000))}s`;
    } else if (S.phase === 'countdown') {
      const n = Math.ceil((S.countdownEndsAt - t) / 1000);
      if (n !== lastCd) {
        lastCd = n;
        const c = $('#cdNum'); c.textContent = n > 0 ? n : 'BẮT ĐẦU!'; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
        if (n > 0) SFX.count();
      }
    }
    if (S.phase !== 'countdown') lastCd = -1;
    $('#ctlNote').textContent = note;
  }

  function renderControls(force) {
    const ph = S ? S.phase : 'none';
    const last = S && S.qIndex + 1 >= S.total;
    const key = ph + ':' + (S ? S.qIndex : '') + ':' + !!auth;
    if (!force && key === ctlKey) return;
    ctlKey = key;
    const B = {
      none: [],
      lobby: [['start', 'BẮT ĐẦU TRÒ CHƠI ▶', 'primary']],
      countdown: [['next', 'Mở câu 1 ngay ▶', 'primary']],
      question: [['next', 'Đóng câu & công bố đáp án', 'primary'], ['end', 'Kết thúc sớm', 'danger']],
      reveal: last ? [['next', 'Xem bảng xếp hạng chung cuộc ▶', 'primary']] : [['next', `Sang câu ${S ? S.qIndex + 2 : ''} ▶`, 'primary'], ['end', 'Kết thúc sớm', 'danger']],
      final: [['top3', 'CÔNG BỐ TOP 3 ▶', 'primary'], ['finale', 'Bỏ qua, mở thông điệp cuối', 'ghost']],
      top3: [['finale', 'GIẢI MÃ THÔNG ĐIỆP CUỐI CÙNG', 'primary']],
      finale: [['top3', 'Xem lại TOP 3', 'ghost'], ['restart', 'Chơi lại (giữ người chơi)', 'ghost']]
    }[ph] || [];
    const box = $('#ctlMain'); box.innerHTML = '';
    B.forEach(([a, label, cls]) => { const b = el('button', 'btn ' + cls, label); b.dataset.action = a; b.onclick = () => act(a); box.appendChild(b); });
  }

  function bindUI() {
    $('#btnCreate').onclick = createRoom;
    $('#pin').addEventListener('keydown', (e) => { if (e.key === 'Enter') createRoom(); });
    const snd = $('#btnSound');
    const sndLabel = () => (snd.textContent = 'Âm thanh: ' + (SFX.on ? 'Bật' : 'Tắt'));
    sndLabel();
    snd.onclick = () => { SFX.toggle(); sndLabel(); };
    $('#btnFull').onclick = toggleFull;
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (k === 'h') $('#controls').classList.toggle('hide');
      else if (k === 'f') toggleFull();
      else if (k === 'm') { SFX.toggle(); sndLabel(); }
      else if ([' ', 'arrowright', 'pagedown', 'enter'].includes(k)) {
        const b = $('#ctlMain .btn.primary');
        if (b) { e.preventDefault(); b.click(); } else if (!S && k !== ' ') createRoom();
      }
    });
  }
  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }

  boot();
})();
