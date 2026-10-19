/* host probe — [KEYBOARD-SCROLL] the pinned Quals heading after a widened column: where each heading stands */
import { open, version } from './kbs-A-lib.mjs'
version('host-qpin2-1')
const { browser, page } = await open({ width: 390, height: 844, stub: false })
await page.evaluate(() => window.go('quals')); await page.waitForSelector('#qtbl td.qname')
await page.evaluate(() => window.scrollTo(0, 700)); await page.waitForTimeout(500)
await page.evaluate(nowiden => {
  const w = document.querySelector('.qwrap')
  const td = document.querySelector('#qtbl td.qname').parentElement.lastElementChild
  if (!nowiden) td.textContent = 'a remark long enough to widen its column well past where it was before this test'
  w.scrollLeft = 99999
}, !!process.env.NOWIDEN)
await page.waitForTimeout(800)
console.log(await page.evaluate(() => {
  const bar = document.querySelector('[data-testid="qsticky-head"]'), br = bar.getBoundingClientRect()
  const tbl = bar.querySelector('.qfixed-anim'), tr = tbl.getBoundingClientRect()
  const out = { bar: [Math.round(br.left), Math.round(br.right)], mirrorTable: [Math.round(tr.left), Math.round(tr.width)], tblStyleW: tbl.style.width, realTableW: Math.round(document.getElementById('qtbl').getBoundingClientRect().width), cols: [] }
  for (const th of [...bar.querySelectorAll('.qfixed-scroll th[data-sort]')].slice(-4)) {
    const k = th.getAttribute('data-sort'), real = document.querySelector('#qtbl thead th[data-sort="' + k + '"]')
    out.cols.push([k, Math.round(th.getBoundingClientRect().left), real ? Math.round(real.getBoundingClientRect().left) : null, Math.round(th.getBoundingClientRect().width), real ? Math.round(real.getBoundingClientRect().width) : null])
  }
  return JSON.stringify(out)
}))
await browser.close()
