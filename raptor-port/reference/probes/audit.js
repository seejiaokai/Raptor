/* B48 — one check per defect the audit confirmed. Each prints WANT vs GOT. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());});
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);

console.log(await p.evaluate(()=>{
  const out=[]; let pass=0,fail=0;
  const T=(name,got,want)=>{const ok=String(got)===String(want);ok?pass++:fail++;
    out.push(`${ok?' ok  ':'FAIL '} ${name.padEnd(52)} want ${want} · got ${got}`);};
  const wipe=di=>{const d=DAYS[di];
    (d.waves||[]).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
    ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];o.more=[];}));
    (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>{r.id='';r.more=[];}));
    (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
    (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});};
  const W=id=>validate().all.filter(x=>(x.who||[]).includes(id));
  const pilot=n=>Object.keys(PEOPLE).filter(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight)[n||0];

  /* 1 · winOverlap no longer manufactures hits ---------------------------- */
  wipe(0); addWave(0,'sc'); afterSchedMutate();
  {const d=DAYS[0], w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
   const AM=w.formations[0], id=pilot(0);
   const dw=(d.dutywaves||[])[0]&&d.dutywaves[0].rows[0];
   if(dw){dw.id=id; dw.str='19:00'; dw.end='08:00';}          // starts 6h AFTER the shift ends
   afterSchedMutate();
   const k=`0.${gi}.0.${AM.aircraft.findIndex(a=>!a.spare)}.p`;
   T('1 · overnight duty does not bar the 07-13 shift',slotBar(id,k)||'CLEAR','CLEAR');
   if(dw){dw.id='';} afterSchedMutate();}

  /* 1b · but a genuine roll into tomorrow still bars -----------------------*/
  wipe(0); wipe(1); addWave(0,'sc'); afterSchedMutate();
  {const d=DAYS[0], w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
   const N=w.formations[1]; N.to='19:00'; N.ld='07:00';        // rolls past midnight
   const id=pilot(0);
   const fw=DAYS[1].waves.find(x=>!isStandalone(x)), ff=fw.formations[0];
   ff.to='05:00'; ff.ld='06:00'; ff.aircraft[0].p=id;          // tomorrow, inside the tail
   afterSchedMutate();
   const k=`0.${gi}.1.${N.aircraft.findIndex(a=>!a.spare)}.p`;
   T('1b · tomorrow inside the night tail DOES bar',/inside this shift/.test(slotBar(id,k))?'BAR':'clear','BAR');
   ff.aircraft[0].p=''; afterSchedMutate();}

  /* 2 · NO_BRIEF can fire ------------------------------------------------- */
  wipe(1);
  {const d=DAYS[1], fw=d.waves.find(x=>!isStandalone(x)), ff=fw.formations[0], id=pilot(0);
   ff.to='13:00'; ff.ld='14:30'; ff.aircraft[0].p=id;
   const g=(d.ground||[])[0]; if(g){g.who=PEOPLE[id].cs; g.str='11:00'; g.end='12:00';}
   afterSchedMutate();
   T('2 · a meeting inside the brief window raises NO_BRIEF',
     W(id).some(x=>x.code==='NO_BRIEF')?'NO_BRIEF':'nothing','NO_BRIEF');
   if(g)g.who=''; ff.aircraft[0].p=''; afterSchedMutate();}

  /* 3 · an offer taken up paints nothing ---------------------------------- */
  wipe(0);
  {const d=DAYS[0], fw=d.waves.find(x=>!isStandalone(x)), ff=fw.formations[0];
   const off=INPUTS.find(i=>/^Available/i.test(i.type)&&i.date===d.dt);
   ff.aircraft[0].p=off.person; afterSchedMutate();
   T('3 · an offer taken up wears no chip',(chipOf(0,off.person)||'none'),'none');
   T('3 · and no ring',(sevOf(0,off.person)||'none'),'none');
   ff.aircraft[0].p=''; afterSchedMutate();}

  /* 4 · a sim crossing midnight is a real window --------------------------- */
  wipe(0);
  {const d=DAYS[0], s0=(d.sims.oft||[])[0], id=pilot(0);
   s0.str='2300'; s0.end='0100'; s0.p=id;
   const dr=(d.dutywaves||[])[0]&&d.dutywaves[0].rows[0];
   if(dr){dr.id=id; dr.str='2330'; dr.end='0030';}
   afterSchedMutate();
   const ev=(collectEvents()[0].events.find(e=>e.kind==='sim'&&e.id===id)||{});
   T('4 · a 2300-0100 sim is stored rolled, not inverted',`${ev.s}-${ev.e}`,'1380-1500');
   T('4 · and it clashes with the duty inside it',
     W(id).some(x=>x.code==='DOUBLE_BOOK')?'DOUBLE_BOOK':'nothing','DOUBLE_BOOK');
   s0.p=''; if(dr)dr.id=''; afterSchedMutate();}

  /* 5 · a body dropped under a sim row counts ------------------------------ */
  wipe(0);
  {const d=DAYS[0], s0=(d.sims.oft||[])[0], id=pilot(1);
   s0.str='1300'; s0.end='1430'; s0.more=[id];
   const dr=(d.dutywaves||[])[0]&&d.dutywaves[0].rows[0];
   if(dr){dr.id=id; dr.str='1300'; dr.end='1430';}
   afterSchedMutate();
   T('5 · a sim extra is seen by the engine',
     W(id).some(x=>x.code==='DOUBLE_BOOK')?'DOUBLE_BOOK':'nothing','DOUBLE_BOOK');
   s0.more=[]; if(dr)dr.id=''; afterSchedMutate();}

  /* 6 · crew rest is measured off flying, not off a desk ------------------- */
  wipe(0); wipe(1); addWave(1,'sc'); afterSchedMutate();
  {const d0=DAYS[0], id=pilot(0);
   const fw=d0.waves.find(x=>!isStandalone(x)), ff=fw.formations[0];
   ff.to='08:00'; ff.ld='10:00'; ff.aircraft[0].p=id;           // rest-bearing end 12:00
   const dr=(d0.dutywaves||[])[0]&&d0.dutywaves[0].rows[0];
   if(dr){dr.id=id; dr.str='1800'; dr.end='2359';}              // a desk, not a cockpit
   const w=DAYS[1].waves.find(x=>x.kind==='sc'), AM=w.formations[0];
   AM.aircraft[AM.aircraft.findIndex(a=>!a.spare)].p=id;
   afterSchedMutate();
   T('6 · a late desk duty raises no crew-rest breach',
     W(id).some(x=>x.code==='CREW_REST')?'CREW_REST':'none','none');
   T('6 · and the picker agrees with the engine',restClear(1,id)==null?'clear':'barred','clear');
   ff.aircraft[0].p=''; if(dr)dr.id=''; AM.aircraft[AM.aircraft.findIndex(a=>!a.spare)].p='';
   afterSchedMutate();}

  /* 7 · one man listed twice on a row is one commitment -------------------- */
  wipe(0);
  {const id=pilot(0); fillSlot('d:0.0.0.+',id); fillSlot('d:0.0.0.+',id); afterSchedMutate();
   T('7 · a man on a row twice does not clash with himself',
     W(id).some(x=>x.code==='DOUBLE_BOOK')?'DOUBLE_BOOK':'none','none');
   const r=DAYS[0].dutywaves[0].rows[0]; r.id=''; r.more=[]; afterSchedMutate();}

  /* 8 · sim seats obey the seat rules -------------------------------------- */
  {const wso=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='RCP'&&!PEOPLE[x].special);
   T('8 · slotRules reads a sim front seat',slotRules('s:0.oft.0.p').seat||'null','p');
   T('8 · a WSO is barred from it',/front seat/.test(slotBar(wso,'s:0.oft.0.p'))?'BAR':'clear','BAR');
   T('8 · but not from a pax place',slotRules('s:0.oft.0.pax.1').seat||'null','null');}

  /* 11 · the free count excludes men on leave ------------------------------ */
  {disarmSlot(); const di=1, d=DAYS[di], off=dayOff(d);
   const host=document.createElement('div'); host.innerHTML=paletteHTML(di,{head:false});
   const free=[...host.querySelectorAll('.rcol')].map(c=>+(c.querySelector('.rh').textContent.match(/(\d+) free/)||[])[1]);
   const shownOff=[...host.querySelectorAll('.rpuck[data-person]')]
     .filter(e=>off.has(e.dataset.person)&&!e.classList.contains('no')).length;
   T('11 · nobody on leave is drawn as available',shownOff,0);
   T('11 · and the free counts are numbers',free.every(n=>isFinite(n))?'ok':'bad','ok');}

  /* 13 · a splice moves the amendment marks with it ------------------------ */
  {const d=DAYS[0]; d.notes=['ALPHA','BRAVO','CHARLIE'];
   SCHED.pending={}; SCHED.changes={'dn:0.2':1}; SCHED.als=[{n:1,keys:['dn:0.2'],sign:{}}];
   /* the delete handler is bound to #sbBoard and keyed off .mbtn */
   openScheduler(0);
   const del=document.createElement('span'); del.className='mbtn'; del.dataset.ndel='0.0';
   document.getElementById('sbBoard').appendChild(del);
   del.dispatchEvent(new MouseEvent('click',{bubbles:true}));
   T('13 · the AL mark follows the row it marked',SCHED.changes['dn:0.1']||'lost',1);
   T('13 · and no mark is left on the dead address',SCHED.changes['dn:0.2']||'gone','gone');
   T('13 · the issued AL is rewritten too',(SCHED.als[0]||{keys:[]}).keys.join(','),'dn:0.1');
   del.remove();}

  /* 15 · undo puts down an armed slot -------------------------------------- */
  {const before=DAYS[0].waves.length;
   addWave(0,'fly'); afterSchedMutate();
   const gi=DAYS[0].waves.length-1;
   armSlot(`0.${gi}.0.0.p`);
   histApply(HIST.ix-1);
   T('15 · undo disarms',ARM?'still armed':'disarmed','disarmed');
   T('15 · and the wave really went',DAYS[0].waves.length<=before?'gone':'still there','gone');}

  out.push(`\n${pass} passed · ${fail} failed`);
  return out.join('\n');}));

