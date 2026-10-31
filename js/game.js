const TOTAL=600, QTIME=15, PAIRS=15, REWARD=3, STREAK_N=3, BONUS=2;
const $=s=>document.querySelector(s);
const SLUGS=Object.keys(IMG);
let S=null, tick=null, toastT=null;

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function show(id){for(const s of ['start','game','end','board']) $('#s-'+s).hidden=(s!==id); window.scrollTo(0,0); LB.shown=({board:'lb-board',end:'lb-end'})[id]||null; if(LB.shown) LB.render();}
function fmt(sec){sec=Math.max(0,sec);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function toast(msg,warn){const el=$('#toast');el.textContent=msg;el.className='on'+(warn?' warn':'');clearTimeout(toastT);toastT=setTimeout(()=>{el.className='';},1700);}
function pulse(id,cls){const el=$(id);el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}



/* ---------- âm thanh ---------- */
const SND_KEY='truc_xanh_snd';
const SND={ctx:null,on:true,
  init(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)this.ctx=new C();}if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}catch(e){}},
  n(f,at,d,type,v){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at;
    o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v||0.09,t+0.015);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+0.03);},
  play(k){if(!this.on||!this.ctx)return;try{
    if(k==='flip')this.n(520,0,0.06,'triangle',0.05);
    else if(k==='miss'){this.n(300,0,0.14,'sine',0.07);this.n(240,0.09,0.18,'sine',0.06);}
    else if(k==='match')[523,659,784,1047].forEach((f,i)=>this.n(f,i*0.08,0.22,'triangle',0.08));
    else if(k==='right'){this.n(660,0,0.12,'sine',0.09);this.n(880,0.1,0.2,'sine',0.09);}
    else if(k==='wrong')this.n(180,0,0.25,'sine',0.08);
    else if(k==='bonus')[784,988,1175,1568].forEach((f,i)=>this.n(f,i*0.06,0.18,'sine',0.07));
    else if(k==='end')[523,659,784,659,784,1047].forEach((f,i)=>this.n(f,i*0.11,0.3,'triangle',0.08));
  }catch(e){}},
  set(v){this.on=v;$('#btn-snd').setAttribute('aria-pressed',v);try{localStorage.setItem(SND_KEY,v?'1':'0');}catch(e){}}
};
try{if(localStorage.getItem(SND_KEY)==='0')SND.on=false;}catch(e){}
$('#btn-snd').setAttribute('aria-pressed',SND.on);
$('#btn-snd').addEventListener('click',()=>{SND.init();SND.set(!SND.on);if(SND.on)SND.play('flip');});
/* ---------- pháo giấy ---------- */
const CF={cv:$('#confetti'),ps:[],raf:0,
  reduced(){return window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;},
  burst(x,y,n,spread){
    if(this.reduced())return;
    const cols=['#1f6b32','#4f7a45','#f0b01c','#f8dc8a','#c62828','#fffdf5'];
    for(let i=0;i<n;i++){const a=(-Math.PI/2)+(Math.random()-.5)*(spread||2.6),s=4+Math.random()*7;
      this.ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,w:5+Math.random()*6,h:3+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],leaf:Math.random()<.3,life:70+Math.random()*40});}
    if(this.ps.length>700)this.ps.splice(0,this.ps.length-700);
    if(!this.raf)this.raf=requestAnimationFrame(()=>this.step());
  },
  finale(){const w=innerWidth,h=innerHeight;for(let k=0;k<6;k++)setTimeout(()=>this.burst(w*(0.1+Math.random()*0.8),h*(0.55+Math.random()*0.3),50,3.4),k*220);},
  step(){
    const cv=this.cv,dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;
    if(cv.width!==W*dpr||cv.height!==H*dpr){cv.width=W*dpr;cv.height=H*dpr;}
    const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    this.ps=this.ps.filter(p=>p.life>0&&p.y<H+30);
    for(const p of this.ps){
      p.vy+=0.22;p.vx*=0.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;
      c.save();c.translate(p.x,p.y);c.rotate(p.r);c.globalAlpha=Math.min(1,p.life/25);c.fillStyle=p.c;
      if(p.leaf){c.beginPath();c.ellipse(0,0,p.w,p.h*0.7,0,0,Math.PI*2);c.fill();}else c.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      c.restore();
    }
    if(this.ps.length)this.raf=requestAnimationFrame(()=>this.step());else{this.raf=0;c.clearRect(0,0,W,H);}
  },
  at(el){const r=el.getBoundingClientRect();this.burst(r.left+r.width/2,r.top+r.height/2,38,3.6);}
};
/* ---------- thẻ kiến thức ---------- */
let knT=null;
function showKn(slug){
  $('#kn-img').src=IMG[slug]; $('#kn-name').textContent=NAMES[slug]; $('#kn-txt').textContent=FACTS[slug]||'';
  const el=$('#kn'); el.hidden=false; el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  clearTimeout(knT); knT=setTimeout(hideKn,8000);
}
function hideKn(){clearTimeout(knT);$('#kn').hidden=true;}
$('#kn-x').addEventListener('click',hideKn);
/* ---------- chuỗi đúng ---------- */
function renderStreak(cele){
  const el=$('#q-streak'); if(!S){el.innerHTML='';return;}
  const k=S.streak%STREAK_N;
  let h='';for(let i=0;i<STREAK_N;i++)h+='<span class="pip'+(i<k?' on':'')+'"></span>';
  h+='<span>Chuỗi đúng: <b>'+S.streak+'</b>. Còn '+(STREAK_N-k)+' câu nữa để thưởng +'+BONUS+' ★</span>';
  el.innerHTML=h; el.classList.toggle('cele',!!cele);
}

