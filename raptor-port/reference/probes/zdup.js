const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1600,height:1000}});
 const p=await ctx.newPage(); p.setDefaultTimeout(20000);
 p.on('pageerror',e=>console.log(' PAGEERR',e.message));
 await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
 await p.evaluate(()=>go('editsched')); await p.waitForTimeout(800);
 console.log(await p.evaluate(()=>{
   if(!editMode())document.getElementById('editToggle').click();
   return 'editMode '+editMode();
 }));
 await p.waitForTimeout(400);
 const info=await p.evaluate(()=>{
   const cells=[...document.querySelectorAll('#eWeek [data-fill]')];
   const byPfx={};cells.forEach(c=>{const k=c.dataset.fill.split(':')[0];byPfx[k]=(byPfx[k]||0)+1;});
   return {n:cells.length,byPfx,sample:cells.slice(0,6).map(c=>c.dataset.fill)};
 });
 console.log(JSON.stringify(info));
 // pick a duty cell whose primary seat is occupied
 const t=await p.evaluate(()=>{
   const c=[...document.querySelectorAll('#eWeek [data-fill]')].filter(x=>/^d:/.test(x.dataset.fill))
     .find(x=>slotVal(x.dataset.fill.replace(/\.\+$/,'')));
   if(!c)return null;
   c.scrollIntoView({block:'center'});
   c.id='ZDUP';
   return {key:c.dataset.fill,id:slotVal(c.dataset.fill.replace(/\.\+$/,''))};
 });
 console.log('target',JSON.stringify(t));
 // 1) can a tap arm it?
 await p.click('#ZDUP .addz',{force:true}).catch(e=>console.log('click addz err',e.message));
 console.log('armed after tap:',await p.evaluate(()=>armedKey()));
 // 2) real mouse drag from the palette puck of the SAME person onto the cell's add strip
 const rp=await p.$(`.rpuck[data-person="${t.id}"]`);
 console.log('palette puck class:',await p.evaluate(e=>e.className+' | why='+(e.dataset.why||''),rp));
 const src=await rp.boundingBox();
 const dst=await (await p.$('#ZDUP .addz')).boundingBox();
 console.log('boxes',JSON.stringify(src),JSON.stringify(dst));
 await p.mouse.move(src.x+src.width/2,src.y+src.height/2);
 await p.mouse.down();
 await p.mouse.move(dst.x+dst.width/2,dst.y+dst.height/2,{steps:12});
 await p.mouse.move(dst.x+dst.width/2,dst.y+dst.height/2,{steps:3});
 await p.mouse.up();
 await p.waitForTimeout(600);
 console.log(await p.evaluate(k=>{
   const base=k.replace(/\.\+$/,''),a=base.slice(2).split('.');
   const r=rowRef('d',a);
   const W=validate();
   const id=r.id;
   return JSON.stringify({row:r,
     events:dayEvents(+a[0],id),
     warns:W.all.filter(x=>(x.who||[]).includes(id)&&x.di===+a[0]),
     chip:W.chip[+a[0]]&&W.chip[+a[0]][id], sev:W.sev[+a[0]]&&W.sev[+a[0]][id]});
 },t.key));
 const txt=await p.evaluate(()=>document.getElementById('eWeek').innerText);
 console.log('rendered clash lines:',(txt.match(/.*duty & .*duty clash.*/g)||[]).slice(0,3));
 await p.screenshot({path:'/tmp/w/zdup.png',fullPage:false});
 await b.close();
})();
