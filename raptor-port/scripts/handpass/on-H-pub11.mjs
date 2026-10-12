// The HOST's reproduction of RX1-11's last line: a Saturday published straight after "Don't swap" read "11 changes" on
// Edit Schedule's week. Two worlds, the same but for the drag: (A) sign, publish; (B) sign, drag + "Don't swap", publish.
// What is compared: the day's head on the week, what waits to go out, the sign-offs, what was issued.
import * as L from './on-RX1-lib.mjs'
const J = o => JSON.stringify(o)
async function run(withDrag) {
  const W = await L.world({ tag: withDrag ? 'H11B' : 'H11A' })
  const { page, tid, press } = W
  await L.usualSat(W)
  const sels = page.locator(`#schedBoard [data-signday="${L.SAT_DI}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  await L.frameBoard(page)
  if (withDrag) {
    await L.drag(page, page.locator(L.puckSel(1)), page.locator(L.puckSel(0)))
    console.log('  question', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'))
    await press(tid('oilconf-cancel')); await page.waitForTimeout(700)
    console.log('  bar', await tid('oilbar-text').innerText().catch(() => 'NO'))
  }
  const btn = page.locator(`#schedBoard [data-beak="${L.SAT_DI}"]`).first()
  await btn.evaluate(b => b.click()); await page.waitForTimeout(1200)
  console.log('  toast', await L.toast(page))
  await L.closeBoard(W)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
  const head = await page.evaluate((di) => {
    const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    const s = d.querySelector('.dstat')
    return {
      dstat: s ? s.innerText.replace(/\s+/g, ' ') : '',
      head: d.innerText.slice(0, 200).replace(/\s+/g, ' '),
      buttons: [...d.querySelectorAll('.dbeak')].map(b => b.innerText.trim() + (b.disabled ? ' (off)' : '')),
      signs: [...d.querySelectorAll(`[data-signday="${di}"]`)].map(e => e.value),
      marks: d.querySelectorAll('[data-alp]').length,
    }
  }, L.SAT_DI)
  console.log('  WEEK Sat', J(head))
  // every other day's head too: is "N changes" a count of the day or of something wider?
  console.log('  all heads', J(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')].map(d => (d.querySelector('.dstat') || {}).innerText || '').map(t => t.replace(/\s+/g, ' ')))))
  await page.screenshot({ path: `docs/img/handpass/2026-10-13-oil-ask-notify/RX1/H11-${withDrag ? 'B-after-dont-swap' : 'A-plain'}-week.png` })
  console.log('  errors', J(W.errors))
  await W.ctx.close()
}
console.log('A — publish, no drag'); await run(false)
console.log('B — drag, Don’t swap, publish'); await run(true)
process.exit(0)