/* ---------- sự kiện ngẫu nhiên (đặc trưng Việt Nam) ---------- */
function windEvent(){
  if(!S||S.open.length) return;
  const idx=S.cards.map((c,i)=>i).filter(i=>!S.cards[i].f&&!S.cards[i].m);
  if(idx.length<4) return;
  const slugs=shuffle(idx.map(i=>S.cards[i].slug));
  idx.forEach((i,k)=>{S.cards[i].slug=slugs[k];});
  renderBoard();
  S.cards.forEach((c,i)=>{ if(c.m){ const el=$('#board').children[i]; el.classList.add('flip','done'); } });
  const b=$('#board'); b.classList.add('wind'); setTimeout(()=>b.classList.remove('wind'),650);
}
function peekEvent(){
  if(!S) return;
  const idx=S.cards.map((c,i)=>i).filter(i=>!S.cards[i].f&&!S.cards[i].m);
  const cells=$('#board').children;
  idx.forEach(i=>{ if(cells[i]) cells[i].classList.add('peek'); });
  setTimeout(()=>{ idx.forEach(i=>{ if(cells[i]) cells[i].classList.remove('peek'); }); },2600);
}
const EVENTS=[
  {k:'fog',icon:'🌫️',name:'Sương mù Sa Pa',kind:'chill',dur:18000,
   msg:'Ảnh mặt thẻ mờ đi trong lúc sương mù còn giăng.',
   on(){$('#board').classList.add('fog');}, off(){$('#board').classList.remove('fog');}},
  {k:'wind',icon:'🌬️',name:'Gió Lào',kind:'chill',dur:4500,
   msg:'Một cơn gió thổi xáo vị trí các thẻ chưa mở!',
   on(){windEvent();}, off(){}},
  {k:'ban',icon:'❄️',name:'Rét Nàng Bân',kind:'chill',dur:20000,
   msg:'Trời trở rét, lật thẻ tạm thời tốn 2 ★ thay vì 1 ★.',
   on(){if(S)S.flipCost=2;}, off(){if(S)S.flipCost=1;}},
  {k:'rain',icon:'🌦️',name:'Mưa xuân',kind:'luck',dur:18000,
   msg:'Mưa xuân lất phất, trả lời đúng được thưởng thêm +2 ★.',
   on(){if(S)S.rainBonus=true;}, off(){if(S)S.rainBonus=false;}},
  {k:'hoi',icon:'🎏',name:'Hội mùa xuân',kind:'luck',dur:15000,
   msg:'Vào hội, lật thẻ miễn phí, không tốn sao!',
   on(){if(S)S.flipCost=0;}, off(){if(S)S.flipCost=1;}},
  {k:'moon',icon:'🌕',name:'Trăng rằm',kind:'luck',dur:4500,
   msg:'Trăng sáng hé lộ nhanh các thẻ chưa mở trong giây lát!',
   on(){peekEvent();}, off(){}}
];
function showEvent(ev){
  const el=$('#evt'); el.className='evt '+ev.kind; el.hidden=false; el.innerHTML='<span class="ic">'+ev.icon+'</span><span>'+esc(ev.name)+' — '+esc(ev.msg)+'</span>';
  toast(ev.icon+' '+ev.name);
}
function hideEvent(){ const el=$('#evt'); if(el){el.hidden=true;} }
function scheduleEvent(){
  if(!S||S.over) return;
  const g=S, gap=70000+Math.random()*40000;
  S.evtT=setTimeout(()=>{ if(g!==S||!S||S.over) return; triggerEvent(g); },gap);
}
function triggerEvent(g){
  if(g!==S||!S||S.over) return;
  if(Date.now()>S.endAt-40000) return;
  const ev=EVENTS[Math.floor(Math.random()*EVENTS.length)];
  showEvent(ev); ev.on();
  S.evtOffT=setTimeout(()=>{ if(g!==S||!S) return; ev.off(); hideEvent(); scheduleEvent(); }, ev.dur);
}
/* ---------- bảng xếp hạng ---------- */
// Địa chỉ máy chủ (LEADERBOARD_URL) nằm trong js/config.js.
const PLAYER_KEY='truc_xanh_name', ROWS_KEY='truc_xanh_rows';
function fmtMs(ms){const d=Math.floor(ms/100)%10;return fmt(Math.floor(ms/1000))+'.'+d;}
function api(params){return fetch(LEADERBOARD_URL+'?'+new URLSearchParams(Object.assign({_:Date.now()},params))).then(r=>r.json());}
let ROOM=null; // {code,title} khi đang chơi trong phòng của MC
const LB={
  tab:'fast', rows:[], name:'', shown:null, msg:'', pending:null, failed:false, updated:null, memRows:[],
  shared(){return !!LEADERBOARD_URL;},
  readLocal(){try{const s=localStorage.getItem(ROWS_KEY);if(s)return JSON.parse(s);}catch(e){}return this.memRows;},
  writeLocal(r){this.memRows=r;try{localStorage.setItem(ROWS_KEY,JSON.stringify(r.slice(-300)));}catch(e){}},
  async load(){
    if(!this.shared()){this.rows=this.readLocal();return true;}
    try{
      const j=await api(ROOM?{action:'list',room:ROOM.code}:{action:'list'});
      this.rows=(j.rows||[]).map(r=>({n:String(r.n||''),room:String(r.room||''),p:+r.p||0,c:+r.c||0,a:+r.a||0,t:+r.t||0,ms:+r.ms||0}));
      return true;
    }catch(e){return false;}
  },
  async save(e){
    if(!this.shared()){const r=this.readLocal();r.push(e);this.writeLocal(r);return true;}
    try{
      const j=await api({action:'submit',id:e.id,n:e.n,p:e.p,c:e.c,a:e.a,t:e.t,ms:e.ms,room:e.room||''});
      return j.ok?true:(j.error||false);
    }catch(err){return false;}
  },
  async send(e){
    this.pending=e; this.msg='Đang gửi kết quả…'; this.render();
    const ok=await this.save(e);
    if(ok===true){this.pending=null;this.msg='Đã ghi kết quả của bạn.';}
    else if(ok==='closed'){this.pending=null;this.msg='MC đã đóng phòng '+e.room+', kết quả này không được ghi.';}
    else this.msg='Chưa gửi được kết quả.';
    await this.refresh();
  },
  async refresh(){this.failed=!(await this.load());this.updated=new Date();this.render();},
  top(tab){
    const ms=r=>r.ms||r.t*1000;
    const cmp=tab==='fast'?(a,b)=>ms(a)-ms(b)||b.c-a.c:(a,b)=>b.c-a.c||b.p-a.p||ms(a)-ms(b);
    const best=new Map();
    for(const r of this.rows){
      const k=r.n.trim().toLowerCase(); if(!k) continue;
      if(tab==='fast'&&r.p<PAIRS) continue;
      const cur=best.get(k); if(!cur||cmp(r,cur)<0) best.set(k,r);
    }
    return [...best.values()].sort(cmp).slice(0,30);
  },
  render(){
    if(!this.shown) return;
    const box=$('#'+this.shown), list=this.top(this.tab), me=this.name.trim().toLowerCase();
    let h='<div class="lb-tabs" role="tablist"><button class="lb-tab" role="tab" data-tab="fast" aria-selected="'+(this.tab==='fast')+'" type="button">Hoàn thành nhanh nhất</button><button class="lb-tab" role="tab" data-tab="correct" aria-selected="'+(this.tab==='correct')+'" type="button">Nhiều câu đúng nhất</button></div>';
    if(!list.length){
      h+='<p class="lb-empty">'+(this.tab==='fast'?'Chưa có ai ghép đủ 15 cặp. Bạn có thể là người đầu tiên!':'Chưa có kết quả nào.')+'</p>';
    } else {
      h+='<ol class="lb-list">'+list.map((r,i)=>{
        const mine=r.n.trim().toLowerCase()===me?' me':'';
        const sub=this.tab==='fast'?r.c+' câu đúng':r.p+'/'+PAIRS+' cặp · '+fmt(r.t);
        const val=this.tab==='fast'?(r.ms?fmtMs(r.ms):fmt(r.t))+'<small>'+r.c+' câu đúng</small>':r.c+'<small>trên '+r.a+' câu</small>';
        return '<li class="lb-row'+mine+'"><span class="lb-rank">'+(i+1)+'</span><span class="lb-name">'+esc(r.n)+'<small>'+esc(sub)+'</small></span><span class="lb-val">'+val+'</span></li>';
      }).join('')+'</ol>';
    }
    const parts=[];
    if(this.msg) parts.push('<span>'+esc(this.msg)+'</span>');
    if(this.pending&&this.msg!=='Đang gửi kết quả…') parts.push('<button type="button" data-retry="1">Gửi lại</button>');
    if(this.failed) parts.push('<span>Chưa kết nối được bảng xếp hạng chung. Đang thử lại…</span>');
    parts.push('<span>'+(ROOM?'Chỉ tính người chơi trong phòng '+esc(ROOM.code)+', tự cập nhật'+(this.updated?' (lúc '+this.updated.toLocaleTimeString('vi-VN')+')':'')+'.':this.shared()?'Bảng chung cho cả lớp, tự cập nhật'+(this.updated?' (lúc '+this.updated.toLocaleTimeString('vi-VN')+')':'')+'.':'Bảng này chỉ lưu kết quả trên thiết bị của bạn.')+'</span>');
    h+='<div class="lb-status">'+parts.join('')+'</div>';
    box.innerHTML=h;
    box.querySelectorAll('.lb-tab').forEach(b=>b.addEventListener('click',()=>{LB.tab=b.dataset.tab;LB.render();}));
    const rb=box.querySelector('[data-retry]'); if(rb) rb.addEventListener('click',()=>LB.send(LB.pending));
  }
};
setInterval(()=>{ if(LB.shown&&LB.shared()&&!LB.pending) LB.refresh(); },6000);

