import {createRequire} from 'node:module'
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
const repo='C:/Users/User/projects/Raptor/raptor-port'
const require=createRequire(repo+'/package.json')
const {chromium,devices}=require('@playwright/test')
const out='C:/Users/User/.codex/visualizations/2026/10/03/01a103a4-fe5a-7480-a6df-6c25f1000766/workflow-ui-investigation/layout-complete'
const result={scope:'read-only original frozen bundle, no CSS or state injection',errors:[],assets:[],observations:[],pictures:[],status:'RUNNING'}
const flush=()=>writeFileSync(out+'/layout.json',JSON.stringify(result,null,2))
mkdirSync(out,{recursive:true});flush()
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
const pending=[]
async function pageFor(viewport,phone=false,member=false){
 const c=await browser.newContext({...phone?devices['iPhone 13']:{},viewport})
 const p=await c.newPage();p.setDefaultTimeout(8000)
 p.on('pageerror',e=>result.errors.push('page: '+e.message))
 p.on('console',m=>{if(m.type()==='error')result.errors.push('console: '+m.text())})
 p.on('response',r=>{
  if(r.status()>=400)result.errors.push('http: '+r.status()+' '+r.url())
  if(r.url().includes('/assets/'))pending.push((async()=>{
   const path=new URL(r.url()).pathname,body=await r.body()
   const hash=b=>createHash('sha256').update(b).digest('hex')
   result.assets.push({path,served:hash(body),disk:hash(readFileSync(repo+'/dist'+path))})
  })().catch(e=>result.errors.push('asset capture '+e.message)))
 })
 await p.goto('http://127.0.0.1:4220/?fresh=1');await p.locator('#luser').fill(member?'us':'ad');await p.locator('#lpass').fill(member?'us':'a');await p.locator('#loginForm button[type=submit]').click()
 await p.locator('#vWeek .day').first().waitFor({state:'attached'});await p.evaluate(()=>document.fonts.ready)
 return p
}
async function snap(p,name,selectors){
 await p.waitForTimeout(250)
 const facts=await p.evaluate(selectors=>{
 const q=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {tag:e.tagName,id:e.id,class:e.className,rect:r.toJSON(),style:Object.fromEntries(['display','flex','flexDirection','width','minWidth','height','minHeight','maxHeight','overflow','overflowX','overflowY','position','top','bottom','zIndex'].map(k=>[k,s[k]])),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,scrollLeft:e.scrollLeft,scrollTop:e.scrollTop,ownHit:!!h&&(h===e||e.contains(h)),hit:h?.id||h?.className,text:e.textContent.slice(0,110)}}
 return {viewport:{width:innerWidth,height:innerHeight,visualHeight:visualViewport?.height,scrollY},elements:selectors.flatMap(sel=>[...document.querySelectorAll(sel)].map(e=>({selector:sel,...q(e)})))}
 },selectors)
 result.observations.push({name,facts});await p.screenshot({path:out+'/'+name+'.png',animations:'disabled'});result.pictures.push(name+'.png');flush();return facts
}
const desk=['.topbar','.eroster','.eroster [data-person="allavail"]','.eroster [data-person="all"]','.eroster .rpuck:last-child','#roleBadge']
const board=['.schedboard','.sb-main','.sb-boardwrap','.sb-board','#sbSign','.sb-sec','.sb-side','#sbMore','#sbDone']
try{
 const p=await pageFor({width:1280,height:560});await p.locator('#topnav [data-page="editsched"]').click()
 for(const size of [{width:1280,height:560},{width:1600,height:900},{width:1440,height:480},{width:1280,height:560}]){
  await p.setViewportSize(size);await p.mouse.move(500,Math.min(size.height-50,450));await p.mouse.wheel(0,-10000);await p.waitForTimeout(250);await p.mouse.wheel(0,800)
  await snap(p,'palette-'+size.width+'x'+size.height+(result.pictures.includes('palette-'+size.width+'x'+size.height+'.png')?'-return':''),desk)
 }
 // Pointer input really reaches the header at the hidden placeholder's centre.
 const target=await p.locator('.eroster .rpuck[data-person="allavail"]').boundingBox()
 await p.mouse.move(target.x+target.width/2,target.y+target.height/2)
 result.observations.push({name:'covered-placeholder-hover',facts:await p.evaluate(()=>({hovered:[...document.querySelectorAll(':hover')].map(e=>({id:e.id,class:e.className,tag:e.tagName})),placeholderOwnHit:(()=>{const e=document.querySelector('.eroster [data-person="allavail"]'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===h||e.contains(h)})()}))});flush();await p.context().close()
 const m=await pageFor({width:390,height:844},true);await m.locator('#burger').click();await m.locator('#drawerNav [data-page="editsched"]').click();await m.locator('#eWeek [data-sbday="0"]:visible').click()
 await snap(m,'board-phone-normal',board)
 await m.locator('#sbMore').click();await m.locator('#sbMoreWide').click();await snap(m,'board-phone-wide',board)
 await m.mouse.move(190,450);await m.mouse.wheel(500,0);await snap(m,'board-phone-wide-pan',board)
 await m.locator('#sbMore').click();await m.locator('#sbMoreWide').click();await snap(m,'board-phone-normal-recovery',board)
 await m.locator('#sbMore').click();await m.locator('#sbMoreWide').click()
 for(const size of [{width:820,height:700},{width:821,height:700},{width:844,height:390},{width:390,height:844}]){await m.setViewportSize(size);await snap(m,'board-wide-'+size.width+'x'+size.height,board)}
 await m.locator('#sbMore').click();await m.locator('#sbMoreWide').click();await m.locator('#sbDone').click()
 result.observations.push({name:'phone-public-DOM',facts:await m.evaluate(()=>({body:document.body.innerText.slice(0,11000),buttons:[...document.querySelectorAll('button,[data-air],[data-oilsent]')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({id:e.id,class:e.className,txt:e.textContent.slice(0,80),data:{...e.dataset}}))}))});flush()
 await m.context().close();await Promise.all(pending);result.status='COMPLETE';flush();console.log(JSON.stringify({status:result.status,pictures:result.pictures,errors:result.errors,assetMismatches:result.assets.filter(a=>a.served!==a.disk)}))
}catch(e){result.status='HARNESS-FAIL';result.failure=String(e);flush();throw e}finally{await browser.close()}
