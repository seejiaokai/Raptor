const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const vp of [{width:360,height:900},{width:375,height:900},{width:390,height:900},{width:430,height:900},{width:1600,height:1000}]){
   const p=await b.newPage({viewport:vp,deviceScaleFactor:2});
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
   const r=await p.evaluate(()=>{
     const one=[...document.querySelectorAll('#vWeek .plist.one')];
     const many=[...document.querySelectorAll('#vWeek .plist:not(.one)')];
     const tpl=el=>getComputedStyle(el.querySelector('.pl-row')||el).gridTemplateColumns;
     const R=e=>e.getBoundingClientRect();
     // does any NAME cell paint over the TIME cell that follows it?
     let spill=0,worst=0,names=[];
     one.forEach(bl=>bl.querySelectorAll('.pl-row').forEach(row=>{
       const nm=row.querySelector('.nm'), t=row.querySelector('.t');
       if(!nm||!t)return;
       const over=R(nm).right-R(t).left;
       if(over>0.5){spill++; if(over>worst){worst=over;names=[nm.textContent.trim(),Math.round(over)];}}
     }));
     // do pucks fit their track / does any row exceed its block?
     let pplOV=0, rowOV=0;
     one.forEach(bl=>{const bw=R(bl).right;
       bl.querySelectorAll('.pl-row').forEach(row=>{
         if(R(row).right>bw+0.6)rowOV++;
         const pp=row.querySelector('.ppl'); if(pp&&R(pp).right>R(row).right+0.6)pplOV++;
         [...row.querySelectorAll('.puck')].forEach(k=>{if(R(k).right>R(pp).right+0.6)pplOV++;});
       });});
     const nmW=one.length?Math.round(R(one[0].querySelector('.pl-row .nm')).width):0;
     const rmkW=one.length?Math.round(R(one[0].querySelector('.pl-row .rmk')||one[0]).width):0;
     const blocks=one.map(bl=>bl.querySelector('.sub-h').textContent);
     return {oneN:one.length,manyN:many.length,oneTpl:one.length?tpl(one[0]):'',
             manyTpl:many.length?tpl(many[0]):'',spill,worst:names,pplOV,rowOV,nmW,rmkW,blocks};
   });
   console.log('W'+vp.width, JSON.stringify(r));
   if(vp.width===390){
     await p.locator('#vWeek .plist.sec-grnd').first().scrollIntoViewIfNeeded();
     await p.locator('#vWeek .plist.sec-grnd').first().screenshot({path:'/tmp/b15-grnd-m.png'});
     await p.locator('#vWeek .plist.sec-avail').first().screenshot({path:'/tmp/b15-avail-m.png'});
     await p.locator('#vWeek .plist.sec-duty').first().screenshot({path:'/tmp/b15-duty-m.png'});
   }
   if(vp.width===1600){
     await p.locator('#vWeek .plist.sec-grnd').first().screenshot({path:'/tmp/b15-grnd-d.png'});
   }
   await p.close();
 }
 await b.close(); console.log('one done');
})();
