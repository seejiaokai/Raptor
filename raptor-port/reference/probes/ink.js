const {chromium}=require('playwright');
const probe=()=>{
  const out=[];
  const pucks=[...document.querySelectorAll('#vWeek .puck')].slice(0,40);
  for(const p of pucks){
    const nm=p.querySelector('.nm'); if(!nm)continue;
    const t=nm.textContent||''; if(!/[gjpqy]/.test(t))continue;
    const pr=p.getBoundingClientRect(), nr=nm.getBoundingClientRect();
    const rg=document.createRange(); rg.selectNodeContents(nm);
    const tr=rg.getBoundingClientRect();
    out.push({t:t.trim().slice(0,10),
      puck:[+pr.top.toFixed(1),+pr.bottom.toFixed(1),+pr.height.toFixed(1)],
      nm:[+nr.top.toFixed(1),+nr.bottom.toFixed(1),+nr.height.toFixed(1)],
      txt:[+tr.top.toFixed(1),+tr.bottom.toFixed(1),+tr.height.toFixed(1)],
      belowPuck:+(tr.bottom-pr.bottom).toFixed(2), lh:getComputedStyle(nm).lineHeight, fs:getComputedStyle(nm).fontSize,
      ff:getComputedStyle(nm).fontFamily.split(',')[0]});
    if(out.length>=4)break;
  }
  return out;
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
 await p.goto('file:///home/claude/scheduler.html');
 await p.fill('#luser','a'); await p.fill('#lpass','a');
 await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900);
 console.log(JSON.stringify(await p.evaluate(probe),null,1));
 await b.close();
})();
