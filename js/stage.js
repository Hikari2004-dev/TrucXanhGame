// Chế độ sân khấu: MC chiếu lên màn hình, các đội giơ tay giành quyền trả lời.
const TOTAL=180, QTIME=15, PAIRS=4, PAIR_PTS=10, GUESS_PTS=30;
const DEFAULT_PHRASE='ĐOÀN KẾT ĐẠI ĐOÀN KẾT';
const COLORS=['#c62828','#1f6b32','#1565c0','#b07d08','#6a1b9a','#00838f'];
const $=s=>document.querySelector(s);
const SLUGS=Object.keys(IMG);
let G=null, tick=null, knT=null;
let TEAMS=['Đội 1','Đội 2','Đội 3','Đội 4'];

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function fmt(sec){sec=Math.max(0,sec);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function show(id){for(const s of ['setup','play','end']) $('#g-'+s).hidden=(s!==id); window.scrollTo(0,0);}
function msg(t){$('#g-msg').innerHTML=t;}

/* ---------- âm thanh, pháo giấy (bản rút gọn) ---------- */
const SND={ctx:null,
  init(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)this.ctx=new C();}if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}catch(e){}},
  n(f,at,d,v){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at;
    o.type='triangle';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v||0.09,t+0.015);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+0.03);},
  play(k){try{
    if(k==='flip')this.n(520,0,0.06,0.05);
    else if(k==='right'){this.n(660,0,0.12);this.n(880,0.1,0.2);}
    else if(k==='wrong')this.n(180,0,0.3);
    else if(k==='match')[523,659,784,1047].forEach((f,i)=>this.n(f,i*0.08,0.22));
    else if(k==='end')[523,659,784,659,784,1047].forEach((f,i)=>this.n(f,i*0.11,0.3));
  }catch(e){}}
};
const CF={cv:$('#confetti'),ps:[],raf:0,
  burst(x,y,n){
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const cols=['#1f6b32','#4f7a45','#f0b01c','#f8dc8a','#c62828','#fffdf5'];
    for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*3.4,s=4+Math.random()*8;this.ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,w:5+Math.random()*7,h:3+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],life:80+Math.random()*40});}
    if(!this.raf)this.raf=requestAnimationFrame(()=>this.step());
  },
  finale(){for(let k=0;k<7;k++)setTimeout(()=>this.burst(innerWidth*(0.1+Math.random()*0.8),innerHeight*(0.5+Math.random()*0.3),60),k*220);},
  step(){
    const cv=this.cv,dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;
    if(cv.width!==W*dpr||cv.height!==H*dpr){cv.width=W*dpr;cv.height=H*dpr;}
    const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    this.ps=this.ps.filter(p=>p.life>0&&p.y<H+30);
    for(const p of this.ps){p.vy+=0.22;p.vx*=0.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;
      c.save();c.translate(p.x,p.y);c.rotate(p.r);c.globalAlpha=Math.min(1,p.life/25);c.fillStyle=p.c;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore();}
    if(this.ps.length)this.raf=requestAnimationFrame(()=>this.step());else{this.raf=0;c.clearRect(0,0,W,H);}
  }
};
function showKn(slug){
  $('#kn-img').src=IMG[slug]; $('#kn-name').textContent=NAMES[slug]; $('#kn-txt').textContent=FACTS[slug]||'';
  $('#kn').hidden=false; clearTimeout(knT); knT=setTimeout(()=>{$('#kn').hidden=true;},6000);
}

/* ---------- phút 1: chia đội ---------- */
function renderTeamInputs(){
  $('#g-teams').innerHTML=TEAMS.map((t,i)=>'<label class="field st-team-in" style="--tc:'+COLORS[i]+'">Đội '+(i+1)+'<input type="text" maxlength="24" data-i="'+i+'" value="'+esc(t)+'"></label>').join('');
  $('#g-teams').querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>{TEAMS[+inp.dataset.i]=inp.value;}));
  $('#g-add').disabled=TEAMS.length>=COLORS.length; $('#g-del').disabled=TEAMS.length<=2;
}
$('#g-add').addEventListener('click',()=>{if(TEAMS.length<COLORS.length){TEAMS.push('Đội '+(TEAMS.length+1));renderTeamInputs();}});
$('#g-del').addEventListener('click',()=>{if(TEAMS.length>2){TEAMS.pop();renderTeamInputs();}});
$('#g-phrase').value=DEFAULT_PHRASE;

