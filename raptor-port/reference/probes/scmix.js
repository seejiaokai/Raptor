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
  // wipe day 0 clean, and clear every personal input, so only what we place shows
  (d.waves||[]).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
  ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];o.more=[];}));
  (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>{r.id='';r.more=[];}));
  (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
  (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});
  INPUTS.length=0;
  addWave(0,'sc'); afterSchedMutate();
  const w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
  const AM=w.formations[0], PM=w.formations[1];
  const iM=AM.aircraft.findIndex(a=>!a.spare), iS=AM.aircraft.findIndex(a=>a.spare);
  const jM=PM.aircraft.findIndex(a=>!a.spare), jS=PM.aircraft.findIndex(a=>a.spare);
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight);
  const cs=PEOPLE[id].cs;
  const clear=()=>{
    (d.waves||[]).forEach(x=>x.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
    ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];}));
    (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>r.id=''));
    (d.ground||[]).forEach(g=>g.who='');
    (d.allhands||[]).forEach(x=>x.who='');};
  const V=()=>{const W=validate();return W.all.filter(x=>(x.who||[]).includes(id))
    .map(x=>x.sev.toUpperCase()+'/'+x.code).join(', ')||'nothing';};
  const T=(label,setup)=>{clear();setup();afterSchedMutate();out.push('  '+label.padEnd(42)+V());};

  out.push(cs+' — SC MAIN 07:00-13:00 against everything:');
  T('SC AM MAIN + SC PM MAIN (abutting)',()=>{AM.aircraft[iM].p=id;PM.aircraft[jM].p=id;});
  T('SC AM MAIN + SC PM MAIN (overlapped)',()=>{AM.aircraft[iM].p=id;PM.aircraft[jM].p=id;
    txtSet(`ff:0.${gi}.1.to`,'11:00');});
  txtSet(`ff:0.${gi}.1.to`,'13:00');
  T('SC AM MAIN + a flight in the window',()=>{AM.aircraft[iM].p=id;
    const f=(d.waves||[]).find(x=>!isStandalone(x)).formations[0]; f.to='09:00'; f.ld='11:00'; f.aircraft[0].p=id;});
  T('SC AM MAIN + a sim in the window',()=>{AM.aircraft[iM].p=id;
    const o=((d.sims||{}).oft||[])[0]; if(o){o.str='0900';o.end='1030';o.p=id;}});
  T('SC AM MAIN + a duty in the window',()=>{AM.aircraft[iM].p=id;
    const r=(d.dutywaves||[])[0].rows[0]; r.str='08:00'; r.end='12:00'; r.id=id;});
  T('SC AM MAIN + a ground event',()=>{AM.aircraft[iM].p=id;
    const g=(d.ground||[])[0]; g.str='09:00'; g.end='10:00'; g.who=cs;});
  T('SC AM MAIN + a programme item',()=>{AM.aircraft[iM].p=id;
    const x=(d.allhands||[])[0]; x.str='09:00'; x.end='10:00'; x.who=cs;});
  T('SC AM MAIN + a flight OUTSIDE the window',()=>{AM.aircraft[iM].p=id;
    const f=(d.waves||[]).find(y=>!isStandalone(y)).formations[0]; f.to='15:00'; f.ld='16:30'; f.aircraft[0].p=id;});

  out.push('\n'+cs+' — SC SPARE against the same:');
  T('SC AM SPARE + SC PM SPARE',()=>{AM.aircraft[iS].p=id;PM.aircraft[jS].p=id;});
  T('SC AM SPARE + a flight in the window',()=>{AM.aircraft[iS].p=id;
    const f=(d.waves||[]).find(y=>!isStandalone(y)).formations[0]; f.to='09:00'; f.ld='11:00'; f.aircraft[0].p=id;});
  T('SC AM SPARE + a sim in the window',()=>{AM.aircraft[iS].p=id;
    const o=((d.sims||{}).oft||[])[0]; if(o){o.str='0900';o.end='1030';o.p=id;}});
  T('SC AM SPARE + a duty in the window',()=>{AM.aircraft[iS].p=id;
    const r=(d.dutywaves||[])[0].rows[0]; r.str='08:00'; r.end='12:00'; r.id=id;});

  out.push('\nAVALON / BB stay wholly exempt:');
  addWave(0,'avalon'); addWave(0,'bb'); afterSchedMutate();
  const av=d.waves.find(x=>x.kind==='avalon'), bb=d.waves.find(x=>x.kind==='bb');
  T('AVALON MAIN + a flight',()=>{av.formations[0].aircraft[0].p=id;
    const f=(d.waves||[]).find(y=>!isStandalone(y)).formations[0]; f.to='20:00'; f.ld='22:00'; f.aircraft[0].p=id;});
  T('BB MAIN + a duty',()=>{bb.formations[0].aircraft[0].p=id;
    const r=(d.dutywaves||[])[0].rows[0]; r.str='08:00'; r.end='12:00'; r.id=id;});

  out.push('\nPalette, with an SC PM MAIN slot armed:');
  clear(); AM.aircraft[iS].p=id;                       // he is an AM SPARE
  const busyId=Object.keys(PEOPLE).find(x=>x!==id&&PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight);
  AM.aircraft[iM].p=busyId;                            // and this one is AM MAIN
  afterSchedMutate();
  disarmSlot(); armSlot(`0.${gi}.1.${jM}.p`);
  const K=x=>{const el=document.querySelector('#eRoster .rpuck[data-person="'+x+'"]');
    return el?(el.className.replace('rpuck','').trim()||'normal')+' · selectable '+!el.classList.contains('no'):'not shown';};
  out.push('  '+(cs+' (SC AM SPARE)').padEnd(34)+K(id));
  out.push('  '+(PEOPLE[busyId].cs+' (SC AM MAIN)').padEnd(34)+K(busyId));
  disarmSlot();
  return out.join('\n');}));
await b.close();console.log('\nscmix done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
