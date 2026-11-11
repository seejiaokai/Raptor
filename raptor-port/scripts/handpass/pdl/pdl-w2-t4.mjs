/* pdl-w2-t4 v1 — T4 the ALL AVAIL window (desktop). Tue 28 Jul: Ranger flies 12:00-13:00; ground row 14:30-15:00 with ALL AVAIL. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t4-run1')
console.log('pdl-w2-t4 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic } = P
const FX = await import('../rcf/rcf-w2-fx.mjs')
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { to: '1200', ld: '1300', who: w.ID('Ranger') })
const g = await P.ground(w, 1, { prog: 'BRIEFING', str: '1430', end: '1500', who: null })
const from = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
await from.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const to = page.locator(`#schedBoard [data-fill="g:1.${g.ri}.+"]:visible`).first()
await to.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await FX.dragBox(page, from, to)
const gr = await page.evaluate(() => JSON.stringify(window.DAYS[1].ground.map(x => x.prog + ' ' + x.str + '-' + x.end + ' ' + x.who)))
check('T4.0 fixture: ground row 14:30-15:00 holds ALL AVAIL (dragged)', /allavail/.test(gr), gr)
await L.closeBoard(page)

/* open the count of the ALL AVAIL chip on a surface; returns the window's text + the count shown on the chip */
async function openCount(surface, tag) {
  if (surface === 'board') { await L.board(page, 1); await sleep(500) }
  else if (surface === 'edit') { await L.closeBoard(page); await L.go(page, 'editsched'); await sleep(600) }
  else { await L.closeBoard(page); await L.go(page, 'viewsched'); await sleep(600) }
  const root = surface === 'board' ? '#schedBoard' : surface === 'edit' ? '#eWeek .day[data-day="1"]' : '#vWeek .day[data-day="1"]'
  const chip = page.locator(`${root} .oilcount:visible`).first()
  if (!(await chip.count())) { console.log('NO CHIP on', surface); return { chip: null, text: 'NO CHIP' } }
  const n = (await chip.innerText()).trim()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const before = await page.evaluate(() => new Set([...document.querySelectorAll('body *')].filter(e => e.offsetWidth).map((e, i) => e)).size)
  await page.evaluate(() => { window.__seen = new WeakSet([...document.querySelectorAll('body *')]) })
  await chip.click(); await sleep(900)
  const win = await page.evaluate(() => {
    const fresh = [...document.querySelectorAll('body *')].filter(e => !window.__seen.has(e) && e.offsetWidth)
    const tops = fresh.filter(e => !fresh.includes(e.parentElement))
    return tops.map(e => ({ cls: String(e.className).slice(0, 60), id: e.id, text: e.innerText.replace(/[\s ]+/g, ' ').slice(0, 2500) }))
  })
  await pic(page, `${tag}-${surface}`)
  console.log('COUNT', tag, surface, 'chip', n, JSON.stringify(win).slice(0, 3000))
  return { chip: n, win }
}
const closeWin = async () => { await page.keyboard.press('Escape'); await sleep(300); await page.mouse.click(5, 300); await sleep(300) }
const first = await openCount('board', 't4-0-unpublished')
await closeWin()
const sp = await X.signAndPublish(w, 1)
console.log('publish', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const b1 = await openCount('board', 't4-1-published-before'); await closeWin()
const e1 = await openCount('edit', 't4-1-published-before'); await closeWin()
const v1 = await openCount('view', 't4-1-published-before'); await closeWin()
const lg = await P.setLogic(w, 'debrief', '3h')
console.log('debrief', JSON.stringify(lg))
const b2 = await openCount('board', 't4-2-after-change'); await closeWin()
const e2 = await openCount('edit', 't4-2-after-change'); await closeWin()
const v2 = await openCount('view', 't4-2-after-change'); await closeWin()
const norm = r => JSON.stringify(r.win && r.win.map(x => x.text))
for (const [s, a, b] of [['board', b1, b2], ['edit', e1, e2], ['view', v1, v2]]) {
  note(`T4.1 ALL AVAIL count, ${s} (RECORD)`, `before: chip ${a.chip} window ${norm(a)} || after: chip ${b.chip} window ${norm(b)}`)
  check(`T4.2 ${s}: count window and chip the same before and after debrief 3h (host's reading of D2005)`, a.chip === b.chip && norm(a) === norm(b) && a.chip !== null, `chip ${a.chip} -> ${b.chip}; same window text: ${norm(a) === norm(b)}`)
}
P.finish(w, { first, b1, e1, v1, b2, e2, v2 })
await w.browser.close()
