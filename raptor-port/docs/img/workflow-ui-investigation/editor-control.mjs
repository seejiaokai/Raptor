import {createRequire} from 'node:module'
import {writeFileSync,mkdirSync} from 'node:fs'
const require=createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json'),{chromium,devices}=require('@playwright/test')
const out='C:/Users/User/.codex/visualizations/2026/10/03/01a103a4-fe5a-7480-a6df-6c25f1000766/workflow-ui-investigation/editor-control';mkdirSync(out,{recursive:true})
const browser=await chromium.launch({headless:true}),context=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:844}}),p=await context.newPage(),result={errors:[],status:'RUNNING'}
p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text())});p.setDefaultTimeout(7000)
try{
 await p.goto('http://127.0.0.1:4220/?fresh=1');await p.locator('#luser').fill('ad');await p.locator('#lpass').fill('a');await p.locator('#loginForm button[type=submit]').click();await p.locator('#vWeek .day').first().waitFor({state:'attached'});await p.locator('#burger').click();await p.locator('#drawerNav [data-page="editsched"]').click();await p.locator('#eWeek [data-sbday="0"]:visible').click();await p.locator('#sbBoard [data-inpadd="0.g"]').click();await p.setViewportSize({width:844,height:390});await p.waitForTimeout(500)
 const box=await p.locator('#inpEditPop .airpop-box').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+50);await p.mouse.wheel(0,1200);await p.waitForTimeout(300)
 result.before=await p.locator('#inpEditCancel').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),innerWidth,innerHeight,vv:{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale},hit:document.elementFromPoint(e.getBoundingClientRect().x+e.getBoundingClientRect().width/2,e.getBoundingClientRect().y+e.getBoundingClientRect().height/2)?.id}));result.playwrightBox=await p.locator('#inpEditCancel').boundingBox()
 // Locator maps the emulated visual viewport correctly; ordinary click, no force.
 await p.locator('#inpEditCancel').click();await p.locator('#inpEditPop').waitFor({state:'hidden'});result.closed=true;await p.screenshot({path:out+'/input-editor-landscape-cancel-closed.png',animations:'disabled'});result.status='COMPLETE'
}catch(e){result.status='HARNESS-FAIL';result.failure=String(e);await p.screenshot({path:out+'/failure.png',animations:'disabled'})}finally{writeFileSync(out+'/editor-control.json',JSON.stringify(result,null,2));await browser.close()}
console.log(JSON.stringify(result))
