const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.setDefaultTimeout(15000); p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
console.log('parse  :',await p.evaluate(()=>[
  ['1A: AAR',false],['1A: AAR',true],['A: AAR',false],['AAR',false],['AAR',true],
  ['1A: DAAR',true],['2A: NAAR',false],
  ['1A: NO AAR',false],['A: NO DAAR',false],['NO NAAR',true],['1A: NO AAR',true],
  ['1B: AAR',false],['B: NAAR',true],['1B: AAR // 2A: BFM',false],
  ['1A: BFM-6',false],['2A: SAT-REF',false],['PRI LSR',false],
  ['1A: NO DAAR / NAAR',false],['1A: AAR // 1B: SEFE',false],
].map(([r,n])=>`${JSON.stringify(r)}${n?'(night)':''}=${aarNeed(r,n)}`).join('\n         ')));
console.log('seed   :',await p.evaluate(()=>{
  const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
  const d=ids.filter(x=>PEOPLE[x].quals.daar), n=ids.filter(x=>PEOPLE[x].quals.naar);
  const bad=ids.filter(x=>PEOPLE[x].quals.naar&&!PEOPLE[x].quals.daar);
  const wso=ids.filter(x=>PEOPLE[x].seat==='RCP'&&(PEOPLE[x].quals.daar||PEOPLE[x].quals.naar));
  return 'DAAR '+d.length+' · NAAR '+n.length+' · NAAR-without-DAAR '+bad.length+' · WSOs holding AAR '+wso.length;}));
console.log('seq    :',await p.evaluate(()=>{
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].quals.daar&&!PEOPLE[x].special);
  go('quals');
  const cell=k=>document.querySelector('#qtbl td[data-q="'+id+'|'+k+'"]');
  cell('naar').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const blocked=!PEOPLE[id].quals.naar;
  cell('daar').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  cell('naar').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const now=PEOPLE[id].quals.daar&&PEOPLE[id].quals.naar;
  cell('daar').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const cascade=!PEOPLE[id].quals.daar&&!PEOPLE[id].quals.naar;
  return PEOPLE[id].cs+': NAAR blocked before DAAR='+blocked+' · both after DAAR='+now+' · removing DAAR removes NAAR='+cascade;}));
console.log('wso col:',await p.evaluate(()=>{
  const wso=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='RCP'&&!PEOPLE[x].special);
  const row=[...document.querySelectorAll('#qtbl tbody tr')].find(r=>r.querySelector('[data-person="'+wso+'"]'));
  return wso?('a WSO row is on the FCP view? '+!!row+' · na cells overall '+document.querySelectorAll('#qtbl td.qcell.na').length):'-';}));
await p.evaluate(()=>{document.getElementById('qViewW').click();});await p.waitForTimeout(300);
console.log('wso na :',await p.evaluate(()=>document.querySelectorAll('#qtbl td.qcell.na').length+' struck cells on the WSO view (2 per row × '+document.querySelectorAll('#qtbl tbody tr:not(.grp)').length+' rows)'));
// live flagging
console.log('flag   :',await p.evaluate(()=>{
  go('editsched');
  const f=DAYS[0].waves[0].formations[0];              // day wave, 12:40-14:05
  const noDaar=Object.keys(PEOPLE).find(x=>PEOPLE[x].seat==='FCP'&&!PEOPLE[x].quals.daar&&!PEOPLE[x].special);
  const dayOnly=Object.keys(PEOPLE).find(x=>PEOPLE[x].quals.daar&&!PEOPLE[x].quals.naar);
  f.aircraft[0].rmks='1A: AAR'; f.aircraft[0].p=noDaar;
  afterSchedMutate();
  let W=validate(); const a1=W.all.filter(x=>x.code==='AAR_QUAL');
  f.aircraft[0].rmks='1A: NO AAR';
  afterSchedMutate(); W=validate(); const a2=W.all.filter(x=>x.code==='AAR_QUAL');
  f.aircraft[0].rmks='1B: AAR';
  afterSchedMutate(); W=validate(); const a3=W.all.filter(x=>x.code==='AAR_QUAL');
  f.aircraft[0].rmks='1A: AAR'; f.aircraft[0].p=dayOnly;
  afterSchedMutate(); W=validate(); const a4=W.all.filter(x=>x.code==='AAR_QUAL');
  const night=DAYS[0].waves[1].formations[0];          // night wave
  night.aircraft[0].rmks='1A: AAR'; night.aircraft[0].p=dayOnly;
  afterSchedMutate(); W=validate(); const a5=W.all.filter(x=>x.code==='AAR_QUAL');
  return '\n         no-DAAR + "1A: AAR" day  → '+a1.length+' '+JSON.stringify(a1.map(x=>x.sev+': '+x.msg))
   +'\n         same + "1A: NO AAR"      → '+a2.length
   +'\n         same + "1B: AAR" (rear)  → '+a3.length
   +'\n         DAAR-only + AAR on a DAY wave  → '+a4.length
   +'\n         DAAR-only + AAR on a NIGHT wave → '+a5.length+' '+JSON.stringify(a5.map(x=>x.msg));}));
console.log('palette:',await p.evaluate(()=>{
  renderSchedule('eWeek',true);
  const s=document.querySelector('#eWeek .acrow .seat[data-slot$=".p"]');
  const k=s.dataset.slot; disarmSlot(); setSlotVal(k,''); afterSchedMutate();
  armSlot(k);
  const pk=[...document.querySelectorAll('#eRoster .rpuck[data-person]')];
  const ok=pk.filter(x=>!x.classList.contains('no')).map(x=>x.dataset.person)
    .filter(id=>!/allavail|allsans/i.test(id));
  const rules=slotRules(k);
  const out='rules.aar='+rules.aar+' · selectable '+ok.length
   +' · darkened '+pk.filter(x=>x.classList.contains('no')).length
   +' · all '+(rules.aar||'-')+' current='+(rules.aar?ok.every(id=>aarOK(id,rules.aar)):'n/a')
   +' · reason sample="'+((pk.find(x=>x.classList.contains('no'))||{dataset:{}}).dataset.why||'')+'"';
  disarmSlot(); return out;}));
await b.close();console.log('aar done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
