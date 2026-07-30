const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const [nm,vp] of [['d',{width:1600,height:1000}],['m',{width:390,height:900}]]){
   const p=await b.newPage({viewport:vp,deviceScaleFactor:2});
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);

   // 0 — banner area: prove the bar is gone
   console.log(nm,'after banner:',await p.evaluate(()=>{
     const b=document.getElementById('vBanner');return b.nextElementSibling.className;}));

   // 1 — click a puck that carries an issue on more than one day
   const target=await p.evaluate(()=>{
     const W=validate();const cnt={};
     W.byDay.forEach(g=>g&&g.warns&&g.warns.forEach(w=>(w.who||[]).forEach(id=>{(cnt[id]=cnt[id]||new Set()).add(g.di);})));
     const best=Object.keys(cnt).sort((a,b)=>cnt[b].size-cnt[a].size)[0];
     return {id:best,days:[...cnt[best]]};});
   console.log(nm,'puck target',JSON.stringify(target));
   await p.click(`#vWeek .puck[data-person="${target.id}"]`);
   await p.waitForTimeout(350);
   console.log(nm,'boxes open:',await p.evaluate(()=>[...document.querySelectorAll('#vWeek .dwbox.open')]
     .map(x=>x.closest('.day').dataset.day+':'+x.querySelectorAll('.witem').length).join(' ')));
   await p.screenshot({path:`/tmp/b14-pfoc-${nm}.png`,fullPage:false});

   // 2 — click one warning inside it → solid on its day, dashed elsewhere
   await p.click('#vWeek .dwbox.open .witem');
   await p.waitForTimeout(450);
   console.log(nm,'focus:',await p.evaluate(()=>{
     const s=[...document.querySelectorAll('#vWeek .puck.wfoc:not(.echo)')].map(x=>x.closest('.day').dataset.day+'/'+x.dataset.person);
     const e=[...document.querySelectorAll('#vWeek .puck.wfoc.echo')].map(x=>x.closest('.day').dataset.day+'/'+x.dataset.person);
     return 'solid['+s.join(' ')+'] echo['+e.join(' ')+'] dim='+document.querySelectorAll('#vWeek .puck.dim').length;}));
   await p.screenshot({path:`/tmp/b14-echo-${nm}.png`,fullPage:false});
   const box=await p.locator('#vWeek .dwbox.open').first();
   await box.screenshot({path:`/tmp/b14-box-${nm}.png`});
   await p.close();
 }
 await b.close();
 console.log('warn shots done');
})();
