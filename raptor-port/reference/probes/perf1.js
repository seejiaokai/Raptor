/* B54 — per-day redraw. Three things this has to prove:
     1 · the DOM is byte-identical to what a full week redraw produces
     2 · an edit on one day rewrites ONE day, not five
     3 · everything a full wipe used to destroy (scroll, focus) is no worse
   Run this against B53 first to record what the old behaviour was, then against
   B54 to show the difference. */
const {chromium}=require('playwright');

const boot=async(b,cfg)=>{
  const ctx=await b.newContext({viewport:{width:cfg.w,height:cfg.h},deviceScaleFactor:2,
    hasTouch:!!cfg.touch,isMobile:!!cfg.touch});
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  const cdp=await ctx.newCDPSession(p);
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(900);
  if(cfg.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cfg.cpu});
  await p.waitForTimeout(300);
  return {p,ctx};};

(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0;
const T=(n,got,want)=>{const ok=String(got)===String(want);ok?pass++:fail++;
  console.log(`${ok?' ok  ':'FAIL '} ${n.padEnd(56)} want ${want} · got ${got}`);};

/* ---- A · byte-identical, over a battery of real mutations ---------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(()=>{
   const root=()=>document.getElementById('eWeek');
   const full=()=>{                                    // an unconditional full write
     if(typeof renderSchedule==='function')renderSchedule('eWeek',true,true);
     return root().innerHTML;};
   const inc=()=>{renderSchedule('eWeek',true); return root().innerHTML;};
   const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
   const out=[];
   /* each case: mutate, take the incremental result, then force a full rebuild of
      the same state and compare. Any divergence at all is a failure. */
   const cases={
     'seat filled':      ()=>{const s=document.querySelector('#eWeek .seat[data-slot$=".p"],#eWeek .empty-slot[data-slot$=".p"]');
                              if(s)fillSlot(s.dataset.slot,ids[3]);},
     'seat cleared':     ()=>{const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
                              if(s)setSlotVal(s.dataset.slot,'');},
     'note typed':       ()=>{txtSet(`dn:1.0`,'PROBE NOTE');},
     'wave added':       ()=>{DAYS[2].waves.push(makeStandalone('sc'));},
     'wave removed':     ()=>{DAYS[2].waves.pop();},
     'day published':    ()=>{SIGN_ROLES.forEach(r=>{SCHED.sign[3]=SCHED.sign[3]||{};SCHED.sign[3][r[0]]='PROBE';});
                              setDayApproved(3,true);},
     'day reopened':     ()=>{setDayApproved(3,false);},
     'input added':      ()=>{INPUTS.push({person:ids[5],date:DAYS[4].dt,allday:true,s:0,e:1439,
                                type:'Downchit',remarks:'probe',mod:''});},
     'input removed':    ()=>{INPUTS.pop();},
     'crew rest edited': ()=>{VCONF.crewRest=600;},
     'crew rest back':   ()=>{VCONF.crewRest=720;},
     'programme item':   ()=>{(DAYS[0].allhands=DAYS[0].allhands||[]).push(
                                {prog:'PROBE',sub:'',str:'0900',end:'1000',who:[]});},
     'programme gone':   ()=>{DAYS[0].allhands.pop();},
     /* decoration that lives OUTSIDE the markup — applied by refreshHighlights
        after the swap, so a swapped day and an untouched day must agree */
     'a person selected':()=>{SELID=ids[2];SELSEEN=personCount(ids[2]);},
     'edit under selection':()=>{txtSet('dn:2.0','SELECTED PROBE');},
     'selection dropped':()=>{selClear&&selClear();SELID=null;},
     'a search term':    ()=>{SEARCH=PEOPLE[ids[1]].cs.slice(0,3);},
     'search cleared':   ()=>{SEARCH='';},
   };
   Object.keys(cases).forEach(k=>{
     cases[k](); validate();
     const a=inc();          // what the app actually paints now
     const bb=full();        // the ground truth
     out.push({k,same:a===bb,la:a.length,lb:bb.length});
   });
   return out;});
 r.forEach(x=>T('A · identical DOM after '+x.k,x.same?'identical':`DIFF ${x.la} vs ${x.lb}`,'identical'));
 await p.close();await ctx.close();}

