const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
const S=p=>p.evaluate(()=>({sel:document.querySelectorAll('.puck.sel').length,
  boxes:document.querySelectorAll('.dwbox').length, armed:document.querySelectorAll('.armed').length}));
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const vp of [{width:1600,height:1000},{width:390,height:900}]){
  const ctx=await b.newContext(Object.assign({viewport:vp},vp.width<800?{hasTouch:true,isMobile:true}:{}));
  const p=await ctx.newPage(); p.setDefaultTimeout(20000);
  p.on('pageerror',e=>console.log(' PAGEERR',e.message));
  await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
  console.log('=== W'+vp.width);

  const cycle=async (label,root)=>{
    // pick someone WITH a warning and someone WITHOUT, and toggle each twice
    for(const kind of ['warned','clean']){
      const r=await p.evaluate(([rt,kd])=>{
        const pks=[...document.querySelectorAll(rt+' .puck[data-person]')];
        const withW=id=>{try{return personWarnDays(id).length>0;}catch(_){return false;}};
        const pk=pks.find(x=>kd==='warned'?withW(x.dataset.person):!withW(x.dataset.person));
        if(!pk)return null;
        pk.scrollIntoView({block:'center'});
        window.__pk=pk; return PEOPLE[pk.dataset.person].cs;},[root,kind]);
      if(!r){console.log('  '+label+' '+kind+': nobody');continue;}
      await p.evaluate(()=>window.__pk.dispatchEvent(new MouseEvent('click',{bubbles:true})));
      await p.waitForTimeout(200);
      const on=await S(p);
      await p.evaluate(()=>{const id=window.__pk.dataset.person;
        const again=document.querySelector('.puck[data-person="'+id+'"]');
        again.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
      await p.waitForTimeout(200);
      const off=await S(p);
      console.log('  '+label+' '+kind.padEnd(7)+' '+r.padEnd(10)+
        ' click→ sel '+on.sel+' boxes '+on.boxes+'  ·  click again→ sel '+off.sel+' boxes '+off.boxes+
        '  '+(off.sel===0?'UNCLICKED OK':'STUCK (FAIL)'));
    }
  };
  await cycle('view','#vWeek');
  await p.evaluate(()=>go('editsched')); await p.waitForTimeout(700);
  await cycle('edit','#eWeek');

  // blank space clears
  console.log('  blank space (edit):', await p.evaluate(async()=>{
    const pk=document.querySelector('#eWeek .puck[data-person]');
    pk.scrollIntoView({block:'center'});
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await new Promise(r=>setTimeout(r,150));
    const on=document.querySelectorAll('.puck.sel').length;
    const wk=document.getElementById('eWeek').getBoundingClientRect();
    const el=document.elementFromPoint(Math.round(wk.left+4),Math.round(wk.top+4))||document.getElementById('eWeek');
    el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:wk.left+4,clientY:wk.top+4}));
    await new Promise(r=>setTimeout(r,200));
    return 'sel '+on+' → '+document.querySelectorAll('.puck.sel').length
      +' (clicked <'+el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0]+'>)';}));

  // delete a highlighted puck
  await p.evaluate(()=>{if(!editMode())document.getElementById('editToggle').click();});
  console.log('  delete selected   :', await p.evaluate(async()=>{
    const pk=document.querySelector('#eWeek .acrow .seat[data-slot] .puck[data-person]');
    const key=pk.closest('.seat').dataset.slot, id=pk.dataset.person;
    pk.scrollIntoView({block:'center'});
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await new Promise(r=>setTimeout(r,150));
    const on=document.querySelectorAll('.puck.sel').length, boxOn=document.querySelectorAll('.dwbox').length;
    setSlotVal(key,''); afterSchedMutate();
    await new Promise(r=>setTimeout(r,200));
    return PEOPLE[id].cs+' sel '+on+' boxes '+boxOn+' → after delete sel '
      +document.querySelectorAll('.puck.sel').length+' boxes '+document.querySelectorAll('.dwbox').length;}));

  // board
  await p.evaluate(()=>openScheduler(0)); await p.waitForTimeout(700);
  console.log('  board toggle      :', await p.evaluate(async()=>{
    const pk=document.querySelector('#sbBoard .seat .puck[data-person]');
    pk.scrollIntoView({block:'center'});
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true})); await new Promise(r=>setTimeout(r,150));
    const on=document.querySelectorAll('#sbBoard .puck.sel').length;
    const id=pk.dataset.person;
    document.querySelector('#sbBoard .puck[data-person="'+id+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await new Promise(r=>setTimeout(r,150));
    return 'sel '+on+' → '+document.querySelectorAll('#sbBoard .puck.sel').length;}));
  console.log('  board blank space :', await p.evaluate(async()=>{
    const pk=document.querySelector('#sbBoard .seat .puck[data-person]');
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true})); await new Promise(r=>setTimeout(r,150));
    const on=document.querySelectorAll('#sbBoard .puck.sel').length;
    const bd=document.getElementById('sbBoard');
    bd.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    await new Promise(r=>setTimeout(r,200));
    return 'sel '+on+' → '+document.querySelectorAll('#sbBoard .puck.sel').length
      +' · armed '+document.querySelectorAll('.armed').length;}));
  console.log('  board delete      :', await p.evaluate(async()=>{
    const pk=document.querySelector('#sbBoard .seat[data-slot] .puck[data-person]');
    const key=pk.closest('[data-slot]').dataset.slot;
    pk.dispatchEvent(new MouseEvent('click',{bubbles:true})); await new Promise(r=>setTimeout(r,150));
    const on=document.querySelectorAll('.puck.sel').length;
    setSlotVal(key,''); afterSchedMutate(); await new Promise(r=>setTimeout(r,200));
    return 'sel '+on+' → '+document.querySelectorAll('.puck.sel').length;}));
  await ctx.close();
 }
 await b.close(); console.log('selx done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
