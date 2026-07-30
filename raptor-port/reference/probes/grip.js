const {chromium}=require('playwright');
const drag=(dy)=>`(async()=>{
  const g=document.getElementById('sbGrip');
  const r=g.getBoundingClientRect();
  const x=Math.round(r.x+r.width/2), y=Math.round(r.y+r.height/2);
  const ev=(t,yy)=>{const e=new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:1,pointerType:'touch',isPrimary:true,clientX:x,clientY:yy});g.dispatchEvent(e);};
  const s=m=>new Promise(r2=>setTimeout(r2,m));
  ev('pointerdown',y); await s(30);
  for(let i=1;i<=6;i++){ev('pointermove',y+(${dy})*i/6); await s(16);}
  await s(20); ev('pointerup',y+(${dy})); await s(120);
  return getComputedStyle(document.getElementById('sbSide')).maxHeight;})()`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
const p=await ctx.newPage(); p.setDefaultTimeout(20000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(600);
await p.evaluate(()=>openScheduler(0));await p.waitForTimeout(700);
const sizes=()=>p.evaluate(()=>{const side=document.getElementById('sbSide'),g=document.getElementById('sbGrip');
  const bw=document.querySelector('.sb-boardwrap');
  return 'grip '+getComputedStyle(g).display+' h'+Math.round(g.getBoundingClientRect().height)
   +' · side '+Math.round(side.getBoundingClientRect().height)+'px ('+getComputedStyle(side).maxHeight+')'
   +' · board visible '+Math.round(Math.min(side.getBoundingClientRect().top,innerHeight))+'px';});
console.log('start     :',await sizes());
await p.screenshot({path:'/tmp/b25-before.png'});
console.log('drag up   :',await p.evaluate(drag(-220)),'|',await sizes());
await p.screenshot({path:'/tmp/b25-tall.png'});
console.log('drag down :',await p.evaluate(drag(320)),'|',await sizes());
await p.screenshot({path:'/tmp/b25-short.png'});
console.log('clamp max :',await p.evaluate(drag(-2000)),'|',await sizes());
console.log('clamp min :',await p.evaluate(drag(2000)),'|',await sizes());
console.log('dbl reset :',await p.evaluate(()=>{const g=document.getElementById('sbGrip');
  g.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));
  return getComputedStyle(document.getElementById('sbSide')).maxHeight;}));
console.log('survives  :',await p.evaluate(async()=>{
  document.documentElement.style.setProperty('--sbside','62vh');
  closeScheduler(); await new Promise(r=>setTimeout(r,300)); openScheduler(2);
  await new Promise(r=>setTimeout(r,300));
  return getComputedStyle(document.getElementById('sbSide')).maxHeight;}));
console.log('desktop   :',await p.evaluate(async()=>{document.getElementById('sbWide').click();
  await new Promise(r=>setTimeout(r,300));
  return 'grip '+getComputedStyle(document.getElementById('sbGrip')).display;}));
await ctx.close();
{const c2=await b.newContext({viewport:{width:1600,height:1000}});const q=await c2.newPage();
 await q.goto('file:///home/claude/scheduler.html');await q.fill('#luser','a');await q.fill('#lpass','a');
 await q.click('#loginForm button[type=submit]');await q.waitForTimeout(900);
 await q.evaluate(()=>{go('editsched');openScheduler(0);});await q.waitForTimeout(700);
 console.log('W1600     :',await q.evaluate(()=>'grip '+getComputedStyle(document.getElementById('sbGrip')).display
   +' · side '+Math.round(document.getElementById('sbSide').getBoundingClientRect().width)+'px wide'));
 await c2.close();}
await b.close();console.log('grip done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
