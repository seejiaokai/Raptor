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
  [0,1].forEach(wipe); INPUTS.length=0;
  addWave(1,'sc'); afterSchedMutate();
  const d0=DAYS[0], d1=DAYS[1];
  const sc=d1.waves.find(x=>x.kind==='sc'), gi=d1.waves.indexOf(sc);
  const AM=sc.formations[0], iM=AM.aircraft.findIndex(a=>!a.spare), iS=AM.aircraft.findIndex(a=>a.spare);
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight);
  const cs=PEOPLE[id].cs;
  const yesterdayFlight=(to,ld)=>{const f=(d0.waves||[]).find(x=>!isStandalone(x)).formations[0];
    f.to=to; f.ld=ld; f.aircraft[0].p=id;};
  const yesterdaySC=(to,ld)=>{ if(!d0.waves.find(x=>x.kind==='sc'))addWave(0,'sc');
    const w0=d0.waves.find(x=>x.kind==='sc'); w0.formations[0].to=to; w0.formations[0].ld=ld;
    w0.formations[0].aircraft[w0.formations[0].aircraft.findIndex(a=>!a.spare)].p=id;};
  const clr=()=>{[0,1].forEach(wipe); AM.to='07:00'; AM.ld='13:00';};
  const V=di=>{const W=validate();return W.byDay[di].warns.filter(x=>(x.who||[]).includes(id))
    .map(x=>x.sev.toUpperCase()+'/'+x.code).join(', ')||'nothing';};
  const T=(label,setup)=>{clr();setup();afterSchedMutate();
    const key=`1.${gi}.0.${iM}.p`;
    out.push('  '+label.padEnd(46)+(V(1)).padEnd(26)+' | picker: '+(slotBar(id,key)||'OFFERED'));};

  out.push(cs+' on SC AM 07:00-13:00 on '+d1.dow+', after '+d0.dow+':');
  T('yesterday flight 08:00-10:00 (clear)',()=>{yesterdayFlight('08:00','10:00');AM.aircraft[iM].p=id;});
  T('yesterday flight 17:00-21:00 → 23:00+12=11:00',()=>{yesterdayFlight('17:00','21:00');AM.aircraft[iM].p=id;});
  T('yesterday SC 13:00-19:00 → 19:00+12=07:00',()=>{yesterdaySC('13:00','19:00');AM.aircraft[iM].p=id;});
  T('yesterday SC 19:00-23:00 → 23:00+12=11:00',()=>{yesterdaySC('19:00','23:00');AM.aircraft[iM].p=id;});
  T('yesterday SC SPARE 19:00-23:00 (standby)',()=>{
    if(!d0.waves.find(x=>x.kind==='sc'))addWave(0,'sc');
    const w0=d0.waves.find(x=>x.kind==='sc'); w0.formations[0].to='19:00'; w0.formations[0].ld='23:00';
    w0.formations[0].aircraft[w0.formations[0].aircraft.findIndex(a=>a.spare)].p=id;
    AM.aircraft[iM].p=id;});
  T('yesterday ground event to 23:00 (not flying)',()=>{
    const g=(d0.ground||[])[0]; g.str='20:00'; g.end='23:00'; g.who=cs; AM.aircraft[iM].p=id;});
  out.push('\n  and the same rest bar on an SC SPARE slot:');
  clr(); yesterdaySC('19:00','23:00'); afterSchedMutate();
  out.push('  '+'SPARE seat, yesterday SC ended 23:00'.padEnd(46)+''.padEnd(26)
    +' | picker: '+(slotBar(id,`1.${gi}.0.${iS}.p`)||'OFFERED'));
  out.push('\n  ordinary flying slot is unchanged (no new bar):');
  const ff=(d1.waves||[]).find(x=>!isStandalone(x));
  out.push('  '+'flight seat, yesterday SC ended 23:00'.padEnd(46)+''.padEnd(26)
    +' | picker: '+(slotBar(id,`1.${d1.waves.indexOf(ff)}.0.0.p`)||'OFFERED'));
  return out.join('\n');}));
await b.close();console.log('\nscrest done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
