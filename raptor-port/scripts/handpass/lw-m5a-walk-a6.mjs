// walker A, script 6 — lesson 10, the way back: change a figure while the Balances page is hidden, wait past 2 s idle, come back by each
// route, and count what is drawn on the first frame. ENGINE=chromium (default) or webkit. node scripts/handpass/lw-m5a-walk-a6.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a6'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
const { webkit, devices } = await import('@playwright/test')
const ENGINE = process.env.ENGINE || 'chromium'
console.log(`[lw-m5a-walk-a6 v1] engine ${ENGINE}`)
if (ENGINE === 'chromium') L.clearOut()
const S = 'desk-' + ENGINE
const ok = c => (c ? 'PASS' : 'FAIL')
let w, browser
if (ENGINE === 'webkit') {
  browser = await webkit.launch()
  const ctx = await browser.newContext({ viewport: L.DESK, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage(); const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()}: ` + r.url().slice(0, 100)) })
  w = { ctx, page, cdp: null, errs, phone: false, size: 'desk' }
} else w = await L.newCtx('desk')
const P = w.page
const pic = n => P.screenshot({ path: `${L.OUT}/${ENGINE}-${n}.png`, scale: 'css' })
/* click a control and read the Balances page on the FIRST frame(s) after it: rows drawn, Ranger's figures, boxes with a value */
async function comeBack(label, doClick) {
  await P.evaluate(() => { window.__probe = null })
  const r = await P.evaluate(async clickSrc => {
    const click = new Function('return (' + clickSrc + ')')()
    const read = () => {
      const page = document.querySelector('[data-testid="balances-page"]'); const vis = !!page && page.getBoundingClientRect().width > 0
      const rows = [...document.querySelectorAll('[data-testid^="bal-row-"]')].filter(e => e.getBoundingClientRect().height > 0)
      const v = id => document.querySelector(`[data-testid="${id}"]`)?.value ?? document.querySelector(`[data-testid="${id}"]`)?.textContent.trim() ?? null
      const filled = rows.filter(r => [...r.querySelectorAll('input')].some(i => i.value !== '')).length
      return { pageVisible: vis, rows: rows.length, rowsWithBoxes: filled, bane: { app: v('bal-LVE-bane'), pend: v('bal-pend-bane'), war: v('bal-war-bane') }, scrollH: document.querySelector('[data-testid="bal-scroll"]')?.scrollHeight ?? null }
    }
    click()
    const f0 = read()
    await new Promise(r => requestAnimationFrame(r)); const f1 = read()
    await new Promise(r => requestAnimationFrame(r)); const f2 = read()
    return { sync: f0, frame1: f1, frame2: f2 }
  }, doClick.toString())
  return r
}
try {
  await L.signIn(w, 'admin'); await A.openBalances(w)
  const base = await balRow(P, 'bane')
  rec('A60 start: Ranger on Balances', S, 'PASS', `App ${base.app} Pending ${base.pend} War ${base.war}`, [])
  /* the routes back: tab Grid → ..., tab Approvals, tab OIL */
  const routes = [
    ['from the Grid tab', async () => { await L.openGrid(w) }, () => document.querySelector('[data-testid="lw-tab-balances"]').click()],
    ['from the Approvals tab', async () => { await L.openApprovals(w) }, () => document.querySelector('[data-testid="lw-tab-balances"]').click()],
    ['from the OIL tab (the OIL page closed with Escape first: it covers the tab row)', async () => { await press(w, T('oil-tracker')); await P.waitForTimeout(700); await pic('oil-open'); await P.keyboard.press('Escape'); await P.waitForTimeout(500) }, () => document.querySelector('[data-testid="lw-tab-balances"]').click()],
  ]
  let n = 0
  for (const [lab, leave, back] of routes) {
    n++
    await leave()
    // change a figure while the page is hidden: approve Ranger's first pending LL in Approvals (admin)
    await L.openApprovals(w)
    const before = await P.evaluate(() => { const l = [...document.querySelectorAll('[data-testid^="appr-line-"]')].find(e => /Ranger/.test(e.innerText) && !/Approved|Refused/.test(e.className)); return l ? l.innerText.replace(/\s+/g, ' ').slice(0, 60) : null })
    const appr = P.locator('[data-testid^="appr-line-"]:has-text("Ranger") >> button:has-text("Approve")').first()
    const hadLine = await appr.count()
    if (hadLine) { await appr.click(); await P.waitForTimeout(500) }
    await leave()
    await P.waitForTimeout(3200)               // past 2 s idle
    const r = await comeBack(lab, back)
    await P.waitForTimeout(500)
    const settled = await balRow(P, 'bane')
    await pic('way-back-' + n)
    const first = r.frame1
    rec(`A61.${n} (lesson 10) way back ${lab}, ${hadLine ? 'after approving a leave of Ranger\'s while the page was hidden' : 'no pending line to approve'}`, S,
      hadLine ? ok(first.pageVisible && first.rows >= 50 && first.rowsWithBoxes >= 50 && first.bane.war === settled.war && first.bane.app === settled.app) : 'NOT WALKED',
      `leave line pressed: ${hadLine ? 'yes' : 'none'} ("${before}"); same-tick ${JSON.stringify(r.sync)}; first frame ${JSON.stringify(r.frame1)}; second ${JSON.stringify(r.frame2)}; settled (+500ms): App ${settled.app} Pending ${settled.pend} War ${settled.war}`, [`${ENGINE}-way-back-${n}`])
  }
  /* Balances → Grid: the grid drawn on its first frame, the figure beside Ranger */
  await L.openApprovals(w); await A.openBalances(w); await P.waitForTimeout(300)
  const g = await P.evaluate(async () => {
    document.querySelector('[data-testid="lw-tab-grid"]').click()
    const read = () => { const c = [...document.querySelectorAll('[data-testid^="cell-bane-"]')].filter(e => e.getBoundingClientRect().height > 0).length; const f = document.querySelector('[data-testid="bal-bane"]')?.textContent.trim() ?? null; return { cellsDrawnForRanger: c, figure: f, rowsDrawn: [...document.querySelectorAll('[data-testid^="row-"]')].filter(e => e.getBoundingClientRect().height > 0).length } }
    const f0 = read(); await new Promise(r => requestAnimationFrame(r)); const f1 = read(); await new Promise(r => requestAnimationFrame(r)); return { sync: f0, frame1: f1, frame2: read() }
  })
  await P.waitForTimeout(600)
  await pic('balances-to-grid')
  rec('A62 (lesson 10) Balances → Grid: the grid drawn on its first frame, Ranger\'s figure', S, ok(g.frame1.cellsDrawnForRanger > 0 && g.frame1.figure), JSON.stringify(g), [`${ENGINE}-balances-to-grid`])
  /* View picker → another period → back: Days taken's heading */
  await A.openBalances(w); await press(w, T('bal-view-taken')); await P.waitForTimeout(400)
  await L.openGrid(w)
  await P.locator('select[data-testid="war-picker"]').selectOption({ label: 'JAN - DEC 27' }); await P.waitForTimeout(3000)
  const t = await P.evaluate(async () => { document.querySelector('[data-testid="lw-tab-balances"]').click(); const h = () => document.querySelector('[data-testid="bal-taken-head"]')?.textContent.trim() ?? null; const f0 = h(); await new Promise(r => requestAnimationFrame(r)); return { sync: f0, frame1: h(), view: document.querySelector('[data-testid="bal-view-taken"]')?.getAttribute('aria-pressed') } })
  await P.waitForTimeout(400); t.balancesRowsOnReturn = await P.locator('[data-testid^="bal-row-"]').count(); await press(w, T('bal-view-taken')); await P.waitForTimeout(500); t.afterPressingDaysTaken = await txt(P, T('bal-taken-head')); await pic('period-switch')
  rec('A63 (lesson 10) another period chosen on the Grid while Balances was hidden: back on Balances (the Balances view — the page does not keep Days taken across leaving), the Days taken heading names the new period', S, ok(/27/.test(t.afterPressingDaysTaken || '') && t.balancesRowsOnReturn > 0), JSON.stringify(t), [`${ENGINE}-period-switch`])
  await P.locator('select[data-testid="war-picker"]').selectOption({ label: 'JAN - DEC 26' }); await P.waitForTimeout(500)
  /* the bell → Balances is not a route the bell has (it opens the grid at a date); the ✕ of Approvals' slim bar is not one either */
  await L.openBell(w); const bl = await L.bellLines(P); await L.closeBell(w)
  rec('A64 (lesson 10) the bell as a way back to Balances', S, 'NOT WALKED', `the bell holds ${bl.length} lines for Saber; none of them opens the Balances page (a Leave War line opens the grid at a date), so there is no bell route to Balances to walk; the ✕ of the slim "Back to Approvals" bar leads to Approvals/Grid, not Balances`, [])
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 600), [])
  await L.shot(w, ENGINE + '-error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a6-' + ENGINE)
await w.ctx.close(); if (browser) await browser.close(); await L.closeBrowser()
console.log('DONE')
