/*
 * CHẾ ĐỘ SÂN KHẤU – 1 máy chiếu, không cần server.
 * MC mời người lên giải, người chơi nói đáp án, MC bấm ĐÚNG / SAI. Không tính điểm.
 * Mở trực tiếp file public/san-khau.html bằng trình duyệt.
 */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const cfg = window.GAME_CONFIG, Core = window.GameCore;
  const Q = cfg.questions, ANSWER_MS = cfg.timeline.answerSec * 1000, EXTRA_MS = 15000;
  const RING_C = 2 * Math.PI * 54;

  // phase: welcome → countdown → question (⇄ timeup) → reveal → … → finale
  let phase = 'welcome', qi = 0, wrong = 0, results = Q.map(() => null);
  let endsAt = 0, pausedLeft = null, cdEndsAt = 0, lastSec = -1, lastCd = -1, seqTimers = [];

  const timeLeft = () => (pausedLeft != null ? pausedLeft : Math.max(0, endsAt - Date.now()));

  function boot() {
    DrumArt.mount($('#bgDrum'), 'bg'); DrumArt.mount($('#brandDrum'), 'br');
    $('#welcomeInfo').textContent = `${Q.length} câu đố hình · ${cfg.timeline.answerSec} giây mỗi câu · mời khán giả lên sân khấu giải`;
    Q.forEach((q) => { const im = new Image(); im.src = q.image; }); // tải trước hình
    bindUI();
    go('welcome');
    requestAnimationFrame(tick);
  }

  function show(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
    if (name !== 'finale') { resetFinale(); clearSeq(); }
    $('#controls').classList.toggle('dim', name === 'finale');
    document.body.classList.toggle('in-finale', name === 'finale');
  }

  function go(next) {
    phase = next;
    const screen = { welcome: 'welcome', countdown: 'countdown', question: 'question', timeup: 'question', reveal: 'question', finale: 'finale' }[phase];
    if (!$('#scr-' + screen).classList.contains('on')) show(screen);
    $('#qChip').textContent = phase === 'welcome' || phase === 'finale' ? '–' : `${qi + 1}/${Q.length}`;
    renderProgress();
    renderControls();
  }

  // ===== thao tác MC =====
  function startQuestion(i) {
    SFX.unlock();
    qi = i; wrong = 0; lastCd = -1;
    cdEndsAt = Date.now() + (cfg.timeline.countdownSec || 3) * 1000;
    $('#cdLabel').textContent = `CÂU ${qi + 1}`;
    go('countdown');
  }
  function openQuestion() {
    const q = Q[qi];
    endsAt = Date.now() + ANSWER_MS; pausedLeft = null; lastSec = -1;
    $('#qScreen').classList.remove('revealed');
    $('#qLabel').textContent = `CÂU ${qi + 1} / ${Q.length}`;
    const img = $('#qImg'); img.src = q.image; img.alt = q.alt || '';
    const f = $('#frame'); f.classList.remove('enter'); void f.offsetWidth; f.classList.add('enter');
    buildPattern($('#pattern'), Core.answerPattern(q.answer));
    $('#explain').textContent = '';
    $('#wrongCount').textContent = '0';
    setVerdict('', '');
    SFX.go();
    go('question');
  }
  function markCorrect() {
    if (phase !== 'question' && phase !== 'timeup') return;
    results[qi] = 'ok';
    SFX.correct(); setTimeout(() => SFX.fanfare(), 250);
    Confetti.burst(0.5, 0.5, 200); setTimeout(() => { Confetti.burst(0.2, 0.6, 100); Confetti.burst(0.8, 0.6, 100); }, 300);
    reveal('CHÍNH XÁC!', 'ok');
  }
  function markWrong() {
    if (phase !== 'question') return;
    wrong++;
    $('#wrongCount').textContent = wrong;
    SFX.wrong();
    const f = $('#frame'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
    setVerdict('CHƯA ĐÚNG', 'bad');
    clearTimeout(markWrong.h); markWrong.h = setTimeout(() => { if (phase === 'question') setVerdict('', ''); }, 1400);
  }
  function revealAnswer() {
    if (phase !== 'question' && phase !== 'timeup') return;
    if (results[qi] !== 'ok') results[qi] = 'miss';
    SFX.reveal();
    reveal('ĐÁP ÁN', 'info');
  }
  function reveal(text, cls) {
    pausedLeft = timeLeft();
    $('#qScreen').classList.add('revealed');
    fillPattern($('#pattern'), Q[qi].answer);
    $('#explain').textContent = Q[qi].explanation || '';
    setVerdict(text, cls);
    go('reveal');
  }
  function togglePause() {
    if (phase !== 'question') return;
    if (pausedLeft == null) pausedLeft = timeLeft();
    else { endsAt = Date.now() + pausedLeft; pausedLeft = null; }
    renderControls();
  }
  function addTime() {
    if (phase !== 'timeup') return;
    endsAt = Date.now() + EXTRA_MS; pausedLeft = null; lastSec = -1;
    setVerdict('', '');
    go('question');
  }
  function next() { if (qi + 1 < Q.length) startQuestion(qi + 1); else runFinale(); }
  function restart() {
    if (phase !== 'finale' && !confirm('Chơi lại từ câu 1?')) return;
    results = Q.map(() => null); qi = 0;
    go('welcome');
  }

  // ===== hiển thị =====
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
  function setVerdict(text, cls) { const v = $('#verdict'); v.textContent = text; v.className = 'verdict' + (text ? ' on ' + cls : ''); }

  function renderProgress() {
    const box = $('#prog'); box.innerHTML = '';
    Q.forEach((q, i) => {
      const r = results[i], cur = i === qi && phase !== 'welcome' && phase !== 'finale';
      const li = el('li', (r ? r : '') + (cur ? ' cur' : ''));
      li.append(el('span', 'n', i + 1), el('span', 't', r === 'ok' ? q.answer : r === 'miss' ? q.answer : cur ? 'Đang giải…' : 'Chưa mở'), el('span', 's', r === 'ok' ? '✓' : r === 'miss' ? '✗' : ''));
      box.appendChild(li);
    });
  }

  function renderControls() {
    const last = qi + 1 >= Q.length;
    const B = {
      welcome: [['BẮT ĐẦU CÂU 1 ▶', 'primary', () => startQuestion(0)]],
      countdown: [['Mở câu ngay ▶', 'primary', openQuestion]],
      question: [['ĐÚNG ✓', 'primary', markCorrect], ['SAI ✗', 'danger', markWrong], [pausedLeft == null ? 'Dừng giờ' : 'Chạy tiếp giờ', 'ghost', togglePause], ['Lật đáp án', 'ghost', revealAnswer]],
      timeup: [['Lật đáp án', 'primary', revealAnswer], ['ĐÚNG ✓', 'ghost', markCorrect], ['Thêm 15 giây', 'ghost', addTime]],
      reveal: [[last ? 'GIẢI MÃ THÔNG ĐIỆP CUỐI CÙNG ▶' : `Sang câu ${qi + 2} ▶`, 'primary', next], ['Chơi lại từ đầu', 'ghost', restart]],
      finale: [['Chơi lại từ đầu', 'ghost', restart]]
    }[phase];
    const box = $('#ctlMain'); box.innerHTML = '';
    B.forEach(([label, cls, fn]) => { const b = el('button', 'btn ' + cls, label); b.onclick = () => { SFX.unlock(); fn(); }; box.appendChild(b); });
  }

  function setRing(frac, label) {
    $('#ring').style.strokeDashoffset = RING_C * (1 - Math.max(0, Math.min(1, frac)));
    $('#ringNum').textContent = label;
  }

  function tick() {
    requestAnimationFrame(tick);
    let note = '';
    if (phase === 'countdown') {
      const n = Math.ceil((cdEndsAt - Date.now()) / 1000);
      if (n !== lastCd) {
        lastCd = n;
        if (n <= 0) return openQuestion();
        const c = $('#cdNum'); c.textContent = n; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
        SFX.count();
      }
    } else if (phase === 'question') {
      const left = timeLeft(), sec = Math.ceil(left / 1000);
      setRing(left / ANSWER_MS, sec);
      $('#ringWrap').classList.toggle('warn', sec <= 5);
      if (pausedLeft != null) note = 'Đang dừng giờ';
      else if (sec !== lastSec) { if (sec <= 5 && sec > 0) SFX.tickUrgent(); else if (sec <= 10 && sec > 0) SFX.tick(); lastSec = sec; }
      if (left <= 0) { SFX.timeUp(); setVerdict('HẾT GIỜ!', 'bad'); go('timeup'); }
    } else if (phase === 'timeup' || phase === 'reveal') {
      $('#ringWrap').classList.remove('warn');
    }
    $('#ctlNote').textContent = note;
  }

  // ===== thông điệp cuối (giống màn MC) =====
  function clearSeq() { seqTimers.forEach(clearTimeout); seqTimers = []; Confetti.stop(); }
  const seq = (ms, fn) => seqTimers.push(setTimeout(fn, ms));
  function resetFinale() { const f = $('#scr-finale'); f.className = 'screen finale' + (f.classList.contains('on') ? ' on' : ''); }
  function runFinale() {
    go('finale');
    clearSeq();
    const f = $('#scr-finale'), F = cfg.finale || {};
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

  function bindUI() {
    const snd = $('#btnSound');
    const sndLabel = () => (snd.textContent = 'Âm thanh: ' + (SFX.on ? 'Bật' : 'Tắt'));
    sndLabel();
    snd.onclick = () => { SFX.toggle(); sndLabel(); };
    $('#btnFull').onclick = toggleFull;
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      SFX.unlock();
      if (k === 'h') $('#controls').classList.toggle('hide');
      else if (k === 'f') toggleFull();
      else if (k === 'm') { SFX.toggle(); sndLabel(); }
      else if (k === 'd' || k === 'đ') markCorrect();
      else if (k === 's' || k === 'x') markWrong();
      else if (k === 'l') revealAnswer();
      else if (k === 'p') togglePause();
      else if ([' ', 'arrowright', 'pagedown', 'enter'].includes(k)) {
        const b = $('#ctlMain .btn.primary');
        if (b) { e.preventDefault(); b.click(); }
      }
    });
  }
  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }

  boot();
})();