/* ---- B · how many days actually get rewritten ---------------------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(()=>{
   const root=document.getElementById('eWeek');
   /* stamp every section, redraw, then see which stamps survived: a section that
      was replaced loses its stamp, one that was left alone keeps it */
   const mark=()=>[...root.children].forEach((s,i)=>{s.__keep=i;});
   const kept=()=>[...root.children].filter(s=>s.__keep!==undefined).length;
   const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
   const run=f=>{renderSchedule('eWeek',true);mark();f();afterSchedMutate();
     return {kept:kept(),total:root.children.length};};
   const seat=run(()=>{const s=document.querySelector('#eWeek [data-day="2"] .seat[data-slot$=".p"],#eWeek [data-day="2"] .empty-slot[data-slot$=".p"]');
     if(s)fillSlot(s.dataset.slot,ids[7]);});
   const note=run(()=>{txtSet('dn:4.0','ANOTHER PROBE NOTE');});
   const nothing=run(()=>{});
   return {seat,note,nothing};});
 T('B · a seat edit leaves the other days standing',`${r.seat.kept}/${r.seat.total}`,'4/5');
 T('B · a note edit leaves the other days standing',`${r.note.kept}/${r.note.total}`,'4/5');
 T('B · a redraw with no change touches nothing',`${r.nothing.kept}/${r.nothing.total}`,'5/5');
 await p.close();await ctx.close();}

/* ---- C · the cost, on a throttled phone ---------------------------------- */
for(const cfg of [{n:'DESKTOP',w:1500,h:950,cpu:1},{n:'PHONE 4x',w:390,h:844,cpu:4,touch:true}]){
 const {p,ctx}=await boot(b,cfg);
 const r=await p.evaluate(()=>{
   const flush=()=>document.getElementById('eWeek').offsetHeight;
   const T=f=>{const t=performance.now();f();flush();return performance.now()-t;};
   const med=(f,n)=>{const a=[];for(let i=0;i<n;i++)a.push(T(f));a.sort((x,y)=>x-y);
     return +a[a.length>>1].toFixed(1);};
   const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
   /* the real gesture: drop a body into a seat on ONE day */
   let k=0;
   const oneEdit=med(()=>{
     const s=document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"],#eWeek [data-day="1"] .empty-slot[data-slot$=".p"]');
     if(s)fillSlot(s.dataset.slot,ids[(k++)%ids.length]);
     afterSchedMutate();},7);
   const noChange=med(()=>{afterSchedMutate();},7);
   const fullForce=med(()=>{renderSchedule('eWeek',true,true);},5);
   return {oneEdit,noChange,fullForce};});
 console.log(`   ${cfg.n.padEnd(9)} one-day edit ${String(r.oneEdit).padStart(6)}ms · `
   +`no-op ${String(r.noChange).padStart(6)}ms · forced full ${String(r.fullForce).padStart(6)}ms`);
 if(cfg.n==='PHONE 4x')T('C · a one-day edit is well under half a forced full week',
   r.oneEdit < r.fullForce*0.5 ? 'yes':`no (${r.oneEdit} vs ${r.fullForce})`,'yes');
 await p.close();await ctx.close();}

