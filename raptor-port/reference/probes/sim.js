const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
const probe=()=>{
  const q=s=>[...document.querySelectorAll(s)];
  const R={};
  const de=getComputedStyle(document.documentElement);
  R.puckVar=[de.getPropertyValue('--puck-w').trim(),de.getPropertyValue('--puck-h').trim()];
  const p0=document.querySelector('#vWeek .puck');
  if(p0){const r=p0.getBoundingClientRect();R.puckBox=[+r.width.toFixed(1),+r.height.toFixed(1)];
    const nm=p0.querySelector('.nm'),ro=p0.querySelector('.role');
    R.puckNm=nm?+nm.getBoundingClientRect().width.toFixed(1):null;
    R.puckRole=ro?+ro.getBoundingClientRect().width.toFixed(1):null;}
  // text vertical clipping inside pucks: does the name's line box exceed the puck?
  let tclip=0;
  q('#vWeek .puck .nm').forEach(n=>{const pr=n.parentElement.getBoundingClientRect(),r=n.getBoundingClientRect();
    if(r.height>pr.height+0.6)tclip++;});
  R.puckTextClip=tclip;
  // sims block
  const sim=q('#vWeek .sec-sim')[0];
  R.simTpl=sim?getComputedStyle(sim.querySelector('.pl-row')).gridTemplateColumns:null;
  R.plOV=[];R.pucksPerRow=[];R.rmk=[];
  q('#vWeek .plist .pl-row').forEach(r=>{
    if(r.scrollWidth>r.clientWidth+0.5)R.plOV.push({t:r.textContent.trim().slice(0,18),ov:r.scrollWidth-r.clientWidth});
  });
  (sim?[...sim.querySelectorAll('.pl-row')]:[]).forEach(r=>{
    const pk=[...r.querySelectorAll('.puck')];
    if(pk.length){const tops=new Set(pk.map(p=>Math.round(p.getBoundingClientRect().top)));
      R.pucksPerRow.push(pk.length+'in'+tops.size+'rows');}
    const rk=r.querySelector('.rmk');
    if(rk){const cs=getComputedStyle(rk),rr=rk.getBoundingClientRect();
      R.rmk.push({txt:rk.textContent.trim().slice(0,26)||'(empty)',disp:cs.display,col:cs.gridColumnStart+'/'+cs.gridColumnEnd,
        w:+rr.width.toFixed(1),x:+rr.left.toFixed(1)});}
  });
  // does any puck spill out of its .ppl cell?
  const spill=[];
  q('#vWeek .pl-row .ppl, #vWeek .ah-row .ppl').forEach(c=>{const cr=c.getBoundingClientRect();
    [...c.querySelectorAll('.puck')].forEach(p=>{const r=p.getBoundingClientRect();
      if(r.right>cr.right+0.5)spill.push({t:(p.querySelector('.nm')||{}).textContent,over:+(r.right-cr.right).toFixed(1),cellW:+cr.width.toFixed(1)});});});
  R.pplSpill=spill.slice(0,6);R.pplSpillN=spill.length;
  // rmks overlapping pucks vertically (mobile strip must sit BELOW)
  let vo=0;
  (sim?[...sim.querySelectorAll('.pl-row')]:[]).forEach(r=>{
    const rk=r.querySelector('.rmk'); if(!rk||getComputedStyle(rk).display==='none')return;
    const rr=rk.getBoundingClientRect();
    [...r.querySelectorAll('.puck')].forEach(p=>{const pr=p.getBoundingClientRect();
      if(pr.bottom>rr.top+0.5&&pr.right>rr.left+0.5&&pr.left<rr.right-0.5)vo++;});});
  R.rmkVOverlap=vo;
  // flying view still clean
  const go=document.querySelector('#vWeek .go');
  R.goOV=go?go.scrollWidth-go.clientWidth:null;
  R.weekOV=q('#vWeek .go').map(g=>g.scrollWidth-g.clientWidth).filter(x=>x>0);
  R.formTpl=getComputedStyle(document.querySelector('#vWeek .form')).gridTemplateColumns;
  R.acrowOV=q('#vWeek .acrow').map(a=>a.scrollWidth-a.clientWidth).filter(x=>x>0);
  // pl-cols header count visible
  const hc=sim?[...sim.querySelector('.pl-cols').children].map(s=>getComputedStyle(s).display==='none'?'HID':s.textContent):null;
  R.hdr=hc;
  return R;
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const [nm,vp] of [['W360',{width:360,height:900}],['W390',{width:390,height:900}],['W430',{width:430,height:900}],['DESK',{width:1600,height:1000}]]){
   const p=await b.newPage({viewport:vp,deviceScaleFactor:2});
   p.on('pageerror',e=>console.log('PAGEERR',e.message));
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
   console.log(nm+' '+JSON.stringify(await p.evaluate(probe)));
   await p.close();
 }
 await b.close();
})();
