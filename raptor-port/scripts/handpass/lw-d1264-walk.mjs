// D1264's walk (23 Oct 26) — "put the open for bidding at the top full page. So that when the dates below jumps it doesn't
// affect the user to chase the buttons", and his ask to drag across months (D1169, built in M1). The phone (390 x 844, touch)
// as the admin, then a desktop (1440) with a mouse. The build served on http://localhost:4253/ (lwm1-walk-b). Written as
// assertions of the RIGHT behaviour: PASS means correct. Pictures: docs/img/handpass/2026-10-22-lw-m1-open-dates/d1264/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { newPhone, signIn, tapSel, T, vis, holdDrag, centre, rec, results, getBrowser, launchOptions, URL } from './lw-m1-rewalk-b-lib.mjs'
console.log('lw-d1264-walk v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates', process.env.OUT_SUB || 'd1264')
mkdirSync(OUT, { recursive: true })
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') })
const rectOf = (page, sel) => page.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null }, sel)
const states = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="od-months"] [data-month-ix]')].map(b => (b.className.match(/\b(open|part|closed)\b/) || ['', '?'])[1]))
const lineCount = page => page.evaluate(() => document.querySelectorAll('[data-testid^="od-line-"]').length)
const allErrs = []

/* P1 — the phone: the window fills the screen from the top; tapping months on and off adds and removes stretch lines, and
   the month buttons never move */
{
  const { ctx, page, cdp, errs } = await newPhone()
  try {
    await signIn(page, 'admin')
    await tapSel(cdp, page, T('open-chip')); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(400)
    const sheet = await rectOf(page, T('open-dates'))
    const m0 = await rectOf(page, T('od-months'))
    const l0 = await lineCount(page)
    await shot(page, 'P1-01-phone-window-full-page')
    const ys = [m0.y]; const counts = [l0]
    const taps = ['od-m-2026-07', 'od-m-2026-09', 'od-m-2026-11', 'od-m-2026-07', 'od-m-2026-09']
    const monthBtn = async key => page.evaluate(k => { const b = [...document.querySelectorAll('[data-testid="od-months"] [data-month-ix]')].find(x => x.dataset.testid === k || x.textContent.trim().startsWith(k)); return b ? b.dataset.testid || null : null }, key)
    for (const [i, mon] of ['JUL', 'SEP', 'NOV', 'JUL', 'SEP'].entries()) {
      const b = await page.evaluateHandle(m => [...document.querySelectorAll('[data-testid="od-months"] [data-month-ix]')].find(x => x.textContent.trim().startsWith(m)), mon)
      const r = await b.evaluate(x => { const q = x.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 } })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await page.waitForTimeout(450)
      ys.push((await rectOf(page, T('od-months'))).y); counts.push(await lineCount(page))
      if (i === 2) await shot(page, 'P1-02-phone-three-more-months-open')
    }
    void taps; void monthBtn
    const vh = 844
    const still = ys.every(y => y === ys[0])
    rec('P1', sheet && sheet.y <= 0 && sheet.h >= vh - 1 && still && new Set(counts).size > 1 ? 'PASS' : 'FAIL',
      `window ${JSON.stringify(sheet)} (screen 390 x ${vh}); month buttons' top over 6 states: ${ys.join(', ')}; stretch lines: ${counts.join(', ')}`,
      ['P1-01-phone-window-full-page.png', 'P1-02-phone-three-more-months-open.png'])
    /* P2 — D1169, his "drag to select multiple months": a held finger on APR dragged to JUN opens APR, MAY and JUN as one stretch */
    const before = await states(page)
    const a = await page.evaluate(() => { const q = [...document.querySelectorAll('[data-testid="od-months"] [data-month-ix]')]; const c = b => { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }; return { mar: c(q[3]), may: c(q[5]) } })
    await holdDrag(cdp, page, [a.mar, { x: (a.mar.x + a.may.x) / 2, y: a.mar.y }, a.may], 420)
    await page.waitForTimeout(500)
    const after = await states(page)
    await shot(page, 'P2-01-phone-hold-drag-apr-to-jun')
    rec('P2', before.slice(3, 6).every(s => s === 'closed') && after.slice(3, 6).every(s => s === 'open') ? 'PASS' : 'FAIL',
      `APR–JUN before ${JSON.stringify(before.slice(3, 6))}, after a held drag ${JSON.stringify(after.slice(3, 6))}`, ['P2-01-phone-hold-drag-apr-to-jun.png'])
    await tapSel(cdp, page, T('open-dates-close')); await page.waitForTimeout(400)
    rec('P3', !(await vis(page, T('open-dates'))) ? 'PASS' : 'FAIL', 'the ✕ closes the page')
  } catch (e) { rec('P', 'ERROR', String(e).slice(0, 300)); try { await shot(page, 'P-ERROR') } catch {} }
  allErrs.push(...errs.map(x => 'P ' + x)); await ctx.close()
}

/* D1 — a desktop keeps the floating, movable window */
{
  const b = await getBrowser()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  try {
    await page.goto(URL)
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(800)
    await page.click(T('open-chip')); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(400)
    const r = await rectOf(page, T('open-dates'))
    const cls = await page.evaluate(() => document.querySelector('[data-testid="open-dates"]').className)
    await shot(page, 'D1-01-desktop-window-floating')
    rec('D1', r && r.w <= 562 && r.y > 0 && !/\bfullpage\b/.test(cls) ? 'PASS' : 'FAIL', `desktop window ${JSON.stringify(r)}, class "${cls}"`, ['D1-01-desktop-window-floating.png'])
  } catch (e) { rec('D1', 'ERROR', String(e).slice(0, 300)) }
  allErrs.push(...errs.map(x => 'D ' + x)); await ctx.close()
}
void launchOptions; void chromium; void centre

console.log('ERRORS', JSON.stringify(allErrs))
console.log('SUMMARY', JSON.stringify(results.map(r => [r.id, r.verdict])))
await (await getBrowser()).close()