/* ---- D · what a full wipe used to destroy -------------------------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(async()=>{
   const wk=document.getElementById('eWeek');
   try{wk.scrollTo({left:400,behavior:'instant'});}catch(e){wk.scrollLeft=400;}
   wk.scrollLeft=400;
   await new Promise(r=>setTimeout(r,150));
   const before=Math.round(wk.scrollLeft);
   txtSet('dn:0.0','SCROLL PROBE'); afterSchedMutate();
   await new Promise(r=>requestAnimationFrame(r));
   const after=Math.round(document.getElementById('eWeek').scrollLeft);
   return {before,after};});
 console.log(`   scrollLeft across an edit: ${r.before} → ${r.after}`);
 T('D · the week does not jump back to Monday on an edit',r.after===r.before?'held':`lost(${r.after})`,'held');
 await p.close();await ctx.close();}

/* ---- E · DOM drift the model cannot see --------------------------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(async()=>{
   const out={};
   const fire=el=>el.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
   /* the repair must be LOCAL — the node is healed, the day is not rebuilt, so
      whatever the user is tabbing into survives. Each case checks both. */
   const localOnly=(sel,dirty,clean)=>{
     const el=document.querySelector(sel); if(!el)return 'no field';
     const sec=el.closest('[data-day]'); const before=DAYHTML.eWeek.html.slice();
     dirty(el); fire(el);
     const still=document.querySelector(sel);
     const sameNode=still===el;                       // not rebuilt
     const healed=clean(still);
     const cacheUntouched=DAYHTML.eWeek.html.every((h,i)=>h===before[i]);
     return `${healed?'healed':'left'}/${sameNode?'in-place':'rebuilt'}/${cacheUntouched?'cache-ok':'cache-dirty'}`;};

   out.intimes=localOnly('#eWeek [data-intimes]',
     el=>{el.__b=el.innerHTML; el.insertAdjacentHTML('beforeend','<div><br></div>');},
     el=>el&&!el.querySelector('div')&&!el.querySelector('br'));
   out.area=localOnly('#eWeek [data-area]',
     el=>{el.innerHTML=`<span style="color:red">${el.textContent}</span>`;},
     el=>el&&!el.children.length);
   out.txt=localOnly('#eWeek [data-txt]',
     el=>{el.innerHTML=`<b>${el.textContent}</b>`;},
     el=>el&&!el.children.length);
   const bo=document.querySelector('#eWeek [data-bombs]');
   out.bombs=bo?localOnly('#eWeek [data-bombs]',
     el=>{el.innerHTML=`<i>${el.textContent}</i>`;},
     el=>el&&!el.children.length):'no field';

   /* the escape hatch, for drift OUTSIDE those fields */
   const sec=document.querySelector('#eWeek [data-day="2"]');
   sec.insertAdjacentHTML('beforeend','<i id="__junk">x</i>');
   afterSchedMutate();
   out.noHatch = document.getElementById('__junk') ? 'still there' : 'gone';
   weekDirty(2,'eWeek'); afterSchedMutate();
   out.hatch = document.getElementById('__junk') ? 'STILL THERE' : 'cleared';
   /* a foreign child of the week itself forces the full path, and the fast path
      must come back once it has been swept away */
   document.getElementById('eWeek').insertAdjacentHTML('beforeend','<b id="__alien">x</b>');
   afterSchedMutate();
   out.alien = document.getElementById('__alien') ? 'STILL THERE' : 'cleared';
   const root=document.getElementById('eWeek');
   [...root.children].forEach((s,i)=>{s.__keep=i;});
   afterSchedMutate();
   out.resumed = [...root.children].filter(s=>s.__keep!==undefined).length===DAYS.length
     ? 'fast path back' : 'stuck on full';
   /* an unusable day index degrades to a full rebuild rather than silently doing
      nothing */
   weekDirty(-1,'eWeek');
   out.badIndex = DAYHTML.eWeek===null ? 'cache dropped' : 'IGNORED';
   return out;});
 T('E · a stray node in in-times is healed in place',r.intimes,'healed/in-place/cache-ok');
 T('E · pasted markup in AREA is healed in place',r.area,'healed/in-place/cache-ok');
 T('E · pasted markup in a text cell is healed in place',r.txt,'healed/in-place/cache-ok');
 if(r.bombs!=='no field')T('E · pasted markup in a stores cell is healed',r.bombs,'healed/in-place/cache-ok');
 T('E · without the hatch a hand-injected node survives',r.noHatch,'still there');
 T('E · weekDirty forces that day to be rewritten',r.hatch,'cleared');
 T('E · a foreign child of the week forces the full path',r.alien,'cleared');
 T('E · and the fast path resumes once it is swept',r.resumed,'fast path back');
 T('E · an unusable day index drops the whole cache',r.badIndex,'cache dropped');
 await p.close();await ctx.close();}

