/* host probe — his question 20 Oct 26 ("why does SC not have B on edit schedule? … check BB and Avalon as well"): at his
   iPhone's width, add an AVALON and a BB wave on Monday through the board's + Wave menu, then picture each standby wave
   on Edit Schedule's week (its time headings: R over START, END — no B) and on the board (R over B). */
import { open, version } from './kbs-A-lib.mjs'
version('host-sawk-1')
const { browser, page, errors } = await open({ width: 402, height: 874, stub: false })
const OUT = 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/'
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
for (const k of ['avalon', 'bb']) {
  await page.evaluate(() => document.querySelector('#schedBoard [data-wvadd]').click()); await page.waitForTimeout(400)
  const n = await page.locator(`.wavemenu [data-wmkind="${k}"]`).count(); console.log(k, 'in menu', n)
  if (n) { await page.evaluate(k => document.querySelector(`.wavemenu [data-wmkind="${k}"]`).click(), k); await page.waitForTimeout(600) }
}
/* the board: each standby wave's first line */
for (const lab of ['SC', 'AVALON', 'BB']) {
  const ok = await page.evaluate(lab => { const h = [...document.querySelectorAll('#schedBoard *')].find(e => e.children.length === 0 && e.textContent.trim() === lab && e.closest('#schedBoard') && e.getBoundingClientRect().height > 0); if (!h) return false; h.scrollIntoView({ block: 'start' }); let s = h.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; if (s) s.scrollTop -= 120; return true }, lab)
  await page.waitForTimeout(300)
  if (ok) await page.screenshot({ path: OUT + `sa-board-${lab.toLowerCase()}.png` })
  console.log('board', lab, ok)
}
await page.evaluate(() => document.getElementById('sbDone').click()); await page.waitForTimeout(800)
/* the week: each standby wave's heading row */
for (const lab of ['SC', 'AVALON', 'BB']) {
  const ok = await page.evaluate(lab => { const c = [...document.querySelectorAll('#eWeek .cols.formcols')].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(lab + ' SHIFT')); if (!c) return false; c.scrollIntoView({ block: 'start' }); window.scrollBy(0, -140); return true }, lab)
  await page.waitForTimeout(300)
  if (ok) await page.screenshot({ path: OUT + `sa-week-${lab.toLowerCase()}.png` })
  console.log('week', lab, ok)
}
console.log('errors', errors.length ? errors : 'none')
await browser.close()
