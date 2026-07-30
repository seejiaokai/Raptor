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
  await p.evaluate(()=>go('editsched')); await p.waitForTimeout(800);
  console.log('=== W'+vp.width);
  console.log('  no popup left  :', await p.evaluate(()=>!document.getElementById('assignPop')));
  console.log('  palette        :', await p.evaluate(()=>{
    const el=document.getElementById('eRoster'); const cs=getComputedStyle(el);
    return 'pucks '+el.querySelectorAll('.rpuck').length+' · cols '+el.querySelectorAll('.rcol').length
      +' · pos '+cs.position+' · tab '+getComputedStyle(el.querySelector('.ros-tab')).display
      +' · visible '+(el.getBoundingClientRect().width>10);}));
  // arm an empty slot
  console.log('  arm empty slot :', await p.evaluate(()=>{
    if(!editMode())document.getElementById('editToggle').click();
    let s=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')].find(x=>!slotVal(x.dataset.slot));
    if(!s){ // make one: clear the first seat we can find
      const f=document.querySelector('#eWeek .acrow .seat[data-slot]');
      setSlotVal(f.dataset.slot,''); afterSchedMutate();
      s=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')].find(x=>!slotVal(x.dataset.slot));}
    if(!s)return 'no empty seat';
    s.scrollIntoView({block:'center'});
    s.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const armed=document.querySelectorAll('.armed').length;
    const ros=document.getElementById('eRoster');
    const no=ros.querySelectorAll('.rpuck.no').length, tot=ros.querySelectorAll('.rpuck').length;
    const key=s.dataset.slot;
    const leak=[...ros.querySelectorAll('.rpuck:not(.no)')].map(x=>x.dataset.person)
      .filter(id=>PEOPLE[id]&&!PEOPLE[id].special&&slotBar(id,key));
    return `key ${key} · ringed ${armed} · palette ${tot} (${no} darkened) · leaked ${leak.length}`
      +` · header "${(ros.querySelector('.ros-arm')||{}).textContent||''}"`;}));
  // place a name
  console.log('  place name     :', await p.evaluate(()=>{
    const ros=document.getElementById('eRoster');
    const good=[...ros.querySelectorAll('.rpuck:not(.no)')].find(x=>PEOPLE[x.dataset.person]&&!PEOPLE[x.dataset.person].special);
    if(!good)return 'nobody eligible';
    const key=armedKey(); if(!key)return 'nothing armed';
    const id=good.dataset.person;
    good.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return `${PEOPLE[id].cs} → ${key} = "${slotVal(key)}" · armed now ${document.querySelectorAll('.armed').length}`;}));
  // a darkened name refuses
  console.log('  darkened blocks:', await p.evaluate(()=>{
    const s=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')].find(x=>!slotVal(x.dataset.slot));
    if(!s)return 'no empty seat left';
    s.scrollIntoView({block:'center'});
    s.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const ros=document.getElementById('eRoster');
    const bad=ros.querySelector('.rpuck.no');
    if(!bad)return 'nothing darkened';
    const key=armedKey(); if(!key)return 'nothing armed';
    const before=slotVal(key);
    bad.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const t=document.getElementById('toastEl');
    return `tap ${PEOPLE[bad.dataset.person].cs} → slot "${slotVal(key)}" (was "${before}") · toast "${t?t.textContent:''}"`;}));
  // filled puck = plain select, no popup
  console.log('  filled puck    :', await p.evaluate(()=>{
    disarmSlot();
    const pk=document.querySelector('#eWeek .acrow .seat[data-slot] .puck[data-person]');
    pk.scrollIntoView({block:'center'});
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    return `selected ${document.querySelectorAll('#eWeek .puck.sel').length} · popup ${!!document.getElementById('assignPop')} · armed ${document.querySelectorAll('.armed').length}`;}));
  await ctx.close();
 }
 await b.close(); console.log('pal done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
