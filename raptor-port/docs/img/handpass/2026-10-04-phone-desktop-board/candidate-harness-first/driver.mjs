import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json');
const {chromium,devices}=require('@playwright/test');
const out='C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-04-phone-desktop-board/candidate';
mkdirSync(out,{recursive:true});
const results={scope:'Candidate only: frozen diagnostic bundle plus browser-only display:flex override, no source edit or completed repair proof',errors:[],states:[]};
const browser=await chromium.launch({headless:true});
async function shape(page){return page.evaluate(()=>({wide:document.querySelector('.schedboard')?.classList.contains('sb-wide'),wrapper:getComputedStyle(document.querySelector('.sb-boardwrap')).display,sections:[...document.querySelectorAll('#sbBoard .sb-sec')].map(e=>({title:e.querySelector('.sb-sh')?.textContent||e.textContent.slice(0,40),width:e.getBoundingClientRect().width})),sign:document.querySelector('#sbSign').getBoundingClientRect().toJSON(),board:document.querySelector('#sbBoard').getBoundingClientRect().toJSON()}));}
try{
  for(const device of ['phone','desktop']){
    const context=await browser.newContext(device==='phone'?{...devices['iPhone 13'],deviceScaleFactor:1,viewport:{width:390,height:844}}:{viewport:{width:1280,height:700}});
    const page=await context.newPage();page.setDefaultTimeout(10000);
    page.on('pageerror',e=>results.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)results.errors.push(r.status()+' '+r.url());});
    await page.goto('http://127.0.0.1:4220/?fresh=1');
    await page.locator('#luser').fill('ad');await page.locator('#lpass').fill('a');await page.locator('#loginForm button[type=submit]').click();await page.locator('#vWeek .day').first().waitFor({state:'attached'});
    if(device==='phone'){await page.locator('#burger').click();await page.locator('#drawerNav [data-page="editsched"]').click();}else await page.locator('#topnav [data-page="editsched"]').click();
    await page.locator('#eWeek [data-sbday="0"]:visible').click();await page.locator('#sbBoard .sb-sec').first().waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);
    const baseline=await shape(page);await page.screenshot({path:`${out}/${device}-normal-before.png`,animations:'disabled'});
    if(device==='phone'){
      await page.locator('#sbMore').click();await page.locator('#sbMoreWide').click();
      await page.waitForFunction(()=>[...document.querySelectorAll('#sbBoard .sb-sec')].every(e=>e.getBoundingClientRect().width===0));
      results.states.push({name:'phone-wide-before',facts:await shape(page)});await page.screenshot({path:`${out}/phone-wide-before.png`,animations:'disabled'});
    }
    await page.addStyleTag({content:'.schedboard.sb-wide .sb-boardwrap{display:flex}'});
    if(device==='phone')await page.waitForFunction(()=>[...document.querySelectorAll('#sbBoard .sb-sec')].every(e=>e.getBoundingClientRect().width>300));
    const candidate=await shape(page);
    if(device==='desktop')assert.deepEqual(candidate,baseline);
    await page.screenshot({path:`${out}/${device}-candidate.png`,animations:'disabled'});
    results.states.push({name:`${device}-candidate`,baseline,facts:candidate});
    await context.close();
  }
}finally{await browser.close();}
assert.equal(results.errors.length,0);
writeFileSync(`${out}/candidate.json`,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({candidateOnly:true,errors:results.errors.length,states:results.states.map(x=>({name:x.name,sectionWidths:x.facts.sections.map(s=>s.width)}))}));
