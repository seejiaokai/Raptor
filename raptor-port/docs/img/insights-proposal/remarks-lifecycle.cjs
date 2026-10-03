/* D525-D527 lifecycle design: Later/correction access, no application/data writes. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http')
const assert=require('node:assert/strict'),{chromium}=require('@playwright/test')
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
let browser
const result={designOnly:true,placement:'after formation AREA',savingLifecycleUnbuilt:true,checks:[],errors:[]}
async function run(){
  await new Promise(resolve=>server.listen(4247,'127.0.0.1',resolve))
  browser=await chromium.launch({...fs.existsSync(CHROMIUM)?{executablePath:CHROMIUM}:{},headless:true})
  for(const[label,viewport]of[['phone',{width:390,height:844}],['desktop',{width:1440,height:1000}],['short',{width:390,height:568}]]){
    const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:label!=='desktop',hasTouch:label!=='desktop'})
    const page=await context.newPage();page.on('pageerror',e=>result.errors.push(`${label}: ${e.message}`))
    await page.goto('http://127.0.0.1:4247/')
    await page.locator('#luser').fill('ad');await page.locator('#lpass').fill('a')
    await page.locator('#loginForm button[type=submit]').click()
    await page.locator('#vWeek .day').first().waitFor({state:'attached'})
    await page.evaluate(()=>window.go('editsched'));await page.locator('#eWeek .sb-open').first().click()
    const mission=page.locator('#sbBoard [data-bfld$=".msn"]').first()
    await mission.waitFor();await mission.scrollIntoViewIfNeeded()
    await mission.evaluate(el=>{
      const row=el.closest('.sb-line'),remarks=row.querySelector('.nts')
      // Remove the mock editor's writer attribute before demonstrating focus exit.
      // The illustrative text and answer live only in this disposable DOM.
      remarks.removeAttribute('data-bfld');remarks.dataset.pictureRemarks='true';remarks.value='DS FOR RU'
      let end=row;while(end.nextElementSibling&&!end.nextElementSibling.classList.contains('sb-area'))end=end.nextElementSibling
      if(!end.nextElementSibling)throw Error('Formation AREA not found')
      end.nextElementSibling.dataset.pictureArea='true';row.dataset.pictureRow='true'
    })
    await page.addStyleTag({content:'.remarks-role-picture{box-sizing:border-box;margin:8px 10px 12px;padding:12px;background:var(--panel);border:1px solid var(--edge);border-radius:9px;color:var(--ink);font:12px Inter,sans-serif;max-width:440px;display:flex;align-items:center;gap:16px}.remarks-role-picture .words{flex:1;min-width:0}.remarks-role-picture strong{display:block;font-size:12px;margin-bottom:5px}.remarks-role-picture p{font-size:11px;line-height:1.4;margin:0;color:var(--ink-2)}.remarks-role-picture .choices{display:flex;gap:7px}.remarks-role-picture button{min-width:54px;min-height:36px;padding:7px 11px;border:1px solid var(--edge);border-radius:6px;background:var(--bg);color:var(--ink);font:600 12px Inter,sans-serif}.remarks-role-picture button[data-role=blue]{border-color:var(--flight)}.remarks-role-picture button[data-role=red]{border-color:var(--hard)}@media(max-width:500px){.remarks-role-picture{max-width:none;gap:10px}.remarks-role-picture button{min-width:51px;padding:7px 9px}}'})
    const metrics=()=>mission.evaluate(el=>({text:el.value,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,rowHeight:el.closest('.sb-line').getBoundingClientRect().height}))
    const before=await metrics()
    const clip=async()=>{
      const start=await page.locator('[data-picture-row]').boundingBox(),end=await page.locator('.remarks-role-picture').count()?await page.locator('.remarks-role-picture').boundingBox():await page.locator('[data-picture-area]').boundingBox()
      const y=Math.max(0,start.y-64)
      return{x:0,y,width:viewport.width,height:Math.min(viewport.height-y,Math.max(280,end.y+end.height+24-y))}
    }
    await page.addStyleTag({content:'.remarks-role-picture .later{padding:4px 0;min-width:0;min-height:0;border:0;margin:0 0 0 4px;color:var(--ink-2);text-decoration:underline}.remarks-correction-picture{margin:8px 10px 12px;display:flex;align-items:center;gap:12px;font:12px Inter,sans-serif;color:var(--ink-2)}.remarks-correction-picture button{border:1px solid var(--edge);border-radius:6px;padding:8px 10px;color:var(--ink);background:var(--panel);font:12px Inter,sans-serif}'})
    const remarks=page.locator('[data-picture-remarks]')
    await remarks.evaluate(el=>el.addEventListener('blur',()=>setTimeout(()=>{
      const focusBefore=document.activeElement
      const p=document.createElement('section');p.className='remarks-role-picture';p.setAttribute('role','region');p.setAttribute('aria-label','Mission role for VL')
      p.innerHTML='<div class="words"><strong>VL: Blue or Red?</strong><p>Remarks mention DS or RED.</p></div><div class="choices"><button type="button" data-role="blue">Blue</button><button type="button" data-role="red">Red</button><button class="later" type="button" data-role="later">Later</button></div>'
      document.querySelector('[data-picture-area]').after(p)
      p.dataset.focusPreserved=String(document.activeElement===focusBefore)
      p.querySelectorAll('button').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.body.dataset.pictureAnswer=button.dataset.role;p.remove();focusBefore.focus({preventScroll:true})}))
    },30),{once:true}))
    await remarks.focus();await page.keyboard.press('Tab')
    const panel=page.locator('.remarks-role-picture');await panel.waitFor()
    const active=await page.evaluate(()=>({tag:document.activeElement.tagName,roleQuestionFocus:!!document.activeElement.closest('.remarks-role-picture')}))
    assert.equal(await panel.getAttribute('data-focus-preserved'),'true');assert.equal(active.roleQuestionFocus,false)
    // Normal scrolling reveals a question below the viewport; no automatic jump.
    await panel.scrollIntoViewIfNeeded()
    if(label==='short')await mission.evaluate(el=>{
      const row=el.closest('.sb-line'),dy=row.getBoundingClientRect().y-110
      for(let p=row.parentElement;p;p=p.parentElement){if(p.scrollHeight>p.clientHeight&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)){p.scrollTop+=dy;return}}
      window.scrollBy(0,dy)
    })
    const row=await page.locator('[data-picture-row]').boundingBox(),box=await panel.boundingBox(),rb=await remarks.boundingBox()
    assert.ok(box.x>=0&&box.x+box.width<=viewport.width&&box.y>=rb.y+rb.height)
    if(label==='short')assert.ok(row.y>=100&&box.y+box.height<=viewport.height)
    assert.deepEqual(await metrics(),before)
    await page.screenshot({path:path.join(__dirname,`lifecycle-question-${label}.png`),clip:await clip()})
    const panelHTML=await panel.evaluate(el=>el.outerHTML)
    await panel.locator('[data-role=blue]').click();assert.equal(await page.locator('body').getAttribute('data-picture-answer'),'blue');assert.equal(await panel.count(),0)
    // Reinsert the same design to demonstrate the other button without a saved command.
    await page.evaluate(html=>{
      document.querySelector('[data-picture-area]').insertAdjacentHTML('afterend',html)
      const p=document.querySelector('.remarks-role-picture');p.querySelector('[data-role=red]').onclick=e=>{e.preventDefault();e.stopImmediatePropagation();document.body.dataset.pictureAnswer='red';p.remove()}
    },panelHTML)
    await panel.locator('[data-role=red]').click();assert.equal(await page.locator('body').getAttribute('data-picture-answer'),'red');assert.equal(await panel.count(),0)
    await page.evaluate(html=>{
      document.querySelector('[data-picture-area]').insertAdjacentHTML('afterend',html)
      const p=document.querySelector('.remarks-role-picture');p.querySelector('[data-role=later]').onclick=e=>{e.preventDefault();e.stopImmediatePropagation();document.body.dataset.pictureAnswer='later';p.remove()}
    },panelHTML)
    await panel.locator('[data-role=later]').click();assert.equal(await page.locator('body').getAttribute('data-picture-answer'),'later');assert.equal(await panel.count(),0)
    assert.equal(await remarks.inputValue(),'DS FOR RU')
    await page.evaluate(html=>{
      const p=document.createElement('div');p.className='remarks-correction-picture';p.innerHTML='<span>VL</span><button type="button">Change mission role…</button>'
      document.querySelector('[data-picture-area]').after(p)
      p.querySelector('button').onclick=e=>{e.preventDefault();e.stopImmediatePropagation();p.remove();document.querySelector('[data-picture-area]').insertAdjacentHTML('afterend',html)}
      document.querySelector('[data-picture-remarks]').focus({preventScroll:true})
    },panelHTML)
    const correction=page.locator('.remarks-correction-picture');await correction.scrollIntoViewIfNeeded()
    const start=await page.locator('[data-picture-row]').boundingBox(),end=await correction.boundingBox(),y=Math.max(0,start.y-64)
    await page.screenshot({path:path.join(__dirname,`lifecycle-correction-${label}.png`),clip:{x:0,y,width:viewport.width,height:Math.min(viewport.height-y,Math.max(280,end.y+end.height+24-y))}})
    await correction.locator('button').click();await panel.waitFor();assert.equal(await correction.count(),0)
    result.checks.push({label,viewport,before,after:await metrics(),row,remarks:rb,question:box,focusPreserved:true,nextFocus:active,buttonsRemoveTemporarySpace:true,virtualKeyboardNotSimulated:true})
    await context.close()
  }
  assert.deepEqual(result.errors,[])
  fs.writeFileSync(path.join(__dirname,'remarks-lifecycle-result.json'),JSON.stringify(result,null,2))
  console.log('Design only: phone/desktop/short question/correction pictures, no Remarks overlap, mock Blue/Red/Later/correction actions operate, Later keeps text. Real saving/keyboard/Undo/issuing unbuilt.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
