const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1600,height:1000}});
const p=await ctx.newPage(); p.setDefaultTimeout(20000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
console.log('appointed   :', await p.evaluate(()=>{
  const s=Object.keys(PEOPLE).filter(isScheduler);
  return s.length+' of '+Object.keys(PEOPLE).filter(id=>!PEOPLE[id].special).length+' · '+s.map(id=>PEOPLE[id].cs).join(', ');}));
await p.evaluate(()=>go('quals'));await p.waitForTimeout(600);
console.log('quals column:', await p.evaluate(()=>{
  const hs=[...document.querySelectorAll('#qtbl thead th')].map(x=>x.textContent);
  const ticks=document.querySelectorAll('#qtbl td.qcell.apt-on').length;
  return 'headers ['+hs.join('|')+'] · scheduler ticks '+ticks;}));
await p.locator('#qtbl').screenshot({path:'/tmp/b24-quals.png'});
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);
console.log('dropdowns   :', await p.evaluate(()=>{
  const bar=document.querySelector('#eWeek .day[data-day="0"] .signoff');
  return ['cur','sked','plan','appr'].map(k=>{
    const s=bar.querySelector('select[data-sign="'+k+'"]');
    return k+'='+(s.options.length-1);}).join(' · ');}));
console.log('sked names  :', await p.evaluate(()=>{
  const s=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="sked"]');
  const names=[...s.options].slice(1).map(o=>o.textContent);
  const bad=[...s.options].slice(1).filter(o=>!isScheduler(o.value)).map(o=>o.textContent);
  return names.length+' · '+names.join(',')+' · non-schedulers '+bad.length;}));
console.log('cur is open :', await p.evaluate(()=>{
  const s=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="cur"]');
  return (s.options.length-1)+' names, includes non-schedulers: '
    +[...s.options].slice(1).some(o=>!isScheduler(o.value));}));
// tick one more on the quals page and watch the list grow
console.log('grant       :', await p.evaluate(()=>{
  const id=Object.keys(PEOPLE).find(x=>!PEOPLE[x].special&&!isScheduler(x));
  PEOPLE[id].quals.sched=true; reflow();
  const s=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="plan"]');
  return PEOPLE[id].cs+' now offered: '+[...s.options].some(o=>o.value===id);}));
// a signed name survives losing the appointment
console.log('withdraw    :', await p.evaluate(()=>{
  const sel=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="appr"]');
  const id=sel.options[1].value;
  sel.value=id; sel.dispatchEvent(new Event('change',{bubbles:true}));
  PEOPLE[id].quals.sched=false; reflow();
  const s2=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="appr"]');
  return PEOPLE[id].cs+' still shown '+(s2.value===id)+' · still in list '+[...s2.options].some(o=>o.value===id);}));
await p.locator('#eWeek .day[data-day="0"] .signoff').screenshot({path:'/tmp/b24-sign.png'});
await b.close();console.log('sched done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
