const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,tag] of [[1440,900,'desk'],[390,844,'phone']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');await p.waitForTimeout(800);
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.screenshot({path:`/tmp/w/top-${tag}.png`,clip:{x:0,y:0,width:Math.min(w,900),height:tag==='desk'?110:150}});
  await p.close();
}
/* and a bad password still prints the error without shifting the button off screen */
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await p.goto('file:///home/claude/scheduler.html');await p.waitForTimeout(700);
await p.fill('#luser','a');await p.fill('#lpass','wrong');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(400);
console.log('err text:',await p.evaluate(()=>document.getElementById('lerr').textContent));
await p.screenshot({path:'/tmp/w/lgn-err.png',clip:{x:1050,y:220,width:390,height:560}});
await b.close();console.log('lgn2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
