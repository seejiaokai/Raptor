/* B54 baseline — where do the 580ms actually go? Splits afterSchedMutate into
   its parts: validate, string-building, innerHTML assignment, and the tail work.
   Run against B53 to get the number the fix has to beat. */
const {chromium}=require('playwright');

(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const cfg of [{n:'DESKTOP',w:1500,h:950,cpu:1},{n:'PHONE 4x',w:390,h:844,cpu:4}]){
  const ctx=await b.newContext({viewport:{width:cfg.w,height:cfg.h},deviceScaleFactor:2,
    hasTouch:cfg.cpu>1,isMobile:cfg.cpu>1});
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  const cdp=await ctx.newCDPSession(p);
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(900);
  if(cfg.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cfg.cpu});
  await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=f=>{const t=performance.now();f();return +(performance.now()-t).toFixed(1);};
    const med=(f,n)=>{const a=[];for(let i=0;i<n;i++)a.push(T(f));a.sort((x,y)=>x-y);return a[a.length>>1];};
    /* force layout so the number includes it, the way a real frame does */
    const flush=()=>document.getElementById('eWeek').offsetHeight;

    const validate_=med(()=>{validate();},9);
    /* the string for the whole week, built but not written */
    let str='';
    const build=med(()=>{str=DAYS.map((d,di)=>dayHTML(di,true)).join('');},5);
    const write=med(()=>{document.getElementById('eWeek').innerHTML=str;flush();},5);
    const whole=med(()=>{afterSchedMutate();flush();},5);
    const board=SBDAY!=null?med(()=>{renderScheduler();},5):-1;
    const sched=med(()=>{renderSchedule('eWeek',true);flush();},5);
    return {validate_,build,write,whole,sched,board,
      days:DAYS.length,htmlLen:str.length,
      nodes:document.getElementById('eWeek').getElementsByTagName('*').length};});
  console.log(cfg.n.padEnd(9),JSON.stringify(r));
  await p.close();await ctx.close();
}
await b.close();console.log('perf0 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
