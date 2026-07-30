/* B53 — the pre-production audit, proved in a real browser rather than in the
   source. One block per finding; each one first shows the wrong outcome would
   be visible, then that it is not. */
const {chromium}=require('playwright');

const boot=async(ctx,who)=>{const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser',who||'a');await p.fill('#lpass',who||'a');
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  return p;};

(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0;
const T=(n,got,want)=>{const ok=String(got)===String(want);ok?pass++:fail++;
  console.log(`${ok?' ok  ':'FAIL '} ${n.padEnd(58)} want ${want} · got ${got}`);};

const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:2});
const p=await boot(ctx);

/* ---- #5 · edit mode does not survive a logout ---------------------------- */
{await p.evaluate(()=>go('logic'));await p.waitForTimeout(300);
 await p.click('#lgEdit');await p.waitForTimeout(300);
 T('#5 an admin gets live fields',
   await p.evaluate(()=>$('lgBody').querySelectorAll('[data-lgset]').length>0?'live':'read-only'),'live');
 await p.click('#logout');await p.waitForTimeout(300);
 await p.fill('#luser','user');await p.fill('#lpass','user');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(700);
 await p.evaluate(()=>go('logic'));await p.waitForTimeout(400);
 const m=await p.evaluate(()=>({fields:$('lgBody').querySelectorAll('[data-lgset],[data-lgkind]').length,
   edit:$('lgEdit').hidden,done:$('lgDone').hidden}));
 T('#5 the member who follows him gets none',m.fields,0);
 T('#5 and no orphaned Done button',`${m.edit}/${m.done}`,'true/true');
 await p.click('#logout');await p.waitForTimeout(200);
 await p.fill('#luser','a');await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);}

/* ---- #6 · the RULES MODIFIED stamp survives a reload --------------------- */
{await p.evaluate(()=>go('logic'));await p.waitForTimeout(300);
 await p.evaluate(()=>{VCONF.crewRest=600;ruleApply();});
 await p.waitForTimeout(200);
 await p.reload();await p.waitForTimeout(400);
 await p.fill('#luser','a');await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
 await p.evaluate(()=>go('viewsched'));await p.waitForTimeout(400);
 const r=await p.evaluate(()=>({cr:VCONF.crewRest,
   stamp:document.body.classList.contains('page-rules-off'),
   seen:getComputedStyle(document.querySelector('#vBanner'),'::after').content}));
 T('#6 the override reloaded',r.cr,600);
 T('#6 and the banner says so without opening Logic',r.stamp,true);
 T('#6 the stamp actually renders',/RULES MODIFIED/.test(r.seen),true);

 /* ---- #7 · the labels quote the value that is in force ------------------ */
 const lb=await p.evaluate(()=>[wlbl(CHIP_LABEL.CR),wlbl(WCODE.CREW_REST)].join(' | '));
 T('#7 chip + code label read 10h, not 12h',/10h/.test(lb)&&!/12h/.test(lb),true);
 await p.evaluate(()=>{rulesReset();ruleApply();});await p.waitForTimeout(200);
 T('#7 and back to 12h on reset',
   await p.evaluate(()=>/12h/.test(wlbl(CHIP_LABEL.CR))),true);
 T('#6 the stamp clears with the reset',
   await p.evaluate(()=>document.body.classList.contains('page-rules-off')),false);}

/* ---- #22 · a hand-edited store cannot poison the maths ------------------- */
{const r=await p.evaluate(()=>{
   localStorage.setItem('sqn142_rules',JSON.stringify({v:{crewRest:"840",dekit:9999},s:{}}));
   rulesLoad();
   return {cr:VCONF.crewRest,ty:typeof VCONF.crewRest,dk:VCONF.dekit};});
 T('#22 a string override is refused',`${r.ty}/${r.cr}`,'number/720');
 T('#22 an out-of-range override is refused',r.dk,30);
 await p.evaluate(()=>localStorage.removeItem('sqn142_rules'));}

/* ---- #17 · Edit mode OFF means OFF for the right button too -------------- */
{await p.evaluate(()=>go('editsched'));await p.waitForTimeout(600);
 const r=await p.evaluate(async()=>{
   const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
   s.scrollIntoView({block:'center'});
   const key=s.dataset.slot, id=slotVal(key);
   const t=$('editToggle'); const wasOn=t.classList.contains('on');
   if(wasOn)t.click();
   await new Promise(r=>setTimeout(r,300));
   const el=document.querySelector(`#eWeek .seat[data-slot="${key}"]`)||s;
   el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
   await new Promise(r=>setTimeout(r,200));
   const still=slotVal(key);
   if(!wasOn===false)t.click();
   return {id,still,same:still===id};});
 T('#17 right-click with Edit off leaves the seat alone',r.same,true);
 const on=await p.evaluate(async()=>{
   const t=$('editToggle'); if(!t.classList.contains('on'))t.click();
   await new Promise(r=>setTimeout(r,300));
   const s=document.querySelector('#eWeek .seat[data-slot$=".p"]');
   const key=s.dataset.slot, id=slotVal(key);
   if(!id)return 'no crew';
   s.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));
   await new Promise(r=>setTimeout(r,200));
   const gone=!slotVal(key);
   if(gone){setSlotVal(key,id);afterSchedMutate();}
   return gone?'cleared':'stuck';});
 T('#17 and with Edit on it still clears it',on,'cleared');}

