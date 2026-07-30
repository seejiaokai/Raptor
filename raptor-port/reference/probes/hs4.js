const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const page of ['viewsched','editsched']){
const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
if(page==='editsched'){await p.click('.nav a[data-page="editsched"]');await p.waitForTimeout(800);}
const id=page==='editsched'?'eWeek':'vWeek';
const read=()=>p.evaluate(i=>{const w=document.getElementById(i),t=document.getElementById('hsTrack');
  const tm=t.scrollWidth-t.clientWidth,wm=w.scrollWidth-w.clientWidth;
  return {t:tm?t.scrollLeft/tm:0,w:wm?w.scrollLeft/wm:0};},id);
console.log('--- '+page);
const box=await p.evaluate(()=>{const r=document.getElementById('hsTrack').getBoundingClientRect();
  return {x:r.x+r.width/2,y:r.y+r.height/2};});
await p.mouse.move(box.x,box.y);
const out=[];
for(let k=0;k<6;k++){await p.mouse.wheel(220,0);await p.waitForTimeout(120);
  const r=await read();out.push(r.t.toFixed(2)+'/'+r.w.toFixed(2));}
console.log('  wheel on track  :',out.join(' '));
// now wheel over the WEEK itself (shift+wheel path)
const wb=await p.evaluate(i=>{const r=document.getElementById(i).getBoundingClientRect();
  return {x:r.x+r.width/2,y:r.y+120};},id);
await p.mouse.move(wb.x,wb.y);
const out2=[];
for(let k=0;k<4;k++){await p.mouse.wheel(-260,0);await p.waitForTimeout(140);
  const r=await read();out2.push(r.t.toFixed(2)+'/'+r.w.toFixed(2));}
console.log('  wheel on week   :',out2.join(' '));
console.log('  mismatch max    :',await p.evaluate(i=>{const w=document.getElementById(i),t=document.getElementById('hsTrack');
  const tm=t.scrollWidth-t.clientWidth,wm=w.scrollWidth-w.clientWidth;
  return Math.abs((tm?t.scrollLeft/tm:0)-(wm?w.scrollLeft/wm:0)).toFixed(4);},id));
await p.close();}
await b.close();console.log('hs4 done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