function cleanName(v){return String(v||'').replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40).replace(/^[=+\-@]+/,'').trim();}
let PLAYER='';
function openBoard(){
  LB.name=cleanName($('#in-name').value)||PLAYER; LB.msg=''; LB.pending=null; LB.tab='fast';
  $('#b-sub').textContent=ROOM?'Phòng '+ROOM.code+(ROOM.title?' · '+ROOM.title:'')+'. Bảng tự cập nhật.':LB.shared()?'Cả lớp cùng chơi, bảng tự cập nhật.':'Kết quả các lượt chơi trên thiết bị này.';
  show('board'); LB.refresh();
}

/* ---------- game setup ---------- */
function newGame(name){
  PLAYER=name; LB.name=name;
  const picks=shuffle(SLUGS.slice()).slice(0,PAIRS);
  const cards=shuffle(picks.flatMap(s=>[{slug:s,f:false,m:false},{slug:s,f:false,m:false}]));
  S={picks,cards,open:[],lock:false,stars:0,earned:0,streak:0,bonus:0,paused:false,pauseAt:0,pendingNext:false,spent:0,flips:0,pairs:0,
     flipCost:1,rainBonus:false,evtT:null,evtOffT:null,
     endAt:Date.now()+TOTAL*1000,order:shuffle(QS.map((_,i)=>i)),pos:0,q:null,qDeadline:0,qLocked:false,
     answered:0,correct:0,missed:[],over:false,nextT:null,name,id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),
     room:ROOM?ROOM.code:'',startAt:Date.now()};
  $('#hud-sub').textContent=ROOM?'Phòng '+ROOM.code:'Đại đoàn kết dân tộc';
  if(ROOM&&LB.shared()) api({action:'join',room:ROOM.code,id:S.id,n:name}).catch(()=>{});
  hideKn(); $('#q-pause').hidden=true; $('#board').className='board'; hideEvent(); renderStreak(); renderBoard(); updateHud(); nextQuestion(); setTab('q'); show('game');
  clearInterval(tick); tick=setInterval(onTick,100);
  scheduleEvent();
}

