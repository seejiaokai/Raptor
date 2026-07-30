const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,tag] of [[1440,900,'desk'],[390,844,'phone']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.waitForTimeout(900);
  const m=await p.evaluate(()=>{
    const el=s=>document.querySelector(s);
    const r=s=>{const e=el(s);return e?e.getBoundingClientRect():null;};
    const doc=document.documentElement;
    return {wrap:!!el('.login-wrap'),brand:!!el('.login-brand'),keys:document.querySelectorAll('.lb-keys li').length,
      word:(el('.lb-word')||{}).textContent,glyph:!!el('.lb-glyph'),
      stamp:(el('#bstamp')||{}).textContent,build:!!el('.login-build'),
      cardW:Math.round((r('.login-card')||{width:0}).width),
      hOverflow:doc.scrollWidth-doc.clientWidth,
      cardTop:Math.round((r('.login-card')||{top:0}).top),
      brandTop:Math.round((r('.login-brand')||{top:0}).top),
      focus:document.activeElement?document.activeElement.id:'-'};});
  console.log(tag,JSON.stringify(m));
  await p.screenshot({path:`/tmp/w/lgn-${tag}.png`,fullPage:false});
  /* and it still signs in */
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(700);
  console.log(tag,'signed in:',await p.evaluate(()=>!document.getElementById('shell').hidden),
    '· topbar:',await p.evaluate(()=>(document.querySelector('.topbar .mark')||{}).textContent));
  await p.close();
}
await b.close();console.log('lgn done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
