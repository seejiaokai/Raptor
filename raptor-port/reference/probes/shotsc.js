const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,tag] of [[1600,1000,'desk'],[390,844,'phone']]){
  const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);
  await p.evaluate(()=>{const d=DAYS[0];
    addWave(0,'sc'); afterSchedMutate();
    const wv=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(wv);
    const AM=wv.formations[0], PM=wv.formations[1];
    const mAM=AM.aircraft.findIndex(a=>!a.spare), mPM=PM.aircraft.findIndex(a=>!a.spare);
    const id=Object.keys(PEOPLE).find(x=>PEOPLE[x].cs==='Beams');
    AM.aircraft[mAM].p=id; afterSchedMutate();
    disarmSlot(); armSlot(`0.${gi}.1.${mPM}.p`);});
  await p.waitForTimeout(600);
  await p.screenshot({path:`/tmp/w/sc-${tag}.png`,fullPage:false});
  await p.close();
}
await b.close();console.log('shots done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
