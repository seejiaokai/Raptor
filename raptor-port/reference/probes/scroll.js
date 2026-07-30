const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const page of ['viewsched','editsched']){
   const p=await b.newPage({viewport:{width:1600,height:1000}});
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
   if(page==='editsched'){await p.click('.nav a[data-page="editsched"]'); await p.waitForTimeout(700);}
   const id=page==='editsched'?'eWeek':'vWeek';
   console.log('--- '+page);
   console.log(' geom', await p.evaluate(i=>{const w=document.getElementById(i);
     const ds=w.querySelectorAll('.day');
     return JSON.stringify({cw:w.clientWidth,sw:w.scrollWidth,over:w.scrollWidth-w.clientWidth,
       days:ds.length,pitch:ds.length>1?Math.round(ds[1].offsetLeft-ds[0].offsetLeft):null,
       dayW:ds.length?Math.round(ds[0].getBoundingClientRect().width):null,
       ovf:getComputedStyle(w).overflowX, parentOvf:getComputedStyle(w.parentElement).overflowX,
       parentSW:w.parentElement.scrollWidth-w.parentElement.clientWidth,
       docSW:document.documentElement.scrollWidth-document.documentElement.clientWidth});},id));
   // arrow behaviour
   for(let k=0;k<3;k++){
     const before=await p.evaluate(i=>document.getElementById(i).scrollLeft,id);
     await p.click('#weekNext'); await p.waitForTimeout(600);
     const after=await p.evaluate(i=>document.getElementById(i).scrollLeft,id);
     console.log(' arrow next '+k+': '+Math.round(before)+' -> '+Math.round(after)+'  Δ'+Math.round(after-before));
   }
   // hscroll proxy
   console.log(' hs   ', await p.evaluate(i=>{const w=document.getElementById(i),t=document.getElementById('hsTrack'),n=document.getElementById('hsIn');
     return JSON.stringify({on:document.getElementById('hscroll').classList.contains('on'),
       trkCW:t.clientWidth,trkSW:t.scrollWidth,trkOver:t.scrollWidth-t.clientWidth,
       inW:n.style.width,inRect:Math.round(n.getBoundingClientRect().width),
       wOver:w.scrollWidth-w.clientWidth,
       ratioNeeded:(w.scrollWidth-w.clientWidth)/Math.max(1,t.scrollWidth-t.clientWidth)});},id));
   // drag the proxy thumb all the way right
   await p.evaluate(()=>{const t=document.getElementById('hsTrack');t.scrollLeft=t.scrollWidth;});
   await p.waitForTimeout(400);
   console.log(' after proxy max:', await p.evaluate(i=>{const w=document.getElementById(i),t=document.getElementById('hsTrack');
     return JSON.stringify({trk:Math.round(t.scrollLeft),trkMax:t.scrollWidth-t.clientWidth,
       week:Math.round(w.scrollLeft),weekMax:w.scrollWidth-w.clientWidth});},id));
   await p.close();
 }
 await b.close(); console.log('scroll done');
})();
