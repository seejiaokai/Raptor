const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
const p=await ctx.newPage();p.setDefaultTimeout(20000);
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('editsched'));await p.waitForTimeout(700);
await p.evaluate(()=>{if(!editMode())document.getElementById('editToggle').click();
  document.body.classList.add('ros-open');});
await p.waitForTimeout(350);
console.log(await p.evaluate(async()=>{
  const ev=(t,x,y)=>{const e=new PointerEvent(t,{bubbles:true,cancelable:true,composed:true,
    pointerId:1,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});
    (document.elementFromPoint(x,y)||document.body).dispatchEvent(e);};
  const sleep=m=>new Promise(r=>setTimeout(r,m));
  const R=e=>{const q=e.getBoundingClientRect();return [Math.round(q.x+q.width/2),Math.round(q.y+q.height/2)];};
  // bring a jet line into view first — the drawer is fixed, so it stays put
  document.querySelector('#eWeek .acrow .seat[data-slot]').scrollIntoView({block:'center'});
  await sleep(350);
  const src=[...document.querySelectorAll('#eRoster .rpuck:not(.no)')]
    .find(x=>{const q=x.getBoundingClientRect();return q.width>4&&q.top>140&&q.bottom<820
      &&!/allavail|allsans/i.test(x.dataset.person);});
  if(!src)return 'no reachable palette puck';
  const id=src.dataset.person, s=R(src);
  ev('pointerdown',s[0],s[1]); await sleep(260);
  const armed=document.body.classList.contains('tdrag');
  const parked=!document.body.classList.contains('ros-open');
  // NOW the drawer is out of the way — find a seat in the space it freed
  const seat=[...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')]
    .find(x=>{const q=x.getBoundingClientRect();
      return q.width>4&&q.top>140&&q.bottom<820&&q.right<innerWidth-30;});
  if(!seat){ev('pointerup',s[0],s[1]);
    return 'drawer parked='+parked+' but no seat on screen · vw'+innerWidth+' vh'+innerHeight+' · sample '
      +JSON.stringify([...document.querySelectorAll('#eWeek .acrow .seat[data-slot]')].slice(0,5)
        .map(x=>{const q=x.getBoundingClientRect();
          return [Math.round(q.left),Math.round(q.right),Math.round(q.top),Math.round(q.bottom),Math.round(q.width)];}));}
  const key=seat.dataset.slot, before=slotVal(key), t=R(seat);
  for(let i=1;i<=8;i++){ev('pointermove',s[0]+(t[0]-s[0])*i/8,s[1]+(t[1]-s[1])*i/8);await sleep(16);}
  ev('pointerup',t[0],t[1]); await sleep(320);
  return `pick up ${PEOPLE[id].cs} · armed ${armed} · drawer parked mid-drag ${parked}`
    +`\n         drop on ${key} · "${before}" -> "${slotVal(key)}" · landed ${slotVal(key)===id}`
    +`\n         drawer back open after drop ${document.body.classList.contains('ros-open')}`;}));
await b.close();console.log('drawdrag done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
