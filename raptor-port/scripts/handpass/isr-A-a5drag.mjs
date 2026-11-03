// A5 (drag form) — a placeholder's puck dragged off its row on a published day.
import * as L from './isr-A-lib.mjs'
import * as P from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
export default async function a5drag() {
  const size = 'desktop'
  const { ctx, page, tap } = await L.session(size)
  try {
    const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Duty', people: ['allavail'], from: '09:00', to: '12:00', remarks: 'isr drag' })
    const pub = await P.pubDay(page, tap, 5)
    if (!iid || !pub.r.pressed) { notWalked('A5 drag', `set-up failed: filed ${iid}, publish ${JSON.stringify(pub.r)}`); await ctx.close(); return }
    const f0 = await P.face(page, 5)
    await P.showDay(page, 5)
    await page.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(700)
    const puck = page.locator('#schedBoard .sb-arow.gr-frominput .seat .puck.allavail:visible').first()
    let still = 1
    for (const [tx, ty] of [[1200, 700], [700, 880], [900, 40], [400, 520]]) {
      const b = await puck.boundingBox().catch(() => null); if (!b) break
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await sleep(150)
      for (let i = 1; i <= 16; i++) await page.mouse.move(b.x + b.width / 2 + (tx - b.x - b.width / 2) * i / 16, b.y + b.height / 2 + (ty - b.y - b.height / 2) * i / 16)
      await sleep(250); await page.mouse.up(); await sleep(900)
      still = await page.locator('#schedBoard .sb-arow.gr-frominput .seat .puck.allavail:visible').count()
      note('A5 drag', `drop at ${tx},${ty}: puck on its row afterwards ${still}; notes so far ${JSON.stringify(await L.notes(page))}`); if (tx === 1200) await shot(page, 'A5', size, 'drag-puck-after-drop')
      if (!still || await tid(page, 'oilconf').count()) break
    }
    const person = await page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r.person || (r.people || []).map(e => e.p) }, iid)
    if (await tid(page, 'oilconf').count()) { await shot(page, 'A5', size, 'drag-oil-question'); await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await sleep(500) }
    await P.closeBoard(page)
    const f = await P.face(page, 5)
    const out = await P.toGoOut(page, 5, ['A5', size, 'drag-to-go-out'])
    say(`A5 DRAG: puck still on its row ${still}; input's person now ${JSON.stringify(person)}; face before ${JSON.stringify(f0)} after ${JSON.stringify(f)}; To go out: ${out.text.slice(0, 600)}`)
    const n = +((f.pend[0] || '').match(/\d+/) || [0])[0]
    check('A5', 'dragging the placeholder puck off its row on a published day reads ONE pending, with the cause named', n === 1 && !/What this day earns changed/.test(out.text), { chip: f.pend, text: out.text.slice(0, 300) })
    await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (w) { w.style.outline = '3px solid #ff3b6b'; w.style.outlineOffset = '2px' } })
    await shot(page, 'A5', size, 'drag-marked')
  } catch (e) { say(`ERROR A5 drag: ${e.message.split('\n')[0]}`); await shot(page, 'A5', size, 'drag-error').catch(() => {}) }
  await ctx.close()
}
if (process.argv[1].endsWith('isr-A-a5drag.mjs')) { await a5drag(); await L.finish('a5drag') }
