// D1268's walk (23 Oct 26) — D1265 as drawn: past months locked and not pressable, a stretch wholly past reads "past", the
// admin's chip counts from today. The phone (390 x 844, touch), the admin, the clock at 23 Oct 2026, the seed's 1 Jan – 31 Mar
// open (all past). The build served on http://localhost:4253/ (lwm1-walk-b). PASS means correct. Pictures:
// docs/img/handpass/2026-10-22-lw-m1-open-dates/d1268/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { newPhone, signIn, tapSel, T, rec, results, getBrowser, holdDrag } from './lw-m1-rewalk-b-lib.mjs'
console.log('lw-d1268-walk v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/d1268')
mkdirSync(OUT, { recursive: true })
const shot = (page, name, h = 844) => page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 0, y: 0, width: 390, height: h } })
const errs = []
const { ctx, page, cdp, errs: e0 } = await newPhone()
try {
  await signIn(page, 'admin', '2026-10-23')
  const chip = await page.locator(T('open-chip')).innerText()
  await shot(page, 'A1-admin-chip-from-today', 300)
  await tapSel(cdp, page, T('open-chip')); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(400)
  const st = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-month-"]')].map(b => [b.dataset.testid.slice(9), b.classList.contains('past'), b.disabled]))
  const lineTxt = await page.locator(T('od-line-2026-01-01')).innerText()
  await shot(page, 'A2-window-past-months', 420)
  /* a tap on a past month (MAR) changes nothing */
  await tapSel(cdp, page, T('od-month-2026-03')); await page.waitForTimeout(400)
  const afterTap = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-line-"]')].map(n => n.innerText.replace(/\s+/g, ' ').trim()))
  /* a held drag from SEP (past) across OCT to NOV opens only from today: 23 Oct – 30 Nov */
  const pt = await page.evaluate(() => { const c = k => { const r = document.querySelector(`[data-testid="od-month-${k}"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }; return { oct: c('2026-10'), nov: c('2026-11') } })
  await holdDrag(cdp, page, [pt.oct, pt.nov], 420); await page.waitForTimeout(500)
  const afterDrag = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-line-"]')].map(n => n.innerText.replace(/\s+/g, ' ').trim()))
  await shot(page, 'A3-window-after-drag-oct-nov', 420)
  const pastOk = st.filter(([k]) => k < '2026-10').every(([, p, d]) => p && d) && st.filter(([k]) => k >= '2026-10').every(([, p, d]) => !p && !d)
  rec('D1268', chip === 'Bidding closed' && pastOk && /past/.test(lineTxt) && afterTap.length === 1 && afterDrag.some(t => t.startsWith('23 Oct – 30 Nov')) ? 'PASS' : 'FAIL',
    `chip "${chip}"; months (key, past, disabled) ${JSON.stringify(st.map(x => x.join(':')))}; line "${lineTxt.replace(/\s+/g, ' ')}"; after a tap on MAR ${JSON.stringify(afterTap)}; after a held drag OCT–NOV ${JSON.stringify(afterDrag)}`,
    ['A1-admin-chip-from-today.png', 'A2-window-past-months.png', 'A3-window-after-drag-oct-nov.png'])
} catch (e) { rec('D1268', 'ERROR', String(e).slice(0, 300)) }
errs.push(...e0); await ctx.close()
console.log('ERRORS', JSON.stringify(errs))
console.log('SUMMARY', JSON.stringify(results.map(r => [r.id, r.verdict])))
await (await getBrowser()).close()
