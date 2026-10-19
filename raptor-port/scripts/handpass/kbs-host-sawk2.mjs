/* host probe — his question 20 Oct 26 ("why does SC not have B on edit schedule?"): pictures with the place marked —
   Edit Schedule's week, an SC, AVALON and BB wave's time headings (R over START, END: no B); the board's BB wave (R over B). */
import { open, version } from './kbs-A-lib.mjs'
version('host-sawk2-1')
const { browser, page } = await open({ width: 402, height: 874, stub: false })
const OUT = 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/'
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
for (const k of ['avalon', 'bb']) {
  await page.evaluate(() => document.querySelector('#schedBoard [data-wvadd]').click()); await page.waitForTimeout(400)
  await page.evaluate(k => document.querySelector(`.wavemenu [data-wmkind="${k}"]`).click(), k); await page.waitForTimeout(600)
}
/* the board: the last standby wave's time heading, ringed */
await page.evaluate(() => {
  const heads = [...document.querySelectorAll('#schedBoard span, #schedBoard div')].filter(e => e.children.length <= 1 && /^R\s*B$/.test(e.textContent.replace(/\s+/g, ' ').trim()))
  const h = heads[heads.length - 1]; if (!h) return
  h.style.outline = '3px solid #ff3b30'; h.style.outlineOffset = '3px'
  let s = h.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement
  if (s) s.scrollTop += h.getBoundingClientRect().top - 260
})
await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'sa-board-marked.png' })
await page.evaluate(() => document.getElementById('sbDone').click()); await page.waitForTimeout(800)
/* the week: every standby wave's time headings ringed; the SC one in view */
const found = await page.evaluate(() => {
  const cs = [...document.querySelectorAll('#eWeek .cols.formcols')].filter(c => /SHIFT/.test(c.textContent))
  for (const c of cs) for (const sp of c.querySelectorAll('.c-c')) { sp.style.outline = '3px solid #ff3b30'; sp.style.outlineOffset = '2px' }
  const sc = cs.find(c => /AVALON/.test(c.textContent)) || cs[0]
  if (sc) { sc.scrollIntoView({ block: 'start' }); window.scrollBy(0, -160) }
  return cs.map(c => c.textContent.replace(/\s+/g, ' ').trim().slice(0, 30))
})
console.log('week standby headings', found)
await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'sa-week-marked.png' })
await browser.close()
