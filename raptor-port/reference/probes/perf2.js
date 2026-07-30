/* B54 — what is left in the floor once the week is diffed. Times each piece of a
   no-op afterSchedMutate separately so the next cut is chosen from evidence. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const cfg of [{n:'DESKTOP',w:1500,h:950,cpu:1},{n:'PHONE 4x',w:390,h:844,cpu:4,touch:true}]){
  const ctx=await b.newContext({viewport:{width:cfg.w,height:cfg.h},deviceScaleFactor:2,
    hasTouch:!!cfg.touch,isMobile:!!cfg.touch});
  const p=await ctx.newPage(); p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  const cdp=await ctx.newCDPSession(p);
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(900);
  if(cfg.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cfg.cpu});
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const flush=()=>document.getElementById('eWeek').offsetHeight;
    const med=(f,n)=>{const a=[];for(let i=0;i<n;i++){const t=performance.now();f();flush();
      a.push(performance.now()-t);} a.sort((x,y)=>x-y); return +a[a.length>>1].toFixed(1);};
    const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special); let k=0;
    return {
      validate:      med(()=>validate(),9),
      buildWeekStr:  med(()=>{DAYS.map((d,di)=>dayHTML(di,true)).join('');},7),
      /* the app's own path, i.e. through setHTML — not a raw write */
      legend:        med(()=>{const g=legendHTML();
                        document.querySelectorAll('#page-editsched .legend').forEach(l=>setHTML(l,g));},7),
      editRoster:    med(()=>renderEditRoster(),7),
      highlights:    med(()=>refreshHighlights(),7),
      fitDays:       med(()=>fitDays(),7),
      hsSync:        med(()=>hsSync(),7),
      noopWhole:     med(()=>afterSchedMutate(),7),
      oneDayEdit:    med(()=>{const s=document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"],#eWeek [data-day="1"] .empty-slot[data-slot$=".p"]');
                        if(s)fillSlot(s.dataset.slot,ids[(k++)%ids.length]); afterSchedMutate();},7),
      rosterNodes:   (document.getElementById('eRoster')||{}).getElementsByTagName
                        ? document.getElementById('eRoster').getElementsByTagName('*').length : -1,
    };});
  console.log(cfg.n.padEnd(9),JSON.stringify(r));
  await p.close();await ctx.close();
}
await b.close();console.log('perf2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
