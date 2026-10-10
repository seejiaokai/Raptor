// [GROUP-INPUT-ONE-ROW] / D747 — the Scheduler Board's Ground Programme on the seed Monday, phone and desktop: the
// coloured line down the left of a row (blue: came from an input; amber: a late input) pictured where it is drawn, in
// the framing of his own picture of 11 Oct 26. A PASS line per row says the line ends left of everything the row draws.
//   node scripts/handpass/gi-rail.mjs        LOOK_URL=http://localhost:4180/   GI_OUT=<folder>
import { browser, open, DESK, PHONE, errs } from './gi-lib.mjs'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.env.GI_OUT || 'docs/img/handpass/2026-10-11-group-input-one-row'
mkdirSync(OUT, { recursive: true })
let bad = 0
for (const [tag, vp, touch] of [['phone', PHONE, true], ['desk', DESK, false]]) {
  const { ctx, page } = await open(vp, 'ad', 'a', touch, { clock: null })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
  await page.evaluate(() => window.openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  await page.evaluate(() => {
    const sec = document.querySelector('#schedBoard .sb-panel.grnd')
    sec.scrollIntoView({ block: 'start' })
    for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 6; break }
  })
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, `rail-${tag}-board-ground.png`) }); console.log(`saved rail-${tag}-board-ground`)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].map(row => {
    const line = getComputedStyle(row, '::before'), box = row.getBoundingClientRect()
    const left = box.left + parseFloat(line.left), right = left + parseFloat(line.width)
    const drawn = [...row.querySelectorAll('.puck, .mbtn, input, textarea, .sb-grip')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
    return { name: (row.querySelector('textarea.ain, input.ain') || {}).value, late: row.classList.contains('lateinp'), left: +left.toFixed(1), right: +right.toFixed(1),
      first: +Math.min(...drawn.map(r => r.left)).toFixed(1), panel: +row.closest('.sb-panel').getBoundingClientRect().left.toFixed(1) }
  }))
  for (const r of rows) {
    const ok = r.right <= r.first - 1 && r.left >= r.panel + 1
    if (!ok) bad++
    console.log(`${ok ? 'PASS' : 'FAIL'} ${tag} · ${r.name} · ${r.late ? 'amber' : 'blue'} line ${r.left}–${r.right}px · first thing drawn at ${r.first}px · panel edge ${r.panel}px`)
  }
  await ctx.close()
}
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors on the page')
await browser.close()
process.exit(bad || errs.length ? 1 : 0)
