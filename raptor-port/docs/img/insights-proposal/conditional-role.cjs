/* D517-D519 design picture only: cue-based question, no new line indicator.
   Browser context is disposable; no application source or owner data changes. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http')
const assert=require('node:assert/strict')
const {chromium}=require('@playwright/test')
const dist=path.resolve(__dirname,'../../../dist')
const CHROMIUM=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium'
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)
  const p=path.resolve(dist,'.'+(name==='/'?'/index.html':name))
  if(!p.startsWith(dist+path.sep)){res.writeHead(403);res.end();return}
  const chosen=fs.existsSync(p)&&fs.statSync(p).isFile()?p:path.join(dist,'index.html')
  res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(chosen)]||'application/octet-stream')
  res.end(fs.readFileSync(chosen))
})
const result={designOnly:true,noLineIndicator:true,checks:[],errors:[]}
let browser
async function run(){
  await new Promise(resolve=>server.listen(4246,'127.0.0.1',resolve))
  browser=await chromium.launch({...fs.existsSync(CHROMIUM)?{executablePath:CHROMIUM}:{},headless:true})
  for(const[label,viewport]of[['phone',{width:390,height:844}],['desktop',{width:1440,height:1000}],['short',{width:390,height:568}]]){
    const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:label!=='desktop',hasTouch:label!=='desktop'})
    const page=await context.newPage();page.on('pageerror',e=>result.errors.push(`${label}: ${e.message}`))
    await page.goto('http://127.0.0.1:4246/')
    await page.locator('#luser').fill('ad');await page.locator('#lpass').fill('a')
    await page.locator('#loginForm button[type=submit]').click()
    await page.locator('#vWeek .day').first().waitFor({state:'attached'})
    await page.evaluate(()=>window.go('editsched'));await page.locator('#eWeek .sb-open').first().click()
    const mission=page.locator('#sbBoard [data-bfld$=".msn"]').first()
    await mission.waitFor();await mission.scrollIntoViewIfNeeded()
    const before=await mission.evaluate(el=>({text:el.value,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,rowHeight:el.closest('.sb-line').getBoundingClientRect().height}))
    await page.evaluate(()=>{
      const mission=document.querySelector('#sbBoard [data-bfld$=".msn"]')
      // Illustrative aircraft remarks only; changing DOM text is not an app save.
      mission.closest('.sb-line').querySelector('.nts').value='DS FOR RU'
    })
    const field=await mission.boundingBox()
    const clip={x:label==='desktop'?Math.max(0,field.x-120):0,y:Math.max(0,field.y-65),width:label==='desktop'?760:viewport.width,height:Math.min(320,viewport.height-Math.max(0,field.y-65))}
    await page.screenshot({path:path.join(__dirname,`conditional-normal-${label}.png`),clip})
    await page.addStyleTag({content:`.conditional-role-picture{position:fixed;width:248px;box-sizing:border-box;padding:13px;background:var(--panel);border:1px solid var(--edge);border-radius:9px;z-index:9999;box-shadow:0 8px 24px #0006;color:var(--ink);font:12px Inter,sans-serif}.conditional-role-picture strong{display:block;margin-bottom:7px}.conditional-role-picture p{font-size:11px;line-height:1.45;margin:0 0 12px;color:var(--ink-2)}.conditional-role-picture .choices{display:flex;gap:8px}.conditional-role-picture button{flex:1;padding:8px;border:1px solid var(--edge);border-radius:6px;background:var(--bg);color:var(--ink);font:600 12px Inter,sans-serif}.conditional-role-picture button[data-role=blue]{border-color:var(--flight)}.conditional-role-picture button[data-role=red]{border-color:var(--hard)}`})
    await mission.evaluate(el=>{
      const p=document.createElement('section');p.className='conditional-role-picture';p.role='dialog';p.setAttribute('aria-label','Mission role for VL')
      p.innerHTML='<strong>Mission role for VL</strong><p>Remarks mention DS or RED.<br>Is this formation blue or red?</p><div class="choices"><button type="button" data-role="blue">Blue</button><button type="button" data-role="red">Red</button></div>'
      document.body.append(p)
      const b=el.getBoundingClientRect();p.style.left=Math.max(8,Math.min(b.x,innerWidth-256))+'px';p.style.top=Math.min(b.bottom+6,innerHeight-p.getBoundingClientRect().height-8)+'px'
      p.querySelectorAll('button').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();p.dataset.answer=button.dataset.role;p.hidden=true}))
    })
    const panel=page.locator('.conditional-role-picture'),box=await panel.boundingBox()
    assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height)
    await page.screenshot({path:path.join(__dirname,`conditional-question-${label}.png`),clip})
    await panel.locator('[data-role=blue]').click();assert.equal(await panel.getAttribute('data-answer'),'blue')
    await panel.evaluate(el=>el.hidden=false)
    await panel.locator('[data-role=red]').click();assert.equal(await panel.getAttribute('data-answer'),'red')
    const after=await mission.evaluate(el=>({text:el.value,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,rowHeight:el.closest('.sb-line').getBoundingClientRect().height}))
    assert.deepEqual(after,before)
    assert.equal(await page.locator('.role-proposal-tag,.role-proposal-visible').count(),0)
    result.checks.push({label,viewport,before,after,popup:box,prototypeButtons:true,virtualKeyboardNotSimulated:true})
    await context.close()
  }
  assert.deepEqual(result.errors,[])
  fs.writeFileSync(path.join(__dirname,'conditional-role-result.json'),JSON.stringify(result,null,2))
  console.log('Conditional question design only: Mission text/box and row size unchanged, no line marker, popup visible within phone/desktop/short viewports, two DOM-only answers operate, zero page errors. Saved/category/typing/keyboard behaviour remains unbuilt.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
