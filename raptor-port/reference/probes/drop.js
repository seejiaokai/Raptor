/* B49 — the offset puck, and every way a drop used to silently do nothing. */
const {chromium}=require('playwright');

const boot=async(ctx)=>{const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a');await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('editsched'));await p.waitForTimeout(800);
  return p;};

/* a real finger: press, settle (a wobble), hold past TD_HOLD, drag, release */
const finger=async(p,x0,y0,x1,y1,wobble)=>{
  await p.mouse.move(x0,y0);
  await p.evaluate(([x,y])=>{const el=document.elementFromPoint(x,y);
    el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:x,clientY:y,pointerId:1,isPrimary:true}));},[x0,y0]);
  if(wobble)await p.evaluate(([x,y,w])=>document.dispatchEvent(
    new PointerEvent('pointermove',{bubbles:true,clientX:x+w,clientY:y+w,pointerId:1,isPrimary:true})),[x0,y0,wobble]);
  await p.waitForTimeout(260);
  await p.evaluate(([x,y])=>document.dispatchEvent(
    new PointerEvent('pointermove',{bubbles:true,clientX:x,clientY:y,pointerId:1,isPrimary:true})),[x1,y1]);
  await p.waitForTimeout(60);
  await p.evaluate(([x,y])=>document.dispatchEvent(
    new PointerEvent('pointerup',{bubbles:true,clientX:x,clientY:y,pointerId:1,isPrimary:true})),[x1,y1]);
  await p.waitForTimeout(220);};

(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0;
const T=(n,got,want)=>{const ok=String(got)===String(want);ok?pass++:fail++;
  console.log(`${ok?' ok  ':'FAIL '} ${n.padEnd(54)} want ${want} · got ${got}`);};

/* ---- A · the offset puck ------------------------------------------------- */
{const p=await boot(await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2}));
 const r=await p.evaluate(()=>{
   const d=DAYS[0];
   if(!d.allhands||!d.allhands.length)d.allhands=[{prog:'PROBE ITEM',sub:'',str:'0900',end:'1000',who:[]}];
   const ri=0, row=d.allhands[0];
   ['ipman','krait','romeo','vinci','badger','cards'].forEach(id=>fillSlot(`a:0.${ri}.+`,id));
   afterSchedMutate();
   /* blank the first three — exactly what dragging them off the row does. Trailing
      blanks are popped, so the survivors at the end keep the holes in front of them
      and every published AL key still points at the same person. */
   for(let i=0;i<3;i++)setSlotVal(`a:0.${ri}.${i}`,'');
   afterSchedMutate();
   const cell=document.querySelector(`#eWeek .ah-row .ppl[data-fill="a:0.${ri}.+"]`);
   const kids=[...cell.children].filter(c=>!c.classList.contains('addz'));
   const box=cell.getBoundingClientRect();
   return {holes:whoArr(row).filter(x=>!x).length,
     crew:whoArr(row).filter(Boolean).length,
     empties:kids.filter(c=>!c.classList.contains('seat')).length,
     lefts:kids.filter(c=>c.classList.contains('seat'))
       .map(c=>Math.round(c.getBoundingClientRect().left-box.left)),
     widths:[...cell.querySelectorAll('.puck')].map(c=>Math.round(c.getBoundingClientRect().width))};});
 console.log(`\nA · programme row with ${r.holes} holes and ${r.crew} crew`);
 T('A · a hole renders no element at all',r.empties,0);
 T('A · every remaining puck is flush left',[...new Set(r.lefts)].length,1);
 T('A · and every puck is the canonical width',[...new Set(r.widths)].join(','),'74');
 await p.close();}

