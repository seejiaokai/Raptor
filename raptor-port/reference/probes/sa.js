const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1600,height:1000}});
 const p=await ctx.newPage(); p.setDefaultTimeout(20000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);

 console.log('badge before   :', await p.evaluate(()=>[...document.querySelectorAll('#vWeek .day .badge')].map(x=>x.textContent).join(' | ')));
 const warnBefore=await p.evaluate(()=>{const W=validate();return W.all.length;});

 // add one of each to day 0
 await p.evaluate(()=>{addWave(0,'sc');});
 await p.waitForTimeout(450);
 console.log('badge SC only  :', await p.evaluate(()=>document.querySelector('#vWeek .day .badge').textContent));
 await p.evaluate(()=>{addWave(0,'avalon');addWave(0,'bb');});
 await p.waitForTimeout(450);
 console.log('badge after    :', await p.evaluate(()=>[...document.querySelectorAll('#vWeek .day .badge')].map(x=>x.textContent).join(' | ')));
 console.log('standalone     :', await p.evaluate(()=>{
   const d=DAYS[0];
   return JSON.stringify((d.waves||[]).filter(isStandalone).map(w=>({
     label:w.label,kind:w.kind,noconf:!!w.noconf,
     shifts:(w.formations||[]).map(f=>f.msn+' '+f.to+'-'+f.ld+' ac'+f.aircraft.length+' spare'+f.aircraft.filter(a=>a.spare).length)})));}));
 console.log('avalon duties  :', await p.evaluate(()=>{
   const dw=(DAYS[0].dutywaves||[]).find(x=>x.label==='AVALON');
   return dw?JSON.stringify({noconf:dw.noconf,roles:dw.rows.map(r=>r.role),t:dw.rows[0].str+'-'+dw.rows[0].end}):'MISSING';}));

 // fill every standalone seat with people who are ALREADY flying that day, then
 // prove the engine still says nothing new about them
 const stuffed=await p.evaluate(()=>{
   const d=DAYS[0];
   const busy=[...dayEngaged(d)];
   let i=0,put=[];
   /* only the lines the engine must ignore: everything on AVALON and BB, and
      SC's SPARE. SC main crews ARE checked, by design — filling those would
      legitimately raise new warnings. */
   (d.waves||[]).filter(isStandalone).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{
     if(!saExempt(w,f,a))return;
     a.p=busy[i++%busy.length]; a.w=busy[i++%busy.length]; put.push(a.p,a.w);})));
   // and man the AVALON duty block with more of the same people
   const dw=(d.dutywaves||[]).find(x=>x.label==='AVALON');
   if(dw)dw.rows.forEach(r=>{r.id=busy[i++%busy.length];put.push(r.id);});
   afterSchedMutate();
   return put.length;});
 await p.waitForTimeout(400);
 const warnAfter=await p.evaluate(()=>{const W=validate();return W.all.length;});
 console.log('seats filled   :',stuffed,'| warnings',warnBefore,'->',warnAfter,warnBefore===warnAfter?'UNCHANGED OK':'CHANGED (FAIL)');

 // SC main crew IS still checked — put an SC main seat on top of a real flight
 const scTest=await p.evaluate(()=>{
   const d=DAYS[0];
   const sc=(d.waves||[]).find(w=>w.kind==='sc');
   const f0=(d.waves||[]).find(w=>!isStandalone(w)).formations[0];
   const victim=f0.aircraft[0].p;                       // already flying 12:40-14:05
   sc.formations[0].to='12:00'; sc.formations[0].ld='14:00';
   sc.formations[0].aircraft[0].p=victim;               // main SC seat — must be flagged
   sc.formations[0].aircraft[2].p=victim;               // SPARE seat, same person — must NOT add anything
   afterSchedMutate();
   const W=validate();
   return {victim,hits:W.all.filter(x=>(x.who||[]).includes(victim)).map(x=>x.code+'/'+x.sev)};});
 console.log('SC main checked:',JSON.stringify(scTest));

 // chip priority
 console.log('chip order     :', await p.evaluate(()=>{
   const src=document.documentElement.innerHTML.match(/const RANK=\{[^}]*\}/)[0];
   const m={};src.replace(/(\w+):(\d+)/g,(_,k,v)=>{m[k]=+v;});
   return Object.keys(m).sort((a,b)=>m[b]-m[a]).join(' > ');}));

 // SUP filter
 console.log('SUP filter     :', await p.evaluate(()=>{
   const b=document.querySelector('.fchip[data-hl="SUP"]'); if(!b)return 'MISSING';
   b.dispatchEvent(new Event('click',{bubbles:true}));
   const lit=[...document.querySelectorAll('#vWeek .puck.hl[data-person]')].map(x=>x.dataset.person);
   const wrong=lit.filter(id=>!['A','B'].includes(PEOPLE[id].q));
   const missed=[...document.querySelectorAll('#vWeek .puck[data-person]')].map(x=>x.dataset.person)
     .filter(id=>['A','B'].includes(PEOPLE[id].q)&&!lit.includes(id));
   b.dispatchEvent(new Event('click',{bubbles:true}));
   return 'lit '+new Set(lit).size+' · wrong '+wrong.length+' · missed '+new Set(missed).size;}));
 await p.locator('#vWeek .day').first().screenshot({path:'/tmp/b18-day-d.png'});
 await ctx.close();

 // phone: filters visible, board desktop toggle
 {
   const ctx2=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
   const p2=await ctx2.newPage(); p2.setDefaultTimeout(20000);
   await p2.goto(F); await p2.fill('#luser','a'); await p2.fill('#lpass','a');
   await p2.click('#loginForm button[type=submit]'); await p2.waitForTimeout(900);
   console.log('phone filters  :', await p2.evaluate(()=>{
     const f=document.querySelector('#page-viewsched .filters');
     const cs=getComputedStyle(f);
     return 'display '+cs.display+' · chips '+f.querySelectorAll('.fchip').length
       +' · sideScroll '+(f.scrollWidth>f.clientWidth)+' · pageOverflow '
       +(document.documentElement.scrollWidth-document.documentElement.clientWidth);}));
   await p2.locator('#page-viewsched .filters').screenshot({path:'/tmp/b18-filters-m.png'});
   await p2.evaluate(()=>{go('editsched');});await p2.waitForTimeout(600);
   await p2.evaluate(()=>openScheduler(0)); await p2.waitForTimeout(700);
   console.log('board phone    :', await p2.evaluate(()=>{
     const m=document.querySelector('.sb-main');
     return 'dir '+getComputedStyle(m).flexDirection+' · wideBtn '+getComputedStyle(document.getElementById('sbWide')).display;}));
   await p2.click('#sbWide'); await p2.waitForTimeout(500);
   console.log('board desktop  :', await p2.evaluate(()=>{
     const m=document.querySelector('.sb-main'),sb=document.getElementById('schedBoard');
     const side=document.querySelector('.sb-side');
     return 'wide '+sb.classList.contains('sb-wide')+' · dir '+getComputedStyle(m).flexDirection
       +' · sidePos '+getComputedStyle(side).position+' · sideW '+Math.round(side.getBoundingClientRect().width)
       +' · panX '+(sb.scrollWidth-sb.clientWidth)+' · btn "'+document.getElementById('sbWide').textContent+'"';}));
   await p2.screenshot({path:'/tmp/b18-board-wide-m.png'});
   await ctx2.close();
 }
 await b.close(); console.log('sa done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
