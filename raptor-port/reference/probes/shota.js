const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:1500,height:900},deviceScaleFactor:2})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);
await p.evaluate(()=>{const d=DAYS[0];
  addWave(0,'sc'); afterSchedMutate();
  const wv=d.waves.find(x=>x.kind==='sc'), AM=wv.formations[0];
  const A=Object.keys(PEOPLE).find(x=>PEOPLE[x].cs==='Beams');
  const B=Object.keys(PEOPLE).find(x=>PEOPLE[x].cs==='Boosh');
  AM.aircraft[AM.aircraft.findIndex(a=>!a.spare)].p=A;
  AM.aircraft[AM.aircraft.findIndex(a=>!a.spare)].w=B;
  const g=(d.ground||[])[0]; if(g){g.who=PEOPLE[A].cs;g.str='09:00';g.end='10:00';}
  const dr=(d.dutywaves||[])[0]&&d.dutywaves[0].rows[0];
  if(dr){dr.id=B;dr.str='09:00';dr.end='10:00';}
  afterSchedMutate();
  const el=[...document.querySelectorAll('.day[data-day="0"] .sa-wave, .day[data-day="0"] .wave')]
    .find(x=>/SC/.test(x.textContent));
  (el||document.querySelector('.day[data-day="0"]')).scrollIntoView({block:'center'});});
await p.waitForTimeout(700);
await p.evaluate(()=>{const e=[...document.querySelectorAll('.day[data-day="0"] .puck[data-person]')]
  .find(x=>x.querySelector('.lchip'));
  if(e)e.scrollIntoView({block:'center'});});
await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/w/sc-chip.png'});
await b.close();console.log('shot done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
