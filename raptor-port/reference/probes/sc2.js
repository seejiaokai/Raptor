/* B40 — SC slots are judged against their own shift window, the palette is cut
   to the crew holding that shift's currency, and SC NIGHT needs SC DAY. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);

console.log(await p.evaluate(()=>{
  const out=[];
  const d=DAYS[0];
  /* clear day 0 so nothing else interferes */
  (d.waves||[]).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
  ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];o.more=[];}));
  (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>{r.id='';r.more=[];}));
  (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
  (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});
  addWave(0,'sc'); afterSchedMutate();
  const w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
  const AM=w.formations[0], PM=w.formations[1];
  const mAM=AM.aircraft.findIndex(a=>!a.spare), mPM=PM.aircraft.findIndex(a=>!a.spare);
  const key=`0.${gi}.1.${mPM}.p`;                       // the SC PM MAIN front seat
  out.push(`SC AM ${AM.to}-${AM.ld} · SC PM ${PM.to}-${PM.ld} · arming ${key}`);

  const pilots=Object.keys(PEOPLE).filter(id=>PEOPLE[id].seat==='FCP'&&!PEOPLE[id].special
    &&!PEOPLE[id].archived&&PEOPLE[id].quals&&PEOPLE[id].quals.scDay);
  const A=pilots[0], B=pilots[1], C=pilots[2];
  const cls=id=>{const el=document.querySelector('#eRoster .rpuck[data-person="'+id+'"]');
    return el?(el.className.replace(/\s+/g,' ').trim()||'rpuck'):'NOT SHOWN';};
  const arm=()=>{disarmSlot();armSlot(key);};

  /* 1 — the reported bug: a man on the other half of the day */
  AM.aircraft[mAM].p=A; afterSchedMutate(); arm();
  out.push(`\n1 · ${PEOPLE[A].cs} on SC AM MAIN, planning SC PM MAIN`);
  out.push(`     class "${cls(A)}" · slotBar "${slotBar(A,key)||'(clear)'}"`);

  /* 2 — a flight sitting inside the PM window bars him, and says which */
  const fw=(d.waves||[]).find(x=>!isStandalone(x)), ff=fw.formations[0];
  ff.to='14:00'; ff.ld='15:30'; ff.aircraft[0].p=B; afterSchedMutate(); arm();
  out.push(`\n2 · ${PEOPLE[B].cs} flying ${ff.to}-${ff.ld}, inside the PM shift`);
  out.push(`     class "${cls(B)}" · slotBar "${slotBar(B,key)||'(clear)'}"`);

  /* 3 — a ground event inside the window does NOT bar him */
  const g=(d.ground||[])[0];
  if(g){g.who=PEOPLE[C].cs; g.str='14:00'; g.end='15:00';}
  afterSchedMutate(); arm();
  out.push(`\n3 · ${PEOPLE[C].cs} on ground "${(g||{}).prog||'-'}" 14:00-15:00`);
  out.push(`     class "${cls(C)}" · slotBar "${slotBar(C,key)||'(clear)'}" · plants ${
    (()=>{const before=slotVal(key); placeArmed(C); const after=slotVal(key);
      setSlotVal(key,before); afterSchedMutate(); return after===C?'YES':'NO';})()}`);

  /* 4 — no day-wide fade while an SC slot is armed */
  arm();
  const pal=[...document.querySelectorAll('#eRoster .rpuck[data-person]')];
  out.push(`\n4 · palette with the SC slot armed: ${pal.length} shown · busy ${
    pal.filter(e=>e.classList.contains('busy')).length} · standby ${
    pal.filter(e=>e.classList.contains('standby')).length} · struck ${
    pal.filter(e=>e.classList.contains('no')).length}`);
  const nonCur=pal.filter(e=>{const P=PEOPLE[e.dataset.person];
    return !P.special&&P.quals&&!P.quals.scDay;});
  out.push(`     listed without SC DAY currency: ${nonCur.length} (want 0)`);
  out.push(`     arm strip: "${(document.querySelector('#eRoster .ros-arm span')||{}).textContent||''}"`);

  /* 5 — an ordinary flying seat still fades the day the old way */
  const fkey=`0.${d.waves.indexOf(fw)}.0.1.p`;
  disarmSlot(); armSlot(fkey);
  const pal2=[...document.querySelectorAll('#eRoster .rpuck[data-person]')];
  out.push(`\n5 · ordinary flying seat armed: ${pal2.length} shown · busy ${
    pal2.filter(e=>e.classList.contains('busy')).length} (want >0 — unchanged)`);
  disarmSlot();

  /* 6 — a NIGHT shift lists only SC NIGHT holders */
  PM.to='19:00'; PM.ld='23:00'; afterSchedMutate(); arm();
  const pal3=[...document.querySelectorAll('#eRoster .rpuck[data-person]')];
  out.push(`\n6 · PM moved to 19:00-23:00 → ${slotRules(key).sc} shift · ${pal3.length} shown`);
  out.push(`     listed without SC NIGHT currency: ${pal3.filter(e=>{
    const P=PEOPLE[e.dataset.person];return !P.special&&P.quals&&!P.quals.scNight;}).length} (want 0)`);
  disarmSlot();

  /* 7 — SC NIGHT cannot stand without SC DAY */
  const seedBad=Object.keys(PEOPLE).filter(id=>PEOPLE[id].quals
    &&PEOPLE[id].quals.scNight&&!PEOPLE[id].quals.scDay).length;
  const t=Object.keys(PEOPLE).find(id=>PEOPLE[id].quals&&!PEOPLE[id].quals.scDay&&!PEOPLE[id].special);
  go('quals'); $('qEdit').click();
  const tick=(id,k)=>{const c=document.querySelector('[data-q="'+id+'|'+k+'"]');
    c&&c.dispatchEvent(new MouseEvent('click',{bubbles:true}));};
  tick(t,'scNight');
  const blocked=!PEOPLE[t].quals.scNight;
  tick(t,'scDay'); tick(t,'scNight');
  const bothOK=PEOPLE[t].quals.scDay&&PEOPLE[t].quals.scNight;
  tick(t,'scDay');
  const cascaded=!PEOPLE[t].quals.scDay&&!PEOPLE[t].quals.scNight;
  out.push(`\n7 · ${PEOPLE[t].cs}: SC NIGHT before SC DAY blocked=${blocked}`
    +` · both after SC DAY=${bothOK} · removing SC DAY removes SC NIGHT=${cascaded}`);
  out.push(`     seeded SC NIGHT without SC DAY: ${seedBad} (want 0)`);
  return out.join('\n');}));
await b.close();console.log('\nsc2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