function renderBoard(){
  const b=$('#board'); b.innerHTML='';
  S.cards.forEach((c,i)=>{
    const el=document.createElement('button');
    el.type='button'; el.className='card'; el.dataset.i=i; el.setAttribute('aria-label','Thẻ úp số '+(i+1));
    el.innerHTML='<span class="in"><span class="face back"></span><span class="face front"><img alt="" src="'+IMG[c.slug]+'"></span></span>';
    el.addEventListener('click',()=>flip(i));
    b.appendChild(el);
  });
}

function updateHud(){
  $('#v-stars').textContent=S.stars+' ★';
  $('#v-pairs').textContent=S.pairs+'/'+PAIRS;
}

/* ---------- tạm dừng khi lật thẻ ---------- */
function enterPause(){
  if(!S||S.over||S.paused) return;
  S.paused=true; S.pauseAt=Date.now(); $('#q-pause').hidden=false;
}
function exitPause(){
  if(!S||!S.paused) return;
  S.paused=false; $('#q-pause').hidden=true;
  if(!S.qLocked) S.qDeadline+=Date.now()-S.pauseAt;
  if(S.pendingNext&&!(tabsOn()&&$('#s-game').dataset.tab==='cards')) nextQuestion();
  if(tabsOn()&&$('#s-game').dataset.tab==='cards') $('#tab-q').classList.add('alert');
}
$('#btn-resume').addEventListener('click',()=>{exitPause(); setTab('q');});
/* ---------- cards ---------- */
function flip(i){
  if(!S||S.over||S.lock) return;
  const c=S.cards[i]; if(c.f||c.m) return;
  const cost=S.flipCost;
  if(S.stars<cost){pulse('#p-stars','shake');toast('Hết sao! Hãy trả lời đúng một câu để nhận 3 ★',true);return;}
  S.stars-=cost; S.spent+=cost; S.flips++; c.f=true; S.open.push(i); SND.play('flip');
  enterPause(); if(S.stars<S.flipCost) exitPause();
  const el=$('#board').children[i]; el.classList.add('flip'); el.setAttribute('aria-label','Dân tộc '+NAMES[c.slug]);
  updateHud();
  if(S.open.length===2){
    const [a,b]=S.open, A=S.cards[a], B=S.cards[b], g=S;
    S.open=[];
    if(A.slug===B.slug){
      A.m=B.m=true; S.pairs++; updateHud();
      setTimeout(()=>{ if(g!==S) return; [a,b].forEach(k=>{const e=$('#board').children[k];e.classList.add('done');CF.at(e);}); SND.play('match'); showKn(A.slug); },420);
      if(S.pairs===PAIRS) setTimeout(()=>{ if(g===S) endGame(); },2600);
    } else {
      S.lock=true; setTimeout(()=>SND.play('miss'),450);
      setTimeout(()=>{
        if(g!==S) return;
        [a,b].forEach(k=>{A.f=B.f=false; const e=$('#board').children[k]; e.classList.remove('flip'); e.setAttribute('aria-label','Thẻ úp số '+(k+1));});
        g.lock=false;
      },1000);
    }
  }
}