/* ---- G · the repair must not eat the next gesture ------------------------ */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(async()=>{
   const out={};
   /* 1 · blur out of a stores cell straight onto its sibling store chip: the chip
      must still be in the document when the click lands on it */
   const bo=document.querySelector('#eWeek [data-bombs]');
   if(bo){
     const chip=bo.closest('.stores')?bo.closest('.stores').querySelector('[data-store]'):null;
     bo.innerHTML=`<i>${bo.textContent}</i>`;              // drifted, so a repair will run
     bo.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
     out.chip = chip && chip.isConnected ? 'survived' : 'detached';
   } else out.chip='no field';
   /* 2 · tab from AREA to TIME in the same formation */
   const ar=document.querySelector('#eWeek [data-area]');
   const at=ar?ar.parentElement.querySelector('[data-atime]'):null;
   if(ar&&at){
     at.focus();
     ar.innerHTML=`<span>${ar.textContent}</span>`;
     ar.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
     await new Promise(r=>setTimeout(r,60));
     out.tab = document.activeElement===at ? 'caret held' : `caret lost(${document.activeElement.tagName})`;
   } else out.tab='no pair';
   /* 3 · a blur that changed nothing and drifted nothing must not repaint at all */
   const before=DAYHTML.eWeek.html.slice();
   const tx=document.querySelector('#eWeek [data-txt]');
   const root=document.getElementById('eWeek');
   [...root.children].forEach((s,i)=>{s.__keep=i;});
   tx.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
   await new Promise(r=>setTimeout(r,60));
   out.quiet = [...root.children].filter(s=>s.__keep!==undefined).length===DAYS.length
     ? 'no repaint' : 'repainted';
   return out;});
 T('G · a sibling store chip survives the repair',r.chip,'survived');
 T('G · tabbing between AREA and TIME keeps the caret',r.tab,'caret held');
 T('G · a blur with nothing to do repaints nothing',r.quiet,'no repaint');
 await p.close();await ctx.close();}

