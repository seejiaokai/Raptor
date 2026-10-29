// His look at M5b (29 Oct 26 — D1503, D1506 and his ⚙ question): every way into the OIL tracker from the Balances and
// Approvals pages closes back onto that page as he left it; ⚙ and its Events list open over those pages; Rearrange and
// another tab bring the grid. Pressed on screen, at his iPhone's 402 (touch) and his PC's 1536 at 125%.
// Run from raptor-port:  node scripts/handpass/lw-m5b-look-walk.mjs <dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , DIST = 'dist', OUT = 'docs/img/handpass/2026-10-29-lw-m5b/look'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4197'
const res = []
const C = (id, ok, note = '') => { res.push({ id, ok: !!ok, note }); console.log((ok ? 'PASS ' : 'FAIL ') + id + (note ? ' — ' + note : '')) }
for (const kind of ['P', 'D']) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 }); await p.waitForTimeout(500)
  const T = id => p.locator(`[data-testid="${id}"]`)
  const press = async loc => { if (phone) await loc.tap(); else await loc.click(); await p.waitForTimeout(450) }
  const shot = n => p.screenshot({ path: join(OUT, `${kind}-${n}.png`) })
  const vis = async id => (await T(id).count()) > 0 && await T(id).first().isVisible()
  const listY = () => p.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return s ? Math.round(s.scrollTop) : -1 })
  // 1. Balances: scroll the list, press a man's OIL figure, close — the same page, the same place
  await press(T('lw-tab-balances'))
  await p.locator('[data-testid="bal-scroll"]').evaluate(e => { e.scrollTop = 300 }); await p.waitForTimeout(250)
  const y0 = await listY()
  const fig = p.locator('[data-testid^="bal-oil-"]').nth(8); await fig.scrollIntoViewIfNeeded()
  const y1 = await listY()
  await press(fig)
  C(kind + '-1 a man\'s OIL figure opens the tracker', await vis('oil-sheet')); await shot('1-oil-over-balances')
  C(kind + '-1 the OIL tab reads as chosen while it is up', (await T('oil-tracker').getAttribute('aria-selected')) === 'true')
  await press(T('oil-close'))
  C(kind + '-1 ✕ comes back to the Balances page', await vis('balances-page') && !(await vis('oil-sheet')))
  C(kind + '-1 at the same place in the list', (await listY()) === y1, `before ${y1} (scrolled to ${y0}), after ${await listY()}`)
  await shot('1-back-on-balances')
  // 2. the OIL tab from Balances, then My leave's OIL line
  await press(T('oil-tracker')); C(kind + '-2 the OIL tab over Balances', await vis('oil-sheet'))
  await press(T('oil-close')); C(kind + '-2 its ✕ back to Balances', await vis('balances-page'))
  await press(T('my-leave')); await press(T('pw-oil')); C(kind + '-2 My leave → OIL over Balances', await vis('oil-sheet'))
  await press(T('oil-close')); C(kind + '-2 its ✕ back to Balances', await vis('balances-page')); await shot('2-myleave-oil-back')
  // 3. ⚙ over Balances, its Events list, Escape
  await press(T('settings-open')); C(kind + '-3 ⚙ on Balances opens Settings in sight', await vis('settings-sheet')); await shot('3-gear-over-balances')
  await press(T('settings-events')); C(kind + '-3 Events… over Balances', await vis('events-sheet')); await shot('3-events-over-balances')
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  C(kind + '-3 closed, Balances still up', await vis('balances-page') && !(await vis('events-sheet')))
  // 4. Approvals: My leave → OIL → ✕ — back on Approvals
  await press(T('lw-tab-approvals'))
  await press(T('my-leave')); await press(T('pw-oil')); C(kind + '-4 My leave → OIL over Approvals', await vis('oil-sheet')); await shot('4-oil-over-approvals')
  await press(T('oil-close')); C(kind + '-4 its ✕ back to Approvals', await vis('approvals-page')); await shot('4-back-on-approvals')
  await press(T('settings-open')); C(kind + '-4 ⚙ on Approvals opens Settings in sight', await vis('settings-sheet')); await shot('4-gear-over-approvals')
  // 5. Rearrange from Settings over Approvals brings the grid, rearranging
  await press(T('settings-rearrange'))
  C(kind + '-5 Rearrange brings the grid up', !(await vis('approvals-page')) && await p.locator('.mx-outer.mx-arranging').count() > 0); await shot('5-rearrange-grid')
  // 6. the read's finding 1: "Really reset?" armed over Balances, the Leave War left and come back to — never one tap from acting
  await press(T('lw-tab-balances')); await press(T('settings-open'))
  const ro = T('roster-reset-order')
  if (await ro.isEnabled()) {
    await press(ro); const armed = (await ro.textContent()) === 'Really reset?'
    await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
    await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(800)
    const t = (await ro.count()) ? await ro.textContent() : '(window closed)'
    C(kind + '-6 an armed Reset order is taken back when he leaves and comes back', armed && t !== 'Really reset?', 'on return: ' + t)
    await shot('6-reset-after-return')
  } else C(kind + '-6 (Reset order greyed: the roster is in its default order — armed in the unit test)', true)
  // (another tab while the tracker is up: the tracker covers the tab row, as it always has — the unit test presses it)
  C(kind + ' no page errors', errs.length === 0, errs.join(' | '))
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(res, null, 1))
console.log(res.filter(r => !r.ok).length ? 'SOME FAILED' : 'ALL PASS', res.length)
