/* B47 — no Publish all days; the day's own button is the blue one and darkens
   until the four sign-offs are in. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,tag] of [[1500,950,'desk'],[390,844,'phone']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);
  const paint=async()=>await p.evaluate(()=>{const el=document.querySelector('#eWeek button.dbeak[data-beak="0"]');
    const c=getComputedStyle(el);
    return {txt:el.textContent.trim(),disabled:el.disabled,bg:c.backgroundColor,fg:c.color,
      op:c.opacity,fs:c.fontSize,bd:c.borderStyle};});
  console.log(tag,'unsigned :',JSON.stringify(await paint()));
  console.log(tag,'banner   :',await p.evaluate(()=>document.getElementById('eBanner').textContent.trim()));
  console.log(tag,'pub-all  :',await p.evaluate(()=>!!document.getElementById('beakAllBtn')));
  await p.evaluate(`(()=>{['cur','sked','plan','appr'].forEach((k,i)=>{
    const s=document.querySelector('#eWeek .day[data-day="0"] select[data-sign="'+k+'"]');
    s.value=s.options[i+2].value; s.dispatchEvent(new Event('change',{bubbles:true}));});})()`);
  await p.waitForTimeout(500);
  console.log(tag,'signed   :',JSON.stringify(await paint()));
  if(tag==='desk'){
    const el=await p.$('#eWeek .day[data-day="0"] .day-head');
    const r=await el.boundingBox();
    await p.screenshot({path:'/tmp/w/pub-head.png',clip:{x:r.x-6,y:r.y-6,width:Math.min(620,r.width+12),height:r.height+12}});
  }
  await p.click('#eWeek button.dbeak[data-beak="0"]');await p.waitForTimeout(500);
  console.log(tag,'published:',JSON.stringify(await paint()));
  await p.close();
}
await b.close();console.log('pubday done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