/* ---- B · drops that used to vanish --------------------------------------- */
{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await boot(ctx);
 /* 1 · a faded toast must not eat the drop underneath it */
 const toastHit=await p.evaluate(async()=>{toast('probe');
   await new Promise(r=>setTimeout(r,60));
   const t=document.getElementById('toastEl'), b=t.getBoundingClientRect();
   const el=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
   return {pe:getComputedStyle(t).pointerEvents,isToast:el===t};});
 T('B1 · the toast is transparent to the pointer',toastHit.pe,'none');
 T('B1 · and no longer takes the hit test',toastHit.isToast,false);

 /* 2 · a wobble inside the hold must not kill the gesture */
 /* instrument tdArm so "did the gesture actually pick the puck up" is measurable */
 await p.evaluate(()=>{const o=window.tdArm; window.__arm=0;
   window.tdArm=function(){window.__arm++;return o.apply(this,arguments);};});
 for(const w of [7,9,20,40]){
   await p.evaluate(()=>window.__arm=0);
   const r=await p.evaluate(()=>{const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
     s.scrollIntoView({block:'center'}); const b=s.getBoundingClientRect();
     return {x:Math.round(b.left+b.width/2),y:Math.round(b.top+b.height/2)};});
   await finger(p,r.x,r.y,r.x,r.y+2,w);
   T(`B2 · wobble ${String(w).padStart(2)}px → ${w>26?'cancelled':'armed'}`,
     await p.evaluate(()=>window.__arm>0?'armed':'cancelled'), w>26?'cancelled':'armed');
 }

 /* 3 · a drop anywhere on a list row resolves to that row */
 const rowDrop=await p.evaluate(()=>{
   const row=document.querySelector('#eWeek .pl-row .ppl[data-fill]')?.closest('.pl-row');
   if(!row)return 'no row';
   row.scrollIntoView({block:'center'});
   const cell=row.querySelector('[data-fill]'), rb=row.getBoundingClientRect();
   const cb=cell.getBoundingClientRect();
   const id=Object.keys(PEOPLE).find(x=>!PEOPLE[x].special);
   const n=()=>row.querySelectorAll('.seat[data-slot]').length;
   /* a point genuinely OUTSIDE the .ppl cell but inside the row */
   const y=Math.min(rb.bottom-2,cb.bottom+4), x=rb.left+8;
   const el=document.elementFromPoint(x,y);
   if(el&&el.closest('[data-fill]'))return 'probe point was inside the cell';
   const n0=n();
   DRAG={kind:'roster',id};
   const ok=applyDrop(el,x,y);
   afterSchedMutate();
   const row2=document.querySelector(`#eWeek .pl-row .ppl[data-fill="${cell.dataset.fill}"]`);
   const n1=row2?row2.closest('.pl-row').querySelectorAll('.seat[data-slot]').length:n0;
   return ok&&n1>n0?'landed':`swallowed(ok=${ok} ${n0}->${n1} el=${el?el.className||el.tagName:'null'})`;});
 T('B3 · a drop below the cell still lands on the row',rowDrop,'landed');

 /* 4 · the click-eater must not outlive its own drag */
 const eaten=await p.evaluate(async()=>{
   let seen=0; const c=()=>seen++;
   document.addEventListener('click',c);
   const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
   const bx=s.getBoundingClientRect(), x=bx.left+5, y=bx.top+5;
   s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:x,clientY:y,pointerId:9,isPrimary:true}));
   await new Promise(r=>setTimeout(r,240));
   document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:x+40,clientY:y+40,pointerId:9,isPrimary:true}));
   document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:x+40,clientY:y+40,pointerId:9,isPrimary:true}));
   await new Promise(r=>setTimeout(r,40));
   /* the user's NEXT tap, well inside the old 350ms window */
   document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:x,clientY:y,pointerId:10,isPrimary:true}));
   document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));
   await new Promise(r=>setTimeout(r,30));
   document.removeEventListener('click',c);
   return seen;});
 T('B4 · the next tap after a drag is not swallowed',eaten>0?'delivered':'eaten','delivered');

 /* 5 · the phone drawer stays pinned through a drag */
 const drawer=await p.evaluate(()=>{const e=document.querySelector('.eroster');
   const a=getComputedStyle(e).position; document.body.classList.add('dnd');
   const bpos=getComputedStyle(e).position; document.body.classList.remove('dnd');
   return a+'->'+bpos;});
 T('B5 · the drawer stays fixed while dragging',drawer,'fixed->fixed');
 await p.close();}

/* ---- C · desktop: the proxy scrollbar ------------------------------------ */
{const p=await boot(await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:2}));
 const hs=await p.evaluate(()=>{const e=document.querySelector('.hscroll');
   const a=getComputedStyle(e).pointerEvents; document.body.classList.add('dnd');
   const c=getComputedStyle(e).pointerEvents; document.body.classList.remove('dnd');
   return a+'->'+c;});
 T('B7 · the proxy scrollbar is inert only while dragging',hs,'auto->none');

 /* 6 · dropping a puck back on itself says so instead of nothing */
 const self=await p.evaluate(()=>{
   const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
   const id=slotVal(s.dataset.slot)||Object.keys(PEOPLE)[0];
   setSlotVal(s.dataset.slot,id); afterSchedMutate();
   const el=document.querySelector(`#eWeek .seat[data-slot="${s.dataset.slot}"]`);
   const b=el.getBoundingClientRect();
   DRAG={kind:'slot',key:el.dataset.slot};
   applyDrop(el,b.left+b.width/2,b.top+b.height/2);
   return (document.getElementById('toastEl')||{}).textContent||'(silent)';});
 T('B6 · a drop back onto the same seat reports it',/Already in that seat/.test(self)?'told':'silent','told');
 await p.close();}

console.log(`\n${pass} passed · ${fail} failed`);
await b.close();console.log('drop done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
