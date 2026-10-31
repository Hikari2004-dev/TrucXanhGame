// Trúc Xanh – máy chủ bảng xếp hạng và phòng chơi (Google Apps Script gắn với một Google Sheet).
// Cách cài: xem HUONG-DAN.md trong cùng thư mục.

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // chỉ dùng chữ để Sheet không tự đổi mã thành số
const HEAD = {
  Rooms:   ['code', 'title', 'key', 'status', 'created'],
  Players: ['room', 'id', 'n', 'joined'],
  Results: ['time', 'room', 'id', 'n', 'p', 'c', 'a', 't', 'ms']
};

function doGet(e) {
  let out;
  try { out = handle((e && e.parameter) || {}); }
  catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function handle(p) {
  switch (p.action) {
    case 'list':   return list(p);
    case 'submit': return locked(() => submit(p));
    case 'room':   return roomInfo(p);
    case 'join':   return locked(() => join(p));
    case 'create': return locked(() => create(p));
    case 'close':  return locked(() => setStatus(p, 'closed'));
    case 'open':   return locked(() => setStatus(p, 'open'));
    default:       return { ok: false, error: 'unknown action' };
  }
}

/* ---------- tiện ích ---------- */
function locked(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function sheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]]); }
  return s;
}
function rows(name) {
  const s = sheet(name), last = s.getLastRow();
  if (last < 2) return [];
  const keys = HEAD[name];
  return s.getRange(2, 1, last - 1, keys.length).getValues().map((v, i) => {
    const o = { _row: i + 2 };
    keys.forEach((k, j) => { o[k] = String(v[j]); });
    return o;
  });
}
// Ghi dạng chữ thuần để Sheet không đổi tên/mã thành số, ngày hay công thức.
function addRow(name, obj) {
  const s = sheet(name), r = s.getLastRow() + 1;
  if (r > s.getMaxRows()) s.insertRowsAfter(s.getMaxRows(), 100);
  const rg = s.getRange(r, 1, 1, HEAD[name].length);
  rg.setNumberFormat('@');
  rg.setValues([HEAD[name].map(k => obj[k] == null ? '' : String(obj[k]))]);
}
function clean(v, max) {
  return String(v || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 40).replace(/^[=+\-@]+/, '').trim();
}
function num(v) { const n = Number(v); return isFinite(n) && n >= 0 ? Math.floor(n) : 0; }
function code(v) { return String(v || '').toUpperCase().replace(/[^A-Z]/g, ''); }
function findRoom(c) { c = code(c); return c ? rows('Rooms').find(r => r.code === c) || null : null; }

/* ---------- phòng chơi ---------- */
function create(p) {
  const used = new Set(rows('Rooms').map(r => r.code));
  let c = '';
  do { c = ''; for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]; } while (used.has(c));
  const key = Utilities.getUuid();
  addRow('Rooms', { code: c, title: clean(p.title, 60), key: key, status: 'open', created: new Date().toISOString() });
  return { ok: true, code: c, key: key };
}
function roomInfo(p) {
  const r = findRoom(p.code);
  if (!r) return { ok: false, error: 'notfound' };
  return { ok: true, room: { code: r.code, title: r.title, status: r.status } };
}
function setStatus(p, status) {
  const r = findRoom(p.code);
  if (!r) return { ok: false, error: 'notfound' };
  if (!p.key || p.key !== r.key) return { ok: false, error: 'forbidden' };
  sheet('Rooms').getRange(r._row, HEAD.Rooms.indexOf('status') + 1).setValue(status);
  return { ok: true, status: status };
}
function join(p) {
  const r = findRoom(p.room);
  if (!r) return { ok: false, error: 'notfound' };
  if (r.status !== 'open') return { ok: false, error: 'closed' };
  const id = clean(p.id, 30), n = clean(p.n);
  if (!id || !n) return { ok: false, error: 'missing' };
  if (!rows('Players').some(x => x.id === id)) addRow('Players', { room: r.code, id: id, n: n, joined: new Date().toISOString() });
  return { ok: true };
}

/* ---------- kết quả ---------- */
function submit(p) {
  const id = clean(p.id, 30), n = clean(p.n);
  if (!id || !n) return { ok: false, error: 'missing' };
  let room = '';
  if (p.room) {
    const r = findRoom(p.room);
    if (!r) return { ok: false, error: 'notfound' };
    if (r.status !== 'open') return { ok: false, error: 'closed' };
    room = r.code;
  }
  if (rows('Results').some(x => x.id === id)) return { ok: true, dup: true };
  addRow('Results', { time: new Date().toISOString(), room: room, id: id, n: n, p: num(p.p), c: num(p.c), a: num(p.a), t: num(p.t), ms: num(p.ms) });
  return { ok: true };
}
function list(p) {
  const pick = x => ({ id: x.id, n: x.n, room: x.room, p: +x.p || 0, c: +x.c || 0, a: +x.a || 0, t: +x.t || 0, ms: +x.ms || 0, time: x.time });
  if (!p.room) return { ok: true, rows: rows('Results').filter(x => !x.room).map(pick) };
  const r = findRoom(p.room);
  if (!r) return { ok: false, error: 'notfound' };
  return {
    ok: true,
    room: { code: r.code, title: r.title, status: r.status },
    rows: rows('Results').filter(x => x.room === r.code).map(pick),
    players: rows('Players').filter(x => x.room === r.code).map(x => ({ id: x.id, n: x.n, joined: x.joined }))
  };
}