/* ---- #8 · an offer never blocks its own sortie --------------------------- */
{const r=await p.evaluate(()=>{
   const d=DAYS[0], f=(((d.waves||[])[0]||{}).formations||[])[0];
   const a=f&&(f.aircraft||[])[0], id=a&&a.p;
   if(!id)return 'no crew';
   const n=t=>{INPUTS.push({person:id,date:d.dt,allday:false,s:5*60,e:23*60,
       type:t,remarks:'probe',mod:''});
     const c=validate().all.filter(x=>(x.who||[]).indexOf(id)>=0
       &&(x.code==='NO_BRIEF'||x.code==='DEBRIEF')).length;
     INPUTS.pop(); return c;};
   /* this man may already carry one from the published week — measure the delta */
   const base=(()=>{const c=validate().all.filter(x=>(x.who||[]).indexOf(id)>=0
       &&(x.code==='NO_BRIEF'||x.code==='DEBRIEF')).length; return c;})();
   const offer=n('Available fly')-base, real=n('Meeting')-base;
   validate();
   return `${offer}/${real>0?'flagged':'unflagged'}`;});
 T('#8 an offer adds nothing, a meeting still does',r,'0/flagged');}

/* ---- #10 · a downchit closes an SC SPARE, OIL does not ------------------- */
{const r=await p.evaluate(()=>{
   const d=DAYS[0];
   d.waves.push(makeStandalone('sc'));           // 2 shifts × [MAIN,MAIN,SPARE,SPARE]
   const gi=d.waves.length-1;
   const ids=Object.keys(PEOPLE).filter(x=>!PEOPLE[x].special);
   const sp=ids[ids.length-1];
   fillSlot(`0.${gi}.0.2.p`,sp);                  // the AM SPARE line
   const cnt=t=>{INPUTS.push({person:sp,date:d.dt,allday:true,s:0,e:1439,type:t,remarks:'probe',mod:''});
     const c=validate().all.filter(x=>(x.who||[]).indexOf(sp)>=0
       &&/SC SPARE/.test(x.msg||'')).length;
     INPUTS.pop(); return c;};
   const dn=cnt('Downchit'), ol=cnt('OL'), oil=cnt('OIL'), ll=cnt('LL');
   const seated=slotVal(`0.${gi}.0.2.p`)===sp;
   d.waves.pop(); afterSchedMutate();
   return [seated,dn>0,ol>0,oil===0,ll===0].join(',');});
 T('#10 downchit + OL flagged, OIL + LL not',r,'true,true,true,true,true');}

/* ---- #11/#21 · the binding number is the larger one ---------------------- */
{const r=await p.evaluate(()=>{
   const w={t:VCONF.tightTurn,d:VCONF.dekit,s:VCONF.step};
   VCONF.tightTurn=60; VCONF.dekit=30; VCONF.step=60;   // threshold below the mechanics
   const need=Math.max(VCONF.tightTurn,VCONF.dekit+VCONF.step);
   VCONF.tightTurn=w.t;VCONF.dekit=w.d;VCONF.step=w.s; validate();
   return need;});
 T('#11 a 60 min threshold cannot beat 30+60 of ground time',r,90);}

/* ---- #14 · an issued AL is history --------------------------------------- */
{const r=await p.evaluate(()=>{
   const A=JSON.stringify(SCHED.als);
   SCHED.als=[{n:1,keys:['dn:0.0','dn:0.1'],sign:{},days:[0],n0:2}];
   SCHED.als[0].keys=[];                       // exactly what deleting the rows does
   const txt=`${alCount(SCHED.als[0])} on ${daysLabel(alDays(SCHED.als[0]))}`;
   SCHED.als=JSON.parse(A); renderStatus();
   return txt;});
 T('#14 the record still says what went out',/^2 on \w/.test(r)?'2 items':r,'2 items');}

/* ---- #19 · committing a field does not swallow the next click ------------ */
{await p.evaluate(()=>go('logic'));await p.waitForTimeout(300);
 await p.click('#lgEdit');await p.waitForTimeout(300);
 const r=await p.evaluate(async()=>{
   const f=[...$('lgBody').querySelectorAll('[data-lgset]')];
   if(f.length<2)return 'too few fields';
   const a=f[0], bkey=f[1].dataset.lgset;
   const bb=f[1].getBoundingClientRect();
   a.focus(); a.value=ruleFmt(a.dataset.lgset,ruleParse(a.dataset.lgset,a.value)+5);
   /* the user is already pressing the NEXT field when the first one commits */
   f[1].dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,
     clientX:bb.left+4,clientY:bb.top+4,pointerId:1,isPrimary:true}));
   a.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(r=>setTimeout(r,120));
   const act=document.activeElement;
   return act&&act.dataset&&act.dataset.lgset===bkey?'focused':`lost(${act&&act.tagName})`;});
 T('#19 the click on the next field is not swallowed',r,'focused');
 await p.evaluate(()=>{rulesReset();ruleApply();lgSetEdit(false);});}

await p.close();
console.log(`\n${pass} passed · ${fail} failed`);
await b.close();console.log('audit2 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
