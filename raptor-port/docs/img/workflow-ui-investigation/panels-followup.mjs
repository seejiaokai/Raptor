import {createRequire} from 'node:module'
import {existsSync,writeFileSync,mkdirSync} from 'node:fs'
const repo='C:/Users/User/projects/Raptor/raptor-port',require=createRequire(repo+'/package.json')
const {chromium,devices}=require('@playwright/test')
const out='C:/Users/User/.codex/visualizations/2026/10/03/01a103a4-fe5a-7480-a6df-6c25f1000766/workflow-ui-investigation/panels-followup'
mkdirSync(out,{recursive:true})
const result={scope:'read-only original frozen bundle, normal UI routes, Chromium iPhone emulation, no physical Safari proof',errors:[],cases:[],pictures:[],status:'RUNNING'}
const flush=()=>writeFileSync(out+'/panels.json',JSON.stringify(result,null,2));flush()
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
async function fresh(member=false){
 const c=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:844}}),p=await c.newPage();p.setDefaultTimeout(7000)
 p.on('pageerror',e=>result.errors.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push('console: '+m.text())});p.on('response',r=>{if(r.status()>=400)result.errors.push('http: '+r.status()+' '+r.url())})
 await p.goto('http://127.0.0.1:4220/?fresh=1');await p.locator('#luser').fill(member?'us':'ad');await p.locator('#lpass').fill(member?'us':'a');await p.locator('#loginForm button[type=submit]').click();await p.locator('#vWeek .day').first().waitFor({state:'attached'});await p.evaluate(()=>document.fonts.ready)
 return p
}
async function nav(p,page){if(await p.locator('#topnav').isVisible())await p.locator('#topnav [data-page="'+page+'"]').click();else{await p.locator('#burger').click();await p.locator('#drawerNav [data-page="'+page+'"]').click()}await p.locator('#page-'+page+'.on').waitFor()}
async function editBoard(p){await nav(p,'editsched');await p.locator('#eWeek [data-sbday="0"]:visible').click();await p.locator('.schedboard:visible').waitFor()}
async function measure(p,selector,close,body){
 await p.waitForTimeout(200)
 return await p.evaluate(({selector,close,body})=>{
  const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'}
  const q=sel=>[...document.querySelectorAll(sel)].filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {selector:sel,id:e.id,class:e.className,rect:r.toJSON(),style:Object.fromEntries(['display','position','height','minHeight','maxHeight','overflowY','flex','top','bottom'].map(k=>[k,s[k]])),clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,scrollTop:e.scrollTop,withinScreen:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,ownHit:!!h&&(h===e||e.contains(h))}})
  return {viewport:{width:innerWidth,height:innerHeight,vvHeight:visualViewport?.height},panel:q(selector),close:q(close),body:q(body),footer:q(selector+' .airpop-foot,'+selector+' .ic-pop-foot,'+selector+' .ic-pick-foot,'+selector+' .win-foot'),controls:[...document.querySelectorAll(selector+' button')].filter(visible).map(e=>({id:e.id,text:e.textContent.slice(0,50),disabled:e.disabled,rect:e.getBoundingClientRect().toJSON()}))}
 },{selector,close,body})
}
async function photo(p,name){await p.screenshot({path:out+'/'+name+'.png',animations:'disabled'});result.pictures.push(name+'.png')}
const specs=[
 {name:'traffic',panel:'#airpop .airpop-box',close:'#airClose',body:'#airpop .airpop-body',setup:async p=>{await editBoard(p)},open:async p=>{await p.locator('#sbBoard [data-air]:visible').first().click()}},
 {name:'input-editor',panel:'#inpEditPop .airpop-box',close:'#inpEditCancel',body:'#inpEditPop .airpop-body',setup:editBoard,open:async p=>{await p.locator('#sbBoard [data-inpadd="0.g"]').click()}},
 {name:'week-calendar',panel:'#weekCal .airpop-box',close:'#weekCal .x',body:'#weekCal .airpop-body',setup:editBoard,open:async p=>{await p.locator('#sbCal').click()}},
 {name:'day-details',panel:'#dayPop .airpop-box',close:'#dayPopDone',body:'#dayPopBody',setup:async p=>{},open:async p=>{await p.locator('#vWeek [data-dayinfo="0"]:visible').first().click()}},
 {name:'inputs-calendar-day',panel:'.ic-pop',close:'#icPopClose',body:'.ic-pop-body',setup:async p=>{await nav(p,'inputs');await p.locator('#inCalBtn').click()},open:async p=>{await p.locator('[data-icday]').first().click({position:{x:20,y:15}})}},
 {name:'inputs-people-picker',panel:'.ic-pick',close:'#icPickCancel',body:'.ic-pick-body',setup:async p=>{await nav(p,'inputs');await p.locator('#inCalBtn').click();await p.locator('[data-icday]').first().click({position:{x:20,y:15}})},open:async p=>{await p.locator('#icAddPucks').click()}},
 {name:'availability',panel:'.availwin:not([hidden])',close:'.availwin:not([hidden]) .win-x',body:'.availwin .aw-body',setup:async p=>{await nav(p,'editsched')},open:async p=>{if(!await p.locator('#eWeek [data-oilsent]').count())throw new Error('UNAVAILABLE: no existing ALL/ALL AVAIL count chip in seeded week');await p.locator('#eWeek [data-oilsent]').first().click()}},
 {name:'changes',panel:'.chgwin:not([hidden]):not(.bar)',close:'.chgwin:not([hidden]) .win-x',body:'.chgwin .cw-body',setup:async p=>{await nav(p,'editsched')},open:async p=>{await p.locator('#histBtn').click()}},
 {name:'medical-document',panel:'#docViewPop .airpop-box',close:'#docViewDone',body:'#docViewPop .airpop-body',setup:async p=>{await nav(p,'inputs');await p.locator('#inMedBtn').click()},open:async p=>{if(!await p.locator('.medcard:visible').count())throw new Error('UNAVAILABLE: no existing medical document card in seeded account');await p.locator('.medcard:visible').first().click()}},
 {name:'input-type-legend',panel:'#inTypePop',close:'#inTypeHelp',body:'#inTypePop',setup:async p=>{await nav(p,'inputs')},open:async p=>{await p.locator('#inTypeHelp').click()}}
]
for(const s of specs.filter(s=>['inputs-calendar-day','inputs-people-picker','availability','changes'].includes(s.name))){
 const run={name:s.name,account:s.member?'Ranger member':'Saber admin',measurements:[],status:'RUNNING'};result.cases.push(run);flush();let p
 try{
  p=await fresh(s.member);await s.setup(p);await s.open(p);await p.locator(s.panel).waitFor()
  for(const [i,size] of [{width:390,height:844},{width:390,height:568},{width:844,height:390}].entries()){
   await p.setViewportSize(size);run.measurements.push({state:'open-resize-'+size.width+'x'+size.height,facts:await measure(p,s.panel,s.close,s.body)});if(i===1||s.name==='inputs-people-picker'&&i===0)await photo(p,s.name+'-'+size.width+'x'+size.height)
  }
  await p.setViewportSize({width:390,height:568});await p.locator(s.close).click();await s.open(p);run.measurements.push({state:'fresh-open-short',facts:await measure(p,s.panel,s.close,s.body)})
  const b=p.locator(s.body+':visible').first();if(await b.count()){
   const r=await b.boundingBox();if(r&&r.y>=0&&r.y+r.height<=568){await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,700);await p.waitForTimeout(200);run.measurements.push({state:'native-body-scroll',facts:await measure(p,s.panel,s.close,s.body)})}
  }
  await p.locator(s.close).click();run.status='COMPLETE'
 }catch(e){run.status=String(e).includes('UNAVAILABLE:')?'UNAVAILABLE':'HARNESS-FAIL';run.failure=String(e);if(p){run.dom=await p.evaluate(()=>({text:document.body.innerText.slice(0,9000),buttons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({id:e.id,class:e.className,text:e.textContent.slice(0,60)}))}));await photo(p,s.name+'-route-failure')}}finally{if(p)await p.context().close();flush()}
 console.log(JSON.stringify({name:run.name,status:run.status,failure:run.failure}))
}
await browser.close();result.status='COMPLETE-WITH-LIMITS';flush();console.log(JSON.stringify({status:result.status,errors:result.errors,pictures:result.pictures,cases:result.cases.map(c=>({name:c.name,status:c.status}))}))
