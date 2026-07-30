const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
 const p=await ctx.newPage(); p.setDefaultTimeout(20000);
 p.on('pageerror',e=>console.log(' PAGEERR',e.message));
 await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
 await p.evaluate(()=>go('editsched')); await p.waitForTimeout(800);
 const st=()=>p.evaluate(()=>{const el=document.getElementById('eRoster'),t=el.querySelector('.ros-tab');
   const r=el.getBoundingClientRect(),tr=t.getBoundingClientRect();
   return {open:document.body.classList.contains('ros-open'),
     tabDisp:getComputedStyle(t).display, tabX:Math.round(tr.x), tabW:Math.round(tr.width),
     rosterX:Math.round(r.x), rosterW:Math.round(r.width), vw:innerWidth,
     onScreen:tr.x<innerWidth&&tr.right>0};});
 console.log('parked :',JSON.stringify(await st()));
 await p.evaluate(()=>document.querySelector('.ros-tab').dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await p.waitForTimeout(350);
 console.log('opened :',JSON.stringify(await st()));
 await p.screenshot({path:'/tmp/b35-drawer-open.png'});
 await p.evaluate(()=>document.querySelector('.ros-tab').dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await p.waitForTimeout(350);
 console.log('closed :',JSON.stringify(await st()));
 await p.screenshot({path:'/tmp/b35-drawer-shut.png'});
 console.log('viewport meta:',await p.evaluate(()=>document.querySelector('meta[name=viewport]').content));
 // arming opens it
 await p.evaluate(()=>{if(!editMode())document.getElementById('editToggle').click();
   const f=document.querySelector('#eWeek .acrow .seat[data-slot]');setSlotVal(f.dataset.slot,'');afterSchedMutate();
   const s=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')].find(x=>!slotVal(x.dataset.slot));
   s.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await p.waitForTimeout(350);
 console.log('armed  :',JSON.stringify(await st()));
 await p.screenshot({path:'/tmp/b35-armed.png'});
 await b.close(); console.log('draw done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
