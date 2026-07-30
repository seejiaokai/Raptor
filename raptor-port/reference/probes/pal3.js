const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const vp of [{width:1600,height:1000},{width:390,height:900}]){
  const ctx=await b.newContext(Object.assign({viewport:vp},vp.width<800?{hasTouch:true,isMobile:true}:{}));
  const p=await ctx.newPage(); p.setDefaultTimeout(20000);
  p.on('pageerror',e=>console.log(' PAGEERR',e.message));
  await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched')); await p.waitForTimeout(600);
  await p.evaluate(()=>openScheduler(0)); await p.waitForTimeout(800);
  console.log('=== board W'+vp.width);
  for(const seat of ['p','w']){
   console.log('  '+(seat==='p'?'FCP':'RCP')+' :', await p.evaluate(st=>{
    // empty a flying seat on the board, then arm it via a real click
    const all=[...document.querySelectorAll('#sbBoard .seat[data-slot]')]
      .filter(x=>x.dataset.slot.indexOf(':')<0&&x.dataset.slot.endsWith('.'+st));
    if(!all.length)return 'no '+st+' seat';
    const key=all[0].dataset.slot;
    setSlotVal(key,''); afterSchedMutate();
    const el=[...document.querySelectorAll('#sbBoard [data-slot]')].find(x=>x.dataset.slot===key);
    el.scrollIntoView({block:'center'});
    el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    if(armedKey()!==key)return 'did not arm ('+armedKey()+')';
    const r=document.getElementById('sbRoster');
    const no=r.querySelectorAll('.rpuck.no').length;
    const leak=[...r.querySelectorAll('.rpuck:not(.no)')].map(x=>x.dataset.person)
      .filter(id=>PEOPLE[id]&&!PEOPLE[id].special&&slotBar(id,key));
    // refuse a darkened one
    const bad=r.querySelector('.rpuck.no');
    let refused='n/a';
    if(bad){bad.dispatchEvent(new MouseEvent('click',{bubbles:true}));
      refused=`${PEOPLE[bad.dataset.person].cs} blocked=${slotVal(key)===''} armed=${armedKey()===key}`;}
    // then a good one
    const good=[...r.querySelectorAll('.rpuck:not(.no)')].find(x=>PEOPLE[x.dataset.person]&&!PEOPLE[x.dataset.person].special);
    good.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return `darkened ${no} · leaked ${leak.length} · refuse[${refused}] · placed ${PEOPLE[good.dataset.person].cs}="${slotVal(key)}" · disarmed ${!armedKey()}`;},seat));
  }
  // append key on a ground/programme row
  console.log('  append   :', await p.evaluate(()=>{
    const c=[...document.querySelectorAll('#sbBoard [data-fill]')].find(x=>x.getBoundingClientRect().width>3);
    if(!c)return 'no fill cell';
    c.scrollIntoView({block:'center'});
    const before=document.querySelectorAll('#sbBoard .rpuck,#sbBoard .puck[data-person]').length;
    c.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    if(!armedKey())return 'did not arm';
    const good=[...document.querySelectorAll('#sbRoster .rpuck:not(.no)')].find(x=>PEOPLE[x.dataset.person]&&!PEOPLE[x.dataset.person].special);
    const id=good.dataset.person;
    good.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const now=[...document.querySelectorAll('#sbBoard .puck[data-person]')].map(x=>x.dataset.person);
    return `key ${c.dataset.fill} · added ${PEOPLE[id].cs} · present ${now.includes(id)} · disarmed ${!armedKey()}`;}));
  await ctx.close();
 }
 await b.close(); console.log('pal3 done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
