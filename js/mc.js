// Trang MC: tạo phòng có mã, theo dõi trực tiếp ai hoàn thành nhanh nhất trong phòng.
const PAIRS=8, TOTAL=180, POLL=4000;
const $=s=>document.querySelector(s);
const ROOMS_KEY='truc_xanh_mc_rooms';
let CUR=null, pollT=null, busy=false;

function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function fmt(sec){sec=Math.max(0,sec);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function fmtMs(ms){return fmt(Math.floor(ms/1000))+'.'+(Math.floor(ms/100)%10);}
function api(params){return fetch(LEADERBOARD_URL+'?'+new URLSearchParams(Object.assign({_:Date.now()},params))).then(r=>r.json());}

/* ---------- phòng lưu trên máy MC (giữ khoá để đóng/mở phòng) ---------- */
function saved(){try{return JSON.parse(localStorage.getItem(ROOMS_KEY))||[];}catch(e){return [];}}
function remember(r){const list=saved().filter(x=>x.code!==r.code);list.unshift(r);try{localStorage.setItem(ROOMS_KEY,JSON.stringify(list.slice(0,20)));}catch(e){}}
function renderOld(){
  const list=saved(); $('#m-old-box').hidden=!list.length;
  $('#m-old').innerHTML=list.map(r=>'<div class="row"><b>'+esc(r.code)+'</b><span>'+esc(r.title||'(không tên)')+' · '+new Date(r.created).toLocaleString('vi-VN')+'</span><button type="button" data-code="'+esc(r.code)+'">Mở</button></div>').join('');
  $('#m-old').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openRoom(b.dataset.code)));
}

/* ---------- màn hình ---------- */
function showSetup(){
  clearTimeout(pollT); CUR=null; history.replaceState(null,'',location.pathname);
  $('#m-room').hidden=true; $('#m-setup').hidden=false; renderOld();
}
async function create(){
  if(busy) return;
  const btn=$('#m-create'); busy=true; btn.disabled=true; btn.textContent='Đang tạo…'; $('#m-err').hidden=true;
  const title=$('#m-title').value.trim();
  try{
    const j=await api({action:'create',title});
    if(!j.ok) throw new Error(j.error);
    remember({code:j.code,key:j.key,title,created:Date.now()});
    $('#m-title').value=''; openRoom(j.code);
  }catch(e){$('#m-err').textContent='Không tạo được phòng. Kiểm tra mạng và địa chỉ máy chủ.';$('#m-err').hidden=false;}
  busy=false; btn.disabled=false; btn.textContent='Tạo phòng';
}
function openRoom(code){
  const mine=saved().find(r=>r.code===code);
  CUR={code,key:mine?mine.key:'',title:mine?mine.title:'',status:'open'};
  history.replaceState(null,'','#'+code);
  $('#m-setup').hidden=true; $('#m-room').hidden=false; window.scrollTo(0,0);
  $('#m-code').textContent=code; $('#m-title-show').textContent=CUR.title;
  $('#m-toggle').hidden=!CUR.key;
  // Đường dẫn + mã QR chỉ có ích khi trò chơi được đưa lên web (http/https).
  const online=/^https?:$/.test(location.protocol), url=new URL('index.html?phong='+code,location.href).href;
  $('#m-link').hidden=!online; $('#m-link').href=url; $('#m-link').textContent=url;
  const qr=$('#m-qr'); qr.innerHTML=''; qr.hidden=!(online&&window.QRCode);
  if(!qr.hidden) new QRCode(qr,{text:url,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});
  render(null); poll();
}

