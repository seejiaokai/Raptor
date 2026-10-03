/* Probe: does the Board repaint after a field is saved and focus moves to another Board field?
   Serves one frozen dist on localhost, drives it in Chromium, prints JSON facts. Tracking stays at its default (Off). */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path')
const { createRequire } = require('node:module')
const req = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = req('@playwright/test')
const [, , distArg, portArg, tag, outDir] = process.argv
const dist = path.resolve(distArg)
const port = Number(portArg)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'
  const f = path.join(dist, p)
  if (!f.startsWith(dist) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r)
})
;(async () => {
  await new Promise(ok => server.listen(port, '127.0.0.1', ok))
  const browser = await chromium.launch({ headless: true })
  const out = { tag, steps: {}, errors: [] }
  try {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
    page.on('pageerror', e => out.errors.push('PAGEERROR ' + e.message))
    page.on('console', m => { if (m.type() === 'error') out.errors.push(m.text()) })
    await page.goto(`http://localhost:${port}/`)
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
    await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(400)
    const di = 1
    await page.click(`#eWeek [data-sbday="${di}"]:visible`); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
    out.tracking = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('insights') || 'null') } catch { return 'n/a' } })
    const keys = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-bfld]')].map(e => e.dataset.bfld))
    const toKey = keys.find(k => /^ff:\d+\.\d+\.\d+\.to$/.test(k)); const base = toKey.slice(3, -3)
    const ldKey = `ff:${base}.ld`, rmKey = `fr:${base}.0`
    out.keys = { toKey, ldKey, rmKey }
    const snap = (label) => page.evaluate(({ toKey, ldKey, label }) => {
      const to = document.querySelector(`#sbBoard [data-bfld="${toKey}"]`), ld = document.querySelector(`#sbBoard [data-bfld="${ldKey}"]`)
      const [d, g, l] = toKey.slice(3, -3).split('.').map(Number), f = window.DAYS[d].waves[g].formations[l]
      const ae = document.activeElement
      return { label, modelTO: f.to, modelLD: f.ld, shownTO: to && to.value, shownLD: ld && ld.value,
        markedNodeStillThere: !!(window.__probeNode && window.__probeNode.isConnected),
        focusIn: ae ? (ae.dataset && (ae.dataset.bfld || ae.dataset.txt) || ae.tagName) : null,
        warnPanel: (document.querySelector('#sbWarn') || document.querySelector('.sb-warn') || { innerText: '(no warn panel found)' }).innerText.replace(/\s+/g, ' ').slice(0, 400),
        badCells: [...document.querySelectorAll('#sbBoard .bad,[data-warnkey]')].length,
        lineHasNoLenTitle: !!(ld && ld.closest('.sb-line,.sb-fline,div') && /length|before|after|land/i.test((ld.getAttribute('title') || '') + (ld.parentElement.getAttribute('title') || ''))) }
    }, { toKey, ldKey, label })
    out.steps.start = await snap('start')
    out.warnIds = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [id]')].map(e => e.id).filter(i => /warn|chk/i.test(i)))
    // mark the TO node, type a take-off AFTER the landing time so the line needs a new warning, then click straight into Remarks
    const ldVal = out.steps.start.shownLD || '1100'
    const late = '2359'
    const to = page.locator(`#sbBoard [data-bfld="${toKey}"]:visible`).first()
    await to.scrollIntoViewIfNeeded(); await to.click(); await to.evaluate(e => { window.__probeNode = e })
    await to.fill(late)
    const rm = page.locator(`#sbBoard [data-bfld="${rmKey}"]:visible`).first()
    await rm.click(); await page.waitForTimeout(400)
    out.steps.afterMoveToRemarks = await snap('after typing TO and clicking into Remarks (no typing there)')
    await page.screenshot({ path: path.join(outDir, `${tag}-1-focus-in-remarks.png`) })
    // leave Remarks unchanged: click a neutral, non-interactive spot of the board header
    await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
    await page.waitForTimeout(600)
    out.steps.afterLeaving = await snap('after leaving Remarks unchanged')
    await page.screenshot({ path: path.join(outDir, `${tag}-2-after-leaving.png`) })
    // what a repaint WOULD show: force one through any real notify (toggle the More menu open/closed is local state; use a day-tab round trip instead)
    await page.waitForTimeout(1500)
    out.steps.afterWaiting = await snap('1.5 s later, nothing else touched')
  } catch (e) { out.failed = String(e && e.stack || e) }
  await browser.close(); server.close()
  console.log(JSON.stringify(out, null, 1))
})()
