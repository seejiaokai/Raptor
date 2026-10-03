/* The remaining shared window families and the inherited builds' join.
   One dense production world, built through controls; no state injection. */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { buildSaturday } from './fixture.mjs'
const base=process.env.HP_URL||'http://localhost:4230',out='docs/handpass/css-split/'+(process.env.CSS_EXTRAS_RUN||'extras-after-01')
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));assert.ok(!existsSync(out));mkdirSync(out,{recursive:true})
const report={pictures:[],operations:[],errors:[],status:'RUNNING'},flush=()=>writeFileSync(out+'/result.json',JSON.stringify(report,null,2))
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
const ctx=await browser.newContext({viewport:{width:1600,height:900}}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message))
const settle=async()=>{await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400)}
async function hit(s){const l=typeof s==='string'?p.locator(s).first():s;await l.waitFor({state:'visible'});await l.scrollIntoViewIfNeeded();assert.ok(await l.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h===e||e.contains(h)}),`Covered ${s}`);await l.click();await settle()}
async function nav(to){if(await p.locator('#burger').isVisible()){await hit('#burger');await hit(`#drawerNav [data-page=${to}]`)}else await hit(`#topnav [data-page=${to}]`);await p.locator(`#page-${to}.on`).waitFor();await settle()}
async function shot(name){const path=out+'/'+name+'.png';await p.screenshot({path,animations:'disabled'});report.pictures.push(path);flush();console.log('PICTURE',name)}
async function top(){await p.locator('.sb-main').hover();await p.mouse.wheel(0,-100000);await p.mouse.wheel(-100000,0);await settle()}
async function edit(selector,value){await hit(selector);await p.locator(selector).fill(value);await p.locator(selector).press('Tab');await settle()}
try{
 await p.goto(base+'/?fresh=1');await p.locator('#luser').fill('ad');await p.locator('#lpass').fill('a');await hit('#loginForm button[type=submit]')
 report.operations.push({name:'dense Saturday via actual controls',facts:await buildSaturday(p)})
 if(process.env.CSS_EXTRAS_WINDOWS_ONLY!=='1'){
 await hit('#sbDone');await nav('logic');await hit('#lgEdit');await p.locator('#lgMissionMix').setChecked(true);await hit('#lgDone');await nav('editsched');await hit('#eWeek [data-sbday="5"]:visible')
 await edit('#sbBoard [data-bfld="ff:5.0.0.to"]:visible','12:00')
 await edit('#sbBoard [data-bfld="ff:5.0.0.ld"]:visible','13:00')
 await edit('#sbBoard [data-bfld="ff:5.0.0.msn"]:visible','ACM')
 await edit('#sbBoard [data-bfld="fr:5.0.0.0"]:visible','DS FOR CSS WALK')
 assert.equal(await p.locator('[data-role-side=red]').count(),1)
 await hit('#sbBoard [data-itadd="5|0"]');await edit('#sbBoard [data-itline="5|0|0"]','10:20 RALLY')
 assert.equal(await p.locator('[data-role-side=red]').count(),1,'Rally edit retains the own-edit role question')
 await shot('desktop-rally-and-role');await hit('[data-role-side=red]')
 assert.ok((await p.locator('#sbWarn').innerText()).toLowerCase().includes('rally'),'Wrong Rally is visibly warned')
 report.operations.push({name:'Board own mission/remarks + Rally + Red answer',status:'PASS'})
 await hit('#sbDone');await nav('editsched')
 await edit('#eWeek [data-txt="fr:5.0.0.0"]','DS FOR CSS WEEK')
 assert.equal(await p.locator('[data-role-side=red]').count(),1)
 await edit('#eWeek [data-itline="5|0|0"]','09:50 RALLY')
 assert.equal(await p.locator('[data-role-side=red]').count(),1,'Week Rally edit retains the own-edit role question')
 // The native keyboard route is distinct from the Board mouse route above.
 await p.locator('[data-role-side=blue]').focus();await p.locator('[data-role-side=blue]').press('Enter');await settle()
 assert.equal(await p.locator('[data-role-side=blue]').count(),0)
 report.operations.push({name:'Week own remarks + Rally + native keyboard Blue answer',status:'PASS'})
 }else await hit('#sbDone')
 for(const [kind,width,height] of [['desktop',1600,900],['phone',390,844]]){
  await p.setViewportSize({width,height});await settle();await nav('editsched');await hit('#eWeek [data-sbday="5"]:visible');await top()
  await hit('#sbBoard [data-oilsent]:visible');await shot(`${kind}-board-availability`);await hit('.availwin .win-x')
  await hit('#schedBoard [data-planmenu="5"]:visible');await shot(`${kind}-plans-menu`)
  if(kind==='desktop'){
   await hit('.wavemenu [data-plandup]');await hit('#schedBoard [data-planmenu="5"]:visible')
  }
  await hit('.wavemenu [data-planmanage]');await shot(`${kind}-plans-manager`);await hit('#draftsClose')
  if(kind==='phone'){
   await hit('#sbMore');await hit('#sbMoreWide');await top();await shot('phone-board-wide-content')
   assert.ok(await p.locator('#sbBoard .sb-go-h:visible').count(),'Wide Board has day contents')
   await hit('#sbMore');await hit('#sbMoreWide')
  }
  await hit('#sbDone');await hit('#eWeek [data-oilsent]:visible');await shot(`${kind}-week-availability`);await hit('.availwin .win-x')
  await nav('inputs');await hit('#inCalBtn');await hit('#icPrev');await shot(`${kind}-calendar-previous-month`);await hit('#icNext');await hit('#icClose')
  await hit('#inMedBtn');await hit('#medView .medcard');await shot(`${kind}-medical-document`)
  if(await p.locator('#docViewNext').isVisible()){await hit('#docViewNext');report.operations.push(`${kind} next medical document`)}
  await hit('#docViewDone');await hit('#medClose')
  report.operations.push(`${kind} shared windows opened/closed via their own controls`)
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';flush()
}catch(e){report.status='FAIL';report.failure=String(e);flush();throw e}finally{await browser.close()}
