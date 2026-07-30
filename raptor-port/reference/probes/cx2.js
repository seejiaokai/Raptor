const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const vp of [{width:390,height:900,t:true},{width:1600,height:1000,t:false}]){
const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:vp.t,isMobile:vp.t});
const p=await ctx.newPage(); p.setDefaultTimeout(15000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
await p.evaluate(()=>{go('editsched');openScheduler(0);});await p.waitForTimeout(700);
console.log('--- W'+vp.width);
console.log(' click CX   :',await p.evaluate(()=>{
  const b2=document.querySelector('#sbBoard .mbtn[data-lcx]'); b2.scrollIntoView({block:'center'});
  b2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const pop=document.getElementById('cxPop');
  return 'box open='+!pop.hidden+' title="'+document.getElementById('cxTitle').textContent+'"'
   +' · save="'+document.getElementById('cxSave').textContent+'"'
   +' · uncancel hidden='+document.getElementById('cxUn').hidden
   +' · quick='+document.querySelectorAll('#cxQuick [data-cxq]').length
   +' · already cx='+!!CXT.o.cx;}));
console.log(' quick pick :',await p.evaluate(()=>{
  document.querySelector('#cxQuick [data-cxq="U/S AIRCRAFT"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return 'field="'+document.getElementById('cxReason').value+'"';}));
console.log(' save       :',await p.evaluate(()=>{
  const o=CXT.o; document.getElementById('cxSave').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return 'cx='+o.cx+' reason="'+o.cxr+'" · tag="'+cxText(o)+'" · box closed='+document.getElementById('cxPop').hidden
   +' · pending='+Object.keys(SCHED.pending).length;}));
console.log(' rendered   :',await p.evaluate(()=>{
  const t=[...document.querySelectorAll('#vWeek .cxtag,#eWeek .cxtag,#sbBoard .cxtag')].map(x=>x.textContent);
  return JSON.stringify([...new Set(t)]);}));
console.log(' reopen     :',await p.evaluate(()=>{
  const b2=document.querySelector('#sbBoard .mbtn[data-lcx].on')||document.querySelector('#sbBoard .mbtn[data-lcx]');
  b2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return 'title="'+document.getElementById('cxTitle').textContent+'" prefilled="'+document.getElementById('cxReason').value+'"'
   +' · uncancel shown='+!document.getElementById('cxUn').hidden+' · save="'+document.getElementById('cxSave').textContent+'"';}));
console.log(' un-cancel  :',await p.evaluate(()=>{
  const o=CXT.o; document.getElementById('cxUn').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return 'cx='+o.cx+' reason='+JSON.stringify(o.cxr)+' · tags now '+document.querySelectorAll('.cxtag').length;}));
if(vp.width===390){
  await p.evaluate(()=>{const b2=document.querySelector('#sbBoard .mbtn[data-lcx]');b2.scrollIntoView({block:'center'});
    b2.dispatchEvent(new MouseEvent('click',{bubbles:true}));document.getElementById('cxReason').value='U/S AIRCRAFT';});
  await p.waitForTimeout(250); await p.screenshot({path:'/tmp/b28-box.png'});
  await p.evaluate(()=>document.getElementById('cxSave').click()); await p.waitForTimeout(350);
  await p.evaluate(()=>{closeScheduler();go('viewsched');}); await p.waitForTimeout(500);
  await p.evaluate(()=>{const t=document.querySelector('#vWeek .cxtag');if(t)t.scrollIntoView({block:'center'});});
  await p.waitForTimeout(300);
  await p.locator('#vWeek .go').first().screenshot({path:'/tmp/b28-week.png'});}
await ctx.close();}
await b.close();console.log('cx2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
