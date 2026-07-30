/* B41 — an SC SPARE is standing by (may still fly, carries no crew rest), and the
   shift-vs-ground advisory wears its own amber A instead of the red conflict C. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);

console.log(await p.evaluate(()=>{
  const out=[];
  const wipe=di=>{const d=DAYS[di];
    (d.waves||[]).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
    ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];o.more=[];}));
    (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>{r.id='';r.more=[];}));
    (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
    (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});};
  wipe(0); wipe(1);
  addWave(1,'sc'); addWave(0,'sc'); afterSchedMutate();
  const d0=DAYS[0], d1=DAYS[1];
  const w1=d1.waves.find(x=>x.kind==='sc'), g1=d1.waves.indexOf(w1);
  const AM=w1.formations[0], PM=w1.formations[1];
  const mPM=PM.aircraft.findIndex(a=>!a.spare), sPM=PM.aircraft.findIndex(a=>a.spare);
  const mAM=AM.aircraft.findIndex(a=>!a.spare), sAM=AM.aircraft.findIndex(a=>a.spare);
  const kMain=`1.${g1}.1.${mPM}.p`, kSpare=`1.${g1}.1.${sPM}.p`;
  const kMainAM=`1.${g1}.0.${mAM}.p`, kSpareAM=`1.${g1}.0.${sAM}.p`;
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight);
  const cs=PEOPLE[id].cs;
  out.push(`SC PM on Tuesday ${PM.to}-${PM.ld} · MAIN ${kMain} · SPARE ${kSpare} · subject ${cs}`);

  /* 1 — a flight sitting inside the shift window */
  const fw=d1.waves.find(x=>!isStandalone(x)), ff=fw.formations[0];
  ff.to='14:00'; ff.ld='15:30'; ff.aircraft[0].p=id; afterSchedMutate();
  out.push(`\n1 · ${cs} flying ${ff.to}-${ff.ld}, inside the PM shift`);
  out.push(`     MAIN  "${slotBar(id,kMain)||'(clear — OFFERED)'}"`);
  out.push(`     SPARE "${slotBar(id,kSpare)||'(clear — OFFERED)'}"`);
  ff.aircraft[0].p=''; afterSchedMutate();

  /* 2 — crew rest running in from Monday */
  const w0=d0.waves.find(x=>x.kind==='sc'), AM0=w0.formations[0];
  AM0.to='19:00'; AM0.ld='23:00';
  AM0.aircraft[AM0.aircraft.findIndex(a=>!a.spare)].p=id; afterSchedMutate();
  out.push(`\n2 · ${cs} stood SC 19:00-23:00 on Monday → clear ${hm24((restClear(1,id)||0))}`
    +`, so Tuesday's AM shift ${AM.to}-${AM.ld} is inside it`);
  out.push(`     AM MAIN  "${slotBar(id,kMainAM)||'(clear — OFFERED)'}"`);
  out.push(`     AM SPARE "${slotBar(id,kSpareAM)||'(clear — OFFERED)'}"`);

  /* 3 — and a SPARE shift still buys the next day no rest */
  AM0.aircraft[AM0.aircraft.findIndex(a=>!a.spare)].p='';
  AM0.aircraft[AM0.aircraft.findIndex(a=>a.spare)].p=id; afterSchedMutate();
  out.push(`\n3 · the same 19:00-23:00 stood as a SPARE → rest clear ${
    restClear(1,id)==null?'(none — spare carries no rest)':hm24(restClear(1,id))}`);
  out.push(`     AM MAIN  "${slotBar(id,kMainAM)||'(clear — OFFERED)'}"`);
  AM0.aircraft[AM0.aircraft.findIndex(a=>a.spare)].p=''; afterSchedMutate();

  /* 4 — the chip on the puck: ground → amber A, duty → red C */
  /* render the puck exactly as the board does and read the paint off it */
  const host=document.createElement('div'); document.body.appendChild(host);
  const chipAt=()=>{const c=chipOf(1,id);
    host.innerHTML=puck(id,sevOf(1,id),true,c);
    const el=host.querySelector('.puck'), lc=host.querySelector('.lchip');
    return {chip:c||'(none)',text:lc?lc.textContent:'-',cls:lc?lc.className:'-',
      paint:lc?getComputedStyle(lc).backgroundColor:'-',
      box:el?el.classList.contains('boxred'):null,
      ring:sevOf(1,id)||'(none)'};};
  PM.aircraft[mPM].p=id;
  const gr=(d1.ground||[])[0]; if(gr){gr.who=cs; gr.str='14:00'; gr.end='15:00';}
  afterSchedMutate();
  const a=chipAt();
  out.push(`\n4 · ${cs} on SC PM MAIN + ground 14:00-15:00`);
  out.push(`     chip ${a.chip} · prints "${a.text}" · class "${a.cls}" · ${a.paint} · red box ${a.box} · ring ${a.ring}`);
  out.push(`     note: ${(validate().all.filter(x=>(x.who||[]).includes(id)&&x.code==='SHIFT_SOFT')[0]||{}).sev||'none'}/SHIFT_SOFT`);

  if(gr){gr.who='';}
  const dr=(d1.dutywaves||[])[0]&&d1.dutywaves[0].rows[0];
  if(dr){dr.id=id; dr.str='14:00'; dr.end='15:00';}
  afterSchedMutate();
  const c=chipAt();
  out.push(`\n5 · the same man on SC PM MAIN + a DUTY 14:00-15:00 (must stay hard)`);
  out.push(`     chip ${c.chip} · prints "${c.text}" · class "${c.cls}" · ${c.paint} · red box ${c.box} · ring ${c.ring}`);
  return out.join('\n');}));
await b.close();console.log('\nsc3 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
