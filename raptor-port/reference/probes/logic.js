/* B50 — the Logic tab: every value read from the live engine, nothing hardcoded. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,tag] of [[1500,950,'desk'],[390,844,'phone']]){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
 await p.evaluate(()=>go('logic'));await p.waitForTimeout(600);
 console.log('\n---',tag);
 console.log(' shell    :',await p.evaluate(()=>{
   const on=document.querySelector('.page.on').id;
   return `${on} · ${document.querySelectorAll('#lgBody .lggrp').length} groups · `
     +`${document.querySelectorAll('#lgBody .lgrule').length} rules`;}));
 console.log(' count    :',await p.evaluate(()=>document.getElementById('lgCount').textContent));
 console.log(' overflow :',await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
 /* the whole point: the page must move when the engine moves */
 console.log(' live     :',await p.evaluate(()=>{
   const txt=()=>document.getElementById('lgBody').textContent;
   const before=/12h clear/.test(txt())||/\b12h\b/.test(txt());
   VCONF.crewRest=600; renderLogic();
   const after=/\b10h\b/.test(txt());
   VCONF.crewRest=720; renderLogic();
   const back=/\b12h\b/.test(txt());
   return `crew rest 12h shown ${before} → set 600 → shows 10h ${after} → restored ${back}`;}));
 console.log(' fired    :',await p.evaluate(()=>{
   const rows=[...document.querySelectorAll('#lgBody .lgfired.on')].map(x=>x.textContent);
   return rows.length+' codes fired · e.g. '+(rows[0]||'none');}));
 console.log(' search   :',await p.evaluate(()=>{
   const i=document.getElementById('lgSearch'); i.value='crew rest';
   i.dispatchEvent(new Event('input',{bubbles:true}));
   const n=document.querySelectorAll('#lgBody .lgrule').length;
   i.value=''; i.dispatchEvent(new Event('input',{bubbles:true}));
   return `"crew rest" → ${n} rules · cleared → ${document.querySelectorAll('#lgBody .lgrule').length}`;}));
 console.log(' filter   :',await p.evaluate(()=>{
   const hit=k=>{document.querySelector(`[data-lgf="${k}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}));
     return document.querySelectorAll('#lgBody .lgrule').length;};
   const r=['hard','adv','note','fired','all'].map(k=>k+'='+hit(k)).join(' · ');
   return r;}));
 console.log(' readonly :',await p.evaluate(()=>
   document.querySelectorAll('#page-logic input:not(#lgSearch),#page-logic select,#page-logic [contenteditable]').length+' editable controls (want 0)'));
 if(tag==='desk')await p.screenshot({path:'/tmp/w/logic-desk.png',clip:{x:0,y:0,width:1100,height:950}});
 else await p.screenshot({path:'/tmp/w/logic-phone.png',fullPage:false});
 /* a member account sees it too */
 await p.evaluate(()=>{const b=document.getElementById('logoutBtn')||document.querySelector('[data-logout],#logout');
   if(b)b.click();});await p.waitForTimeout(500);
 await p.fill('#luser','user');await p.fill('#lpass','user');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
 console.log(' member   :',await p.evaluate(()=>{go('logic');
   return document.querySelector('.page.on').id+' · '+document.querySelectorAll('#lgBody .lgrule').length+' rules'; }));
 console.log(' errors   :',errs.length?errs.join(' | '):'none');
 await p.close();
}
await b.close();console.log('\nlogic done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
