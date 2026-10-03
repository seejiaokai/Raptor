import {createRequire} from 'node:module'
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const repo='C:/Users/User/projects/Raptor/raptor-port'
const require=createRequire(repo+'/package.json')
const {chromium}=require('@playwright/test')
const out='C:/Users/User/.codex/visualizations/2026/10/03/01a103a4-fe5a-7480-a6df-6c25f1000766/workflow-ui-investigation'
mkdirSync(out,{recursive:true})
const hash=b=>createHash('sha256').update(b).digest('hex')
const freeze=JSON.parse(readFileSync(repo+'/docs/handpass/css-split/source-freeze.json','utf8'))
const identity=freeze.files.map(f=>({path:f.path,expected:f.sha256,actual:existsSync(repo+'/'+f.path)?hash(readFileSync(repo+'/'+f.path)):null}))
assert.equal(identity.filter(f=>f.expected!==f.actual).length,0,'Original source and bundle freeze must match')
const result={baseline:'686c799534f0e78dc0c3a9f1a69c6c72fb0561a8',freezeFiles:identity.length,identity,errors:[],pictures:[],observations:[],status:'RUNNING'}
const flush=()=>writeFileSync(out+'/inventory.json',JSON.stringify(result,null,2))
flush()
const chrome=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const browser=await chromium.launch({headless:true,...(existsSync(chrome)?{executablePath:chrome}:{})})
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:560}})
 const p=await ctx.newPage()
 p.on('pageerror',e=>result.errors.push('page: '+e.message))
 p.on('console',m=>{if(m.type()==='error')result.errors.push('console: '+m.text())})
 p.on('response',r=>{if(r.status()>=400)result.errors.push('http: '+r.status()+' '+r.url())})
 await p.goto('http://127.0.0.1:4220/?fresh=1')
 await p.locator('#luser').fill('ad');await p.locator('#lpass').fill('a')
 await p.locator('#loginForm button[type=submit]').click()
 await p.locator('#vWeek .day').first().waitFor({state:'attached'})
 await p.locator('#topnav [data-page="editsched"]').click()
 await p.locator('#page-editsched.on').waitFor()
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400)
 result.observations.push({name:'initial DOM',facts:await p.evaluate(()=>({body:document.body.innerText.slice(0,9000),header:document.querySelector('.topbar')?.outerHTML,roster:document.querySelector('.eroster')?.outerHTML.slice(0,4500)}))})
 await p.screenshot({path:out+'/desktop-initial.png',animations:'disabled'});result.pictures.push('desktop-initial.png')
 await p.mouse.move(500,450);await p.mouse.wheel(0,800);await p.waitForTimeout(500)
 result.observations.push({name:'native scroll',facts:await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {rect:{x:r.x,y:r.y,width:r.width,height:r.height},top:c.top,z:c.zIndex,hit:hit?.id||hit?.className,ownHit:hit===e||e.contains(hit)}};return {scrollY:scrollY,header:q('.topbar'),roster:q('.eroster'),placeholder:[...document.querySelectorAll('.eroster *')].filter(e=>e.textContent==='ALL AVAIL').map(e=>({tag:e.tagName,outer:e.outerHTML,rect:e.getBoundingClientRect().toJSON()}))}})})
 await p.screenshot({path:out+'/desktop-native-scroll.png',animations:'disabled'});result.pictures.push('desktop-native-scroll.png')
 result.status='COMPLETE';flush();console.log(JSON.stringify({status:result.status,freezeFiles:identity.length,errors:result.errors,observations:result.observations}))
}catch(e){result.status='HARNESS-FAIL';result.failure=String(e);flush();throw e}finally{await browser.close()}
