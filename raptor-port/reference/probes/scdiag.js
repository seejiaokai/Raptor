const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{
  const out=[];
  addWave(0,'sc'); afterSchedMutate();
  const d=DAYS[0], w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
  out.push('SC lines: '+w.formations.map((f,i)=>i+':'+f.msn+' '+f.to+'-'+f.ld
    +' ['+f.aircraft.map(a=>a.role).join(',')+']').join(' | '));
  // clear everything else off the day so only SC is in play
  (d.waves||[]).forEach(x=>{if(x!==w)x.formations.forEach(f=>f.aircraft.forEach(a=>{a.p='';a.w='';}));});
  ['amt','oft'].forEach(k=>((d.sims||{})[k]||[]).forEach(o=>{o.p='';o.w='';o.who='';o.pax=[];}));
  (d.dutywaves||[]).forEach(dw=>dw.rows.forEach(r=>r.id=''));
  (d.ground||[]).forEach(g=>{g.who='';g.more=[];});
  (d.allhands||[]).forEach(x=>{x.who='';x.more=[];});
  afterSchedMutate();
  const V=id=>validate().all.filter(x=>(x.who||[]).includes(id)).map(x=>x.sev+'/'+x.code+': '+x.msg);
  const pick=Object.keys(PEOPLE).find(id=>PEOPLE[id].seat==='FCP'&&!PEOPLE[id].special
    &&PEOPLE[id].quals&&PEOPLE[id].quals.scDay&&PEOPLE[id].quals.scNight);
  const cs=PEOPLE[pick].cs;
  // AM MAIN + PM MAIN  (0700-1300 then 1300-1900 — abutting)
  const AM=w.formations[0], PM=w.formations[1];
  const mainAM=AM.aircraft.findIndex(a=>!a.spare), spareAM=AM.aircraft.findIndex(a=>a.spare);
  const mainPM=PM.aircraft.findIndex(a=>!a.spare), sparePM=PM.aircraft.findIndex(a=>a.spare);
  AM.aircraft[mainAM].p=pick; PM.aircraft[mainPM].p=pick; afterSchedMutate();
  out.push('\n1 · '+cs+' on SC AM MAIN + SC PM MAIN (abutting shifts):\n     '+(V(pick).join('\n     ')||'no flags'));
  AM.aircraft[mainAM].p=''; PM.aircraft[mainPM].p='';
  AM.aircraft[spareAM].p=pick; PM.aircraft[sparePM].p=pick; afterSchedMutate();
  out.push('\n2 · '+cs+' on SC AM SPARE + SC PM SPARE:\n     '+(V(pick).join('\n     ')||'no flags'));
  // spare + a real flight in the same window
  AM.aircraft[spareAM].p=pick; PM.aircraft[sparePM].p='';
  const fw=(d.waves||[]).find(x=>!isStandalone(x)), ff=fw.formations[0];
  ff.aircraft[0].p=pick; afterSchedMutate();
  out.push('\n3 · '+cs+' on SC AM SPARE + a flight '+ff.to+'-'+ff.ld+':\n     '+(V(pick).join('\n     ')||'no flags'));
  // MAIN + the same flight
  AM.aircraft[spareAM].p=''; AM.aircraft[mainAM].p=pick; afterSchedMutate();
  out.push('\n4 · '+cs+' on SC AM MAIN + the same flight:\n     '+(V(pick).join('\n     ')||'no flags'));
  // MAIN + a ground event inside the shift
  ff.aircraft[0].p='';
  const g=(d.ground||[])[0];
  if(g){g.who=PEOPLE[pick].cs; g.str='09:00'; g.end='10:00';}
  afterSchedMutate();
  out.push('\n5 · '+cs+' on SC AM MAIN + ground "'+((g||{}).prog||'-')+'" 09:00-10:00:\n     '+(V(pick).join('\n     ')||'no flags'));
  // what the palette says while an SC PM slot is armed
  const key=`0.${gi}.1.${mainPM}.p`;
  disarmSlot(); armSlot(key);
  const el=[...document.querySelectorAll('#eRoster .rpuck[data-person="'+pick+'"]')][0];
  out.push('\n6 · palette with SC PM MAIN armed → '+cs+' classes "'+(el?el.className:'not shown')
    +'" · slotBar="'+slotBar(pick,key)+'"');
  return out.join('\n');}));
await b.close();console.log('\nscdiag done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
