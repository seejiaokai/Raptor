/* Probe: on the Board's view of the latest published version, does a Remarks box changed at AL1 keep its
   amendment mark when Blue/Red tracking is On? Real controls only; reads are evidence. */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path')
const { createRequire } = require('node:module')
const req = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = req('@playwright/test')
const [, , distArg, portArg, tag, outDir] = process.argv
const dist = path.resolve(distArg), port = Number(portArg)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' }
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'
  const f = path.join(dist, p)
  if (!f.startsWith(dist) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r)
})
;(async () => {
  await new Promise(ok => server.listen(port, '127.0.0.1', ok))
  const browser = await chromium.launch({ headless: true })
  const out = { tag, facts: {}, errors: [] }
  let page
  const vis = s => page.locator(s).filter({ visible: true }).first()
  const settle = (ms = 200) => page.waitForTimeout(ms)
  const go = async to => { await page.evaluate(p => window.go(p), to); await page.waitForFunction(p => window.CURPAGE === p, to); await settle(400) }
  const closeBoard = async () => { if (await page.locator('#sbDone:visible').count()) { await page.locator('#sbDone:visible').click(); await settle(300) } }
  const board = async di => { await closeBoard(); await go('editsched'); if (await page.locator(`#eWeek [data-golive="${di}"]:visible`).count()) await vis(`#eWeek [data-golive="${di}"]`).click(); await vis(`#eWeek [data-sbday="${di}"]`).click(); await page.waitForSelector('#schedBoard'); await settle(500) }
  const text = async (key, value) => { const el = vis(`#schedBoard [data-bfld="${key}"]`); await el.scrollIntoViewIfNeeded(); await el.fill(value); await el.press('Tab'); await settle(250) }
  const later = async () => { if (await page.locator('[data-role-side="later"]:visible').count()) { await vis('[data-role-side="later"]').click(); await settle(150) } }
  const tracking = async on => { await closeBoard(); await go('logic'); const e = page.locator('#lgEdit'); if (await e.count() && await e.isVisible()) await e.click(); await page.locator('#lgMissionMix').setChecked(on); await settle(300) }
  const publish = async di => {
    await page.keyboard.press('Tab'); await settle(150)
    const sels = page.locator('#schedBoard select[data-sign]:visible, #schedBoard [data-sign] select:visible'); const n = await sels.count()
    for (let i = 0; i < n; i++) { const s = sels.nth(i); await s.scrollIntoViewIfNeeded(); const vals = await s.locator('option').evaluateAll(os => os.filter(o => !o.disabled && o.value).map(o => o.value)); if (vals.length) { await s.selectOption(vals[Math.min(i, vals.length - 1)]); await settle(150) } }
    const before = await page.evaluate(i => window.dayCurVer(i), di)
    const b = page.locator(`#schedBoard [data-beak="${di}"]:visible, #schedBoard [data-alpub="${di}"]:visible`).first(); await b.scrollIntoViewIfNeeded(); await b.click()
    await page.waitForFunction(([i, was]) => !!window.dayCurVer(i) && window.dayCurVer(i) !== was, [di, before], { timeout: 8000 })
    return page.evaluate(i => window.dayCurVer(i), di)
  }
  const preview = async ver => { await vis('#schedBoard [data-planmenu]').click(); await settle(200); await vis(`.wavemenu [data-planpv="${ver}"]`).click(); await page.waitForSelector('#sbBoard .pv-frozen'); await settle(400) }
  const marks = di => page.evaluate(di => {
    const attrs = el => el ? Object.fromEntries([...el.attributes].filter(a => /^(data-|title|readonly|disabled|aria-label)/.test(a.name)).map(a => [a.name, a.value])) : null
    const line = document.querySelector('#sbBoard .pv-frozen')
    const all = [...line.querySelectorAll('textarea.nts, input.nts')]
    const cs = line.querySelector(`[data-bfld="ff:${di}.0.0.cs"]`)
    return { firstRemarks: attrs(all[0]), firstRemarksValue: all[0] && all[0].value, callsign: attrs(cs), callsignValue: cs && cs.value,
      alMarkedBoxesInView: line.querySelectorAll('[data-alc]').length, roleRemarksBoxes: line.querySelectorAll('[data-role-remarks]').length }
  }, di)
  try {
    page = await (await browser.newContext({ viewport: { width: Number(process.env.VW || 1440), height: Number(process.env.VH || 900) }, isMobile: Number(process.env.VW||1440) < 821, hasTouch: Number(process.env.VW||1440) < 821 })).newPage()
    page.on('pageerror', e => out.errors.push('PAGEERROR ' + e.message))
    page.on('console', m => { if (m.type() === 'error') out.errors.push(m.text()) })
    await page.goto(`http://localhost:${port}/`); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await settle(500)
    await tracking(true); await board(0)
    if (Number(process.env.VW || 1440) < 821) { await vis('#sbMore').click(); await vis('#sbMoreInsights').click() } else await vis('#sbInsights').click()
    await page.waitForSelector('#insightBody .ibar'); await settle(300)
    out.facts = await page.evaluate(() => { const b = document.querySelector('#insightModal .modal-box'), r = b.getBoundingClientRect(), h = document.querySelector('#insightModal .modal-head').getBoundingClientRect(); return { innerHeight, boxTop: r.top, boxBottom: r.bottom, headTop: h.top, maxHeight: getComputedStyle(b).maxHeight, scrolls: b.scrollHeight > b.clientHeight } })
    await page.screenshot({ path: path.join(outDir, `${tag}-insights-window.png`) })
  } catch (e) { out.failed = String(e && e.stack || e) }
  await browser.close(); server.close()
  console.log(JSON.stringify(out))
})()
