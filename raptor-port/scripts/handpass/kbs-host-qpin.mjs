/* host probe — [KEYBOARD-SCROLL] the geometry test "a column widened while the Quals row is pinned": with the table no
   longer set again on every repaint (QualsPage tableInner), does the pinned heading row follow a widened column? Prints,
   per frame after the widening, the stuck bar's widths against the real heading's and the largest offset. */
import { open, version } from './kbs-A-lib.mjs'
version('host-qpin-3')
const { browser, page } = await open({ width: 390, height: 844, stub: false })
await page.evaluate(() => window.go('quals')); await page.waitForSelector('#qtbl td.qname')
await page.evaluate(() => window.scrollTo(0, 700)); await page.waitForTimeout(500)
const grew = await page.evaluate(nowiden => {
  const w = document.querySelector('.qwrap'), before = w.scrollWidth - w.clientWidth
  const td = document.querySelector('#qtbl td.qname').parentElement.lastElementChild
  if (!nowiden) td.textContent = 'a remark long enough to widen its column well past where it was before this test'
  w.scrollLeft = 99999
  return (w.scrollWidth - w.clientWidth) - before
}, !!process.env.NOWIDEN)
console.log('grew', grew)
if (process.env.RESTART) { await page.waitForTimeout(400); console.log('restart', await page.evaluate(() => { const a = document.querySelector('.qfixed-anim')?.getAnimations?.()[0]; if (!a) return 'no anim'; a.cancel(); a.play(); return 'ok' })) }
for (const ms of [50, 300, 1000]) {
  await page.waitForTimeout(ms)
  console.log(ms, await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="qsticky-head"]'); if (!bar) return 'no bar'
    const br = bar.getBoundingClientRect(); let w = 0, n = 0, worst = ''
    for (const th of bar.querySelectorAll('.qfixed-scroll th[data-sort]')) {
      const k = th.getAttribute('data-sort'); if (k === 'cs') continue
      const real = document.querySelector('#qtbl thead th[data-sort="' + k + '"]'); if (!real) continue
      const a = th.getBoundingClientRect(); if (a.right < br.left + 120 || a.left > br.right) continue
      const d = Math.abs(a.left - real.getBoundingClientRect().left); if (d > w) { w = d; worst = k }; n++
    }
    const m = bar.querySelector('.qfixed-scroll'), wr = document.querySelector('.qwrap')
    return JSON.stringify({ n, w: Math.round(w), worst, mirrorSL: m.scrollLeft, wrapSL: wr.scrollLeft, qxmax: m.style.getPropertyValue('--qx-max'), wrapMax: wr.scrollWidth - wr.clientWidth, tf: bar.querySelector('.qfixed-anim')?.style.transform || '' })
  }))
}
await browser.close()
