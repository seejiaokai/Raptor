/* Design-only DOM controls over the existing production bundle. No category
   saved, no app source changed, no mission text edited. Scope is illustrative. */
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const assert = require('node:assert/strict')
const { chromium } = require('@playwright/test')
const root = path.resolve(__dirname, '../../..')
const dist = path.join(root, 'dist')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
  const p = path.resolve(dist, '.' + (name === '/' ? '/index.html' : name))
  if (!p.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  const chosen = fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(dist, 'index.html')
  res.setHeader('Content-Type', mime[path.extname(chosen)] || 'application/octet-stream')
  res.end(fs.readFileSync(chosen))
})
const results = { designOnly: true, formationScopeIllustrative: true, checks: [], errors: [] }
let browser
async function run() {
  await new Promise(resolve => server.listen(4245, '127.0.0.1', resolve))
  browser = await chromium.launch({ ...launchOptions, headless: true })
  for (const [label, viewport] of [['phone', {width:390,height:844}], ['desktop', {width:1440,height:1000}], ['short', {width:320,height:568}]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor:1, isMobile:label!=='desktop', hasTouch:label!=='desktop' })
    const page = await context.newPage()
    page.on('pageerror', e => results.errors.push(`${label}: ${e.message}`))
    await page.goto('http://127.0.0.1:4245/')
    await page.locator('#luser').fill('ad')
    await page.locator('#lpass').fill('a')
    await page.locator('#loginForm button[type=submit]').click()
    await page.locator('#vWeek .day').first().waitFor({state:'attached'})
    await page.evaluate(() => window.go('editsched'))
    await page.locator('#eWeek .sb-open').first().click()
    const mission = page.locator('#sbBoard [data-bfld$=".msn"]').first()
    await mission.waitFor()
    await mission.scrollIntoViewIfNeeded()
    const before = await mission.evaluate(el => ({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width,rowHeight:el.closest('.sb-line').getBoundingClientRect().height,text:el.value}))
    await page.addStyleTag({content:`
      .role-proposal{position:relative;min-width:0;box-sizing:border-box}
      .role-proposal .msn{height:100%}
      .role-proposal-tag{position:fixed;padding:0 2px;background:var(--bg);color:var(--hard);font:700 8px Inter,sans-serif;pointer-events:none;z-index:9998}
      .role-proposal-menu{position:fixed;width:222px;padding:12px;background:var(--panel);border:1px solid var(--edge);border-radius:9px;z-index:9999;box-shadow:0 8px 24px #0006;color:var(--ink);font:12px Inter,sans-serif}
      .role-proposal-menu strong{display:block;font-size:12px;margin-bottom:5px}
      .role-proposal-menu p{margin:0 0 10px;color:var(--ink-2);font-size:10px;line-height:1.4}
      .role-proposal-options{display:flex;gap:6px}
      .role-proposal-options button{flex:1;border:1px solid var(--edge);border-radius:6px;padding:7px 8px;background:var(--bg);color:var(--ink);font:600 11px Inter,sans-serif;cursor:pointer}
      .role-proposal-options button[data-side=blue].selected{border-color:var(--flight);background:color-mix(in srgb,var(--flight) 15%,var(--bg))}
      .role-proposal-options button[data-side=red].selected{border-color:var(--hard);background:color-mix(in srgb,var(--hard) 15%,var(--bg))}
      .role-proposal-visible{display:block;width:100%;margin-top:3px;padding:3px;border:1px solid var(--edge);border-radius:4px;background:var(--bg);color:var(--ink-2);font:10px Inter,sans-serif}
      @media(max-width:350px){.role-proposal-visible{font-size:8px;padding:3px 0;white-space:nowrap}}
    `})
    await mission.evaluate(el => {
      const path=el.getAttribute('data-bfld')
      const siblings=Array.from(document.querySelectorAll('#sbBoard [data-bfld]')).filter(node=>node.getAttribute('data-bfld')===path)
      siblings.forEach(input=>{
        const b=input.getBoundingClientRect(),tag=document.createElement('span')
        tag.className='role-proposal-tag';tag.textContent='Red';tag.style.left=(b.right-20)+'px';tag.style.top=(b.top-4)+'px'
        document.body.append(tag)
      })
      const menu=document.createElement('div');menu.className='role-proposal-menu';menu.hidden=true
      menu.innerHTML='<strong>Sortie role</strong><p>For this formation</p><div class="role-proposal-options"><button type="button" data-side="blue">Blue</button><button type="button" data-side="red" class="selected">Red ✓</button></div>'
      document.body.append(menu)
      menu.querySelectorAll('button').forEach(button => button.addEventListener('click', e => {
        e.preventDefault();e.stopImmediatePropagation()
        const red=button.dataset.side==='red'
        document.querySelectorAll('.role-proposal-tag').forEach(tag=>tag.hidden=!red)
        menu.querySelectorAll('button').forEach(b => {const selected=b===button;b.classList.toggle('selected',selected);b.textContent=(b.dataset.side==='red'?'Red':'Blue')+(selected?' ✓':'')})
      }))
      el.addEventListener('focus', () => {
        const b=el.getBoundingClientRect();menu.hidden=false
        menu.style.left=Math.max(8,Math.min(b.x,innerWidth-230))+'px'
        menu.style.top=Math.min(b.bottom+6,innerHeight-menu.getBoundingClientRect().height-8)+'px'
      })
    })
    const quiet = await mission.evaluate(el => ({width:el.getBoundingClientRect().width,rowHeight:el.closest('.sb-line').getBoundingClientRect().height,text:el.value}))
    assert.equal(quiet.text,before.text)
    assert.ok(Math.abs(quiet.rowHeight-before.rowHeight)<=1)
    assert.ok(Math.abs(quiet.width-before.width)<=1)
    const field=await mission.boundingBox()
    const clip={x:label==='desktop'?Math.max(0,field.x-120):0,y:Math.max(0,field.y-65),width:label==='desktop'?760:viewport.width,height:Math.min(330,viewport.height-Math.max(0,field.y-65))}
    await page.screenshot({path:path.join(__dirname,`mission-quiet-${label}.png`),clip})
    await mission.focus()
    const menu=page.locator('.role-proposal-menu')
    await menu.waitFor()
    const menuBox=await menu.boundingBox()
    assert.ok(menuBox.x>=0&&menuBox.y>=0&&menuBox.x+menuBox.width<=viewport.width&&menuBox.y+menuBox.height<=viewport.height)
    await menu.locator('[data-side=blue]').click()
    await page.locator('.role-proposal-tag').first().waitFor({state:'hidden'})
    await menu.locator('[data-side=red]').click()
    await page.locator('.role-proposal-tag').first().waitFor({state:'visible'})
    await page.screenshot({path:path.join(__dirname,`mission-open-${label}.png`),clip})
    await menu.evaluate(el=>el.hidden=true)
    await mission.evaluate(el => {
      document.querySelectorAll('.role-proposal-tag').forEach(tag=>tag.hidden=true)
      const path=el.getAttribute('data-bfld')
      const siblings=Array.from(document.querySelectorAll('#sbBoard [data-bfld]')).filter(node=>node.getAttribute('data-bfld')===path)
      siblings.forEach(input=>{
        const cs=getComputedStyle(input),b=input.getBoundingClientRect(),wrap=document.createElement('div')
        input.style.height=b.height+'px';input.style.font=cs.font;input.style.padding=cs.padding
        wrap.className='role-proposal';wrap.style.gridColumn=cs.gridColumn;wrap.style.gridRow=cs.gridRow
        input.before(wrap);wrap.append(input)
        const button=document.createElement('button');button.type='button';button.className='role-proposal-visible';button.textContent='Blue ▾';wrap.append(button)
      })
    })
    await page.screenshot({path:path.join(__dirname,`mission-visible-${label}.png`),clip})
    const visible=await mission.evaluate(el=>({rowHeight:el.closest('.sb-line').getBoundingClientRect().height,text:el.value}))
    assert.equal(visible.text,before.text)
    results.checks.push({label,before,quiet,visible,menuBox,prototypeToggle:true,virtualKeyboardNotSimulated:true})
    await context.close()
  }
  assert.deepEqual(results.errors,[])
  fs.writeFileSync(path.join(__dirname,'mission-choice-result.json'),JSON.stringify(results,null,2))
  console.log('Design only: unchanged mission text and quiet row height at phone, desktop and short screen; popup stays on screen; DOM-only role buttons toggle. No saved category or application gate proof; keyboard not simulated.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
