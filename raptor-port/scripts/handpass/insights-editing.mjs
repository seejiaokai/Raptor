/* Frozen production-bundle walk. All edits use real fields/buttons; all screenshots must be opened. */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { buildSaturday } from './fixture.mjs'
import { login, go, board } from './lib.mjs'
if(process.env.INSIGHTS_FROZEN!=='1')throw new Error('Frozen build required')
const base=process.env.HP_URL||'http://localhost:4199',out='docs/img/insights-build-editing/'+(process.env.HP_RUN||new Date().toISOString().replace(/[:.]/g,'-'))
if(existsSync(out))throw new Error('Choose a fresh evidence folder')
mkdirSync(out,{recursive:true});const report={base,results:[],pictures:[],errors:[],limitations:['Chromium emulation, not physical iPhone/iOS keyboard.']}
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
async function check(page,id,fn){try{const facts=await fn();report.results.push({id,status:'PASS',facts});console.log('PASS',id)}catch(e){report.results.push({id,status:'FAIL',error:String(e)});await shot(page,id+'-failure');throw e}finally{writeFileSync(out+'/result.json',JSON.stringify(report,null,2))}}
async function shot(page,name){const path=out+'/'+name+'.png';await page.screenshot({path,fullPage:false});report.pictures.push(path)}
const settle=page=>page.waitForTimeout(160)
async function closeBoard(page){if(await page.locator('#sbDone:visible').count()){await page.locator('#sbDone:visible').click();await page.locator('#schedBoard').waitFor({state:'hidden'});await settle(page)}}
async function hit(loc){await loc.waitFor({state:'visible'});try{await loc.scrollIntoViewIfNeeded()}catch(e){if(!String(e).includes('not attached'))throw e;await loc.waitFor({state:'visible'});await loc.scrollIntoViewIfNeeded()}assert.equal(await loc.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h===e||e.contains(h)}),true);await loc.click()}
async function edit(page,key,value){const loc=page.locator(`#sbBoard [data-bfld="${key}"]:visible`);await loc.scrollIntoViewIfNeeded();await hit(loc);await loc.fill(value);await loc.press('Tab');await settle(page)}
async function toggle(page,on){await closeBoard(page);await go(page,'logic');const edit=page.locator('#lgEdit');if(await edit.isVisible())await edit.click();await page.locator('#lgMissionMix').setChecked(on);await settle(page)}
async function modal(page,width){if(width<821){await hit(page.locator('#sbMore'));await hit(page.locator('#sbMoreInsights'))}else await hit(page.locator('#sbInsights'));await page.locator('#insightBody').waitFor({state:'visible'})}
async function role(page,side){await hit(page.locator(`[data-role-side="${side}"]`));await settle(page)}
async function dirtyRole(page,editor,di,name){
 const attr=editor==='Board'?'data-bfld':'data-txt',root=editor==='Board'?'#sbBoard':'#eWeek',key=`fr:${di}.0.0.0`
 const field=page.locator(`${root} [${attr}="${key}"]:visible`),mission=page.locator(`${root} [${attr}="ff:${di}.0.0.msn"]:visible`)
 const commit=async(loc,value)=>{await hit(loc);await loc.fill(value);await loc.press('Tab');await settle(page)}
 const saved=()=>page.evaluate(i=>window.DAYS[i].waves[0].formations[0].aircraft[0].rmks,di)
 const seq=()=>page.evaluate(()=>window.commandStreamLen()),last=()=>page.evaluate(()=>window.lastEnvelope())
 const typed=async(value)=>{if(await page.locator('[data-role-ui]').count()===0){await field.press('Tab');await settle(page)}await hit(field);await field.fill(value);await field.evaluate(e=>{window.__dirtyNode=e;if(e.tagName==='TEXTAREA')e.setSelectionRange(3,7);else{const r=document.createRange();r.setStart(e.firstChild,3);r.setEnd(e.firstChild,7);window.getSelection().removeAllRanges();window.getSelection().addRange(r)}})}
 const focus=()=>page.evaluate(()=>{const e=window.__dirtyNode;return document.activeElement===e&&e.isConnected&&(e.tagName==='TEXTAREA'?e.selectionStart===3&&e.selectionEnd===7:window.getSelection().toString()===e.textContent.slice(3,7))})
 await commit(mission,'ACM');await commit(field,'DS FOR '+editor+' ALPHA');await role(page,'later')
 await typed('DS FROM '+editor+' BRAVO');let n=await seq();await hit(page.locator('[data-role-choose]'))
 assert.equal(await saved(),'DS FROM '+editor+' BRAVO');assert.equal(await focus(),true);await shot(page,name+'-'+editor+'-dirty-choose')
 await role(page,'red');const a=await last();assert.equal(a.type,'insights.role.set');assert.ok(a.changes[0].after.context.includes((editor+' BRAVO').toUpperCase()));assert.equal(await seq(),n+2);assert.equal(await focus(),true)
 await typed('DS FROM '+editor+' CHARLIE');assert.equal(await page.locator('[data-role-choose]').textContent(),'Change mission role');n=await seq();await hit(page.locator('[data-role-choose]'));await role(page,'blue');const b=await last();assert.notEqual(b.changes[0].id,a.changes[0].id);assert.ok(b.changes[0].after.context.includes((editor+' CHARLIE').toUpperCase()));assert.equal(await seq(),n+2);assert.equal(await focus(),true)
 await commit(field,'DS FOR '+editor+' DELTA');await typed('DS FROM '+editor+' ECHO');n=await seq();await role(page,'red');assert.equal(await saved(),'DS FROM '+editor+' ECHO');assert.equal(await seq(),n+2);assert.ok((await last()).changes[0].after.context.includes((editor+' ECHO').toUpperCase()));assert.equal(await focus(),true);await shot(page,name+'-'+editor+'-dirty-open-answer')
 await commit(field,'DS FOR '+editor+' FOXTROT');await typed('DS FROM '+editor+' GOLF');n=await seq();await role(page,'later');assert.equal(await saved(),'DS FROM '+editor+' GOLF');assert.equal(await seq(),n+1);assert.equal(await page.locator('[data-role-ui]').count(),0);assert.equal(await focus(),true)
 await typed('ordinary briefing');n=await seq();await hit(page.locator('[data-role-choose]'));assert.equal(await saved(),'ordinary briefing');assert.equal(await seq(),n+1);assert.equal(await page.locator('[data-role-ui]').count(),0);assert.equal(await focus(),true)
 await commit(field,'DS FOR '+editor+' HOTEL');await hit(mission);await mission.fill('DS');n=await seq();await role(page,'red');assert.equal(await mission.inputValue().catch(()=>mission.textContent()),'DS');assert.equal(await page.evaluate(i=>window.DAYS[i].waves[0].formations[0].msn,di),'DS');assert.equal(await seq(),n+1);assert.equal(await page.locator('[data-role-ui]').count(),0)
 await shot(page,name+'-'+editor+'-dirty-exact-DS');await commit(mission,'ACM');if(await page.locator('[data-role-side="later"]').count())await role(page,'later');await commit(field,'');return 'Choose, Change, already-open question, Later, cue removal and exact DS all commit through the real editor before a fresh role target; identical node/selection and separate command order'
}
let fixture
try{
 if(process.env.HP_STATE)fixture=JSON.parse(readFileSync(process.env.HP_STATE,'utf8'))
 else {
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage()
 page.on('pageerror',e=>report.errors.push(String(e)));await page.goto(base);await login(page);await page.addStyleTag({content:'*{scroll-behavior:auto!important}'})
 await check(page,'everything-day',async()=>{const r=await buildSaturday(page);assert.equal(r.some(s=>s.includes('FAILED')),false);return r})
 await page.waitForTimeout(800);fixture=await ctx.storageState();writeFileSync(out+'/fixture.json',JSON.stringify(fixture));await ctx.close()
 }
 for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]){
  if(process.env.HP_VIEWS && !process.env.HP_VIEWS.split(',').includes(name))continue
  const ctx=await browser.newContext({viewport:{width,height},storageState:fixture,...(name==='phone'?{isMobile:true,hasTouch:true}:{})}),page=await ctx.newPage()
  page.on('pageerror',e=>report.errors.push(name+': '+e));page.on('response',r=>{if(r.status()>=400)report.errors.push(name+': HTTP '+r.status()+' '+r.url())})
  await page.goto(base);await login(page);await page.addStyleTag({content:'*{scroll-behavior:auto!important}'})
  await check(page,name+'-S27-Off',async()=>{await go(page,'logic');assert.equal(await page.locator('#lgMissionMix').getAttribute('aria-checked'),'false');await shot(page,name+'-logic-off');await toggle(page,true);await shot(page,name+'-logic-on');return 'real default-Off setting and edit gate'})
  await board(page,5)
  assert.equal(await page.locator('#sbInsights').isVisible(),name==='desktop')
  const mission='ff:5.0.0.msn',remarks='fr:5.0.0.0'
  await check(page,name+'-R1-dirty-Board',()=>dirtyRole(page,'Board',5,name))
  await check(page,name+'-S01-S03-S07',async()=>{
   for(const value of ['DS','RED','RED AIR','REDAIR','RED-AIR','CREDIBLE','REDS','REDSHIFT','DSFOR']){await edit(page,mission,value);assert.equal(await page.locator('.mission-role-question').count(),0)}
   await edit(page,mission,'DS-2');assert.equal(await page.locator('.mission-role-question').count(),1);await shot(page,name+'-mission-question');await role(page,'later')
   await edit(page,mission,'ACM');await edit(page,remarks,'DS FOR EAGLE // BRIEF 30 PRIOR');assert.equal(await page.locator('.mission-role-question').count(),1);await shot(page,name+'-remarks-question');return 'exact/cue boundaries operated via native Mission and Remarks fields'
  })
  await check(page,name+'-S08-S11-S12',async()=>{
   assert.equal(await page.evaluate(()=>window.DAYS[5].waves[0].formations[0].aircraft[0].rmks),'DS FOR EAGLE // BRIEF 30 PRIOR')
   await role(page,'later');const field=page.locator(`#sbBoard [data-bfld="${remarks}"]:visible`);await field.focus();assert.equal(await page.locator('[data-role-choose]').textContent(),'Choose mission role')
   await field.press('Tab');await settle(page);assert.equal(await page.locator('.mission-role-question').count(),0)
   await field.focus();await hit(page.locator('[data-role-choose]'));await role(page,'blue');await field.press('Tab');await field.focus();assert.equal(await page.locator('[data-role-choose]').textContent(),'Change mission role')
   await hit(page.locator('[data-role-choose]'));await role(page,'later');await field.press('Tab');await field.focus();assert.equal(await page.locator('[data-role-choose]').textContent(),'Change mission role');await shot(page,name+'-change-action')
   return 'text persisted first, Later saves no answer, unchanged Tab never reopens, manual Choose and Change survive pointer blur'
  })
  await check(page,name+'-S09-S22-S23',async()=>{
   await edit(page,remarks,'DS FROM VIPER // BRIEF 30 PRIOR');await role(page,'later');await edit(page,remarks,'DS FROM VIPER // BRIEF 45 PRIOR');assert.equal(await page.locator('.mission-role-question').count(),0)
   const field=page.locator(`#sbBoard [data-bfld="${remarks}"]:visible`);await field.focus();await field.evaluate(e=>{window.__focusNode=e;e.setSelectionRange(3,7)})
   await hit(page.locator('[data-role-choose]'));assert.equal(await page.evaluate(()=>document.activeElement===window.__focusNode&&window.__focusNode.selectionStart===3&&window.__focusNode.selectionEnd===7),true)
   await role(page,'red');assert.equal(await page.evaluate(()=>document.activeElement===window.__focusNode&&window.__focusNode.selectionStart===3&&window.__focusNode.selectionEnd===7),true)
   await page.keyboard.type('FROM');await field.press('Tab');await settle(page);return 'strict native node/selection preserved through Choose and answer, continued typing works; separate timing clause no question'
  })
  await check(page,name+'-S06-S08-answered',async()=>{
   await edit(page,remarks,'DS FOR S08 VL');await role(page,'later');await edit(page,mission,'BFM');await role(page,'blue');await edit(page,mission,'ACM');assert.equal(await page.locator('.mission-role-question').count(),1);await role(page,'later')
   await edit(page,remarks,'DS FOR VL // BRIEF 30 PRIOR');await role(page,'red');const lines=await page.evaluate(()=>JSON.stringify(window.ELOG.rows.filter(r=>r.fld==='mission-role')))
   await edit(page,remarks,'DS FOR VL // BRIEF 45 PRIOR');assert.equal(await page.locator('.mission-role-question').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify(window.ELOG.rows.filter(r=>r.fld==='mission-role'))),lines)
   await edit(page,remarks,'DS FOR VL; REJOIN 1430');assert.equal(await page.locator('.mission-role-question').count(),0);await edit(page,remarks,'DS FOR VL; REJOIN 1440');assert.equal(await page.locator('.mission-role-question').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify(window.ELOG.rows.filter(r=>r.fld==='mission-role'))),lines)
   return 'answered BFM Remarks then Mission ACM asks once; answered Red retained across // and ; separate timing edits without annotation/history write'
  })
  await check(page,name+'-S24-S29-S30',async()=>{
   await modal(page,width);const rows=page.locator('#insightBody .ibar.mission-mix-row');assert.equal(await rows.count(),12)
   const show=page.locator('[data-insights-all]');assert.equal(await show.count(),1);await shot(page,name+'-insights-twelve');await hit(show);assert.ok(await rows.count()>12);await shot(page,name+'-insights-all');await hit(page.locator('#insightClose'))
   assert.equal(await page.locator('#schedBoard').isVisible(),true);await modal(page,width);assert.equal(await rows.count(),12);await hit(page.locator('#insightClose'))
   for(const h of [name==='phone'?568:700,name==='phone'?430:700]){await page.setViewportSize({width,height:h});const field=page.locator(`#sbBoard [data-bfld="${remarks}"]:visible`);await field.press('Tab');await field.focus();await hit(page.locator('[data-role-choose]'));for(const side of ['blue','red','later']){const b=page.locator(`[data-role-side="${side}"]`);await b.scrollIntoViewIfNeeded();assert.equal(await b.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit)}),true)}await shot(page,name+'-height-'+h);await role(page,'later')}
   await page.setViewportSize({width,height});return 'real Board opener, topmost modal, twelve/all/reopen, short window and keyboard-height scroll reachability'
  })
  await check(page,name+'-S25-S27-S31',async()=>{
   const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4})
   const before=await page.evaluate(()=>window.commandStreamLen());for(let i=0;i<8;i++){await edit(page,remarks,'DS FOR EAGLE '+i);assert.equal(await page.locator('.mission-role-question').count(),1);await role(page,'later')}
   const afterEdits=await page.evaluate(()=>window.commandStreamLen());assert.equal(afterEdits-before,8);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.commandStreamLen()),afterEdits)
   await toggle(page,false);await board(page,5);await edit(page,remarks,'RED FROM VIPER');assert.equal(await page.locator('[data-role-ui]').count(),0)
   const offNodes=await page.evaluate(()=>({board:document.querySelectorAll('#sbBoard *').length,week:document.querySelectorAll('#eWeek *').length}))
   await toggle(page,true);await board(page,5);assert.equal(await page.locator('.mission-role-question').count(),0)
   const nodes=await page.evaluate(()=>({board:document.querySelectorAll('#sbBoard *').length,week:document.querySelectorAll('#eWeek *').length,offers:document.querySelectorAll('[data-role-ui]').length}));assert.deepEqual({board:nodes.board,week:nodes.week},offNodes);assert.ok(nodes.offers<=1)
   await page.mouse.wheel(0,350);await settle(page);await page.mouse.wheel(0,-350);await settle(page)
   await shot(page,name+'-everything-board');await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});return {before,afterEdits,cpuRate:4,...nodes,offNodes,budgetScope:'separate long stress fixture, bounded On/Off growth; recorded demo ceiling enforced by npm perf'}
  })
  await check(page,name+'-S10-structural',async()=>{
   await hit(page.locator('#sbBoard [data-lac="5.0.0"]'));await settle(page)
   await edit(page,'fr:5.0.0.1','DS FROM RU');await role(page,'later')
   await hit(page.locator('#sbBoard [data-ldel="5.0.0.1"]'));await settle(page)
   assert.equal(await page.locator('.mission-role-question').count(),1);await shot(page,name+'-structural-question');await role(page,'later')
   return 'add a distinct-cue aircraft then remove it through the actual structural door: remaining single context asks once'
  })
  await check(page,name+'-week-editor',async()=>{
   await closeBoard(page);await go(page,'editsched');const field=page.locator('#eWeek [data-txt="fr:0.0.0.0"]');await field.scrollIntoViewIfNeeded();await hit(field);await field.fill('DS FOR EAGLE');await field.press('Tab');await settle(page);assert.equal(await page.locator('.mission-role-question').count(),1);await shot(page,name+'-week-question');await role(page,'red');await shot(page,name+'-week-answered');return 'contenteditable route also saves text and answers through actual controls'
  })
  await check(page,name+'-week-S06-S22-S23',async()=>{
   const field=page.locator('#eWeek [data-txt="fr:0.0.0.0"]');await hit(field);await field.fill('DS FOR WEEK VL // BRIEF 30 PRIOR');await field.press('Tab');await settle(page);await role(page,'red')
   const lines=await page.evaluate(()=>JSON.stringify(window.ELOG.rows.filter(r=>r.fld==='mission-role')))
   for(const text of ['DS FOR WEEK VL // BRIEF 45 PRIOR','DS FOR WEEK VL; REJOIN 1430','DS FOR WEEK VL; REJOIN 1440']){await field.fill(text);await field.press('Tab');await settle(page);assert.equal(await page.locator('.mission-role-question').count(),0)}
   assert.equal(await page.evaluate(()=>JSON.stringify(window.ELOG.rows.filter(r=>r.fld==='mission-role'))),lines)
   await field.focus();await field.evaluate(e=>{window.__focusNode=e;const r=document.createRange();r.setStart(e.firstChild,3);r.setEnd(e.firstChild,6);window.getSelection().removeAllRanges();window.getSelection().addRange(r)})
   const choose=page.locator('[data-role-choose]');await choose.focus();await choose.press('Enter');await settle(page)
   assert.equal(await page.evaluate(()=>document.activeElement===window.__focusNode&&window.getSelection().toString()==='FOR'),true)
   const red=page.locator('[data-role-side="red"]');await red.focus();await red.press('Enter');await settle(page);assert.equal(await page.evaluate(()=>document.activeElement===window.__focusNode&&window.getSelection().toString()==='FOR'),true)
   await shot(page,name+'-week-keyboard-selection');return 'both house separators preserve answered role in contenteditable; real keyboard Enter returns to identical node and exact selection'
  })
  await check(page,name+'-R1-dirty-week',()=>dirtyRole(page,'week',0,name))
  await ctx.close()
 }
 assert.deepEqual(report.errors,[])
}catch(e){report.error=String(e);process.exitCode=1;console.error(e)}finally{writeFileSync(out+'/result.json',JSON.stringify(report,null,2));await browser.close()}