/* ---------- questions ---------- */
function tabsOn(){return getComputedStyle($('.tabs')).display!=='none';}
function nextQuestion(){
  if(!S||S.over) return;
  if(S.paused){S.pendingNext=true;return;}
  // Đang ở tab "Lật thẻ" (điện thoại): tạm dừng, chưa hiện câu mới cho đến khi quay lại tab "Trả lời".
  if(tabsOn()&&$('#s-game').dataset.tab==='cards'){S.pendingNext=true;return;}
  S.pendingNext=false;
  if(S.pos>=S.order.length){S.order=shuffle(QS.map((_,i)=>i));S.pos=0;}
  const idx=S.order[S.pos];
  const opts=shuffle(QS[idx].opts.map((t,i)=>({t,ok:i===0})));
  S.q={idx,opts,n:S.answered+1}; S.pos++; S.qLocked=false; S.qDeadline=Date.now()+QTIME*1000;
  $('#q-n').textContent='Câu '+S.q.n;
  $('#q-text').textContent=QS[idx].q;
  $('#q-fb').textContent=''; $('#q-fb').className='fb';
  const box=$('#q-opts'); box.innerHTML='';
  opts.forEach((o,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='opt'; b.id='opt'+i;
    b.innerHTML='<span class="l">'+'ABCD'[i]+'</span><span class="t">'+esc(o.t)+'</span>';
    b.addEventListener('click',()=>answer(i));
    box.appendChild(b);
  });
  $('#tab-q').classList.remove('alert');
}

