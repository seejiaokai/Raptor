const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const vw of [1600,1280,2000]){
const p=await (await b.newContext({viewport:{width:vw,height:1000}})).newPage();
await p.goto('file:///home/claude/scheduler.html');await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
console.log('--- viewport '+vw);
console.log(await p.evaluate(()=>{
  const w=document.getElementById('vWeek'),bar=document.getElementById('hscroll'),
        trk=document.getElementById('hsTrack'),inn=document.getElementById('hsIn');
  const cw=w.clientWidth,sw=w.scrollWidth,over=sw-cw;
  const tw=trk.clientWidth,iw=inn.getBoundingClientRect().width,tmax=trk.scrollWidth-trk.clientWidth;
  return ['week  cw='+cw+' sw='+sw+' over='+over+' visible fraction='+(cw/sw).toFixed(3),
   'bar   width='+Math.round(bar.getBoundingClientRect().width)+' track cw='+tw+' inner='+Math.round(iw)
     +' trk sw='+trk.scrollWidth+' tmax='+tmax,
   'thumb wanted='+(cw/sw).toFixed(3)+' actual='+(tw/trk.scrollWidth).toFixed(3)
     +'  ← should match'].join('\n         ');}));
// walk the week and see whether the thumb tracks proportionally
console.log('  track:',await p.evaluate(async()=>{
  const w=document.getElementById('vWeek'),trk=document.getElementById('hsTrack');
  const out=[];
  for(const f of [0,0.25,0.5,0.75,1]){
    const over=w.scrollWidth-w.clientWidth;
    w.scrollTo({left:over*f,behavior:'instant'});
    await new Promise(r=>setTimeout(r,120));
    const tmax=trk.scrollWidth-trk.clientWidth;
    out.push(f.toFixed(2)+'→thumb '+(tmax?(trk.scrollLeft/tmax):0).toFixed(2));
  }
  return out.join('  ');}));
// and drive it from the thumb
console.log('  drive:',await p.evaluate(async()=>{
  const w=document.getElementById('vWeek'),trk=document.getElementById('hsTrack');
  const out=[];
  for(const f of [0,0.25,0.5,0.75,1]){
    const tmax=trk.scrollWidth-trk.clientWidth;
    trk.scrollLeft=tmax*f;
    await new Promise(r=>setTimeout(r,140));
    const over=w.scrollWidth-w.clientWidth;
    out.push(f.toFixed(2)+'→week '+(over?(w.scrollLeft/over):0).toFixed(2));
  }
  return out.join('  ');}));
await p.close();}
await b.close();console.log('hs done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
