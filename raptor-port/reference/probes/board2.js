const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const vp of [{width:390,height:900,t:true},{width:1600,height:1000,t:false}]){
const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:vp.t,isMobile:vp.t});
const p=await ctx.newPage(); p.setDefaultTimeout(15000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto(F);await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
await p.evaluate(()=>{go('editsched');openScheduler(0);});await p.waitForTimeout(700);
console.log('--- W'+vp.width);
const stat=()=>p.evaluate(()=>{
  const seats=[...document.querySelectorAll('#sbBoard .seat[data-slot]')];
  const hit=e=>{const q=e.getBoundingClientRect();const t=document.elementFromPoint(Math.round(q.x+q.width/2),Math.round(q.y+q.height/2));return !!(t&&e.contains(t));};
  const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.top>0&&q.bottom<innerHeight;};
  return 'visible '+seats.filter(vis).length+'/'+seats.length+' hittable '+seats.filter(x=>vis(x)&&hit(x)).length;});
console.log(' slots at top   :',await stat());
console.log(' signoff        :',await p.evaluate(()=>{
  const el=document.getElementById('sbSignBar');
  return 'inTop='+!!el.closest('.sb-top')+' inBoard='+!!el.closest('#sbBoard')
   +' top='+Math.round(el.getBoundingClientRect().top);}));
await p.evaluate(()=>{document.querySelector('.sb-main').scrollTop=500;});
await p.waitForTimeout(350);
console.log(' after scroll   :',await stat(),'| signoff top='+await p.evaluate(()=>Math.round(document.getElementById('sbSignBar').getBoundingClientRect().top))
  +' (scrolled away: '+await p.evaluate(()=>document.getElementById('sbSignBar').getBoundingClientRect().bottom<160)+')');
// tap to arm, then take a name off the palette (the dropdown is gone)
console.log(' tap a filled   :',await p.evaluate(()=>{
  const seat=[...document.querySelectorAll('#sbBoard .seat[data-slot]')].find(x=>slotVal(x.dataset.slot));
  seat.scrollIntoView({block:'center'});
  seat.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  return 'popup='+!!document.getElementById('assignPop')+' armed='+(armedKey()||'none')
   +' selected='+document.querySelectorAll('#sbBoard .puck.sel').length;}));
console.log(' arm an empty   :',await p.evaluate(()=>{
  const seat=[...document.querySelectorAll('#sbBoard .seat[data-slot]')]
    .find(x=>x.dataset.slot.indexOf(':')<0&&/\.(p|w)$/.test(x.dataset.slot));
  const k=seat.dataset.slot; setSlotVal(k,''); afterSchedMutate();
  const el=[...document.querySelectorAll('#sbBoard [data-slot]')].find(x=>x.dataset.slot===k);
  el.scrollIntoView({block:'center'});
  el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  const r=document.getElementById('sbRoster');
  return k+' · armed='+(armedKey()===k)+' · ringed='+document.querySelectorAll('.armed').length
   +' · palette '+r.querySelectorAll('.rpuck').length+' ('+r.querySelectorAll('.rpuck.no').length+' darkened)';}));
console.log(' plant a name   :',await p.evaluate(()=>{
  const k=armedKey(), before=slotVal(k);
  const good=[...document.querySelectorAll('#sbRoster .rpuck:not(.no)')]
    .find(x=>!/allavail|allsans/i.test(x.dataset.person));
  good.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  return k+': "'+before+'" -> "'+slotVal(k)+'" · disarmed='+!armedKey()
   +' · pending='+Object.keys(SCHED.pending).length;}));
console.log(' slots now      :',await stat());
if(vp.width===390){await p.evaluate(()=>{document.querySelector('.sb-main').scrollTop=0;});await p.waitForTimeout(300);
  await p.screenshot({path:'/tmp/b27-board-top.png'});
  await p.evaluate(()=>{document.querySelector('.sb-main').scrollTop=420;});await p.waitForTimeout(300);
  await p.screenshot({path:'/tmp/b27-board-scrolled.png'});}
await ctx.close();}
await b.close();console.log('board2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