function settle(chosen){
  const q=S.q, g=S; S.qLocked=true; S.answered++;
  const right=q.opts.findIndex(o=>o.ok);
  const btns=[...$('#q-opts').children];
  btns.forEach((b,i)=>{b.disabled=true; if(i===right) b.classList.add('ok'); else if(i===chosen) b.classList.add('bad'); else b.classList.add('dim');});
  const fb=$('#q-fb');
  if(chosen===right){
    S.correct++; S.streak++; let gain=REWARD, bonus=S.streak%STREAK_N===0, rain=S.rainBonus;
    if(bonus){gain+=BONUS; S.bonus+=BONUS;}
    if(rain){gain+=2; S.bonus+=2;}
    S.stars+=gain; S.earned+=gain; updateHud(); pulse('#p-stars','bump');
    fb.textContent='Chính xác! +'+REWARD+' ★'+(bonus?' Thưởng '+STREAK_N+' câu đúng liên tiếp: +'+BONUS+' ★':'')+(rain?' Thưởng mưa xuân: +2 ★':''); fb.className='fb ok';
    SND.play('right'); if(bonus){setTimeout(()=>SND.play('bonus'),260); const r=$('#p-stars').getBoundingClientRect(); CF.burst(r.left+r.width/2,r.top+r.height,45,3.4);}
    renderStreak(bonus);
    S.nextT=setTimeout(()=>{if(g===S) nextQuestion();},1500);
  } else {
    S.streak=0; renderStreak(); SND.play('wrong');
    S.missed.push({q:QS[q.idx].q,right:q.opts[right].t,chosen:chosen>=0?q.opts[chosen].t:null});
    fb.textContent=chosen>=0?'Chưa đúng. Đáp án đúng được tô màu xanh.':'Hết giờ. Đáp án đúng được tô màu xanh.'; fb.className='fb bad';
    S.nextT=setTimeout(()=>{if(g===S) nextQuestion();},3200);
  }
}
function answer(i){ if(!S||S.over||S.qLocked||S.paused) return; settle(i); }

