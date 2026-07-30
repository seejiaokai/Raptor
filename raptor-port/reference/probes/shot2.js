const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const [nm,vp] of [['m',{width:390,height:900}],['d',{width:1600,height:1000}]]){
   const p=await b.newPage({viewport:vp,deviceScaleFactor:2});
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
   await p.locator('#vWeek .sec-sim').first().screenshot({path:`/tmp/b11-sim-${nm}.png`});
   await p.locator('#vWeek .go').first().screenshot({path:`/tmp/b11-fly-${nm}.png`});
   await p.locator('#vWeek .sec-dnco').first().screenshot({path:`/tmp/b11-inp-${nm}.png`});
   await p.close();
 }
 await b.close();
 console.log('shots done');
})();
