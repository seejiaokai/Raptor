// D1269's walk (23 Oct 26) — the grid's green outline marks only the open days from today, for the admin as for a member.
// The phone (390 x 844), the admin, the seed's 1 Jan – 31 Mar open. Clock at 15 Feb: one outline, starting at 15 Feb (the
// first day it covers is read from the date heading under its left edge). Clock at 15 Apr: no outline. The build served on
// http://localhost:4253/ (lwm1-walk-b). PASS means correct. Pictures: docs/img/handpass/2026-10-22-lw-m1-open-dates/d1269/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { newPhone, signIn, gotoMonth, rec, results, getBrowser } from './lw-m1-rewalk-b-lib.mjs'
console.log('lw-d1269-walk v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/d1269')
mkdirSync(OUT, { recursive: true })
const boxes = page => page.evaluate(() => [...document.querySelectorAll('.lw-bidbox')].map(b => {
  const r = b.getBoundingClientRect()
  const heads = [...document.querySelectorAll('[data-testid^="head-"]')]
  const under = heads.find(h => { const q = h.getBoundingClientRect(); return q.left <= r.left + 3 && q.right > r.left + 3 })
  return { first: under ? under.dataset.testid.slice(5) : null, cutL: b.classList.contains('cut-l') }
}))
for (const [today, want] of [['2026-02-15', 'from'], ['2026-04-15', 'none']]) {
  const { ctx, page, cdp } = await newPhone()
  try {
    await signIn(page, 'admin', today)
    await gotoMonth(cdp, page, 'FEB'); await page.waitForTimeout(900)
    const b = await boxes(page)
    await page.screenshot({ path: path.join(OUT, `admin-clock-${today}.png`), clip: { x: 0, y: 0, width: 390, height: 700 } })
    const ok = want === 'none' ? b.length === 0 : b.length === 1 && (b[0].first === '2026-02-15' || b[0].cutL)
    rec(`D1269-${today}`, ok ? 'PASS' : 'FAIL', `admin, clock ${today}: outlines ${JSON.stringify(b)}`, [`admin-clock-${today}.png`])
  } catch (e) { rec(`D1269-${today}`, 'ERROR', String(e).slice(0, 300)) }
  await ctx.close()
}
console.log('SUMMARY', JSON.stringify(results.map(r => [r.id, r.verdict])))
await (await getBrowser()).close()
