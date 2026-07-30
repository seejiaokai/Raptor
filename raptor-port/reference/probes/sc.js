const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1600,height:1000}});
const p=await ctx.newPage(); p.setDefaultTimeout(15000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
console.log('currency  :',await p.evaluate(()=>{
  const ids=Object.keys(PEOPLE).filter(id=>!PEOPLE[id].special);
  const d=ids.filter(id=>PEOPLE[id].quals.scDay), n=ids.filter(id=>PEOPLE[id].quals.scNight);
  const none=ids.filter(id=>!PEOPLE[id].quals.scDay&&!PEOPLE[id].quals.scNight);
  return 'SC DAY '+d.length+' · SC NIGHT '+n.length+' · neither '+none.length
   +' ('+none.slice(0,4).map(id=>PEOPLE[id].cs+'/'+PEOPLE[id].q).join(', ')+')';}));
console.log('classify  :',await p.evaluate(()=>
  [['07:00','13:00'],['13:00','19:00'],['07:00','19:00'],['13:00','21:00'],['19:00','07:00'],['06:00','12:00']]
  .map(([a,c])=>a+'-'+c+'='+scShiftKind(parseHM(a),parseHM(c)<parseHM(a)?parseHM(c)+1440:parseHM(c))).join('  ')));
// build an SC and staff it deliberately
console.log('day shift :',await p.evaluate(()=>{
  addWave(0,'sc');
  const sc=DAYS[0].waves.find(w=>w.kind==='sc');
  const ids=Object.keys(PEOPLE).filter(id=>!PEOPLE[id].special);
  const dayOnly=ids.find(id=>PEOPLE[id].quals.scDay&&!PEOPLE[id].quals.scNight);
  const nightOnly=ids.find(id=>PEOPLE[id].quals.scNight&&!PEOPLE[id].quals.scDay)
    ||(()=>{const x=ids.find(id=>PEOPLE[id].quals.scNight);PEOPLE[x].quals.scDay=false;return x;})();
  const neither=ids.find(id=>!PEOPLE[id].quals.scDay&&!PEOPLE[id].quals.scNight);
  const am=sc.formations[0];
  am.aircraft[0].p=dayOnly;      // fine on 07:00-13:00
  am.aircraft[1].p=nightOnly;    // night-only on a day shift -> flag
  am.aircraft[2].p=neither;      // SPARE, not current at all -> flag
  afterSchedMutate();
  const W=validate();
  const hits=W.all.filter(x=>x.code==='SC_QUAL');
  return 'AM 07:00-13:00 · '+PEOPLE[dayOnly].cs+'(day) '+PEOPLE[nightOnly].cs+'(night) '+PEOPLE[neither].cs+'(none,SPARE)'
   +' → SC_QUAL '+hits.length+' '+JSON.stringify(hits.map(h=>h.sev+': '+h.msg));}));
console.log('night shft:',await p.evaluate(()=>{
  const sc=DAYS[0].waves.find(w=>w.kind==='sc');
  const am=sc.formations[0];
  am.to='13:00'; am.ld='21:00';     // crew change moved — now a night shift
  afterSchedMutate();
  const W=validate();
  const hits=W.all.filter(x=>x.code==='SC_QUAL');
  return 'shift moved to 13:00-21:00 → SC_QUAL '+hits.length+' '+JSON.stringify(hits.map(h=>h.msg));}));
console.log('both ok   :',await p.evaluate(()=>{
  const sc=DAYS[0].waves.find(w=>w.kind==='sc');
  const both=Object.keys(PEOPLE).find(id=>PEOPLE[id].quals.scDay&&PEOPLE[id].quals.scNight);
  sc.formations[0].aircraft.forEach(a=>{a.p=both;a.w='';});
  afterSchedMutate();
  const W=validate();
  return PEOPLE[both].cs+' holds both → SC_QUAL '+W.all.filter(x=>x.code==='SC_QUAL').length;}));
console.log('not SC    :',await p.evaluate(()=>{
  // an ordinary flying wave must not be touched by this rule
  const neither=Object.keys(PEOPLE).find(id=>!PEOPLE[id].special&&!PEOPLE[id].quals.scDay&&!PEOPLE[id].quals.scNight);
  DAYS[0].waves.find(w=>!isStandalone(w)).formations[0].aircraft[0].p=neither;
  afterSchedMutate();
  const W=validate();
  return 'ordinary wave with '+PEOPLE[neither].cs+' → SC_QUAL '+W.all.filter(x=>x.code==='SC_QUAL').length+' (want 0)';}));
console.log('avalon    :',await p.evaluate(()=>{
  addWave(0,'avalon');
  const av=DAYS[0].waves.find(w=>w.kind==='avalon');
  const dayOnly=Object.keys(PEOPLE).find(id=>PEOPLE[id].quals.scDay&&!PEOPLE[id].quals.scNight);
  av.formations[0].aircraft[0].p=dayOnly;
  afterSchedMutate();
  const W=validate();
  return 'AVALON 19:00-07:00 with a day-only body → SC_QUAL '+W.all.filter(x=>x.code==='SC_QUAL').length+' (want 0, AVALON is exempt)';}));
await p.evaluate(()=>go('quals'));await p.waitForTimeout(500);
console.log('quals page:',await p.evaluate(()=>{
  const hs=[...document.querySelectorAll('#qtbl thead th')].map(x=>x.textContent);
  return 'headers ['+hs.join('|')+'] · scq ticks '+document.querySelectorAll('#qtbl td.scq-on').length;}));
await p.locator('#qtbl').screenshot({path:'/tmp/b30-quals.png'});
await b.close();console.log('sc done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
