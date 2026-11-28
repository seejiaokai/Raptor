// S22 a gesture or timer survives the pick: Find, a moved ball, pan/zoom, a just-saved mark; pick at once; wait out the delays; mark on the new squadron.
import { mk, closeAll, finish, pic, picsFor, note, step, check, T, hit, pickCourse, pickCrew, info, grade, openBall, arrange, tool, ballIds, fastPick, samePress, shut, sleep } from './ja-lib.mjs'
import { fixture, waitTrk, openTrk, move, reload, readBoth, whole142, whole149 } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-22 v1', SZ)
picsFor(`j22-${SZ}`)
const after = async (s, n = '149') => { await sleep(s, 150); if (!s.desk) await shut(s); return waitTrk(s, n) }
const mark = s => s.page.evaluate(() => ({ found: [...document.querySelectorAll('#flowSvg .ball')].filter(b => b.querySelector('.found')).map(b => b.dataset.id), q: document.getElementById('hSearch')?.value, stat: document.getElementById('hSearchStat')?.textContent, corner: (() => { const e = document.getElementById('saveStat'); return e && !e.hidden ? e.textContent.trim() : '' })(), zoom: document.getElementById('fzPct')?.textContent }))
const place = (s, id) => s.page.evaluate(id => [...document.querySelectorAll('#flowSvg .ball')].find(b => b.dataset.id === id)?.getAttribute('transform'), id)
const done = async s => { const i = await info(s); return +(/Done=(\d+)/.exec(i.overall) || [])[1] }
/* a real finger on the chart: Chromium over CDP only (walk-scripts §4) */
async function finger(s, x, y, dx, dy, steps = 10) {
  const cdp = await s.ctx.newCDPSession(s.page); const pt = (a, b) => [{ x: a, y: b, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) })
  for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x + dx * i / steps, y + dy * i / steps) }); await s.page.waitForTimeout(16) }
  await s.page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
}
try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s); await openTrk(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A') })
  await step('S22a Find, then pick at once', async () => {
    if (!s.desk) await hit(s, '#hSearchBtn', 300)
    await s.page.locator('#hSearch').fill('ACG-07'); await s.page.locator('#hSearch').press('Enter'); await sleep(s, 80)
    if (!s.desk) { const c = s.page.locator('#hSearchClear'); void c }
    const m0 = await mark(s); note('Find on 142: ' + JSON.stringify(m0))
    await fastPick(s, '149'); check('S22a reached 149', await after(s), (await T(s)).sq); await sleep(s, 1800)
    const m = await mark(s); note('after the delays on 149: ' + JSON.stringify(m)); await pic(s, '01-find-after-pick')
    check('S22a no ring left from the 142 search on 149', m.found.length === 0, m.found)
    check('S22a heading is 149', (await T(s)).sq.startsWith('149'), (await T(s)).sq)
    await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
    await grade(s, 'ACG-06', 'dco'); check('S22a a mark on 149 lands on 149', await done(s) === 6, await done(s))
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); check('S22a 142 untouched', await done(s) === 3, await done(s))
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); await openBall(s, 'ACG-06'); await hit(s, '#pop .opts button[data-g="0"]', 300); await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A')
  })
  await step('S22b a just-saved mark, pick at once, the corner on the new squadron', async () => {
    await openBall(s, 'ACG-05'); await samePress(s, '#pop .opts button[data-g="dco"]', '149')
    check('S22b reached 149', await after(s), (await T(s)).sq)
    const seen = []; for (let i = 0; i < 8; i++) { seen.push((await mark(s)).corner); await sleep(s, 280) }
    note('corner on 149 over 2.2s: ' + JSON.stringify(seen)); await pic(s, '02-corner-149')
    check('S22b no saved word from 142 stands on 149', seen.every(w => !/JA-142|JA142/.test(w)), seen)
    await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); check('S22b 149 marks unchanged', await done(s) === 5, await done(s))
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); check('S22b the mark is on 142', await done(s) === 4, await done(s))
  })
  await step('S22c zoom and pan, pick at once, the new chart answers', async () => {
    for (let i = 0; i < 3; i++) await hit(s, '#fzOut', 60)
    const z = await mark(s); note('142 zoomed to ' + z.zoom)
    if (s.sz === 'pc') {
      const b = await s.page.locator('#board').boundingBox(); await finger(s, b.x + b.width / 2, b.y + 200, -40, -140); note('a finger panned the chart')
    } else if (s.desk) {
      const b = await s.page.locator('#board').boundingBox(); await s.page.mouse.move(b.x + 40, b.y + 40); await s.page.mouse.down(); await s.page.mouse.move(b.x + 10, b.y + 10, { steps: 4 }); await s.page.mouse.up(); note('a mouse drag panned the chart')
    } else note('WebKit: no real finger pan (walk-scripts §4); the zoom buttons only')
    await fastPick(s, '149'); check('S22c reached 149', await after(s), (await T(s)).sq); await sleep(s, 700); await pic(s, '03-149-after-zoom')
    const m = await mark(s); note('149 zoom after pick: ' + m.zoom)
    await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A')
    await grade(s, 'ACG-07', 'dco'); check('S22c a mark still lands on 149 after the zoom and pan', await done(s) === 6, await done(s))
    const b = await (await import('./ja-lib.mjs')).ballInfo(s, 'ACG-07'); check('S22c the pressed event is the one marked', !!b && b.done && (b.title || '').includes('ACG-07'), b)
    await move(s, '142'); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); check('S22c 142 keeps 4', await done(s) === 4, await done(s))
  })
  await step('S22d a ball dragged in the layout editor, saved, pick at once', async () => {
    await arrange(s, true); await tool(s, 'Move')
    const id = 'ACG-08', before = await place(s, id)
    const r = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).boundingBox()
    const x = r.x + r.width / 2, y = r.y + r.height / 2
    if (s.sz === 'p') { note('WebKit: a real finger drag is not available (walk-scripts §4): S22d NOT WALKED at this size'); await arrange(s, false); return }
    if (s.sz === 'pc') { await finger(s, x, y, 60, 30); await sleep(s, 300); if ((await place(s, id)) === before) { note('first finger drag did not move it; a second with a hold'); await fingerHold(s, x, y, 70, 35) } } else { await s.page.mouse.move(x, y); await s.page.mouse.down(); await s.page.mouse.move(x + 60, y + 30, { steps: 8 }); await s.page.mouse.up() }
    await sleep(s, 400); const mid = await place(s, id); check('S22d the ball moved in the draft', mid !== before, { before, mid }); await arrange(s, false)
    const isDirty = (await T(s)).dirty; note('after the drag: Save changes lit = ' + isDirty + ' (a moved ball writes itself, the Tracker bar says)'); if (mid === before) { note('S22d NOT WALKED: the drag never moved the ball'); return }
    if (isDirty) await hit(s, '#saveChanges', 0); await fastPick(s, '149'); await sleep(s, 300)
    if (await s.page.locator('#dlgModal').count()) { note('a question stood after Save + pick'); await hit(s, '#dlgOk', 400) }
    check('S22d reached 149', await after(s), (await T(s)).sq); await pickCourse(s, 'JA-149')
    const on149 = await place(s, id); check('S22d the 149 chart did not take the move', on149 !== mid, { on149, mid }); await pic(s, '04-149-after-drag')
    await move(s, '142'); await pickCourse(s, 'JA-142'); const on142 = await place(s, id); note('142 ball: ' + on142); check('S22d the 142 chart kept the move', on142 !== before, { before, on142 })
  })
  await step('S22 reload', async () => {
    await reload(s); await openTrk(s); await pickCourse(s, 'JA-142'); await pickCrew(s, 'JA142A'); check('S22 142 marks after reload', await done(s) === 4, await done(s))
    await move(s, '149'); await pickCourse(s, 'JA-149'); await pickCrew(s, 'JA149A'); check('S22 149 marks after reload', await done(s) === 6, await done(s))
  })
  await s.ctx.close()
} finally { finish(`j22-${SZ}`); await closeAll() }
/* the same finger, resting 300ms before it moves */
async function fingerHold(s, x, y, dx, dy) {
  const cdp = await s.ctx.newCDPSession(s.page); const pt = (a, b) => [{ x: a, y: b, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) }); await s.page.waitForTimeout(300)
  for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x + dx * i / 14, y + dy * i / 14) }); await s.page.waitForTimeout(24) }
  await s.page.waitForTimeout(120)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
}
