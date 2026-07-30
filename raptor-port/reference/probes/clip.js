const {chromium}=require('playwright');
const probe=()=>{
  const q=s=>[...document.querySelectorAll(s)];
  const R={rows:[],bad:0,badList:[]};
  q('#vWeek .form').forEach((fm,fi)=>{
    const a1=fm.querySelector('.acrow'); if(!a1)return;
    const ab=a1.getBoundingClientRect();
    ['csmsn','bto','ld'].forEach(cls=>{
      const c=fm.querySelector('.fcell.'+cls); if(!c)return;
      const kids=[...c.children].filter(k=>k.getBoundingClientRect().height>0);
      if(!kids.length)return;
      const last=kids[kids.length-1].getBoundingClientRect();
      const over=+(last.bottom-ab.bottom).toFixed(1);
      if(fi<3)R.rows.push({f:fi,cls,txt:c.textContent.trim().replace(/\s+/g,'|').slice(0,14),
        kids:kids.length,rowH:+ab.height.toFixed(1),cellSH:c.scrollHeight,over});
      if(over>0.5){R.bad++;if(R.badList.length<5)R.badList.push({f:fi,cls,over,rowH:+ab.height.toFixed(1)});}
    });
  });
  R.acrowH=[...new Set(q('#vWeek .acrow').map(a=>Math.round(a.getBoundingClientRect().height)))].sort((x,y)=>x-y);
  R.puckH=[...new Set(q('#vWeek .acrow .puck').map(a=>Math.round(a.getBoundingClientRect().height)))];
  R.goOV=q('#vWeek .go').map(g=>g.scrollWidth-g.clientWidth).filter(v=>v>0);
  R.dayH=Math.round(document.querySelector('#vWeek .day').getBoundingClientRect().height);
  return R;
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const w of [360,375,390,430,1600]){
  const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser','a'); await p.fill('#lpass','a');
  await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(800);
  console.log('W'+w, JSON.stringify(await p.evaluate(probe)));
  await p.close();
 }
 await b.close();
})();
