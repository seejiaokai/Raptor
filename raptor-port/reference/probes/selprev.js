const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
const snap=()=>p.evaluate(()=>({wfoc:document.querySelectorAll('.puck.wfoc').length,
  sel:document.querySelectorAll('.puck.sel').length,
  open:document.querySelectorAll('.dwbox').length,
  focRing:!!document.querySelector('.witem.on,.wln.on')}));
console.log('resting   :',JSON.stringify(await snap()));
// focus one warning
await p.evaluate(()=>{const s=document.querySelector('#vWeek [data-daywarn]');
  s.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
await p.waitForTimeout(300);
await p.evaluate(()=>{const it=document.querySelector('#vWeek .witem[data-wdi]');
  if(it)it.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
await p.waitForTimeout(400);
console.log('warn focus:',JSON.stringify(await snap()));
// click a puck, then click it again
const r=await p.evaluate(async()=>{
  const pk=document.querySelector('#vWeek .puck[data-person]:not(.wfoc)');
  pk.scrollIntoView({block:'center'});
  pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  await new Promise(r=>setTimeout(r,250));
  const mid={wfoc:document.querySelectorAll('.puck.wfoc').length,sel:document.querySelectorAll('.puck.sel').length};
  const id=pk.dataset.person;
  document.querySelector('.puck[data-person="'+id+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  await new Promise(r=>setTimeout(r,250));
  return JSON.stringify(mid);});
console.log('after puck:',r);
console.log('after undo:',JSON.stringify(await snap()),'  ← should match "warn focus"');
await b.close();console.log('selprev done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
