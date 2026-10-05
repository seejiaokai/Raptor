/* D515 final-look proposal. Disposable DOM overlays only; app source and saved
   answers are unbuilt. Prior plan/review/picture records are preserved. */
const fs = require('node:fs'), path = require('node:path'), http = require('node:http')
const assert = require('node:assert/strict'), { chromium } = require('@playwright/test')
const dist = path.resolve(__dirname, '../../../dist')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const out = __dirname, port = 4251
const result = { designOnly: true, applicationSourceUnchanged: true, checks: [], errors: [], pictures: [] }
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
  const base = name.startsWith('/pictures/') ? out : dist
  const relative = name.startsWith('/pictures/') ? name.slice(9) : name === '/' ? '/index.html' : name
  const p = path.resolve(base, '.' + relative)
  if (!p.startsWith(base + path.sep)) { res.writeHead(403); res.end(); return }
  const chosen = fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(dist, 'index.html')
  res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }[path.extname(chosen)] || 'application/octet-stream')
  res.end(fs.readFileSync(chosen))
})
const style = `
  #insightBody .mix-row{display:grid;grid-template-columns:74px minmax(0,1fr) 42px;gap:2px 8px;margin:5px 0 8px;font-size:12px;align-items:center}
  #insightBody .mix-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #insightBody .mix-track{height:12px;background:var(--panel-2);border-radius:6px;overflow:hidden}
  #insightBody .mix-fill{height:100%;display:flex;border-radius:6px;overflow:hidden}
  #insightBody .mix-blue{background:var(--flight)} #insightBody .mix-red{background:var(--hard)}
  #insightBody .mix-total{text-align:right;color:var(--ink-2);font:11px 'JetBrains Mono',monospace}
  #insightBody .mix-counts{grid-column:2/4;font-size:10px;line-height:14px;color:var(--ink-2)}
  #insightBody .mix-key{display:flex;gap:14px;font-size:11px;color:var(--ink-2);margin:0 0 10px;align-items:center}
  #insightBody .mix-key i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}
  #insightBody .mix-show{margin:2px 0 4px;padding:0;border:0;background:none;color:var(--accent);font:inherit;font-size:11px;cursor:pointer}
  #insightBody .mix-total-only{background:linear-gradient(90deg,var(--flight),#59c899)}
  .final-role{box-sizing:border-box;margin:8px 10px 12px;padding:12px;background:var(--panel);border:1px solid var(--edge);border-radius:9px;color:var(--ink);font:12px Inter,sans-serif;max-width:440px;display:flex;align-items:center;gap:16px}
  .final-role .words{flex:1;min-width:0}.final-role strong{display:block;font-size:12px;margin:0 0 5px}
  .final-role p{font-size:11px;line-height:1.4;margin:0;color:var(--ink-2)}
  .final-role .context{font-size:10px;color:var(--ink-2);margin:0 0 6px;display:block}
  .final-role .choices{display:flex;gap:7px;align-items:center}
  .final-role button{min-width:54px;min-height:36px;padding:7px 11px;border:1px solid var(--edge);border-radius:6px;background:var(--bg);color:var(--ink);font:600 12px Inter,sans-serif;cursor:pointer}
  .final-role button[data-role=blue]{border-color:var(--flight)}.final-role button[data-role=red]{border-color:var(--hard)}
  .final-role .later{padding:4px 0;min-width:0;min-height:0;border:0;margin:0 0 0 4px;color:var(--ink-2);text-decoration:underline}
  .final-action{margin:8px 10px 12px;display:flex;align-items:center;gap:12px;font:12px Inter,sans-serif;color:var(--ink-2)}
  .final-action button{border:1px solid var(--edge);border-radius:6px;padding:8px 10px;color:var(--ink);background:var(--panel);font:12px Inter,sans-serif;cursor:pointer}
  @media(max-width:500px){.final-role{max-width:none;gap:10px}.final-role button{min-width:51px;padding:7px 9px}}
`
let browser
async function login(page) {
  await page.goto(`http://127.0.0.1:${port}/?fresh=1`)
  await page.locator('#luser').fill('ad'); await page.locator('#lpass').fill('a')
  await page.locator('#loginForm button[type=submit]').click()
  await page.locator('#vWeek .day').first().waitFor({ state: 'attached' })
  await page.addStyleTag({ content: style })
}
async function picture(page, name, clip) {
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.playState==='running'&&a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))))
  await page.screenshot({ path: path.join(out, name + '.png'), ...(clip ? { clip } : {}) })
  result.pictures.push(name + '.png')
}
async function run() {
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve))
  browser = await chromium.launch({ ...(fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), headless: true })
  for (const [label, viewport] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 1000 }], ['short', { width: 390, height: 568 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: label !== 'desktop', hasTouch: label !== 'desktop' })
    const page = await ctx.newPage()
    page.on('pageerror', e => result.errors.push(`${label}: ${e.message}`))
    await login(page)
    if (label !== 'short') {
      // Existing hidden shell button opens the real modal for design capture;
      // this is deliberately not evidence for the future Board/Drawer doors.
      await page.evaluate(()=>document.querySelector('#insightBtn').click()); await page.locator('#insightBody .ibar').first().waitFor()
      const counts = await page.evaluate(() => {
        const body = document.querySelector('#insightBody')
        const heading = [...body.querySelectorAll('.isec-h')].find(el => el.textContent.startsWith('Flying load'))
        heading.insertAdjacentHTML('afterend', '<div class="mix-key"><span><i style="background:var(--flight)"></i>Blue</span><span><i style="background:var(--hard)"></i>Red</span></div>')
        let el = heading.nextElementSibling.nextElementSibling, i = 0
        const totals = [], mixes = [[2,2],[0,3],[3,0],null,[1,1]]
        while (el && el.classList.contains('ibar')) {
          const next = el.nextElementSibling, name = el.querySelector('.nm').textContent, total = Number(el.querySelector('.v').textContent)
          const mix = i === 3 ? null : mixes[i] || [total,0]
          const row = document.createElement('div'); row.className = 'mix-row'
          const nm = document.createElement('span'); nm.className = 'mix-name'; nm.textContent = name; row.append(nm)
          row.insertAdjacentHTML('beforeend', `<span class="mix-track"><span class="mix-fill${mix ? '' : ' mix-total-only'}" style="width:${total/4*100}%">${mix ? `<span class="mix-blue" style="flex:0 0 ${mix[0]/total*100}%"></span><span class="mix-red" style="flex:0 0 ${mix[1]/total*100}%"></span>` : ''}</span></span><span class="mix-total">${total}</span><span class="mix-counts">${mix ? mix[0]+' blue · '+mix[1]+' red' : 'Role not chosen · total only'}</span>`)
          el.replaceWith(row); totals.push({ name, total, mix }); i++; el = next
        }
        const show = document.createElement('button'); show.type = 'button'; show.className = 'mix-show'; show.textContent = 'Show all 38 aircrew ↓'
        el.replaceWith(show)
        show.onclick = () => {
          const extras = body.querySelector('.mix-extra')
          if (extras) { extras.remove(); show.textContent = 'Show all 38 aircrew ↓'; return }
          const extra = document.createElement('div'); extra.className = 'mix-extra'
          // Explicit illustrative overflow rows: no claim these are calculated app data.
          for (let n=13; n<=38; n++) extra.insertAdjacentHTML('beforeend', `<div class="mix-row"><span class="mix-name">Aircrew ${n}</span><span class="mix-track"><span class="mix-fill" style="width:25%"><span class="mix-blue" style="flex:0 0 100%"></span></span></span><span class="mix-total">1</span><span class="mix-counts">1 blue · 0 red</span></div>`)
          show.before(extra); show.textContent = 'Show less ↑'
        }
        return totals
      })
      assert.equal(counts.length,12); counts.filter(x=>x.mix).forEach(x=>assert.equal(x.mix[0]+x.mix[1],x.total))
      const modal = page.locator('#insightModal .modal-box')
      assert.ok(await modal.evaluate(el=>el.scrollWidth<=el.clientWidth+1))
      await modal.screenshot({ path: path.join(out, `chart-${label}.png`) }); result.pictures.push(`chart-${label}.png`)
      await page.locator('.mix-show').click(); assert.equal(await page.locator('.mix-row').count(),38)
      assert.equal(await page.locator('.mix-show').innerText(),'Show less ↑')
      await page.locator('.mix-show').click(); assert.equal(await page.locator('.mix-row').count(),12)
      result.checks.push({ label, chartTotals: counts, chartOverflow: false, mockShowAll: '12 → 38 → 12', splitsIllustrative: true })
      await page.locator('#insightClose').click()
    }
    await page.evaluate(()=>window.go('editsched')); await page.locator('#eWeek .sb-open').first().click()
    await page.locator('#sbBoard .sb-line').first().waitFor()
    if (label === 'desktop') {
      await page.evaluate(()=>{ const b=document.createElement('button'); b.className='abtn'; b.textContent='Insights'; b.id='finalBoardInsights'; document.querySelector('#sbBell').after(b) })
      const b=await page.locator('#finalBoardInsights').boundingBox(); assert.ok(b.x+b.width<=viewport.width)
      await picture(page,`board-${label}`,{x:0,y:0,width:viewport.width,height:210})
    } else if (label === 'phone') {
      await page.locator('#sbMore').click()
      await page.evaluate(()=>{ const b=document.createElement('button'); b.className='sb-moreitem'; b.textContent='Insights'; b.setAttribute('role','menuitem'); b.id='finalBoardInsights'; document.querySelector('#sbMoreMenu').append(b) })
      const b=await page.locator('#finalBoardInsights').boundingBox(); assert.ok(b.x+b.width<=viewport.width)
      await picture(page,`board-${label}`,{x:0,y:0,width:viewport.width,height:350})
      await page.locator('#sbMore').click()
    }
    const mission=page.locator('#sbBoard [data-bfld$=".msn"]').first(); await mission.scrollIntoViewIfNeeded()
    await mission.evaluate(el=>{
      const row=el.closest('.sb-line'); row.dataset.finalRow='true'
      let end=row; while(end.nextElementSibling&&!end.nextElementSibling.classList.contains('sb-area'))end=end.nextElementSibling
      if(!end.nextElementSibling)throw Error('Formation AREA missing'); end.nextElementSibling.dataset.finalArea='true'
      const r=row.querySelector('.nts'); r.removeAttribute('data-bfld'); r.dataset.finalRemarks='true'; r.value='DS FROM RU'
      for(let n=row;n&&!n.classList.contains('sb-area');n=n.nextElementSibling)n.querySelectorAll('.msn').forEach(m=>{m.removeAttribute('data-bfld');m.value='ACM'})
      window.finalRoleState={side:null,context:'Working copy'}
      window.finalShowQuestion=()=>{
        document.querySelectorAll('.final-role,.final-action').forEach(n=>n.remove())
        const box=document.createElement('section'); box.className='final-role'; box.setAttribute('aria-label','Mission role for VL')
        box.innerHTML='<div class="words"><span class="context">'+window.finalRoleState.context+'</span><strong>VL: Blue or Red?</strong><p>Mission or remarks mention DS or RED.</p></div><div class="choices"><button type="button" data-role="blue">Blue</button><button type="button" data-role="red">Red</button><button type="button" class="later" data-role="later">Later</button></div>'
        document.querySelector('[data-final-area]').after(box)
        box.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();if(b.dataset.role!=='later')window.finalRoleState.side=b.dataset.role;box.remove()})
      }
      window.finalShowAction=()=>{
        document.querySelectorAll('.final-role,.final-action').forEach(n=>n.remove())
        const box=document.createElement('div'); box.className='final-action'
        box.innerHTML='<span>'+window.finalRoleState.context+'</span><button type="button">'+(window.finalRoleState.side?'Change':'Choose')+' mission role</button>'
        document.querySelector('[data-final-area]').after(box)
        box.querySelector('button').onclick=e=>{e.preventDefault();e.stopImmediatePropagation();window.finalShowQuestion()}
      }
    })
    const remarks=page.locator('[data-final-remarks]')
    const metrics=()=>page.locator('[data-final-row] .msn').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,rowHeight:el.closest('.sb-line').getBoundingClientRect().height}))
    const before=await metrics()
    const frame=async name=>{
      await page.locator('.final-action,.final-role').scrollIntoViewIfNeeded()
      await page.locator('[data-final-row]').evaluate(el=>{
        const dy=el.getBoundingClientRect().y-130
        for(let p=el.parentElement;p;p=p.parentElement)if(p.scrollHeight>p.clientHeight&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)){p.scrollTop+=dy;return}
      })
      const start=await page.locator('[data-final-row]').boundingBox(), end=await page.locator('.final-action,.final-role').boundingBox()
      const y=Math.max(0,start.y-62), height=Math.min(viewport.height-y,Math.max(260,end.y+end.height+28-y))
      assert.ok(end.y+end.height<=viewport.height+1); assert.ok(end.y>=(await remarks.boundingBox()).y+(await remarks.boundingBox()).height)
      await picture(page,`${name}-${label}`,{x:0,y,width:viewport.width,height})
    }
    await remarks.focus(); await remarks.evaluate(el=>{el.setSelectionRange(3,7);window.finalFocused=el;window.finalShowAction()})
    assert.ok(await remarks.evaluate(el=>document.activeElement===window.finalFocused&&el.selectionStart===3&&el.selectionEnd===7))
    if(label!=='short')await frame('working-choose')
    await page.locator('.final-action button').click(); await frame('working-question')
    await page.locator('.final-role [data-role=later]').click(); assert.equal(await remarks.inputValue(),'DS FROM RU')
    assert.equal(await page.locator('.final-role').count(),0)
    await remarks.evaluate(el=>{el.focus({preventScroll:true});el.setSelectionRange(3,7);window.finalRoleState.side='blue';window.finalShowAction()})
    assert.ok(await remarks.evaluate(el=>document.activeElement===window.finalFocused&&el.selectionStart===3&&el.selectionEnd===7))
    if(label!=='short')await frame('working-change')
    await page.locator('.final-action button').click(); await page.locator('.final-role [data-role=later]').click()
    assert.equal(await page.evaluate(()=>window.finalRoleState.side),'blue')
    assert.deepEqual(await metrics(),before)
    // Use the existing real sign/publish/view controls in this disposable fresh
    // browser to obtain its authentic read-only layout. Role/text overlays remain
    // illustrations, NOT a production-route annotation/storage test.
    await page.evaluate(()=>document.querySelectorAll('.final-action,.final-role').forEach(n=>n.remove()))
    const signs=page.locator('#schedBoard select[data-sign]')
    for(let i=0;i<await signs.count();i++){
      const values=await signs.nth(i).locator('option').evaluateAll(os=>os.map(o=>o.value).filter(Boolean))
      await signs.nth(i).selectOption(values[Math.min(i,values.length-1)])
    }
    const publish=page.locator('#schedBoard [data-beak="0"]')
    await publish.click()
    await page.locator('#schedBoard [data-planmenu]').click()
    await page.locator('[data-planpv]').first().click()
    await page.locator('#sbBoard .pv-frozen').waitFor()
    await page.waitForFunction(()=>!document.querySelector('#toastEl')||getComputedStyle(document.querySelector('#toastEl')).opacity==='0')
    await page.evaluate(()=>{
      const row=document.querySelector('#sbBoard .sb-line');row.dataset.finalRow='true'
      let end=row;while(end.nextElementSibling&&!end.nextElementSibling.classList.contains('sb-area'))end=end.nextElementSibling
      end.nextElementSibling.dataset.finalArea='true'
      for(let n=row;n&&!n.classList.contains('sb-area');n=n.nextElementSibling)n.querySelectorAll('.msn').forEach(m=>m.value='ACM')
      const r=row.querySelector('.nts');r.dataset.finalRemarks='true';r.removeAttribute('data-bfld');r.disabled=false;r.readOnly=true;r.value='DS FOR VL'
      r.setAttribute('aria-label','Published Remarks — read only');r.style.opacity='1'
      window.finalRoleState={side:'red',context:'Published · Original'}
      r.onfocus=()=>window.finalShowAction();r.focus({preventScroll:true});window.finalShowAction()
    })
    const publishedBefore=await metrics()
    if(label!=='short'){
      await page.locator('#schedBoard .dprev-bar').evaluate(el=>{
        for(let p=el.parentElement;p;p=p.parentElement)if(p.scrollHeight>p.clientHeight&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)){p.scrollTop=0;return}
      })
      await picture(page,`published-view-${label}`)
    }
    await remarks.press('End'); await remarks.press('X'); assert.equal(await remarks.inputValue(),'DS FOR VL')
    if(label!=='short')await frame('published-change')
    await page.locator('.final-action button').click(); await frame('published-question')
    await page.locator('.final-role [data-role=later]').click(); assert.equal(await page.evaluate(()=>window.finalRoleState.side),'red')
    assert.deepEqual(await metrics(),publishedBefore)
    result.checks.push({label,viewport,missionAndRowGeometryUnchanged:true,mockFocusNodeAndRangePreserved:true,mockLaterRetainsTextAndPriorAnswer:true,publishedRemarksReadOnly:true,applicationTriggerStorageUndoUnbuilt:true})
    await ctx.close()
  }
  assert.deepEqual(result.errors,[])
  const css='body{margin:0;background:#131820;color:#e9edf3;font:15px system-ui;padding:24px}h1{font-size:24px}h2{font-size:18px}p{color:#b9c1ce}section{margin:24px 0 40px}.pair{display:grid;grid-template-columns:390px minmax(600px,1fr);gap:20px;align-items:start}img{max-width:100%;display:block;border:1px solid #37404e;border-radius:8px}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}.cards figure{margin:0}figcaption{margin:9px 0 12px;color:#b9c1ce}a{color:#9abfff}@media(max-width:900px){.pair,.cards{display:block}figure{margin:20px 0!important}}'
  const pairs=[['Chart and Show all','chart'],['Board Insights entry','board'],['Unanswered working role','working-choose'],['Working question after an own edit','working-question'],['Correct a saved working answer','working-change'],['Existing latest-published view — programme stays read-only','published-view'],['Latest published read-only Remarks access','published-change'],['Published question','published-question']]
  const gallery='<!doctype html><meta charset="utf-8"><title>Insights — final look</title><style>'+css+'</style><h1>Insights — final look</h1><p>Design previews on the current app. Splits are illustrative. Saving, Undo and the real edit triggers will be built after agreement.</p><p>Open the latest published version, tap its read-only Remarks, then Choose or Change mission role. The answer updates Insights immediately; the programme stays unchanged.</p>'+pairs.map(([title,name])=>'<section><h2>'+title+'</h2><div class="pair"><figure><figcaption>Phone</figcaption><img src="'+name+'-phone.png"></figure><figure><figcaption>Desktop</figcaption><img src="'+name+'-desktop.png"></figure></div></section>').join('')+'<section><h2>Short phone</h2><div class="pair"><img src="working-question-short.png"><img src="published-question-short.png"></div></section>'
  fs.writeFileSync(path.join(out,'index.html'),gallery)
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2))
  console.log('Final-look mock checks PASS: totals, Show all, phone/desktop/short layout, read-only published Remarks, temporary actions/Later. No app source or saved-role behaviour changed.')
}
if(process.argv.includes('--serve'))server.listen(port,'127.0.0.1',()=>console.log('Final-look preview: http://127.0.0.1:'+port+'/pictures/index.html'))
else run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
