/* b3-04b — ITEM 10 (D105), the desktop path from a cell into its bubble, looked at step by step: a fresh bubble each
   time (the pointer parked away first), then the pointer walked from the cell's centre to the list's centre in N
   steps; after EVERY step, is the bubble still up, and what is under the pointer? Also a slow walk (a pause per step,
   as a hand moves). Walker B3, 25 Sep 26. Usage (from raptor-port/): node scripts/handpass/am/b3-04b-bubble-path.mjs */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, check, note, summary, STATE, DESK, RESULTS } = L
import { writeFileSync } from 'node:fs'
const SH = process.env.HP_SHOTS
const DI = 4, N = 13
const { browser, page, errors } = await openHi({ ...DESK, state: STATE, dpr: 1 })
await editWeek(page); await board(page, DI)
const key = await page.evaluate(i => { const e = [...document.querySelectorAll(`#schedBoard [data-bfld^="ap:${i}."][data-bfld$=".str"]`)].find(x => x.offsetWidth); return e ? e.dataset.bfld : null }, DI)
const sel = `#schedBoard [data-bfld="${key}"]:visible`
for (let k = 1; k <= N; k++) {
  const el = page.locator(sel).first()
  await el.click({ force: true }); await el.fill(''); await el.type(`07${String(k).padStart(2, '0')}`, { delay: 5 })
  await el.evaluate(e => e.blur()); await page.waitForTimeout(120)
}
await page.locator('#schedBoard #sbHist:visible').first().click(); await page.waitForTimeout(400)
const el = page.locator(sel).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
const cb = await el.boundingBox()
const state = () => page.evaluate(() => {
  const b = document.querySelector('.histbub'); const ol = b && b.querySelector('.hb-all')
  return b && b.isConnected ? { up: true, list: ol ? (r => ({ x: r.left, y: r.top, w: r.width, h: r.height }))(ol.getBoundingClientRect()) : null, box: (r => ({ y: Math.round(r.top), h: Math.round(r.height) }))(b.getBoundingClientRect()) } : { up: false }
})
const under = (x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); if (!e) return 'nothing'; const c = e.closest('[data-bfld],[data-slot],[data-txt]'); return (e.closest('.histbub') ? 'BUBBLE ' : '') + (c ? 'CELL ' + (c.dataset.bfld || c.dataset.slot || c.dataset.txt) : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) }, [x, y])
const runs = []
for (const [steps, pause] of [[4, 0], [10, 0], [20, 0], [10, 40], [20, 25]]) {
  await page.mouse.move(700, 880, { steps: 3 }); await page.waitForTimeout(500)          // park away: no bubble
  const x0 = cb.x + cb.width / 2, y0 = cb.y + cb.height / 2
  await page.mouse.move(x0, y0, { steps: 2 }); await page.waitForTimeout(450)
  const s0 = await state()
  if (!s0.up || !s0.list) { runs.push({ steps, pause, start: 'no bubble on hover' }); continue }
  const x1 = s0.list.x + s0.list.w / 2, y1 = s0.list.y + s0.list.h / 2
  const trail = []
  let lost = null
  for (let i = 1; i <= steps; i++) {
    const x = x0 + (x1 - x0) * i / steps, y = y0 + (y1 - y0) * i / steps
    await page.mouse.move(x, y)
    if (pause) await page.waitForTimeout(pause)
    const st = await state()
    const u = await under(x, y)
    trail.push(`${i}:${Math.round(y)}:${st.up ? 'up' : 'GONE'}:${u}`)
    if (!st.up && lost == null) lost = { step: i, y: Math.round(y), under: u }
  }
  await page.waitForTimeout(450)
  const end = await state()
  runs.push({ steps, pause, bubbleAbove: s0.box.y < cb.y, cellY: Math.round(cb.y), listY: Math.round(s0.list.y), reached: end.up, lost, trail: trail.join(' | ') })
  if (!end.up && steps === 20 && pause === 25) await page.screenshot({ path: `${SH}/d-H2b-bubble-gone-on-the-way.png` })
}
for (const r of runs) note(`d.H2b ${r.steps} steps${r.pause ? ', ' + r.pause + 'ms each' : ''}`, JSON.stringify(r))
check('d.H2b from a fresh hover, every path from the cell into its list keeps the bubble up', runs.every(r => r.reached), JSON.stringify(runs.map(r => ({ steps: r.steps, pause: r.pause, reached: r.reached, lost: r.lost }))))
check('d.H2b no browser errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
const f = summary('b3-04b-bubble-path')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-04b.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