/* ---------- phút 2–4: chơi ---------- */
function start(){
  SND.init();
  const phrase=$('#g-phrase').value.trim().toUpperCase()||DEFAULT_PHRASE;
  const picks=shuffle(SLUGS.slice()).slice(0,PAIRS);
  G={phrase,picks,cards:shuffle(picks.flatMap(s=>[{slug:s},{slug:s}])).map(c=>Object.assign(c,{f:false,m:false})),
     teams:TEAMS.map((n,i)=>({n:n.trim()||'Đội '+(i+1),c:COLORS[i],pts:0,pairs:0,noGuess:false})),
     order:shuffle(QS.map((_,i)=>i)),pos:0,q:null,qn:0,
     phase:'idle',team:-1,tried:new Set(),open:[],pairs:0,
     endAt:Date.now()+TOTAL*1000,paused:false,pauseLeft:0,qLeft:0,over:false,guessed:-1};
  $('#g-secret-txt').textContent=phrase;
  renderBoard(); renderScore(); idle('Bấm <b>Câu hỏi</b> để bắt đầu.');
  show('play'); clearInterval(tick); tick=setInterval(onTick,100);
}
function renderBoard(){
  const b=$('#g-board'); b.innerHTML='';
  G.cards.forEach((c,i)=>{
    const el=document.createElement('button');
    el.type='button'; el.className='card'; el.setAttribute('aria-label','Thẻ số '+(i+1));
    el.innerHTML='<span class="in"><span class="face back"><span class="st-num">'+(i+1)+'</span></span><span class="face front"><img alt="" src="'+IMG[c.slug]+'"><span class="st-name">'+esc(NAMES[c.slug])+'</span></span></span>';
    el.addEventListener('click',()=>flip(i));
    b.appendChild(el);
  });
}
function renderScore(){
  const pickable=G.phase==='q'||G.phase==='guess';
  $('#g-score').innerHTML=G.teams.map((t,i)=>{
    const dis=G.phase==='q'&&G.tried.has(i)||G.phase==='guess'&&t.noGuess;
    return '<li><button type="button" class="st-team'+(i===G.team?' on':'')+'" style="--tc:'+t.c+'" data-i="'+i+'"'+(!pickable||dis?' disabled':'')+'><span class="st-tn">'+esc(t.n)+(t.noGuess?' <small>đã đoán sai</small>':'')+'</span><b>'+t.pts+'</b></button></li>';
  }).join('');
  $('#g-score').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>pickTeam(+b.dataset.i)));
  $('#g-pairs').textContent=G.pairs+'/'+PAIRS;
}
function idle(text){
  G.phase='idle'; G.team=-1; G.open=[];
  msg(text); $('#g-next').hidden=false; $('#g-guess').hidden=G.teams.every(t=>t.noGuess); $('#g-guessbox').hidden=true;
  renderScore();
}
function nextQuestion(){
  if(!G||G.over||G.paused||G.phase!=='idle') return;
  if(G.pos>=G.order.length){G.order=shuffle(QS.map((_,i)=>i));G.pos=0;}
  const idx=G.order[G.pos++];
  G.q={idx,opts:shuffle(QS[idx].opts.map((t,i)=>({t,ok:i===0})))}; G.qn++;
  G.phase='q'; G.team=-1; G.tried=new Set(); G.qLeft=QTIME*1000; G.qAt=Date.now();
  $('#g-q').hidden=false; $('#g-qn').textContent='Câu '+G.qn; $('#g-qtext').textContent=QS[idx].q;
  const box=$('#g-opts'); box.innerHTML='';
  G.q.opts.forEach((o,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='opt';
    b.innerHTML='<span class="l">'+'ABCD'[i]+'</span><span class="t">'+esc(o.t)+'</span>';
    b.addEventListener('click',()=>answer(i)); box.appendChild(b);
  });
  $('#g-next').hidden=true; $('#g-guess').hidden=true;
  msg('Đội nào giơ tay trước? <b>Chọn đội</b> ở bảng điểm.');
  renderScore();
}
function pickTeam(i){
  if(!G||G.over||G.paused) return;
  if(G.phase==='q'){
    if(G.tried.has(i)) return;
    G.team=i; msg('<b style="color:'+G.teams[i].c+'">'+esc(G.teams[i].n)+'</b> trả lời. Chọn đáp án đội đọc.');
  } else if(G.phase==='guess'){
    if(G.teams[i].noGuess) return;
    G.team=i; $('#g-right').disabled=$('#g-wrong').disabled=false;
  }
  renderScore();
}
function answer(i){
  if(!G||G.paused||G.phase!=='q') return;
  // Chưa chọn đội: nhắc MC bấm tên đội giơ tay trước.
  if(G.team<0){
    msg('<b style="color:var(--red-hot)">Bấm tên đội giơ tay trước</b> ở bảng điểm phía trên, rồi chọn đáp án.');
    const sc=$('#g-score'); sc.classList.remove('nudge'); void sc.offsetWidth; sc.classList.add('nudge');
    return;
  }
  const btns=[...$('#g-opts').children], t=G.teams[G.team];
  if(G.q.opts[i].ok){
    btns.forEach((b,k)=>{b.disabled=true;b.classList.add(k===i?'ok':'dim');});
    SND.play('right'); G.phase='flip'; G.open=[];
    msg('Chính xác! <b style="color:'+t.c+'">'+esc(t.n)+'</b> gọi <b>2 số</b> để lật thẻ.');
    renderScore();
  } else {
    btns[i].classList.add('bad'); btns[i].disabled=true; SND.play('wrong');
    G.tried.add(G.team); G.team=-1;
    if(G.tried.size>=G.teams.length){reveal('Không đội nào trả lời đúng.');return;}
    msg('Chưa đúng! Đội khác giơ tay giành quyền.');
    renderScore();
  }
}
// Hết giờ câu hỏi hoặc không đội nào đúng: hiện đáp án rồi quay về chờ câu mới.
function reveal(text){
  [...$('#g-opts').children].forEach((b,k)=>{b.disabled=true;if(G.q.opts[k].ok)b.classList.add('ok');else if(!b.classList.contains('bad'))b.classList.add('dim');});
  idle(text+' Đáp án đúng được tô xanh. Bấm <b>Câu hỏi</b> để tiếp tục.');
}
function flip(i){
  if(!G||G.over||G.paused||G.phase!=='flip'||G.open.length>=2) return;
  const c=G.cards[i]; if(c.f||c.m) return;
  c.f=true; G.open.push(i); SND.play('flip');
  const cells=$('#g-board').children; cells[i].classList.add('flip');
  if(G.open.length<2) return;
  const [a,b]=G.open, A=G.cards[a], B=G.cards[b], t=G.teams[G.team], g=G;
  G.phase='wait';
  if(A.slug===B.slug){
    A.m=B.m=true; G.pairs++; t.pts+=PAIR_PTS; t.pairs++;
    setTimeout(()=>{ if(g!==G) return; [a,b].forEach(k=>{cells[k].classList.add('done');const r=cells[k].getBoundingClientRect();CF.burst(r.left+r.width/2,r.top+r.height/2,30);}); SND.play('match'); showKn(A.slug); },450);
    setTimeout(()=>{ if(g!==G) return; [a,b].forEach(k=>cells[k].classList.add('gone')); },2200);
    msg('Trùng khớp: <b>'+esc(NAMES[A.slug])+'</b>! <b style="color:'+t.c+'">'+esc(t.n)+'</b> +'+PAIR_PTS+' điểm.');
    renderScore();
    setTimeout(()=>{ if(g!==G||G.over) return; if(G.pairs===PAIRS) finish('Đã mở hết '+PAIRS*2+' thẻ.'); else idle('Có đội nào muốn <b>đoán ô chữ</b>? Hoặc bấm <b>Câu hỏi</b>.'); },2300);
  } else {
    msg('Không trùng. Hai thẻ sẽ úp lại.');
    setTimeout(()=>{ if(g!==G) return; A.f=B.f=false; [a,b].forEach(k=>cells[k].classList.remove('flip')); idle('Bấm <b>Câu hỏi</b> để tiếp tục.'); },1400);
  }
}