/* 12 · undo on the Inputs page redraws the table --------------------------- */
await p.evaluate(()=>go('inputs'));await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{
  const rows=()=>document.querySelectorAll('#inBody [data-inx]').length;
  const n0=INPUTS.length, r0=rows();
  INPUTS.unshift({person:'bane',date:'Jul 13',allday:true,type:'LL',remarks:'probe',mod:'2026-07-28'});
  renderInputs(); histPush();
  const r1=rows();
  histApply(HIST.ix-1);
  return `12 · inputs table after undo — model ${INPUTS.length} rows ${rows()} `
    +`(was ${n0}/${r0}, then ${INPUTS.length+1}/${r1}) · ${INPUTS.length===rows()?'ok':'FAIL'}`;}));

/* 14 · a traffic edit earns a history step and an amendment mark ------------ */
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{
  const h0=HIST.ix, p0=Object.keys(SCHED.pending).length;
  AIRKEY='0|0'; const g=findGo(AIRKEY); g.traffic=g.traffic||[];
  document.getElementById('airAdd').click();
  return `14 · traffic add — history ${h0}->${HIST.ix} · pending ${p0}->${Object.keys(SCHED.pending).length} `
    +`· key ${Object.keys(SCHED.pending).filter(k=>/^tr:/.test(k)).join(',')||'NONE'} `
    +`· ${HIST.ix>h0&&Object.keys(SCHED.pending).some(k=>/^tr:/.test(k))?'ok':'FAIL'}`;}));

/* 9 · the board's day tab puts down the armed slot -------------------------- */
console.log(await p.evaluate(()=>{
  openScheduler(0);
  const cell=document.querySelector('#sbBoard [data-slot]');
  if(!cell)return '9 · no board slot found — SKIP';
  armSlot(cell.dataset.slot);
  const was=ARM?ARM.key:'none';
  const tab=document.querySelector('[data-sbtab="3"]');
  tab.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return `9 · armed ${was} then switched to day 3 — ARM now ${ARM?ARM.key:'null'} · ${ARM?'FAIL':'ok'}`;}));

console.log(errs.length?'\nRUNTIME ERRORS:\n'+errs.join('\n'):'\nno runtime errors');
await b.close();console.log('audit done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
