const {chromium}=require('playwright');
const probe=()=>{
  const q=s=>[...document.querySelectorAll(s)];
  const R={};
  const day=document.querySelector('#vWeek .day'), go=document.querySelector('#vWeek .go');
  R.dayCW=day.clientWidth; R.goCW=go.clientWidth; R.goSW=go.scrollWidth; R.goOV=go.scrollWidth-go.clientWidth;
  R.weekOV=q('#vWeek .go').map(g=>g.scrollWidth-g.clientWidth).filter(v=>v>0);
  const f=document.querySelector('#vWeek .form');
  R.tpl=getComputedStyle(f).gridTemplateColumns; R.formW=+f.getBoundingClientRect().width.toFixed(1);
  R.acrowOV=q('#vWeek .acrow').map(a=>a.scrollWidth-a.clientWidth).filter(v=>v>0);
  // any puck outside its acrow / outside the wave?
  const gr=go.getBoundingClientRect();
  R.puckOut=q('#vWeek .puck').filter(p=>p.getBoundingClientRect().right>gr.right-0.5).length;
  R.rmkRows=q('#vWeek .rmkcell').filter(c=>getComputedStyle(c).display!=='none').length;
  R.rmkHidden=q('#vWeek .rmkcell.rmk-e').length;
  const rc=q('#vWeek .rmkcell').find(c=>getComputedStyle(c).display!=='none');
  if(rc){const r=rc.getBoundingClientRect();R.rmkW=+r.width.toFixed(1);R.rmkTxt=rc.textContent.trim().slice(0,40);
    R.rmkCol=getComputedStyle(rc).gridColumnStart+'/'+getComputedStyle(rc).gridColumnEnd;}
  // vertical overlap check: does any rmkcell overlap its acrow?
  let ovl=0;
  q('#vWeek .form').forEach(fm=>{
    const as=[...fm.querySelectorAll('.acrow')], rs=[...fm.querySelectorAll('.rmkcell')];
    as.forEach((a,i)=>{const r=rs[i]; if(!r||getComputedStyle(r).display==='none')return;
      const ar=a.getBoundingClientRect(), rr=r.getBoundingClientRect();
      if(ar.bottom>rr.top+0.5&&ar.top<rr.bottom-0.5)ovl++;});
  });
  R.vOverlap=ovl;
  R.hdrSpans=[...document.querySelectorAll('#vWeek .cols.formcols span')].map(s=>getComputedStyle(s).display==='none'?'HIDDEN':s.textContent.replace(/\s+/g,''));
  R.ldTxt=[...document.querySelectorAll('#vWeek .form .ld')].slice(0,3).map(e=>({t:e.textContent.trim(),w:+e.getBoundingClientRect().width.toFixed(1),clip:e.scrollWidth>e.clientWidth}));
  R.btoClip=[...document.querySelectorAll('#vWeek .form .bto')].filter(e=>e.scrollWidth>e.clientWidth+0.5).length;
  R.csClip=[...document.querySelectorAll('#vWeek .form .csmsn b')].filter(e=>e.scrollWidth>e.clientWidth+0.5).length;
  return R;
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const w of [360,375,390,430]){
  const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a'); await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(800);
  console.log('W'+w, JSON.stringify(await p.evaluate(probe)));
  await p.close();
 }
 await b.close();
})();
