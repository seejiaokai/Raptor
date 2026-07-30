/* B42 — leave is LL / OL / OIL. All three are leave; LL and OIL keep the man on
   the island, so he may still be raised as an SC SPARE. OL and a downchit may not. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);

console.log(await p.evaluate(()=>{
  const out=[];
  out.push('types      : '+INPUT_TYPES.join(' | '));
  out.push('classify   : '+['LL','OL','OIL','Downchit','Office','Leave'].map(t=>
    `${t}=${isLeave(t)?'leave':isDownchit(t)?'downchit':'-'}${isLocalLeave(t)?'/local':''}`).join('  '));
  out.push('dropdown   : '+[...document.querySelectorAll('#inType option')].map(o=>o.textContent).join(','));

  const d=DAYS[0];
  (d.waves||[]).forEach(w=>w.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';})));
  ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];o.more=[];}));
  (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>{r.id='';r.more=[];}));
  (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
  (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});
  addWave(0,'sc'); afterSchedMutate();
  const w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w), AM=w.formations[0];
  const kMain=`0.${gi}.0.${AM.aircraft.findIndex(a=>!a.spare)}.p`;
  const kSpare=`0.${gi}.0.${AM.aircraft.findIndex(a=>a.spare)}.p`;
  const kFly=(()=>{const fw=d.waves.find(x=>!isStandalone(x));
    return `0.${d.waves.indexOf(fw)}.0.0.p`;})();
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].special
    &&PEOPLE[x].quals&&PEOPLE[x].quals.scDay&&PEOPLE[x].quals.scNight);
  const cs=PEOPLE[id].cs;

  out.push(`\n${cs}, day 0 (${d.dt}) — SC AM MAIN ${kMain} · SPARE ${kSpare} · a jet seat ${kFly}`);
  const hdr='  type       flying seat                    SC MAIN                        SC SPARE';
  out.push(hdr);
  ['LL','OL','OIL','Downchit'].forEach(t=>{
    INPUTS=INPUTS.filter(x=>x.person!==id);
    INPUTS.push({person:id,date:d.dt,allday:true,type:t,remarks:'test',mod:'2026-07-27'});
    afterSchedMutate();
    const f=(k)=>((slotBar(id,k)||'OFFERED').split(' — ')[0]+
      (slotBar(id,k)?'':'')).padEnd(30).slice(0,30);
    out.push(`  ${t.padEnd(10)} ${f(kFly)} ${f(kMain)} ${f(kSpare)}`);
  });

  /* the day's off-set still counts all four, and the Leave block prints all three */
  INPUTS=INPUTS.filter(x=>x.person!==id);
  afterSchedMutate();
  const day1=DAYS[1];
  const rows=[...document.querySelectorAll(`#eWeek .day[data-day="1"] .sec-leave .pl-row`)]
    .map(r=>{const t=r.querySelector('.nm .ntx'), w=r.querySelector('.ppl .puck .nm');
      return (w?w.textContent:'?')+' '+(t?t.textContent:'?');});
  out.push(`\nLeave block on ${day1.dow}: ${rows.length?rows.join(', '):'(nil)'}`);
  out.push(`day-off set  : ${[...dayOff(day1)].map(x=>PEOPLE[x].cs).join(', ')||'(none)'}`);
  const j=INPUTS.find(x=>x.type==='OL');
  out.push(`picker reason: "${offReason(j.person,DATES.indexOf(j.date))||'(none)'}"`);
  out.push(`type colours : ${['LL','OL','OIL','Downchit','Office'].map(t=>t+'='+inTypeCls(t)).join(' ')}`);

  /* and being planted anyway is still a hard warning, for all three */
  const fw=d.waves.find(x=>!isStandalone(x));
  ['LL','OL','OIL'].forEach(t=>{
    INPUTS=INPUTS.filter(x=>x.person!==id);
    INPUTS.push({person:id,date:d.dt,allday:true,type:t,remarks:'test',mod:'2026-07-27'});
    fw.formations[0].aircraft[0].p=id; afterSchedMutate();
    const hits=validate().all.filter(x=>(x.who||[]).includes(id)&&x.code==='LEAVE_FLY');
    out.push(`${t} + planted to fly → ${hits.length?hits[0].sev+'/'+hits[0].code:'NOTHING'}`);
    fw.formations[0].aircraft[0].p='';
  });
  /* a spare, on LL, raises nothing at all */
  INPUTS=INPUTS.filter(x=>x.person!==id);
  INPUTS.push({person:id,date:d.dt,allday:true,type:'LL',remarks:'test',mod:'2026-07-27'});
  AM.aircraft[AM.aircraft.findIndex(a=>a.spare)].p=id; afterSchedMutate();
  out.push(`LL + raised as SC SPARE → ${
    validate().all.filter(x=>(x.who||[]).includes(id)).map(x=>x.sev+'/'+x.code).join(', ')||'NOTHING'}`);
  return out.join('\n');}));
await b.close();console.log('\nleave done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