/* ---------- đoán ô chữ ---------- */
$('#g-guess').addEventListener('click',()=>{
  if(!G||G.phase!=='idle') return;
  G.phase='guess'; G.team=-1; $('#g-q').hidden=true; $('#g-next').hidden=true; $('#g-guess').hidden=true;
  $('#g-guessbox').hidden=false; $('#g-right').disabled=$('#g-wrong').disabled=true;
  msg('Đoán ô chữ! Đúng <b>+'+GUESS_PTS+'</b> và kết thúc ván. Sai thì đội mất quyền đoán.'); renderScore();
});
$('#g-right').addEventListener('click',()=>{ if(G&&G.phase==='guess'&&G.team>=0){ G.teams[G.team].pts+=GUESS_PTS; G.guessed=G.team; finish(G.teams[G.team].n+' đoán đúng ô chữ!'); } });
$('#g-wrong').addEventListener('click',()=>{ if(G&&G.phase==='guess'&&G.team>=0){ const t=G.teams[G.team]; t.noGuess=true; SND.play('wrong'); idle(esc(t.n)+' đoán sai, mất quyền đoán. Bấm <b>Câu hỏi</b> để tiếp tục.'); } });
$('#g-cancel').addEventListener('click',()=>{ if(G&&G.phase==='guess') idle('Bấm <b>Câu hỏi</b> để tiếp tục.'); });

