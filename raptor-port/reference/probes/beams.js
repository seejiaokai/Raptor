const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  addWave(0,'sc'); afterSchedMutate();
  const d=DAYS[0], w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
  const AM=w.formations[0], PM=w.formations[1];
  const iM=AM.aircraft.findIndex(a=>!a.spare), jM=PM.aircraft.findIndex(a=>!a.spare);
  const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].cs==='Beams')||Object.keys(PEOPLE)[0];
  AM.aircraft[iM].p=id; afterSchedMutate();
  const key=`0.${gi}.1.${jM}.p`;
  disarmSlot(); armSlot(key);
  const el=document.querySelector('#eRoster .rpuck[data-person="'+id+'"]');
  const before=slotVal(key);
  const cls=el?el.className:'MISSING';
  el&&el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return `${PEOPLE[id].cs} on SC AM MAIN, planning SC PM MAIN\n`
    +`  palette class : ${cls}\n`
    +`  slotBar       : "${slotBar(id,key)||'(clear)'}"\n`
    +`  click result  : "${before}" -> "${slotVal(key)}"  ${slotVal(key)===id?'PLANNED OK':'DID NOT PLANT'}`;}));
await b.close();console.log('beams done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
