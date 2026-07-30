const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1600,height:1000}});
const p=await ctx.newPage(); p.setDefaultTimeout(20000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
console.log('pax labels  :', await p.evaluate(()=>document.querySelectorAll('.paxn').length+' (want 0)'));
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);

const dnd=(sel,x,y)=>p.evaluate(([s,X,Y])=>{
  const src=document.querySelector(s);
  const dt={data:{},setData(k,v){this.data[k]=v},getData(k){return this.data[k]||''}};
  const mk=t=>{const e=new Event(t,{bubbles:true,cancelable:true});try{e.dataTransfer=dt}catch(_){}
    if(X!=null){try{Object.defineProperty(e,'clientX',{value:X});Object.defineProperty(e,'clientY',{value:Y});}catch(_){}}
    return e;};
  src.dispatchEvent(mk('dragstart'));
  const tgt=document.elementFromPoint(X,Y)||document.body;
  tgt.dispatchEvent(mk('dragover'));tgt.dispatchEvent(mk('drop'));src.dispatchEvent(mk('dragend'));
  return tgt.className;},[sel,x,y]);

// a duty row: one person today
const info=await p.evaluate(()=>{
  const cell=document.querySelector('#eWeek [data-fill^="d:"]');
  cell.scrollIntoView({block:'center'});
  const r=cell.getBoundingClientRect(), seat=cell.querySelector('.seat[data-slot]');
  const sr=seat?seat.getBoundingClientRect():null;
  return {fill:cell.dataset.fill,n:cell.querySelectorAll('.puck').length,
    cellBottom:[Math.round(r.left+30),Math.round(r.bottom-2)],
    onPuck:sr?[Math.round(sr.x+sr.width/2),Math.round(sr.y+sr.height/2)]:null,
    nearMiss:sr?[Math.round(sr.right+4),Math.round(sr.y+sr.height/2)]:null,
    farBelow:sr?[Math.round(sr.x+sr.width/2),Math.round(sr.bottom+30)]:null};});
await p.waitForTimeout(300);
console.log('duty cell   :',JSON.stringify(info));

const crew=k=>p.evaluate(kk=>{const c=document.querySelector('#eWeek [data-fill="'+kk+'"]');
  return c?[...c.querySelectorAll('.puck[data-person]')].map(x=>x.dataset.person).join(','):'gone';},k);
console.log(' before     :',await crew(info.fill));
// 1 · drop ON the puck -> swap/replace
await dnd('#eRoster .rpuck[data-person]',info.onPuck[0],info.onPuck[1]); await p.waitForTimeout(400);
console.log(' on puck    :',await crew(info.fill),'(want 1 name, replaced)');
// 2 · drop a few px past its right edge -> still a swap (margin)
const src2=await p.evaluate(()=>{const r=[...document.querySelectorAll('#eRoster .rpuck[data-person]')];return r[3].dataset.person;});
await p.evaluate(()=>{const c=document.querySelector('#eWeek [data-fill^="d:"]');c.scrollIntoView({block:'center'});});
await p.waitForTimeout(300);
const m=await p.evaluate(()=>{const s=document.querySelector('#eWeek [data-fill^="d:"] .seat[data-slot]').getBoundingClientRect();
  return [Math.round(s.right+4),Math.round(s.y+s.height/2)];});
await dnd('#eRoster .rpuck[data-person]:nth-of-type(4)',m[0],m[1]); await p.waitForTimeout(400);
console.log(' near miss  :',await crew(info.fill),'(want still 1 — margin swap)');
// 3 · drop well below -> add
const far=await p.evaluate(()=>{const c=document.querySelector('#eWeek [data-fill^="d:"]');
  const z=c.querySelector('.addz').getBoundingClientRect();
  return [Math.round(z.x+z.width/2),Math.round(z.y+z.height/2)];});
await dnd('#eRoster .rpuck[data-person]:nth-of-type(6)',far[0],far[1]); await p.waitForTimeout(400);
console.log(' below      :',await crew(info.fill),'(want 2)');
// 4 · keep going, no limit
for(let i=8;i<14;i+=2){
  const f2=await p.evaluate(()=>{const c=document.querySelector('#eWeek [data-fill^="d:"]');
    c.scrollIntoView({block:'center'});
    const z=c.querySelector('.addz').getBoundingClientRect();
    return [Math.round(z.x+z.width/2),Math.round(z.y+z.height/2)];});
  await dnd('#eRoster .rpuck[data-person]:nth-of-type('+i+')',f2[0],f2[1]); await p.waitForTimeout(250);
}
console.log(' unlimited  :',await crew(info.fill));
// 5 · flying line refuses a third
const fly=await p.evaluate(()=>{const row=document.querySelector('#eWeek .acrow');
  row.scrollIntoView({block:'center'});const r=row.getBoundingClientRect();
  return {n:row.querySelectorAll('.puck').length,pt:[Math.round(r.left+40),Math.round(r.bottom-2)]};});
await p.waitForTimeout(300);
await dnd('#eRoster .rpuck[data-person]:nth-of-type(10)',fly.pt[0],fly.pt[1]); await p.waitForTimeout(400);
console.log(' jet line   :', await p.evaluate(()=>document.querySelector('#eWeek .acrow').querySelectorAll('.puck').length)+' pucks (want '+fly.n+')');
await p.evaluate(()=>{document.querySelector('#eWeek [data-fill^="d:"]').scrollIntoView({block:'center'});});
await p.waitForTimeout(300);
await p.locator('#eWeek .plist.sec-duty').first().screenshot({path:'/tmp/b23-duty.png'});
await b.close();console.log('add done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
