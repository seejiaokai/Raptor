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
  console.log('=== W'+vp.width);
  // view page first — the reference behaviour
  console.log('  view week :', await p.evaluate(()=>{
    const pk=document.querySelector('#vWeek .acrow .seat .puck[data-person]');
    pk.scrollIntoView({block:'center'}); pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return PEOPLE[pk.dataset.person].cs+' → sel '+document.querySelectorAll('#vWeek .puck.sel').length
      +' · dayboxes open '+document.querySelectorAll('.dwbox').length;}));
  await p.evaluate(()=>go('editsched')); await p.waitForTimeout(700);
  console.log('  edit week :', await p.evaluate(()=>{
    const pk=document.querySelector('#eWeek .acrow .seat .puck[data-person]');
    pk.scrollIntoView({block:'center'}); pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return PEOPLE[pk.dataset.person].cs+' → sel '+document.querySelectorAll('#eWeek .puck.sel').length
      +' · armed '+(armedKey()||'none')+' · dayboxes '+document.querySelectorAll('.dwbox').length;}));
  await p.evaluate(()=>openScheduler(0)); await p.waitForTimeout(700);
  console.log('  board     :', await p.evaluate(()=>{
    const pk=[...document.querySelectorAll('#sbBoard .seat .puck[data-person]')][1];
    pk.scrollIntoView({block:'center'}); pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return PEOPLE[pk.dataset.person].cs+' → sel '+document.querySelectorAll('#sbBoard .puck.sel').length
      +' · armed '+(armedKey()||'none');}));
  await ctx.close();
 }
 await b.close(); console.log('sel done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