/* ---------- loop ---------- */
function onTick(){
  if(!S||S.over) return;
  const now=Date.now(), rem=Math.ceil((S.endAt-now)/1000);
  $('#v-time').textContent=fmt(rem); $('#p-time').classList.toggle('low',rem<=60);
  if(S.paused){
    $('#tab-sec').textContent='· tạm dừng'; $('#tab-q').classList.remove('alert');
  } else if(!S.qLocked){
    const left=Math.max(0,S.qDeadline-now), s=Math.ceil(left/1000);
    $('#q-sec').textContent=s; $('#q-fill').style.width=(left/(QTIME*1000)*100)+'%';
    const bar=$('#q-bar'); bar.className='bar'+(s<=4?' low':s<=8?' mid':'');
    $('#tab-sec').textContent='· '+s+'s';
    $('#tab-q').classList.toggle('alert',$('#s-game').dataset.tab==='cards'&&s<=6);
    if(left<=0) settle(-1);
  } else {
    $('#tab-sec').textContent=S.pendingNext?'· câu mới đang chờ':'';
    $('#tab-q').classList.toggle('alert',!!S.pendingNext);
    if(S.pendingNext&&!tabsOn()) nextQuestion();
  }
  if(rem<=0) endGame();
}

/* ---------- end ---------- */
function endGame(){
  if(!S||S.over) return;
  S.over=true; clearInterval(tick); clearTimeout(S.nextT); clearTimeout(S.evtT); clearTimeout(S.evtOffT); hideKn(); hideEvent(); $('#board').classList.remove('fog'); $('#q-pause').hidden=true;
  const used=Math.min(TOTAL,TOTAL-Math.max(0,Math.ceil((S.endAt-Date.now())/1000)));
  const usedMs=Math.min(TOTAL*1000,Date.now()-S.startAt);
  const p=S.pairs;
  const t=p===PAIRS?'Hoàn thành xuất sắc!':p>=8?'Rất tốt!':p>=4?'Khá lắm!':'Cố gắng thêm nhé!';
  $('#e-ticket-b').innerHTML=[['Họ tên',esc(S.name)]].concat(S.room?[['Phòng',esc(S.room)]]:[],[['Cặp ghép được',p+'/'+PAIRS],['Câu trả lời đúng',S.correct+'/'+S.answered],['Sao kiếm được',S.earned+' ★'],['Thời gian chơi',fmtMs(usedMs)],['Hoàn thành lúc',new Date().toLocaleString('vi-VN')],['Mã xác nhận',S.id.slice(-6).toUpperCase()]]).map(x=>'<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');
  $('#e-title').textContent=t;
  $('#e-sub').textContent=p===PAIRS?'Bạn đã ghép đủ 15 cặp. Đại đoàn kết là sức mạnh của cả dân tộc.':'Đại đoàn kết toàn dân tộc là chiến lược lâu dài, nhất quán của cách mạng Việt Nam.';
  const st=[['Cặp tìm được',p+'/'+PAIRS],['Câu trả lời đúng',S.correct+'/'+S.answered],['Sao kiếm được',S.earned+' ★'+(S.bonus?' (thưởng '+S.bonus+')':'')],['Lượt lật thẻ',S.flips],['Thời gian chơi',fmt(used)]];
  $('#e-stats').innerHTML=st.map(x=>'<div class="stat"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');
  const found=new Set(S.cards.filter(c=>c.m).map(c=>c.slug));
  $('#e-thumbs').innerHTML=S.picks.slice().sort((a,b)=>(found.has(b)-found.has(a))).map(s=>'<div class="kl'+(found.has(s)?'':' miss')+'"><img alt="" src="'+IMG[s]+'"><div><b>'+esc(NAMES[s])+(found.has(s)?'':' (chưa mở)')+'</b><p>'+esc(FACTS[s]||'')+'</p></div></div>').join('');
  const rv=$('#e-review');
  if(S.missed.length){
    $('#e-rv-h').hidden=false;
    $('#e-rv-h').textContent='Câu cần ôn lại ('+S.missed.length+')';
    rv.innerHTML=S.missed.map(m=>'<div class="rv"><p>'+esc(m.q)+'</p><div class="a">Đáp án đúng: '+esc(m.right)+'</div><div class="b">'+(m.chosen?'Bạn chọn: '+esc(m.chosen):'Bạn chưa kịp trả lời.')+'</div></div>').join('');
  } else { $('#e-rv-h').textContent=S.answered?'Bạn trả lời đúng tất cả các câu':'Bạn chưa trả lời câu nào'; rv.innerHTML=''; }
  show('end'); if(p===PAIRS){CF.finale();} SND.play('end');
  LB.tab=(p===PAIRS)?'fast':'correct'; LB.msg=''; LB.send({id:S.id,n:S.name,p:S.pairs,c:S.correct,a:S.answered,t:used,ms:usedMs,room:S.room});
}

