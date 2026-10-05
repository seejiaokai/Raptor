/* Independent Astra runtime walk. Fixture changes use real controls only.
   Read-only probe reads are evidence; a retained DOM click is labelled explicitly.
   Never run until the host freezes the bundle and grants the shared PC walk lock.
   INSIGHTS_FROZEN=1 HP_URL=http://localhost:4199 node scripts/handpass/insights-publication.mjs
   HP_RUN selects a NEW evidence folder. Existing evidence is never removed. */
import { chromium, expect } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.env.INSIGHTS_FROZEN !== '1') throw new Error('Host freeze notice required: INSIGHTS_FROZEN=1')
const root=fileURLToPath(new URL('../../',import.meta.url))
const base=process.env.HP_URL || 'http://localhost:4199'
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local frozen preview only')
const run=process.env.HP_RUN || new Date().toISOString().replace(/[:.]/g,'-')
const out=resolve(root,'docs/img/insights-build-publication',run)
if(existsSync(out))throw new Error('Evidence folder already exists; choose a new HP_RUN')
mkdirSync(out,{recursive:true})
const R={kind:'runtime walk, not final inspection',base,run,freeze:process.env.INSIGHTS_BUILD || 'host-authorized frozen preview',started:new Date().toISOString(),steps:[],images:[],errors:[],limits:[
  'No direct model, command, storage or fixture writes from page.evaluate.',
  'S20 collision/second-store rollback and S21 failure injection belong to production integration tests; runtime covers supported template travel only.',
  'Retained stale DOM event delivery is explicitly marked; it supplements actual-control navigation.',
  'Desktop/phone emulation does not prove physical Safari.'
]}
const log=s=>{console.log(s);appendFileSync(resolve(out,'walk.log'),s+'\n')}
const save=()=>writeFileSync(resolve(out,'result.json'),JSON.stringify(R,null,2))
const assert=(v,m)=>{if(!v)throw new Error(m)}
const CHROMIUM=process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(CHROMIUM)?{executablePath:CHROMIUM}:{})})
let page,ctx,scene
const loc=s=>page.locator(s).filter({visible:true}).first()
const boardRoot=()=>page.locator('#schedBoard:visible')
const button=s=>loc('#schedBoard '+s)
async function click(el){await el.waitFor({state:'visible'});await el.scrollIntoViewIfNeeded();await expect(el).toBeEnabled();await el.click();await page.waitForTimeout(100)}
async function photo(name){
  await page.waitForFunction(()=>{const t=document.querySelector('#toastEl');return !t||Number(getComputedStyle(t).opacity)===0},{},{timeout:7000}).catch(()=>{})
  const file=resolve(out,scene+'-'+name+'.png');await page.screenshot({path:file,fullPage:false});R.images.push({file,inspected:false});save();return file
}
async function step(id,ids,fn){try{const detail=await fn();R.steps.push({scene,id,ids,status:'PASS',detail});log('PASS '+scene+'/'+id)}catch(e){const image=await photo('FAIL-'+id).catch(()=>null);R.steps.push({scene,id,ids,status:'FAIL',error:String(e.stack||e),image});log('FAIL '+scene+'/'+id+' '+e.message);save();throw e}save()}
async function nav(to){if(await boardRoot().count())await closeBoard();await click(loc('.nav [data-page="'+to+'"]'));await page.waitForFunction(p=>window.CURPAGE===p,to)}
async function closeBoard(){await click(loc('#sbDone'));await expect(boardRoot()).toHaveCount(0)}
async function board(di){if(await boardRoot().count()){if(await page.evaluate(()=>window.SBDAY)===di)return;await closeBoard()}await nav('editsched');if(await loc('#eWeek [data-golive="'+di+'"]').count())await click(loc('#eWeek [data-golive="'+di+'"]'));await click(loc('#eWeek [data-sbday="'+di+'"]'));await expect(boardRoot()).toBeVisible()}
async function text(key,value){const el=button('[data-bfld="'+key+'"]');await el.scrollIntoViewIfNeeded();await el.fill(value);await el.press('Tab');await page.waitForTimeout(120)}
async function later(){if(await loc('[data-role-side="later"]').count())await click(loc('[data-role-side="later"]'))}
async function role(di,side,published=false){
  const field=published?button('[data-role-remarks]'):button('[data-bfld="fr:'+di+'.0.0.0"]')
  await field.scrollIntoViewIfNeeded();await field.press('Tab');await field.click()
  if(await loc('[data-role-choose]').count())await click(loc('[data-role-choose]'))
  await expect(loc('.mission-role-question')).toBeVisible()
  await expect(loc('.mission-role-question')).toContainText(published?'Published':'Working copy')
  await click(loc('[data-role-side="'+side+'"]'));await expect(page.locator('.mission-role-question')).toHaveCount(0)
}
async function snapshot(){return page.evaluate(()=>({week:window.CURWEEK,day:window.SBDAY,days:JSON.stringify(window.DAYS),book:JSON.stringify(window.SCHED),current:window.dayCurVer(window.SBDAY??0),seq:window.commandStreamLen(),last:window.lastEnvelope(),history:JSON.parse(JSON.stringify(window.ELOG.rows))}))}
async function stableProgramme(before){const after=await snapshot();assert(after.days===before.days,'role changed programme day bytes');assert(after.book===before.book,'role changed publication/sign/pending bytes');return after}
async function publish(di){
  await page.keyboard.press('Tab');await page.waitForTimeout(150)
  const sels=page.locator('#schedBoard select[data-sign]:visible, #schedBoard [data-sign] select:visible')
  assert(await sels.count()===4,'Expected four actual sign selectors')
  for(let i=0;i<4;i++){const s=sels.nth(i);await s.scrollIntoViewIfNeeded();await s.focus();const vals=await s.locator('option').evaluateAll(os=>os.filter(o=>!o.disabled&&o.value).map(o=>o.value));assert(vals.length,'No eligible signer');const value=vals[Math.min(i,vals.length-1)];await s.selectOption(value);await page.waitForTimeout(150);await expect(s).toHaveValue(value)}
  const b=page.locator('#schedBoard [data-beak="'+di+'"]:visible, #schedBoard [data-alpub="'+di+'"]:visible').first();await click(b)
  await page.waitForFunction(i=>!!window.dayCurVer(i),di)
  return page.evaluate(i=>window.dayCurVer(i),di)
}
async function menu(){await click(button('[data-planmenu]'));await expect(loc('.wavemenu')).toBeVisible()}
async function preview(ver){await menu();await click(loc('.wavemenu [data-planpv="'+ver+'"]'));await expect(button('.pv-frozen')).toBeVisible()}
async function live(di){await click(button('[data-golive="'+di+'"]'));await expect(page.locator('#sbBoard .pv-frozen')).toHaveCount(0)}
async function insights(opener='#sbInsights'){
 await click(loc(opener));await expect(page.locator('#insightModal')).toBeVisible()
 if(await loc('#insightModal [data-insights-all]').count())await click(loc('#insightModal [data-insights-all]'))
 const rows=await page.locator('#insightModal .ibar').evaluateAll(es=>es.map(e=>({name:e.querySelector('.nm')?.textContent,blue:e.querySelector('.mix-count-blue')?.textContent??null,red:e.querySelector('.mix-count-red')?.textContent??null,total:e.querySelector('.v')?.textContent})))
 const tiles=await page.locator('#insightModal .itile').allTextContents();await click(page.locator('#insightClose'));return {tiles,rows}
}
async function allOpeners(expected,version){
 const before=await page.evaluate(()=>({day:window.SBDAY,y:[...document.querySelectorAll('#schedBoard .sb-boardwrap,#schedBoard .sb-main')].map(e=>e.scrollTop)}))
 assert(JSON.stringify(await insights())===JSON.stringify(expected),'Board figures differ')
 assert(await page.evaluate(()=>window.SBDAY)===before.day,'Insights close changed Board day')
 assert(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('#schedBoard .sb-boardwrap,#schedBoard .sb-main')].map(e=>e.scrollTop)))===JSON.stringify(before.y),'Insights close changed Board scroll')
 await closeBoard();assert(JSON.stringify(await insights('#insightBtn'))===JSON.stringify(expected),'Shell figures differ')
 await page.setViewportSize({width:390,height:844});await click(loc('#burger'));assert(JSON.stringify(await insights('#drawerInsights'))===JSON.stringify(expected),'Drawer figures differ')
 await page.setViewportSize({width:1440,height:1000});await board(before.day);if(version)await preview(version)
 return {rows:expected,openers:['Board','Shell','Drawer'],boardDay:before.day}
}
async function login(user,pass){await page.fill('#luser',user);await page.fill('#lpass',pass);await page.click('#loginForm button[type=submit]');await page.waitForSelector('#vWeek .day')}
async function undo(){await click((await loc('#schedBoard').count())?loc('#sbUndo'):loc('#undoBtn'))}
async function redo(){await click((await loc('#schedBoard').count())?loc('#sbRedo'):loc('#redoBtn'))}
async function setup(name,di=0){
  scene=name;ctx=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:name==='published-phone'||name==='board-door'});page=await ctx.newPage();page.setDefaultTimeout(7000)
  page.on('pageerror',e=>R.errors.push({scene,type:'pageerror',message:String(e)}));page.on('console',m=>{if(m.type()==='error')R.errors.push({scene,type:'console',message:m.text()})});page.on('response',r=>{if(r.status()>=400)R.errors.push({scene,type:'http',status:r.status(),url:r.url()})})
  await page.goto(base+'/');await page.fill('#luser','ad');await page.fill('#lpass','a');await page.click('#loginForm button[type=submit]');await page.waitForSelector('#vWeek .day')
  if(name==='board-door'){await board(di);return}
  await nav('logic');await click(loc('#lgEdit'));await page.locator('#lgMissionMix').check();await expect(page.locator('#lgMissionMix')).toBeChecked();await board(di)
  await text('ff:'+di+'.0.0.msn','ACM');await later();await text('fr:'+di+'.0.0.0','DS FOR VL');await later()
}
async function world(name,fn){
 if(process.env.HP_ONLY && !process.env.HP_ONLY.split(',').includes(name))return
 try{await setup(name);await fn()}catch(e){const image=await photo('world-stopped').catch(()=>null);log('WORLD STOP '+name+': '+e.message);R.steps.push({scene:name,id:'world-stopped',status:'FAIL',error:String(e.stack||e),image});R.steps.push({scene:name,id:'dependent-remainder',status:'NOT RUN',reason:'Earlier prerequisite failed; see failure evidence'})}finally{if(ctx)await ctx.close();ctx=null;save()}
}
try{
await world('board-door',async()=>{
 const state=()=>page.evaluate(()=>({day:window.SBDAY,scroll:[...document.querySelectorAll('#schedBoard .sb-boardwrap,#schedBoard .sb-main')].map(e=>e.scrollTop)}))
 const touch=async el=>{await el.waitFor({state:'visible'});await el.scrollIntoViewIfNeeded();await expect(el).toBeEnabled();await el.tap();await page.waitForTimeout(100)}
 const topmost=async()=>{
   await expect(page.locator('#insightModal')).toBeVisible()
   return page.locator('#insightClose').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2),m=document.querySelector('#insightModal');return {closeHit:h===e||e.contains(h),modalHit:!!h&&m.contains(h),closeVisible:r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}})
 }
 const phoneGeometry=()=>page.evaluate(()=>{
   const acts=document.querySelector('#schedBoard .sb-actions'),top=document.querySelector('#schedBoard .sb-top')
   // Match the standing gate exactly: do not filter invisible direct children out.
   const btns=[...acts.querySelectorAll(':scope > .abtn, :scope > select, :scope > .fastsync, :scope > .bellbtn')]
   return {controls:btns.map(e=>({id:e.id,width:Math.round(e.getBoundingClientRect().width),top:Math.round(e.getBoundingClientRect().top)})),rows:new Set(btns.map(e=>Math.round(e.getBoundingClientRect().top))).size,smallest:Math.min(...btns.map(e=>Math.round(e.getBoundingClientRect().width))),barH:Math.round(top.getBoundingClientRect().height),overflow:top.scrollWidth-top.clientWidth,pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,labelsHidden:[...acts.querySelectorAll('.bl')].every(e=>e.offsetParent===null)}
 })
 const assertGeometry=m=>{assert(m.rows===1,'Phone direct action controls occupy more than one row');assert(m.smallest>=28,'Phone direct action control below 28px');assert(m.barH<82,'Phone bar is 82px or taller');assert(m.overflow<=0&&m.pageOverflow<=0,'Phone toolbar/page overflows horizontally');assert(m.labelsHidden,'Phone action labels remain visible')}
 await step('desktop-direct-door',['S24'],async()=>{
   await board(1);await expect(page.locator('#sbInsights')).toBeVisible();await photo('desktop-button');const before=await state()
   await click(loc('#sbInsights'));const hit=await topmost();assert(hit.closeHit&&hit.modalHit&&hit.closeVisible,'Desktop modal close is not on top');const tiles=await page.locator('#insightModal .itile').allTextContents();await photo('desktop-modal');await click(loc('#insightClose'));await expect(page.locator('#insightModal')).toBeHidden();await expect(boardRoot()).toBeVisible();assert(JSON.stringify(await state())===JSON.stringify(before),'Desktop modal close changed Board/day/scroll');return {before,hit,tiles}
 })
 await step('phone-more-door-and-toolbar',['S24','S30'],async()=>{
   await page.setViewportSize({width:390,height:844});await expect(page.locator('#sbInsights')).toBeHidden();await expect(loc('#sbMore')).toBeVisible();const geometry=await phoneGeometry();assertGeometry(geometry);const before=await state()
   await touch(loc('#sbMore'));await expect(loc('#sbMoreInsights')).toBeVisible();await photo('phone-more');await touch(loc('#sbMoreInsights'));const hit=await topmost();assert(hit.closeHit&&hit.modalHit&&hit.closeVisible,'Phone modal close is not on top');const tiles=await page.locator('#insightModal .itile').allTextContents();await photo('phone-modal');await touch(loc('#insightClose'));await expect(page.locator('#insightModal')).toBeHidden();await expect(boardRoot()).toBeVisible();assert(JSON.stringify(await state())===JSON.stringify(before),'Phone modal close changed Board/day/scroll');await expect(page.locator('#sbInsights')).toBeHidden();const after=await phoneGeometry();assertGeometry(after);return {before,geometry,after,hit,tiles,controlRoute:'Actual desktop button; phone touch More then Insights; no direct opener invocation'}
 })
})
await world('dirty-working-published',async()=>{
 let orig,issuedA,rowsA,roleB
 await step('publish-unanswered-A',['S13','S14','S32'],async()=>{
   orig=await publish(0);issuedA=await page.evaluate(v=>JSON.stringify(window.daySnapOf(0,v)),orig);rowsA=await insights()
   await expect(button('[data-bfld="fr:0.0.0.0"]')).toHaveValue('DS FOR VL');return {orig,rowsA}
 })
 await step('dirty-choose-saves-and-answers-B',['S06','S14','S16','S22','S32'],async()=>{
   const f=button('[data-bfld="fr:0.0.0.0"]');await f.scrollIntoViewIfNeeded();await f.click();await expect(loc('[data-role-choose]')).toHaveText('Choose mission role');const before=await snapshot()
   // Deliberately do not use text(): this is the pointer route BEFORE Tab or blur.
   await f.fill('DS FROM RU');assert(await f.evaluate(e=>document.activeElement===e),'Typing did not leave Remarks focused');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)==='DS FOR VL','Fixture text committed before the dirty Choose click');assert((await snapshot()).seq===before.seq,'Typing created a command before Choose')
   await click(loc('[data-role-choose]'));await expect(loc('.mission-role-question')).toContainText('Working copy');await expect(f).toHaveValue('DS FROM RU');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)==='DS FROM RU','Choose did not save B before offering the role')
   const committed=await snapshot();assert(committed.seq===before.seq+1,'Choose must commit exactly one text command before the answer');assert(committed.last.changes.some(c=>c.collection==='days'),'B text command absent');assert(!committed.last.changes.some(c=>c.collection==='insights.role'),'Choose prematurely answered a role');await photo('dirty-B-question-before-answer')
   await click(loc('[data-role-side="blue"]'));const answered=await stableProgramme(committed);assert(answered.seq===committed.seq+1,'Blue must be a separate command');assert(answered.last.changes.length===1&&answered.last.changes[0].collection==='insights.role','Role command touched another collection');const row=answered.last.changes[0];roleB=row.id
   assert(row.after.context===JSON.stringify([1,'ACM',['DS FROM RU']]),'Dirty Choose answered saved A instead of B');assert(row.after.side==='blue','B answer was not Blue');assert(JSON.parse(decodeURIComponent(roleB))[4]===row.after.context,'B key/context mismatch')
   assert(await page.evaluate(v=>JSON.stringify(window.daySnapOf(0,v)),orig)===issuedA,'Working edit/answer changed issued A bytes');assert(JSON.stringify(await insights())===JSON.stringify(rowsA),'Answering dirty working B changed issued A figures');return {text:committed.last,answer:answered.last,rowsA}
 })
 await step('readonly-A-remains-unanswered-and-independent',['S13','S14','S32'],async()=>{
   await preview(orig);const f=button('[data-role-remarks]');await expect(f).toHaveAttribute('readonly','');await expect(f).toHaveValue('DS FOR VL');await f.click();await expect(loc('[data-role-choose]')).toHaveText('Choose mission role');await click(loc('[data-role-choose]'));await expect(loc('.mission-role-question')).toContainText('Published');await expect(loc('.mission-role-question')).toContainText('Original');await photo('latest-A-still-unanswered')
   const before=await snapshot();await click(loc('[data-role-side="red"]'));const after=await stableProgramme(before);assert(after.last.changes.length===1&&after.last.changes[0].collection==='insights.role','A role command changed programme/signatures');const row=after.last.changes[0]
   assert(row.id!==roleB,'Published A and working B share an answer key');assert(row.after.context===JSON.stringify([1,'ACM',['DS FOR VL']])&&row.after.side==='red','Published answer did not target A');assert(await page.evaluate(v=>JSON.stringify(window.daySnapOf(0,v)),orig)===issuedA,'A role changed published programme bytes');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)==='DS FROM RU','Answering A reverted working B')
   const rowsAfter=await insights();assert(JSON.stringify(rowsAfter)!==JSON.stringify(rowsA),'A answer did not update issued bars immediately');return {roleB,roleA:row.id,answer:after.last,beforeRows:rowsA,afterRows:rowsAfter}
 })
})
await world('published-phone',async()=>{
 let orig,programme,fieldHandle
 const touch=async el=>{await el.waitFor({state:'visible'});await el.scrollIntoViewIfNeeded();await expect(el).toBeEnabled();await el.tap();await page.waitForTimeout(100)}
 const field=()=>button('[data-role-remarks]')
 const hit=async el=>{
   await el.scrollIntoViewIfNeeded()
   const box=await el.evaluate(e=>{const r=e.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x,y:r.y,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,hit:top===e||e.contains(top)}})
   assert(box.width>0&&box.height>0&&box.x>=0&&box.y>=0&&box.x+box.width<=box.viewportWidth&&box.y+box.height<=box.viewportHeight,'Phone control clipped: '+JSON.stringify(box));assert(box.hit,'Phone control covered: '+JSON.stringify(box));return box
 }
 const refocus=async()=>{await touch(loc('#sbMore'));await touch(loc('#sbMore'));await touch(field());await expect(loc('[data-role-choose]')).toBeVisible()}
 const question=async()=>{
   await touch(loc('[data-role-choose]'));await expect(loc('.mission-role-question')).toContainText('Published');await expect(loc('.mission-role-question')).toContainText('Original')
   const geometry={};for(const side of ['blue','red','later'])geometry[side]=await hit(loc('[data-role-side="'+side+'"]'))
   const overlap=await page.evaluate(()=>{const a=document.querySelector('#schedBoard [data-role-remarks]').getBoundingClientRect(),b=document.querySelector('.mission-role-question').getBoundingClientRect();return Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)})
   assert(!overlap,'Question covers published Remarks');return geometry
 }
 await step('phone-fixture-and-issued-entry',['S13','S14','S24','S32'],async()=>{
   // The shared fixture is prepared through desktop controls, including blur before sign selection.
   orig=await publish(0);await text('fr:0.0.0.0','DS FROM RU');await later();await expect(button('[data-bfld="fr:0.0.0.0"]')).toHaveValue('DS FROM RU')
   await page.setViewportSize({width:390,height:844});await touch(button('[data-planmenu]'));await touch(loc('.wavemenu [data-planpv="'+orig+'"]'));await expect(button('.pv-frozen')).toBeVisible();assert(await page.evaluate(()=>window.dayCurVer(0))===orig,'Fixture is not the latest issued version')
   await expect(field()).toHaveAttribute('readonly','');assert(await field().getAttribute('data-bfld')===null,'Issued field exposes schedule-write key');await expect(field()).toHaveValue('DS FOR VL');await touch(field());fieldHandle=await field().elementHandle();assert(await fieldHandle.evaluate(e=>document.activeElement===e),'Touch did not focus published Remarks')
   programme=await snapshot();await page.keyboard.type('x');await expect(field()).toHaveValue('DS FOR VL');assert((await snapshot()).seq===programme.seq,'Read-only typing attempt wrote a command')
   await expect(loc('[data-role-choose]')).toHaveText('Choose mission role');const geometry=await hit(loc('[data-role-choose]'));await photo('normal-choose');return {preparation:'Actual desktop controls, then touch phone390x844 before issued preview',orig,geometry}
 })
 await step('phone-choose-and-correct',['S13','S14','S22','S24','S32'],async()=>{
   const geometry=await question();await photo('normal-question');await touch(loc('[data-role-side="red"]'));await expect(page.locator('.mission-role-question')).toHaveCount(0);const red=await stableProgramme(programme);assert(red.last.changes.every(c=>c.collection==='insights.role'),'Red touched programme collections')
   assert(await fieldHandle.evaluate(e=>e.isConnected&&e===document.querySelector('#schedBoard [data-role-remarks]')),'Red replaced original readonly Remarks node')
   await refocus();await expect(loc('[data-role-choose]')).toHaveText('Change mission role');await question();await touch(loc('[data-role-side="blue"]'));const blue=await stableProgramme(programme);assert(blue.last.changes.every(c=>c.collection==='insights.role'),'Blue touched programme collections');assert(blue.last.changes[0].id===red.last.changes[0].id,'Correction changed context identity')
   assert(await fieldHandle.evaluate(e=>e.isConnected&&e===document.querySelector('#schedBoard [data-role-remarks]')),'Correction replaced original readonly Remarks node');await expect(field()).toHaveValue('DS FOR VL');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)==='DS FROM RU','Phone role answer changed pending working Remarks');return {geometry,red:red.last,blue:blue.last}
 })
 await step('phone-overflow-insights-and-short-later',['S24','S30','S32'],async()=>{
   await expect(page.locator('#sbInsights')).toBeHidden();const day=await page.evaluate(()=>window.SBDAY);await touch(loc('#sbMore'));await touch(loc('#sbMoreInsights'));await expect(page.locator('#insightModal')).toBeVisible();const figures=await page.locator('#insightModal .itile').allTextContents();await touch(loc('#insightClose'));assert(await page.evaluate(()=>window.SBDAY)===day,'Phone Insights changed Board day');await expect(boardRoot()).toBeVisible()
   await page.setViewportSize({width:390,height:568});await refocus();await expect(loc('[data-role-choose]')).toHaveText('Change mission role');const geometry=await question();await photo('short-question');const before=await snapshot();await touch(loc('[data-role-side="later"]'));assert((await snapshot()).seq===before.seq,'Later wrote a command');await expect(page.locator('.mission-role-question')).toHaveCount(0);await expect(page.locator('#sbInsights')).toBeHidden();await stableProgramme(programme);return {figures,geometry,viewports:['390x844','390x568'],focusLimit:'Chromium touch emulation; no physical Safari keyboard or native touch-selection proof'}
 })
})
await world('published-working',async()=>{
 let orig,al1,baseRows,roleA,roleB
 await step('publish-A',['S13','S14'],async()=>{orig=await publish(0);await text('fr:0.0.0.0','DS FROM RU');await later();return {orig,pending:await snapshot()}})
 await step('published-A-answer',['S13','S14','S17','S32'],async()=>{
   await preview(orig);const f=button('[data-role-remarks]');await expect(f).toHaveAttribute('readonly','');assert(await f.getAttribute('data-bfld')===null,'Published Remarks has a write funnel');await expect(f).toHaveValue('DS FOR VL')
   const before=await snapshot();await role(0,'red',true);const after=await stableProgramme(before);assert(after.last.changes.every(c=>c.collection==='insights.role'),'Role command touched programme collections');roleA=after.last.changes[0].id;await role(0,'blue',true);await stableProgramme(before);await role(0,'red',true);await stableProgramme(before);baseRows=await insights();await photo('A-red-working-B-pending');return {roleA,envelope:after.last,rows:baseRows}
 })
 await step('working-B-answer-and-undo',['S14','S16','S17'],async()=>{
   await live(0);const before=await snapshot();await role(0,'blue');const after=await stableProgramme(before);roleB=after.last.changes[0].id;assert(roleA!==roleB,'A and B contexts collided');assert(JSON.stringify(await insights())===JSON.stringify(baseRows),'Working role changed published aggregate')
   await undo();await stableProgramme(before);assert(JSON.stringify(await insights())===JSON.stringify(baseRows),'Undo B changed A');await redo();return {roleB}
 })
 await step('publish-B-historical-and-withdraw',['S15','S32'],async()=>{
   al1=await publish(0);assert(al1!==orig,'AL did not advance');const rows=await insights();assert(JSON.stringify(rows)!==JSON.stringify(baseRows),'AL did not switch aggregate source')
   await preview(al1);await allOpeners(rows,al1);await live(0)
   await preview(orig);assert(await page.locator('#sbBoard [data-role-remarks]').count()===0,'Historical preview has role door');assert(await page.locator('[data-role-ui]').count()===0,'Historical preview has live role controls');await allOpeners(rows,orig);await photo('historical-original-no-role-door');await live(0)
   await click(button('[data-unpub="0"]'));if(await button('[data-unpub="0"].warn').count())await click(button('[data-unpub="0"].warn'))
   assert(await page.evaluate(()=>window.dayCurVer(0))===orig,'Withdraw did not select Original');assert(JSON.stringify(await insights())===JSON.stringify(baseRows),'Withdraw did not restore A aggregate');return {al1,rows}
 })
 await step('same-label-reissue-stale-event',['S25','S32'],async()=>{
   const repub=await publish(0);assert(repub===al1,'Expected same-label reissue');await preview(repub);const before=await snapshot();await button('[data-role-remarks]').click();await click(loc('[data-role-choose]'));const stale=await loc('[data-role-side="red"]').elementHandle();await live(0)
   await click(button('[data-unpub="0"]'));if(await button('[data-unpub="0"].warn').count())await click(button('[data-unpub="0"].warn'));await publish(0);await preview(repub)
   const seq=await page.evaluate(()=>window.commandStreamLen());await stale.dispatchEvent('click');await page.waitForTimeout(100);assert(await page.evaluate(()=>window.commandStreamLen())===seq,'Retained stale DOM click wrote after reissue');await photo('reissued-latest');return {method:'Actual publication controls plus explicitly synthetic retained detached DOM click',before:before.current,current:await snapshot()}
 })
 await step('older-version-load-keeps-issued-and-annotation',['S18','S32'],async()=>{
   await preview(orig);await click(button('[data-restore="0"]'));if(await button('[data-restore="0"].warn').count())await click(button('[data-restore="0"].warn'))
   await expect(button('[data-bfld="fr:0.0.0.0"]')).toHaveValue('DS FOR VL');assert(await page.evaluate(()=>window.dayCurVer(0))===al1,'Loading older wording moved issued pointer');await button('[data-bfld="fr:0.0.0.0"]').click();await expect(loc('[data-role-choose]')).toHaveText('Change mission role');const seq=await page.evaluate(()=>window.commandStreamLen());await role(0,'red');assert(await page.evaluate(()=>window.commandStreamLen())===seq,'Older version replayed a stale role over current Red');return {orig,current:al1}
 })
})
await world('plans-history',async()=>{
 let aId,bId
 await step('text-answer-separate-history',['S16','S17'],async()=>{await role(0,'red');aId=(await snapshot()).last.changes[0].id;await text('fr:0.0.0.0','DS FROM RU');await role(0,'blue');bId=(await snapshot()).last.changes[0].id;await undo();await undo();assert(await button('[data-bfld="fr:0.0.0.0"]').inputValue()==='DS FOR VL','Second Undo did not restore A wording');await redo();await redo();assert(await button('[data-bfld="fr:0.0.0.0"]').inputValue()==='DS FROM RU','Redo did not restore B wording');return {aId,bId,history:(await snapshot()).history.slice(-8)}})
 await step('same-rid-plan-copy-correction',['S18'],async()=>{
   const rid=await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].rid);await menu();await click(loc('[data-plandup]'));await role(0,'red');const corrected=(await snapshot()).last.changes[0].id;assert(corrected===bId,'Plan duplicate changed role identity')
   await menu();const choices=await page.locator('.wavemenu [data-plansel]').evaluateAll(es=>es.map(e=>e.getAttribute('data-plansel')));assert(choices.length>0,'No parked plan');await click(loc('[data-plansel="'+choices[0]+'"]'));assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].rid)===rid,'Plan switch reminted rid');await button('[data-bfld="fr:0.0.0.0"]').click();await expect(loc('[data-role-choose]')).toHaveText('Change mission role');const seq=await page.evaluate(()=>window.commandStreamLen());await role(0,'red');assert(await page.evaluate(()=>window.commandStreamLen())===seq,'Plan selection lost the corrected Red answer');await photo('plan-current-correction');return {rid,corrected}
 })
 await step('parked-plan-different-context-roundtrip',['S18','S25'],async()=>{
   await text('fr:0.0.0.0','DS FOR VL');await later();const seq=await page.evaluate(()=>window.commandStreamLen());await role(0,'red');assert(await page.evaluate(()=>window.commandStreamLen())===seq,'Returning A did not reuse A answer')
   await menu();const pick=loc('.wavemenu [data-plansel]');await click(pick);await expect(button('[data-bfld="fr:0.0.0.0"]')).toHaveValue('DS FROM RU');const bSeq=await page.evaluate(()=>window.commandStreamLen());await role(0,'red');assert(await page.evaluate(()=>window.commandStreamLen())===bSeq,'Parked B lost its correction');await photo('parked-B-keeps-corrected-role');return {aId,bId}
 })
})
await world('templates',async()=>{
 let template,sourceRid,sourceRole
 await step('save-template-and-reload',['S19'],async()=>{
   await role(0,'red');sourceRole=(await snapshot()).last.changes[0].id;sourceRid=await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].rid)
   await click(loc('#sbTpl'));await click(loc('[data-daytplsave]'));await expect(page.locator('#daytplModal')).toBeVisible();await click(page.locator('#daytplClose'));await page.waitForTimeout(1200)
   await page.reload();if(await page.locator('#luser:visible').count()){await page.fill('#luser','ad');await page.fill('#lpass','a');await page.click('#loginForm button[type=submit]')}await page.waitForSelector('#vWeek .day');await board(1)
   await click(loc('#sbTpl'));const pick=loc('[data-daytplpick]');template=await pick.getAttribute('data-daytplpick');assert(template,'Reloaded template absent');await click(pick);return {template,sourceRole}
 })
 await step('fresh-identity-seed-correction-undo',['S19','S20'],async()=>{
   const rid=await page.evaluate(()=>window.DAYS[1].waves[0].formations[0].rid);assert(rid!==sourceRid,'Template aliased source rid');await button('[data-bfld="fr:1.0.0.0"]').click();await expect(loc('[data-role-choose]')).toHaveText('Change mission role');await role(1,'blue');const key=(await snapshot()).last.changes[0].id;assert(key!==sourceRole,'Destination annotation aliases source');await board(0);const seq=await page.evaluate(()=>window.commandStreamLen());await role(0,'red');assert(await page.evaluate(()=>window.commandStreamLen())===seq,'Destination correction changed source answer');await board(1);await undo();await undo();assert(await page.evaluate(()=>window.DAYS[1].waves[0].formations[0].rid)!==rid,'One template Undo did not restore destination');await redo();await photo('template-redo-independent-seed');return {sourceRid,destinationRid:rid,key}
 })
 await step('published-template-refusal',['S19'],async()=>{await board(0);await publish(0);const before=await snapshot();await click(loc('#sbTpl'));const pick=loc('[data-daytplpick="'+template+'"]');await expect(pick).toBeDisabled();await expect(loc('.wavemenu')).toContainText("can't be applied to a published day");await stableProgramme(before);await photo('published-template-refused');return {disabled:true}})
})
await world('off-week',async()=>{
 await step('role-undo-lands-on-origin-week',['S28'],async()=>{
   await role(0,'red');const before=await snapshot();await closeBoard();const options=await page.locator('[data-wk]:visible').evaluateAll(es=>es.map(e=>e.getAttribute('data-wk')));const other=options.find(v=>v!==before.week);assert(other,'No other week button');await click(loc('[data-wk="'+other+'"]'));await page.waitForFunction(w=>window.CURWEEK===w,other);await click(loc('#undoBtn'));await page.waitForFunction(w=>window.CURWEEK===w,before.week);const after=await snapshot();assert(after.last.changes.some(c=>c.collection==='insights.role'),'Undo did not restore annotation');assert(!after.last.changes.some(c=>c.collection==='days'||c.collection.startsWith('sched.')),'Role Undo wrote programme records');await photo('off-week-undo-origin');return {from:other,to:after.week,envelope:after.last}
 })
})
await world('logic-isolation',async()=>{
 await step('setting-undo-redo-reset-reload',['S27'],async()=>{
   await nav('logic');if(await loc('#lgEdit').count())await click(loc('#lgEdit'))
   const before=await snapshot();const count=await loc('#lgCount').innerText();await page.locator('#lgMissionMix').uncheck();await stableProgramme(before);assert(await loc('#lgCount').innerText()===count,'Feature setting changed warning count')
   await undo();await expect(page.locator('#lgMissionMix')).toBeChecked();assert(await page.evaluate(()=>window.CURPAGE)==='logic','Setting Undo did not land on Logic');await redo();await expect(page.locator('#lgMissionMix')).not.toBeChecked()
   await page.locator('#lgMissionMix').check();await stableProgramme(before)
   const rule=loc('[data-lgkind="ground"]');await rule.setChecked(!(await rule.isChecked()));await click(loc('#lgReset'));await expect(page.locator('#lgMissionMix')).toBeChecked();await expect(loc('#lgReset')).toHaveCount(0);await stableProgramme(before)
   await page.waitForTimeout(1200);await page.reload();if(await loc('#luser').count())await login('ad','a');await nav('logic');await expect(page.locator('#lgMissionMix')).toHaveAttribute('aria-checked','true');await photo('logic-on-survives-reset-reload');return {warningCount:count}
 })
 await step('off-edit-on-no-surprise-question',['S25','S27'],async()=>{
   await click(loc('#lgEdit'));await page.locator('#lgMissionMix').uncheck();await board(0);await text('fr:0.0.0.0','DS FROM RU');assert(await page.locator('[data-role-ui]').count()===0,'Off edit offered a role')
   await nav('logic');if(await loc('#lgEdit').count())await click(loc('#lgEdit'));await page.locator('#lgMissionMix').check();await board(0);assert(await page.locator('.mission-role-question').count()===0,'On replayed an old offer');await photo('on-no-backlog-question');return {prompt:false}
 })
})
await world('member-read',async()=>{
 await step('member-shared-figures-readonly-setting',['S26','S29','S30'],async()=>{
   await role(0,'red');await publish(0);const rows=await insights();assert(rows.rows.length>0,'Fixture has no countable flyers');await closeBoard();await page.waitForTimeout(1200);await click(loc('#logout'));await login('us','us');assert(await loc('.nav [data-page="editsched"]').count()===0,'Member has edit schedule door')
   assert(JSON.stringify(await insights('#insightBtn'))===JSON.stringify(rows),'Member Shell figures differ');await page.setViewportSize({width:390,height:844});await click(loc('#burger'));assert(JSON.stringify(await insights('#drawerInsights'))===JSON.stringify(rows),'Member Drawer figures differ');await page.setViewportSize({width:1440,height:1000});await nav('logic');await expect(page.locator('#lgMissionMix')).toHaveAttribute('aria-checked','true');await expect(page.locator('#lgMissionMix')).toHaveAttribute('aria-disabled','true');assert(await loc('#lgEdit').count()===0,'Member can edit Logic');await photo('member-readonly-logic');return {rows}
 })
 R.steps.push({scene,id:'guest-insights-entry',ids:['S29'],status:'NOT RUN',reason:'N/A to runtime: D204 GuestApp intentionally mounts issued schedule only, with no Insights opener. Revised plan viewer reads use existing access; S29 guest reader calculation/permission parity requires independent test evidence, not a new door.'});save()
})
}finally{R.finished=new Date().toISOString();R.summary={pass:R.steps.filter(s=>s.status==='PASS').length,fail:R.steps.filter(s=>s.status==='FAIL').length,notRun:R.steps.filter(s=>s.status==='NOT RUN').length,errors:R.errors.length};save();await browser.close();log(JSON.stringify(R.summary));process.exitCode=R.summary.fail||R.summary.errors?1:0}
