const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
 const p=await ctx.newPage(); p.setDefaultTimeout(20000);
 p.on('pageerror',e=>console.log(' PAGEERR',e.message));
 await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
 await p.evaluate(()=>go('editsched')); await p.waitForTimeout(600);
 await p.evaluate(()=>openScheduler(0)); await p.waitForTimeout(700);
 console.log(await p.evaluate(()=>{
   addWave(0,'sc'); afterSchedMutate();
   const d=DAYS[0], w=d.waves.find(x=>x.kind==='sc'), gi=d.waves.indexOf(w);
   const out=[];
   const probe=(li,label)=>{
     const key=`0.${gi}.${li}.0.p`;
     setSlotVal(key,''); afterSchedMutate();
     const el=[...document.querySelectorAll('#sbBoard [data-slot]')].find(x=>x.dataset.slot===key);
     if(!el){out.push(label+': slot not on board');return;}
     el.scrollIntoView({block:'center'});
     el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
     const r=document.getElementById('sbRoster');
     const open=[...r.querySelectorAll('.rpuck:not(.no)')].map(x=>x.dataset.person)
       .filter(id=>PEOPLE[id]&&!PEOPLE[id].special);
     const rules=slotRules(key);
     const allOK=open.every(id=>scQualOK(id,rules.sc));
     out.push(`${label} ${w.formations[li].to}-${w.formations[li].ld} · rules.sc=${rules.sc}`
       +` · selectable ${open.length} · darkened ${r.querySelectorAll('.rpuck.no').length}`
       +` · all${(rules.sc||'').toUpperCase()}current ${allOK}`);
     disarmSlot();
   };
   probe(0,'AM MAIN');
   w.formations[0].to='19:30'; w.formations[0].ld='23:30'; afterSchedMutate();
   probe(0,'NIGHT  ');
   return out.join('\n');}));
 await b.close(); console.log('scpal done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