/* ---------- ui ---------- */
function setTab(t){
  $('#s-game').dataset.tab=t;
  if(t==='q'&&S&&S.pendingNext&&!S.over) nextQuestion();
  $('#tab-q').setAttribute('aria-selected',t==='q'); $('#tab-c').setAttribute('aria-selected',t==='cards');
}
$('#tab-q').addEventListener('click',()=>setTab('q'));
$('#tab-c').addEventListener('click',()=>setTab('cards'));
function roomErr(msg){$('#f-room').classList.add('err');$('#room-err').textContent=msg;$('#room-err').hidden=false;$('#in-room').focus();}
let starting=false;
async function startClicked(){
  if(starting) return;
  const v=cleanName($('#in-name').value);
  if(!v){$('#f-name').classList.add('err');$('#name-err').hidden=false;$('#in-name').focus();return;}
  try{localStorage.setItem(PLAYER_KEY,v);}catch(e){}
  SND.init();
  // Bắt buộc có mã phòng do MC tạo mới được vào chơi.
  const code=$('#in-room').value.toUpperCase().replace(/[^A-Z]/g,'');
  ROOM=null;
  if(!code){roomErr('Hãy nhập mã phòng MC đưa để vào chơi.');return;}
  if(!LB.shared()){roomErr('Trò chơi chưa nối với máy chủ nên chưa kiểm tra được mã phòng. Báo MC cài máy chủ trước.');return;}
  const btn=$('#btn-start'), label=btn.textContent;
  starting=true; btn.disabled=true; btn.textContent='Đang vào phòng…';
  let j=null; try{j=await api({action:'room',code});}catch(e){}
  starting=false; btn.disabled=false; btn.textContent=label;
  if(!j){roomErr('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');return;}
  if(!j.ok){roomErr('Không có phòng '+code+'. Hãy kiểm tra lại mã MC đưa.');return;}
  if(j.room.status!=='open'){roomErr('Phòng '+code+' đã đóng.');return;}
  ROOM={code:j.room.code,title:j.room.title||''};
  newGame(v);
}
$('#btn-start').addEventListener('click',startClicked);
$('#btn-again').addEventListener('click',()=>{$('#in-name').value=PLAYER;show('start');});
$('#btn-back').addEventListener('click',()=>show('start'));
$('#in-name').addEventListener('input',()=>{$('#f-name').classList.remove('err');$('#name-err').hidden=true;});
$('#in-name').addEventListener('keydown',e=>{if(e.key==='Enter')startClicked();});
$('#in-room').addEventListener('input',()=>{$('#f-room').classList.remove('err');$('#room-err').hidden=true;});
$('#in-room').addEventListener('keydown',e=>{if(e.key==='Enter')startClicked();});
try{const saved=localStorage.getItem(PLAYER_KEY); if(saved) $('#in-name').value=saved;}catch(e){}
// Đường dẫn MC chia sẻ có dạng index.html?phong=MAPHG
{const c=new URLSearchParams(location.search).get('phong'); if(c) $('#in-room').value=c.toUpperCase().replace(/[^A-Z]/g,'').slice(0,5);}
document.addEventListener('keydown',e=>{
  if(!S||S.over||$('#s-game').hidden||e.ctrlKey||e.metaKey||e.altKey) return;
  const k=e.key.toLowerCase(), i='abcd'.indexOf(k)>=0?'abcd'.indexOf(k):('1234'.indexOf(k)>=0?'1234'.indexOf(k):-1);
  if(i>=0) answer(i);
});
