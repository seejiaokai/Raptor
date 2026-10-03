/* Design-only overlays on an existing local production bundle. No source, mission,
   publication or saved browser data changes. Splits below are illustrative. */
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const { chromium } = require('@playwright/test')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '../../..')
const dist = path.join(root, 'dist')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
  const p = path.resolve(dist, '.' + (name === '/' ? '/index.html' : name))
  if (!p.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  const chosen = fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(dist, 'index.html')
  res.setHeader('Content-Type', mime[path.extname(chosen)] || 'application/octet-stream')
  res.end(fs.readFileSync(chosen))
})
const results = { designOnly: true, splitsIllustrative: true, checks: [], errors: [] }
let browser
async function run() {
  await new Promise(resolve => server.listen(4244, '127.0.0.1', resolve))
  browser = await chromium.launch({ ...launchOptions, headless: true })
  for (const [label, viewport] of [['desktop', {width:1440,height:1000}], ['phone', {width:390,height:844}]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor:1, isMobile:label==='phone', hasTouch:label==='phone' })
    const page = await context.newPage()
    page.on('pageerror', e => results.errors.push(`${label}: ${e.message}`))
    await page.goto('http://127.0.0.1:4244/')
    await page.locator('#luser').fill('ad')
    await page.locator('#lpass').fill('a')
    await page.locator('#loginForm button[type=submit]').click()
    await page.locator('#vWeek .day').first().waitFor({state:'attached'})
    await page.evaluate(() => document.getElementById('insightBtn').click())
    await page.locator('#insightBody .ibar').first().waitFor()
    await page.addStyleTag({content:`
      #insightBody .mix-row{display:grid;grid-template-columns:74px minmax(0,1fr) 42px;gap:2px 8px;margin:5px 0 8px;font-size:12px;align-items:center}
      #insightBody .mix-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #insightBody .mix-track{height:12px;background:var(--panel-2);border-radius:6px;overflow:hidden}
      #insightBody .mix-fill{height:100%;display:flex;border-radius:6px;overflow:hidden}
      #insightBody .mix-blue{background:var(--flight)}
      #insightBody .mix-red{background:var(--hard)}
      #insightBody .mix-total{text-align:right;color:var(--ink-2);font:11px 'JetBrains Mono',monospace}
      #insightBody .mix-counts{grid-column:2/4;font-size:10px;line-height:14px;color:var(--ink-2)}
      #insightBody .mix-key{display:flex;gap:14px;font-size:11px;color:var(--ink-2);margin:0 0 10px;align-items:center}
      #insightBody .mix-key i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}
      #insightBody .mix-show{margin:2px 0 4px;padding:0;border:0;background:none;color:var(--accent);font:inherit;font-size:11px;cursor:pointer}
      #sbInsightsProposal{border-color:var(--accent)}
      #sbMoreInsightsProposal{color:var(--accent)}
    `})
    const original = await page.locator('#insightModal .modal-box').evaluate(el => el.outerHTML)
    const checks = await page.evaluate(() => {
      const body = document.getElementById('insightBody')
      const heading = Array.from(body.querySelectorAll('.isec-h')).find(el => el.textContent.startsWith('Flying load'))
      heading.insertAdjacentHTML('afterend', '<div class="mix-key"><span><i style="background:var(--flight)"></i>Blue</span><span><i style="background:var(--hard)"></i>Red</span></div>')
      let el = heading.nextElementSibling.nextElementSibling
      let i=0
      const mixes = [[2,2],[0,3],[3,0],[2,1],[1,1]]
      const rows=[]
      while(el && el.classList.contains('ibar')) {
        const next = el.nextElementSibling
        const name=el.querySelector('.nm').textContent
        const total=Number(el.querySelector('.v').textContent)
        const [blue,red]=mixes[i] || [total,0]
        const row=document.createElement('div'); row.className='mix-row'
        const nm=document.createElement('span'); nm.className='mix-name'; nm.textContent=name
        row.appendChild(nm)
        row.insertAdjacentHTML('beforeend', `<span class="mix-track"><span class="mix-fill" style="width:${total/4*100}%"><span class="mix-blue" style="width:${blue/total*100}%"></span><span class="mix-red" style="width:${red/total*100}%"></span></span></span><span class="mix-total">${total}</span><span class="mix-counts">${blue} blue · ${red} red</span>`)
        el.replaceWith(row)
        rows.push({name,total,blue,red}); i++; el=next
      }
      if(el && el.textContent.includes('more flying')) el.outerHTML='<button class="mix-show" type="button">Show all 38 aircrew ↓</button>'
      const box=document.querySelector('#insightModal .modal-box')
      return {rows,scrollWidth:box.scrollWidth,clientWidth:box.clientWidth}
    })
    assert.equal(checks.rows.length,12)
    for(const row of checks.rows) assert.equal(row.blue+row.red,row.total)
    assert.ok(checks.scrollWidth <= checks.clientWidth+1)
    await page.locator('#insightModal .modal-box').screenshot({path:path.join(__dirname,`sorties-${label}.png`)})
    fs.writeFileSync(path.join(__dirname,`sorties-${label}.html`), await page.locator('#insightModal .modal-box').evaluate(el => el.outerHTML))
    results.checks.push({label,kind:'illustrative-chart',...checks})
    await page.locator('#insightClose').click()
    await page.evaluate(() => window.go('editsched'))
    await page.locator('#eWeek .sb-open').first().click()
    await page.locator('#sbBoard .sb-line').first().waitFor()
    if(label==='desktop') {
      await page.evaluate(() => {
        const bell=document.getElementById('sbBell')
        const button=document.createElement('button'); button.id='sbInsightsProposal'; button.className='abtn'; button.textContent='Insights'
        bell.after(button)
      })
      const box=await page.locator('#sbInsightsProposal').boundingBox()
      assert.ok(box && box.x>=0 && box.x+box.width<=viewport.width)
      await page.screenshot({path:path.join(__dirname,'board-desktop.png'),clip:{x:0,y:Math.max(0,box.y-12),width:viewport.width,height:box.height+24}})
      results.checks.push({label,kind:'Board-opener-placement',button:box})
    } else {
      await page.locator('#sbMore').click()
      await page.locator('#sbMoreMenu').waitFor()
      await page.evaluate(() => {
        const button=document.createElement('button'); button.id='sbMoreInsightsProposal'; button.className='sb-moreitem'; button.role='menuitem'; button.textContent='Insights'
        document.getElementById('sbMoreMenu').appendChild(button)
      })
      const box=await page.locator('#sbMoreInsightsProposal').boundingBox()
      assert.ok(box && box.x>=0 && box.x+box.width<=viewport.width)
      await page.screenshot({path:path.join(__dirname,'board-phone.png'),clip:{x:0,y:0,width:viewport.width,height:350}})
      results.checks.push({label,kind:'Board-opener-placement',button:box})
    }
    await context.close()
  }
  assert.deepEqual(results.errors,[])
  fs.writeFileSync(path.join(__dirname,'result.json'),JSON.stringify(results,null,2))
  console.log('Design pictures: 12 illustrative rows, totals preserved, no horizontal overflow at desktop/phone; Board proposed placements within viewport; no page errors. No application gate or functional approval claimed.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()})
