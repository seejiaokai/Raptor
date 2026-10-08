/* WALKER G — X-06 part b: a 3-day leave approved on the Leave War, then CUT (its middle day deleted) by a second admin */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x06b')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const P = 'dj'
const cellOf = d => tid(`cell-${P}-${d}`)
const showMonth = async mon => { await L.go(p, 'leavewar'); await sleep(1200); await tid(`month-${mon}`).first().click(); await sleep(1300) }
const dragSelect = async (from, to) => {
  for (let i = 0; i < 4; i++) {
    await cellOf(from).scrollIntoViewIfNeeded(); await sleep(200)
    const a = await cellOf(from).boundingBox(), b = await cellOf(to).boundingBox()
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
    await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await p.mouse.up()
    try { await tid('select-sheet').waitFor({ state: 'visible', timeout: 1800 }); await sleep(300); return true } catch { if (await tid('sheet-scrim').count()) await p.keyboard.press('Escape'); await sleep(300) }
  }
  return false
}
const recs = () => p.evaluate(id => window.INPUTS.filter(x => x.person === id && /^LL/.test(x.type) && /Aug/.test(x.date)).map(x => ({ type: x.type, date: x.date, end: x.endDate || '', by: x.by && window.PEOPLE[x.by] ? window.PEOPLE[x.by].cs : x.by, modBy: x.modBy && window.PEOPLE[x.modBy] ? window.PEOPLE[x.modBy].cs : x.modBy, remarks: x.remarks })), P)
const inputsSide = async (label, iso) => {
  await L.go(p, 'inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }
  await G.toInputsCal(p); await G.monthTo(p, 2026, 7)
  const bars = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') || '' })).filter(b => /Ace/.test(b.t)))
  const f1 = await G.shot(p, `${label}-inputs-month`)
  return { bars, f1 }
}
const say = (n, o) => console.log(n, JSON.stringify(o).slice(0, 1800))
await showMonth('AUG')
const ok = await dragSelect('2026-08-17', '2026-08-19'); say('select sheet up', ok)
await tid('sel-LL').click(); await sleep(800)
await dragSelect('2026-08-17', '2026-08-19'); await tid('sel-approve').click(); await sleep(900)
const fA = await G.shot(p, 'lw-3day-approved')
say('3-DAY recs', await recs()); say('3-DAY inputs', await inputsSide('3day', '2026-08-18'))
// cut: second admin deletes the middle day
await p.evaluate(() => { window.raptorMe('nact'); window.raptorRole('admin') }); await sleep(500)
await showMonth('AUG')
await dragSelect('2026-08-18', '2026-08-18')
await tid('sel-delete').click(); await sleep(300); await tid('sel-delete').click(); await sleep(900)
const fC = await G.shot(p, 'lw-cut-middle')
const rc = await recs(); say('CUT recs', rc); say('CUT inputs', await inputsSide('cut', '2026-08-17'))
// Undo as the person who cut (Warden, still swapped in)
const un = await G.undo(p); const toast1 = await p.locator('#toastEl').innerText().catch(() => ''); say('UNDO as Warden', { un, toast1 })
say('UNDONE recs', await recs()); say('UNDONE inputs', await inputsSide('undone', '2026-08-18'))
// and Saber's own Undo of the earlier approval is refused after Warden's change? (swap back, press Undo)
await p.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await sleep(400)
const un2 = await G.undo(p); const toast2 = await p.locator('#toastEl').innerText().catch(() => ''); say('UNDO as Saber', { un2, toast2 })
say('after Saber undo recs', await recs())
await G.reload(p)
say('RELOADED recs', await recs()); say('RELOADED inputs', await inputsSide('reloaded', '2026-08-18'))
G.saveRows('x06b-raw')
console.log('errors', JSON.stringify(errors))
await browser.close()
