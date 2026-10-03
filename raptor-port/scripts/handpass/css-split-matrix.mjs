/* Additional named geometry, real-member, short-screen and shared-window coverage. */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const base=process.env.HP_URL||'http://localhost:4230',run=process.env.CSS_MATRIX_RUN
assert.ok(run&&/^[a-z0-9-]+$/.test(run));assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname))
const out=`docs/handpass/css-split/${run}`;assert.ok(!existsSync(out));mkdirSync(out,{recursive:true})
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
const report={run,base,samples:[],pictures:[],operations:[],breaks:[],errors:[]},flush=()=>writeFileSync(out+'/result.json',JSON.stringify(report,null,2))
const settle=async p=>{await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400)}
async function hit(p,s){const l=typeof s==='string'?p.locator(s).first():s;await l.waitFor({state:'visible'});await l.scrollIntoViewIfNeeded();const clear=()=>l.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h===e||e.contains(h)});if(!await clear()){await p.mouse.wheel(0,160);await settle(p)}if(!await clear()){await p.mouse.wheel(0,-320);await settle(p)}assert.ok(await clear(),`Covered ${s}: `+JSON.stringify(await l.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {rect:[r.x,r.y,r.width,r.height],cover:h?.outerHTML.slice(0,220)}})));await l.click();await settle(p)}
async function nav(p,to){if(await p.locator('#burger').isVisible()){await hit(p,'#burger');await hit(p,`#drawerNav [data-page=${to}]`)}else await hit(p,`#topnav [data-page=${to}]`);await p.locator(`#page-${to}.on`).waitFor();await settle(p)}
async function sample(p,name,selectors){const values={};for(const sel of selectors){const l=p.locator(sel).filter({visible:true}).first();assert.ok(await l.count(),`${name}: missing ${sel}`);values[sel]=await l.evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),props=['display','visibility','position','z-index','color','background-color','border-color','font-size','font-weight','line-height','padding','margin','gap','grid-template-columns','flex-direction','overflow-x','overflow-y','max-height','min-height','white-space','touch-action'];return {id:e.id,css:Object.fromEntries(props.map(k=>[k,s.getPropertyValue(k)])),rect:[r.x,r.y,r.width,r.height].map(n=>Math.round(n*1000)/1000)}})}report.samples.push({name,viewport:p.viewportSize(),values});flush()}
async function picture(p,name,selectors){await settle(p);await sample(p,name,selectors);const path=out+'/'+name+'.png';await p.screenshot({path,animations:'disabled'});report.pictures.push(path);flush();console.log('PICTURE',name)}
async function frame(p,name,open,root,close){await hit(p,open);await picture(p,name,[root,close]);await hit(p,close);await p.locator(root).waitFor({state:'hidden'});report.operations.push(name+' open/close')}
async function sensor(p,name,root){
 const result=await p.locator(root).evaluate(root=>{
  const elements=[root,...root.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth})
  const rules=[];function walk(list){for(const rule of list){if(rule.style&&rule.selectorText)rules.push(rule);else if(rule.cssRules&&(!rule.conditionText||!rule.conditionText.includes(':')||matchMedia(rule.conditionText).matches))walk(rule.cssRules)}}for(const sheet of document.styleSheets)try{walk(sheet.cssRules)}catch{}
  for(const e of elements.slice(0,80))for(const rule of rules.toReversed()){
   let matches=false;try{matches=e.matches(rule.selectorText)}catch{}if(!matches)continue
   for(const prop of ['background-color','color','font-size','border-color','padding']){
    const value=rule.style.getPropertyValue(prop);if(!value)continue
    const priority=rule.style.getPropertyPriority(prop),before=getComputedStyle(e).getPropertyValue(prop)
    rule.style.removeProperty(prop);const broken=getComputedStyle(e).getPropertyValue(prop);rule.style.setProperty(prop,value,priority)
    const restored=getComputedStyle(e).getPropertyValue(prop)
    if(before!==broken&&before===restored)return {selector:rule.selectorText,target:e.tagName+'#'+e.id+'.'+[...e.classList].join('.'),property:prop,before,broken,restored,assertionFailed:true}
   }
  }return null
 });assert.ok(result,`${name}: no winning paint declaration was broken`);report.breaks.push({name,...result});flush()
}
try{
 for(const [kind,width,height] of [['phone',390,844],['laptop',1280,700],['desktop',1600,900]])for(const who of ['admin','member']){
  const ctx=await browser.newContext({viewport:{width,height}}),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/?fresh=1')
  await p.locator('#luser').fill(who==='admin'?'ad':'us');await p.locator('#lpass').fill(who==='admin'?'a':'us');await hit(p,'#loginForm button[type=submit]');await settle(p)
  for(const to of ['viewsched',...(who==='admin'?['editsched']:[]),'inputs','quals','logic','leavewar','tracker','help',...(who==='admin'?['admin']:[])]){
   await nav(p,to);await sample(p,`${kind}-${who}-${to}`,['.topbar',`#page-${to}`])
   if(who==='admin'&&kind!=='laptop')await sensor(p,`${kind}-${to}`,`#page-${to}`)
   if(to==='viewsched'){await hit(p,'#vLegendBox summary');assert.ok(await p.locator('#vLegend').isVisible());await hit(p,'#vLegendBox summary');report.operations.push(`${kind}-${who}-legend`)}
   if(to==='quals'){await p.locator('#page-quals').evaluate(e=>{const boxes=[e,...e.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth);for(const box of boxes)box.scrollLeft=150});report.operations.push(`${kind}-${who}-quals-scroll`)}
   if(to==='logic'){await p.locator('#lgSearch').fill('rally');await settle(p);assert.ok((await p.locator('#page-logic').innerText()).toLowerCase().includes('rally'));await p.locator('#lgSearch').fill('');if(who==='admin'){await hit(p,'#lgEdit');assert.ok(await p.locator('[data-lgset]:visible').count());await hit(p,'#lgDone')}report.operations.push(`${kind}-${who}-logic-find`)}
   if(to==='help'){await p.locator('#bugText').fill('CSS preservation walk, unsent');await p.locator('#bugText').fill('');report.operations.push(`${kind}-${who}-help-draft`)}
  }
  // Actual member account, not just the admin's view switch: forbidden routes absent.
  if(who==='member'){if(width<701){await hit(p,'#burger');assert.equal(await p.locator('#drawerNav [data-page=admin]').count(),0);assert.equal(await p.locator('#drawerNav [data-page=editsched]').count(),0)}else{assert.equal(await p.locator('#topnav [data-page=admin]').isVisible(),false);assert.equal(await p.locator('#topnav [data-page=editsched]').isVisible(),false)}await ctx.close();continue}
  if(kind==='laptop'){await ctx.close();continue}
  await nav(p,'leavewar')
  await frame(p,`${kind}-leavewar-settings`,'[data-testid=settings-open]','[data-testid=settings-sheet]','[data-testid=settings-close]')
  await frame(p,`${kind}-leavewar-oil`,'[data-testid=oil-tracker]','[data-testid=oil-sheet]','[data-testid=oil-close]')
  await nav(p,'tracker');await hit(p,'#fileMenuBtn');await frame(p,`${kind}-tracker-file`,'#exportBtn','#copyModal','#copyCancel')
  const balls=p.locator('#flowSvg .ball[data-id]');let ball=null;for(let i=0;i<await balls.count();i++)if(await balls.nth(i).evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.x>0&&r.y>150&&r.right<innerWidth&&r.bottom<innerHeight-40&&(h===e||e.contains(h))})){ball=balls.nth(i);break}
  assert.ok(ball,'A visible Tracker event');await hit(p,ball);await picture(p,`${kind}-tracker-event`,['#pop']);await hit(p,p.locator('#pop').getByRole('button',{name:'Close',exact:true}))
  await hit(p,'#sylMenuBtn');await hit(p,'#arrangeBtn');await picture(p,`${kind}-tracker-layout`,['#arrTools']);await frame(p,`${kind}-tracker-syllabus`,'#editSyl','#sylModal','#sylCancel')
  await hit(p,'#sylMenuBtn');await hit(p,'#arrangeBtn')
  await nav(p,'viewsched');await frame(p,`${kind}-day-details`,'#vWeek [data-dayinfo="0"]','#dayPop','#dayPopDone')
  await nav(p,'editsched');await hit(p,'#eWeek [data-sbday="0"]:visible')
  await frame(p,`${kind}-schedule-input`,'#sbBoard [data-inpadd="0.g"]','#inpEditPop','#inpEditCancel')
  await hit(p,'#sbDone')
  // Breakpoint samples: real computed layout at both sides, no arbitrary tolerance.
  for(const w of [620,621,820,821,1499,1500]){await p.setViewportSize({width:w,height:900});await settle(p);await sample(p,`${kind}-boundary-${w}`,['.topbar','#eWeek','.eroster'])}
  // Re-open after each resize: the windows choose their position when opened.
  for(const [w,h] of [[844,390],[1440,480]]){
   await p.setViewportSize({width:w,height:h});await settle(p);await nav(p,'viewsched');await hit(p,'#insightBtn');await picture(p,`${kind}-short-${w}-insights`,['#insightModal','.modal-box','#insightClose']);await hit(p,'#insightClose')
   await nav(p,'editsched');await hit(p,'#eWeek [data-sbday="0"]:visible');await picture(p,`${kind}-short-${w}-board`,['#schedBoard','#sbDone','#sbSign']);await hit(p,'#sbDone')
   await nav(p,'tracker');await hit(p,'#sylMenuBtn');await hit(p,'#arrangeBtn');await hit(p,'#foldTools');await picture(p,`${kind}-short-${w}-tracker-tools`,['#arrTools','#foldTools','#foldFit']);await hit(p,'#sylMenuBtn');await hit(p,'#arrangeBtn')
  }
  await ctx.close();flush()
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';flush()
}catch(e){report.status='FAIL';report.failure=String(e);flush();throw e}finally{await browser.close()}
if(process.env.CSS_MATRIX_COMPARE){
 const before=JSON.parse(readFileSync(`docs/handpass/css-split/${process.env.CSS_MATRIX_COMPARE}/result.json`,'utf8'));try{assert.deepEqual(report.samples,before.samples,'Named computed styles and geometry changed');writeFileSync(out+'/comparison.json',JSON.stringify({before:before.run,after:run,exact:true},null,2))}catch(e){report.status='FAIL';report.failure='Named computed style comparison failed';flush();throw e}
}