/* ---------- đồng hồ ---------- */
function onTick(){
  if(!G||G.over||G.paused) return;
  const now=Date.now(), rem=Math.ceil((G.endAt-now)/1000);
  $('#g-time').textContent=fmt(rem); $('#g-time-p').classList.toggle('low',rem<=30);
  if(G.phase==='q'){
    const left=Math.max(0,G.qLeft-(now-G.qAt)), s=Math.ceil(left/1000);
    $('#g-qsec').textContent=s; $('#g-qfill').style.width=(left/(QTIME*1000)*100)+'%';
    $('#g-qbar').className='bar'+(s<=4?' low':s<=8?' mid':'');
    if(left<=0){SND.play('wrong');reveal('Hết giờ câu hỏi.');}
  }
  if(rem<=0) finish('Hết 3 phút!');
}
$('#g-pause').addEventListener('click',()=>{
  if(!G||G.over) return;
  const now=Date.now();
  if(!G.paused){G.paused=true;G.pauseLeft=G.endAt-now;if(G.phase==='q')G.qLeft-=now-G.qAt;$('#g-pause').textContent='Tiếp tục';$('#g-play').classList.add('paused');}
  else{G.paused=false;G.endAt=now+G.pauseLeft;G.qAt=now;$('#g-pause').textContent='Tạm dừng';$('#g-play').classList.remove('paused');}
});

/* ---------- phút 5: công bố ---------- */
function finish(why){
  if(!G||G.over) return;
  G.over=true; clearInterval(tick); G.phase='over';
  const cells=$('#g-board').children; G.cards.forEach((c,i)=>cells[i].classList.add('flip'));
  const ranked=G.teams.slice().sort((a,b)=>b.pts-a.pts||b.pairs-a.pairs);
  const top=ranked.filter(t=>t.pts===ranked[0].pts&&t.pairs===ranked[0].pairs);
  setTimeout(()=>{
    $('#g-end-why').textContent=why;
    $('#g-win').textContent=ranked[0].pts===0?'Hoà! Chưa đội nào ghi điểm':top.length>1?'Đồng hạng: '+top.map(t=>t.n).join(', '):'🏆 '+top[0].n+' thắng!';
    $('#g-end-phrase').textContent=G.phrase;
    $('#g-final').innerHTML=ranked.map(t=>'<li><div class="st-team" style="--tc:'+t.c+'"><span class="st-tn">'+esc(t.n)+' <small>'+t.pairs+' cặp</small></span><b>'+t.pts+'</b></div></li>').join('');
    $('#g-kn').innerHTML=G.picks.map(s=>'<div class="kl"><img alt="" src="'+IMG[s]+'"><div><b>'+esc(NAMES[s])+'</b><p>'+esc(FACTS[s]||'')+'</p></div></div>').join('');
    $('#kn').hidden=true; show('end'); SND.play('end'); CF.finale();
  },1200);
}

$('#g-start').addEventListener('click',start);
$('#g-next').addEventListener('click',nextQuestion);
$('#g-again').addEventListener('click',()=>{G=null;renderTeamInputs();show('setup');});
document.addEventListener('keydown',e=>{
  if(!G||G.over||e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey) return;
  const k=e.key.toLowerCase();
  if(k===' '&&G.phase==='idle'){e.preventDefault();nextQuestion();}
  const i='abcd'.indexOf(k); if(i>=0&&G.phase==='q') answer(i);
});
renderTeamInputs();
