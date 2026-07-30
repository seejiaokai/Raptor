const {chromium}=require('playwright');
const probe=()=>{
  const go=document.querySelector('#vWeek .go');
  const gr=go.getBoundingClientRect();
  const lim=gr.left+go.clientWidth;
  const out=[];
  go.querySelectorAll('*').forEach(e=>{
    const r=e.getBoundingClientRect();
    if(r.width>0&&r.right>lim+0.4)out.push({t:e.tagName+'.'+e.className,r:+r.right.toFixed(1),w:+r.width.toFixed(1),over:+(r.right-lim).toFixed(1),txt:e.textContent.trim().slice(0,16)});
  });
  return {goCW:go.clientWidth,goSW:go.scrollWidth,lim:+lim.toFixed(1),n:out.length,out:out.slice(0,12)};
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const w of [360,375,390]){
  const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a'); await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(800);
  console.log('W'+w, JSON.stringify(await p.evaluate(probe),null,1));
  await p.close();
 }
 await b.close();
})();
