const {chromium}=require('playwright');
const F='file:///home/claude/scheduler.html';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const vp of [{width:390,height:900,t:true},{width:1600,height:1000,t:false}]){
const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:vp.t,isMobile:vp.t});
const p=await ctx.newPage(); p.setDefaultTimeout(15000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto(F);await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(800);
await p.evaluate(()=>{go('editsched');openScheduler(0);});await p.waitForTimeout(700);
console.log('--- W'+vp.width);
console.log(' targets  :',await p.evaluate(()=>{
  const seats=[...document.querySelectorAll('#sbBoard .seat[data-slot]')];
  const empt=[...document.querySelectorAll('#sbBoard .sb-slot.empty[data-slot]')];
  const fills=[...document.querySelectorAll('#sbBoard [data-fill]')];
  const hit=e=>{const q=e.getBoundingClientRect();const t=document.elementFromPoint(Math.round(q.x+q.width/2),Math.round(q.y+q.height/2));return !!(t&&e.contains(t));};
  const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.top>0&&q.bottom<innerHeight;};
  return 'seats '+seats.length+' (visible '+seats.filter(vis).length+', hittable '+seats.filter(x=>vis(x)&&hit(x)).length+')'
   +' · empty '+empt.length+' · fills '+fills.length
   +' · draggable '+document.querySelectorAll('#sbBoard [draggable="true"]').length;}));
// MOUSE drag on the board (works on desktop; proves the model path)
console.log(' mouse dnd:',await p.evaluate(()=>{
  const src=document.querySelector('#sbRoster .rpuck[data-person]');
  const dst=[...document.querySelectorAll('#sbBoard .seat[data-slot]')][0];
  if(!src||!dst)return 'no pair';
  const k=dst.dataset.slot, before=slotVal(k);
  const dt={data:{},setData(a,b2){this.data[a]=b2},getData(a){return this.data[a]||''}};
  const mk=t=>{const e=new Event(t,{bubbles:true,cancelable:true});try{e.dataTransfer=dt}catch(_){}
    const q=dst.getBoundingClientRect();
    try{Object.defineProperty(e,'clientX',{value:Math.round(q.x+q.width/2)});Object.defineProperty(e,'clientY',{value:Math.round(q.y+q.height/2)});}catch(_){}
    return e;};
  src.dispatchEvent(mk('dragstart')); dst.dispatchEvent(mk('dragover')); dst.dispatchEvent(mk('drop')); src.dispatchEvent(mk('dragend'));
  return k+': "'+before+'" -> "'+slotVal(k)+'" (want '+src.dataset.person+')';}));
// where does the sign-off live
console.log(' signoff  :',await p.evaluate(()=>{
  const el=document.getElementById('sbSignBar'); if(!el)return 'missing';
  const inTop=!!el.closest('.sb-top'), r=el.getBoundingClientRect();
  return 'in .sb-top='+inTop+' top='+Math.round(r.top)+' scrollsAway='+!inTop;}));
await ctx.close();}
await b.close();console.log('board done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