/* ---------- dữ liệu phòng ---------- */
async function poll(){
  clearTimeout(pollT); if(!CUR) return;
  const code=CUR.code;
  try{
    const j=await api({action:'list',room:code});
    if(!CUR||CUR.code!==code) return;
    if(!j.ok){$('#m-status').textContent=j.error==='notfound'?'Không tìm thấy phòng '+code+' trên máy chủ.':'Lỗi máy chủ.';}
    else{
      CUR.status=j.room.status; if(j.room.title){CUR.title=j.room.title;$('#m-title-show').textContent=j.room.title;}
      render(j);
      $('#m-status').textContent='Tự cập nhật mỗi '+POLL/1000+' giây · lần cuối lúc '+new Date().toLocaleTimeString('vi-VN')+'.';
    }
  }catch(e){ if(CUR&&CUR.code===code) $('#m-status').textContent='Mất kết nối máy chủ, đang thử lại…'; }
  if(CUR&&CUR.code===code) pollT=setTimeout(poll,POLL);
}
function best(rows,cmp){
  const m=new Map();
  for(const r of rows){const k=r.n.trim().toLowerCase(); if(!k) continue; const cur=m.get(k); if(!cur||cmp(r,cur)<0) m.set(k,r);}
  return [...m.values()].sort(cmp);
}
function row(r,i,val,sub){
  return '<li class="lb-row"><span class="lb-rank">'+(i+1)+'</span><span class="lb-name">'+esc(r.n)+'<small>'+esc(sub)+'</small></span><span class="lb-val">'+val+'</span></li>';
}
function render(j){
  const rows=(j&&j.rows||[]).map(r=>({id:String(r.id||''),n:String(r.n||''),p:+r.p||0,c:+r.c||0,a:+r.a||0,ms:+r.ms||(+r.t||0)*1000}));
  const players=(j&&j.players)||[];
  const ms=(a,b)=>a.ms-b.ms||b.c-a.c;
  const fast=best(rows.filter(r=>r.p>=PAIRS),ms);
  const doneNames=new Set(fast.map(r=>r.n.trim().toLowerCase()));
  const rest=best(rows.filter(r=>r.p<PAIRS&&!doneNames.has(r.n.trim().toLowerCase())),(a,b)=>b.p-a.p||b.c-a.c||a.ms-b.ms);

  $('#m-fast').innerHTML=fast.map((r,i)=>row(r,i,fmtMs(r.ms)+'<small>'+r.c+'/'+r.a+' câu đúng</small>',r.c+' câu đúng')).join('');
  $('#m-rest').innerHTML=rest.map((r,i)=>row(r,i,r.p+'/'+PAIRS+'<small>cặp</small>',r.c+'/'+r.a+' câu đúng · '+fmtMs(r.ms))).join('');

  const w=fast[0];
  $('#m-win').hidden=!w;
  if(w) $('#m-win').innerHTML='<span class="cup" aria-hidden="true">🏆</span><div><small>Nhanh nhất phòng</small><strong>'+esc(w.n)+'</strong></div><em>'+fmtMs(w.ms)+'</em>';

  // Đang chơi: đã vào phòng, chưa nộp kết quả, và vào chưa quá thời lượng một ván.
  const doneIds=new Set(rows.map(r=>r.id)), now=Date.now();
  const playing=players.filter(p=>!doneIds.has(String(p.id))&&now-new Date(p.joined).getTime()<(TOTAL+60)*1000);
  const joinedNames=new Set(players.map(p=>String(p.n).trim().toLowerCase()));
  $('#m-n-join').textContent=joinedNames.size;
  $('#m-n-play').textContent=playing.length;
  $('#m-n-done').textContent=fast.length;
  $('#m-playing').innerHTML=playing.length?playing.map(p=>'<span>'+esc(p.n)+'</span>').join(''):'<span class="none">Không có ai đang chơi.</span>';

  const open=CUR.status==='open';
  $('#m-state').textContent=open?'● Phòng đang mở, người chơi vào được':'● Phòng đã đóng, không nhận thêm kết quả';
  $('#m-state').className='mc-state'+(open?'':' closed');
  $('#m-toggle').textContent=open?'Đóng phòng':'Mở lại';
}
async function toggle(){
  if(!CUR||!CUR.key||busy) return;
  const open=CUR.status==='open';
  if(open&&!confirm('Đóng phòng '+CUR.code+'? Người đang chơi sẽ không được ghi kết quả nữa.')) return;
  busy=true; $('#m-toggle').disabled=true;
  try{const j=await api({action:open?'close':'open',code:CUR.code,key:CUR.key}); if(j.ok) CUR.status=j.status;}catch(e){}
  busy=false; $('#m-toggle').disabled=false; poll();
}

$('#m-create').addEventListener('click',create);
$('#m-title').addEventListener('keydown',e=>{if(e.key==='Enter')create();});
$('#m-back').addEventListener('click',showSetup);
$('#m-toggle').addEventListener('click',toggle);
if(!LEADERBOARD_URL){$('#m-nourl').hidden=false;$('#m-create').disabled=true;}
const start=location.hash.slice(1).toUpperCase().replace(/[^A-Z]/g,'');
if(LEADERBOARD_URL&&start) openRoom(start); else showSetup();
