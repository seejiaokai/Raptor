const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';

const TD_SRC = `(()=>{ window.__td=async function(sx,sy,tx,ty,hold){
  const ev=(t,x,y)=>{const e=new PointerEvent(t,{bubbles:true,cancelable:true,composed:true,
      pointerId:1,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});
    const el=document.elementFromPoint(x,y)||document.body; el.dispatchEvent(e);};
  const sleep=m=>new Promise(r=>setTimeout(r,m));
  ev('pointerdown',sx,sy);
  await sleep(hold==null?260:hold);
  const armed=document.body.classList.contains('tdrag');
  for(let i=1;i<=6;i++){ev('pointermove',sx+(tx-sx)*i/6,sy+(ty-sy)*i/6); await sleep(16);}
  const ghost=document.querySelectorAll('.tdghost').length, over=document.querySelectorAll('.dragover').length;
  await sleep(30); ev('pointerup',tx,ty); await sleep(160);
  return {armed,ghost,over,ghostLeft:document.querySelectorAll('.tdghost').length,
          tdrag:document.body.classList.contains('tdrag'),dnd:document.body.classList.contains('dnd')};
};
window.__snap=function(root){const o={};
  document.querySelectorAll(root+' [data-slot]').forEach(x=>{o[x.dataset.slot]=slotVal(x.dataset.slot)||'';});
  return o;};
window.__mid=function(sel,pick){const els=[...document.querySelectorAll(sel)];
  const e=pick!=null?els[pick]:els[0]; if(!e)return null;
  const q=e.getBoundingClientRect(); return [Math.round(q.x+q.width/2),Math.round(q.y+q.height/2)];};
})()`;

const diff=(a,b)=>Object.keys(b).filter(k=>a[k]!==b[k]).map(k=>k+': "'+(a[k]||'')+'" -> "'+(b[k]||'')+'"');

(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const vp of [{width:390,height:900},{width:430,height:930}]){
   const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true});
   const p=await ctx.newPage(); p.setDefaultTimeout(20000);
   p.on('pageerror',e=>console.log('  PAGEERR',e.message));
   await p.goto(F); await p.fill('#luser','a'); await p.fill('#lpass','a');
   await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
   await p.evaluate(()=>go('editsched')); await p.waitForTimeout(600);
   await p.evaluate(()=>openScheduler(0)); await p.waitForTimeout(600);
   await p.evaluate(TD_SRC);
   await p.waitForTimeout(200);
   console.log('--- W'+vp.width+' touch · scheduler board');

   const run=async (label,pick)=>{
     const before=await p.evaluate(()=>window.__snap('#sbBoard'));
     // 1 · bring both ends on screen, 2 · let the scroll settle, 3 · THEN measure
     const found=await p.evaluate(pk=>{
       const src=document.querySelector(pk.s);
       const dst=[...document.querySelectorAll(pk.d)].filter(pk.f?new Function('x','return '+pk.f):()=>true)[pk.i||0];
       if(!src||!dst)return false;
       window.__src=src; window.__dst=dst;
       dst.scrollIntoView({block:'center',inline:'center',behavior:'auto'});
       src.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});
       return true;},pick);
     if(!found){console.log(' '+label+': no target');return;}
     await p.waitForTimeout(450);
     const pts=await p.evaluate(()=>{
       const src=window.__src,dst=window.__dst;
       const R=e=>{const q=e.getBoundingClientRect();return [Math.round(q.x+q.width/2),Math.round(q.y+q.height/2)];};
       const vis=e=>{const q=e.getBoundingClientRect();
         return q.width>2&&q.height>2&&q.top>0&&q.bottom<innerHeight&&q.left>=0&&q.right<=innerWidth;};
       const hit=e=>{const c=R(e);const t=document.elementFromPoint(c[0],c[1]);return !!(t&&e.contains(t));};
       return {s:R(src),d:R(dst),key:dst.dataset.slot||'',id:src.dataset.person||'',
               vis:vis(src)+'/'+vis(dst),hit:hit(src)+'/'+hit(dst),
               was:dst.dataset.slot?slotVal(dst.dataset.slot):''};});
     const st=await p.evaluate(i=>window.__td(i.s[0],i.s[1],i.d[0],i.d[1],i.hold),Object.assign({},pts,{hold:pick.hold}));
     const after=await p.evaluate(()=>window.__snap('#sbBoard'));
     console.log(' '+label+':',JSON.stringify(st),'| vis='+pts.vis+' hit='+pts.hit+' src='+pts.id+' tgt='+pts.key+' was="'+pts.was+'"',
       '| changed:',JSON.stringify(diff(before,after)));
   };

   await run('roster -> seat ',{s:'#sbRoster .rpuck[data-person]',
     d:'#sbBoard .seat[data-slot]',f:'x.getBoundingClientRect().width>4&&x.getBoundingClientRect().top>120&&!x.closest("[data-fill]")'});
   await run('swap seats    ',{s:'#sbBoard .seat[data-slot] .puck',
     d:'#sbBoard .seat[data-slot]',f:'x.getBoundingClientRect().width>4&&slotVal(x.dataset.slot)&&x.getBoundingClientRect().top>120',i:2});
   await run('seat -> bin   ',{s:'#sbBoard .seat[data-slot] .puck',d:'#sbRoster'});
   await run('quick swipe   ',{s:'#sbRoster .rpuck[data-person]',
     d:'#sbBoard .seat[data-slot]',f:'x.getBoundingClientRect().width>4&&x.getBoundingClientRect().top>120&&!x.closest("[data-fill]")',hold:0});

   // the mobile edit week itself
   console.log('   >> closing board');
   await p.evaluate(()=>closeScheduler()); await p.waitForTimeout(500);
   console.log('   >> board closed');
   const wBefore=await p.evaluate(()=>window.__snap('#eWeek'));
   const wpts=await p.evaluate(()=>{
     const seats=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')]
       .filter(x=>slotVal(x.dataset.slot)&&x.getBoundingClientRect().width>4);
     const a=seats[0], c=seats.find(x=>x!==a&&slotVal(x.dataset.slot)!==slotVal(a.dataset.slot));
     if(!a||!c)return null;
     a.scrollIntoView({block:'center'});
     const R=e=>{const q=e.getBoundingClientRect();return [Math.round(q.x+q.width/2),Math.round(q.y+q.height/2)];};
     return {s:R(a),d:R(c),ka:a.dataset.slot,kb:c.dataset.slot,va:slotVal(a.dataset.slot),vb:slotVal(c.dataset.slot)};});
   if(wpts){
     const st=await p.evaluate(i=>window.__td(i.s[0],i.s[1],i.d[0],i.d[1]),wpts);
     const wAfter=await p.evaluate(()=>window.__snap('#eWeek'));
     const ok=wAfter[wpts.ka]===wpts.vb&&wAfter[wpts.kb]===wpts.va;
     console.log(' week swap     :',JSON.stringify(st),'|',ok?'SWAPPED OK':'FAIL','| changed:',JSON.stringify(diff(wBefore,wAfter)));
   } else console.log(' week swap     : no pair');
   await ctx.close();
 }
 await b.close(); console.log('tdrag done');
})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