/* ---- H · the cases the second review pass found -------------------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(async()=>{
   const out={};
   const fire=el=>el.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
   /* 1 · AREA and TIME are DERIVED until typed over. Clearing the cell must not
          heal it to '' while the renderer still shows the aircraft codes. */
   const ar=[...document.querySelectorAll('#eWeek [data-area]')]
     .find(el=>{const[di,gi,li]=el.dataset.area.split('.');
       const f=DAYS[+di].waves[+gi].formations[+li];
       return f.area==null && areaCodesOf(f);});
   if(ar){const shown=ar.textContent;
     ar.textContent='';                       // select-all + Delete
     fire(ar);
     const now=document.querySelector(`#eWeek [data-area="${ar.dataset.area}"]`);
     out.area = now && now.textContent===shown ? 'restored' : `blanked("${now?now.textContent:'gone'}" was "${shown}")`;
   } else out.area='no derived cell';
   const at=[...document.querySelectorAll('#eWeek [data-atime]')]
     .find(el=>{const[di,gi,li]=el.dataset.atime.split('.');
       const f=DAYS[+di].waves[+gi].formations[+li];
       return f.atime==null && areaCodesOf(f);});
   if(at){const shown=at.textContent;
     at.textContent=''; fire(at);
     const now=document.querySelector(`#eWeek [data-atime="${at.dataset.atime}"]`);
     out.atime = now && now.textContent===shown ? 'restored' : 'blanked';
   } else out.atime='no derived cell';
   /* and the day must still be considered unchanged, i.e. the cache and the DOM
      agree — the whole point of healing rather than blanking */
   const before=DAYHTML.eWeek.html.slice();
   renderSchedule('eWeek',true);
   out.stable = DAYHTML.eWeek.html.every((h,i)=>h===before[i]) ? 'in step' : 'diverged';

   /* 2 · an in-times entry with an apostrophe must not be rewritten on every blur */
   const it=document.querySelector('#eWeek [data-intimes]');
   if(it){const[di,gi]=it.dataset.intimes.split('|');
     DAYS[+di].waves[+gi].intimes=["1200H CO'S BRIEF"];
     it.innerHTML=intimesInner(DAYS[+di].waves[+gi]);
     const first=it.firstChild;
     fire(it); fire(it);
     out.apos = it.firstChild===first ? 'left alone' : 'rewritten every blur';
   } else out.apos='no field';

   /* 3 · a stray TEXT node in the week forces the full path and is swept */
   const root=document.getElementById('eWeek');
   root.appendChild(document.createTextNode('  stray  '));
   afterSchedMutate();
   out.textNode = [...root.childNodes].some(n=>n.nodeType===3) ? 'STILL THERE' : 'cleared';
   /* 4 · a comment node too */
   root.appendChild(document.createComment('injected'));
   afterSchedMutate();
   out.comment = [...root.childNodes].some(n=>n.nodeType===8) ? 'STILL THERE' : 'cleared';
   /* 5 · and a clean week really is section-only, so the guard has no false alarm */
   [...root.children].forEach((s,i)=>{s.__keep=i;});
   afterSchedMutate();
   out.noFalseAlarm = [...root.children].filter(s=>s.__keep!==undefined).length===DAYS.length
     ? 'fast path' : 'full path';
   return out;});
 T('H · clearing a derived AREA cell restores what is shown',r.area,'restored');
 T('H · same for the derived TIME cell',r.atime,'restored');
 T('H · and the cache stays in step with the DOM',r.stable,'in step');
 T('H · an apostrophe in in-times is not rewritten every blur',r.apos,'left alone');
 T('H · a stray text node forces the full path',r.textNode,'cleared');
 T('H · a comment node does too',r.comment,'cleared');
 T('H · a clean week raises no false alarm',r.noFalseAlarm,'fast path');
 await p.close();await ctx.close();}

/* ---- F · Edit-mode toggle holds its place ------------------------------- */
{const {p,ctx}=await boot(b,{w:1500,h:950,cpu:1});
 const r=await p.evaluate(async()=>{
   const wk=document.getElementById('eWeek');
   try{wk.scrollTo({left:500,behavior:'instant'});}catch(e){wk.scrollLeft=500;}
   wk.scrollLeft=500; await new Promise(r=>setTimeout(r,150));
   const before=Math.round(wk.scrollLeft);
   document.getElementById('editToggle').click();          // ed flips -> full path
   await new Promise(r=>setTimeout(r,150));
   const after=Math.round(document.getElementById('eWeek').scrollLeft);
   const editable=!!document.querySelector('#eWeek [contenteditable="true"]');
   document.getElementById('editToggle').click();
   return {before,after,editable};});
 console.log(`   scrollLeft across an Edit-mode toggle: ${r.before} → ${r.after}`);
 T('F · the toggle does not jump back to Monday',r.after===r.before?'held':`lost(${r.after})`,'held');
 T('F · and Edit mode OFF really is read-only',r.editable?'editable':'read-only','read-only');
 await p.close();await ctx.close();}

console.log(`\n${pass} passed · ${fail} failed`);
await b.close();console.log('perf1 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
