const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1600,height:1000}});
 const p=await ctx.newPage(); p.setDefaultTimeout(15000);
 p.on('pageerror',e=>console.log(' PAGEERR',e.message));
 await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
 await p.evaluate(()=>go('editsched')); await p.waitForTimeout(800);
 await p.evaluate(()=>{if(!editMode())document.getElementById('editToggle').click();});
 await p.waitForTimeout(400);
 const out=await p.evaluate(()=>{
   const cell=[...document.querySelectorAll('#eWeek [data-fill]')].filter(x=>/^d:/.test(x.dataset.fill))
     .find(x=>slotVal(x.dataset.fill.replace(/\.\+$/,'')));
   const key=cell.dataset.fill, base=key.replace(/\.\+$/,''), a=base.slice(2).split('.');
   const id=slotVal(base);
   const rp=document.querySelector('.rpuck[data-person="'+id+'"]');
   const dt=new DataTransfer();
   rp.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:dt}));
   const addz=cell.querySelector('.addz')||cell;
   const r=addz.getBoundingClientRect();
   addz.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+2,clientY:r.top+2}));
   addz.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+2,clientY:r.top+2}));
   document.dispatchEvent(new DragEvent('dragend',{bubbles:true}));
   const row=rowRef('d',a), W=validate();
   return JSON.stringify({key,id,row,events:dayEvents(+a[0],id),
     warns:W.all.filter(x=>(x.who||[]).includes(id)&&x.di===+a[0]),
     chip:(W.chip[+a[0]]||{})[id],sev:(W.sev[+a[0]]||{})[id]},null,1);
 });
 console.log(out);
 const txt=await p.evaluate(()=>document.getElementById('eWeek').innerText);
 console.log('rendered:',(txt.match(/.*duty & .*duty clash.*/g)||[]).slice(0,3));
 const pucks=await p.evaluate(()=>{
   const cell=[...document.querySelectorAll('#eWeek [data-fill]')].filter(x=>/^d:/.test(x.dataset.fill))
     .find(x=>/^d:0\.0\./.test(x.dataset.fill)&&x.querySelectorAll('.seat').length>1);
   return cell?cell.innerHTML.slice(0,400):'none';
 });
 console.log('cell html:',pucks);
 await b.close();
})();
