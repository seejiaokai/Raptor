const {chromium}=require('playwright');
const sign=(di,off)=>`(()=>{['cur','sked','plan','appr'].forEach((k,i)=>{
  const s=document.querySelector('#eWeek .day[data-day="${di}"] select[data-sign="'+k+'"]');
  s.value=s.options[${off}+i+2].value;s.dispatchEvent(new Event('change',{bubbles:true}));});})()`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const vp of [{width:1600,height:1000},{width:390,height:900}]){
 const ctx=await b.newContext({viewport:vp,hasTouch:vp.width<800,isMobile:vp.width<800});
 const p=await ctx.newPage(); p.setDefaultTimeout(20000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
 await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);
 console.log('--- W'+vp.width);
 console.log(' strips      :', await p.evaluate(()=>
   document.querySelectorAll('#eWeek .signoff.day-sign').length+' of '+document.querySelectorAll('#eWeek .day').length
   +' days · view page '+document.querySelectorAll('#vWeek .signoff').length));
 console.log(' locked      :', await p.evaluate(()=>[...document.querySelectorAll('#eWeek button.dbeak')]
   .map(b=>b.disabled?'lock':'open').join(' ')));
 await p.evaluate(sign(0,0)); await p.waitForTimeout(400);
 console.log(' Mon signed  :', await p.evaluate(()=>[...document.querySelectorAll('#eWeek button.dbeak')]
   .map(b=>b.disabled?'lock':'open').join(' ')
   +' · Mon "'+document.querySelector('#eWeek .day[data-day="0"] .so-state').textContent+'"'));
 if(vp.width===1600)await p.locator('#eWeek .day[data-day="0"] .signoff').screenshot({path:'/tmp/b22-daysign.png'});
 else await p.locator('#eWeek .day[data-day="0"] .signoff').screenshot({path:'/tmp/b22-daysign-m.png'});
 await p.click('#eWeek button.dbeak[data-beak="0"]'); await p.waitForTimeout(500);
 console.log(' published   :', await p.evaluate(()=>document.querySelector('#eWeek button.dbeak[data-beak="0"]').textContent
   +' · banner "'+document.getElementById('eBanner').querySelector('.sb-badge').textContent.slice(0,44)+'"'));
 // make a change on Monday, then try to publish the AL
 await p.evaluate(()=>{const st=document.querySelector('#eWeek .day[data-day="0"] .stchip[data-store]');st.dispatchEvent(new Event('click',{bubbles:true}));});
 await p.waitForTimeout(500);
 console.log(' AL gate     :', await p.evaluate(()=>{const b=document.querySelector('#eWeek .day[data-day="0"] button[data-alpub]');
   return b?('disabled='+b.disabled+' title="'+b.title+'"'):'absent';}));
 await p.evaluate(()=>{const c=document.querySelector('#eWeek .day[data-day="0"] [data-signclear]');if(c)c.dispatchEvent(new Event('click',{bubbles:true}));});
 await p.waitForTimeout(400);
 console.log(' after clear :', await p.evaluate(()=>{const b=document.querySelector('#eWeek .day[data-day="0"] button[data-alpub]');
   return b?('disabled='+b.disabled+' title="'+b.title+'"'):'absent';}));
 await p.evaluate(sign(0,1)); await p.waitForTimeout(400);
 await p.click('#eWeek .day[data-day="0"] button[data-alpub]'); await p.waitForTimeout(600);
 console.log(' published AL:', await p.evaluate(()=>document.getElementById('vBanner').textContent.slice(0,30)
   +' | sign on AL: '+JSON.stringify((SCHED.als[0]||{}).sign)));
 console.log(' spent       :', await p.evaluate(()=>
   'Mon '+[...document.querySelectorAll('#eWeek .day[data-day="0"] select[data-sign]')].map(s=>s.value||'—').join('/')
   +' · still published '+!!document.querySelector('#eWeek .day[data-day="0"].dok')
   +' · day AL btn '+(document.querySelector('#eWeek .day[data-day="0"] button[data-alpub]')?'shown':'absent')));
 await p.evaluate(()=>openScheduler(2));await p.waitForTimeout(600);
 console.log(' board day 2 :', await p.evaluate(()=>{const el=document.getElementById('sbSignBar');
   return el.querySelectorAll('select[data-sign]').length+' selects · day '+
     (el.querySelector('select[data-sign]')||{dataset:{}}).dataset.signday;}));
 await ctx.close();
}
await b.close();console.log('sign done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
