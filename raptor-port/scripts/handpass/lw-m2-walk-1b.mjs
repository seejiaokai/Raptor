// M2 walk, walker 1 — scenario 2's reload half, on the plain address (real storage: the ?fresh=1 world keeps nothing).
// Run: node scripts/handpass/lw-m2-walk-1b.mjs  (build at :4173)
import * as L from './lw-m2-walk-1-lib.mjs'
console.log('lw-m2-walk-1b v1 — scenario 2, the reload half (plain address)')
const T = L.T
const out = []
const ok = (c, t) => { out.push((c ? 'ok: ' : 'FAIL: ') + t); console.log((c ? 'ok: ' : 'FAIL: ') + t) }
for (const size of ['desk', 'phone']) {
  const w = await L.newCtx(size); const { page } = w
  const login = async () => {
    await page.goto('http://localhost:4173/'); await page.waitForSelector('#luser')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    if (w.phone) await page.tap('#loginForm button[type=submit]'); else await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-stiff"]'); await page.waitForTimeout(800)
    await L.gotoMonth(w, 'JAN')
  }
  const cls = async iso => { const i = await L.cellInfo(page, 'stiff', iso); return i && i.boxes[0] ? i.boxes[0].cls : '(none)' }
  await login()
  const D = '2026-01-14'
  await L.bid(w, 'stiff', D, 'LL')
  await L.openCell(w, 'stiff', D); await L.press(w, T('decide-approve')); await page.waitForTimeout(500)
  await L.openCell(w, 'stiff', D); await L.press(w, T('decide-refuse')); await page.waitForTimeout(1500)
  ok(/s-r/.test(await cls(D)), `[${size}] before the reload: refused (${await cls(D)})`)
  await L.undo(w); await page.waitForTimeout(1500)
  ok(/s-a/.test(await cls(D)), `[${size}] Undo in the same session: back to approved (${await cls(D)})`)
  await login()
  const after = await cls(D)
  ok(/s-a/.test(after), `[${size}] after an Undo and then a reload with a new sign-in: the saved state is approved, as the screen was (${after})`)
  await L.cellShot(w, 'stiff', D, `s02-5-after-reload-${size}`)
  console.log('ERRORS', JSON.stringify(w.errs))
  await w.ctx.close()
}
await L.closeBrowser()
