/* [DB-READINESS] phase 7 — WALKER A, part 2b: A6's two edit-week pictures framed on the ROW (the first pass had no
   chip to scroll to, so its pictures showed the top of the day): a Personal row with only a named extra, and a
   cancelled / information-only Personal row with ALL AVAIL — the edit week, the row on screen. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const rowToMiddle = async (di, text) => { await W.showDay(p, di); await p.evaluate(([d, t]) => { const day = document.querySelector(`#eWeek .day[data-day="${d}"]`); const e = [...day.querySelectorAll('*')].filter(x => x.children.length === 0 && (x.textContent || '').includes(t)).pop(); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [di, text]); await L.sleep(350) }
A.scen('A6e', 'edit week, the row on screen: Sunday — Personal (Ranger) with only Anvil in the extras; Saturday — Personal (Ranger) with ALL AVAIL, then ⓘ (information-only)')
try {
  const i2 = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[A.SUN], from: '10:00', to: '11:00', remarks: 'P7 A6e named' })
  await W.boardOn(p, A.SUN)
  A.ok('Anvil placed in the extras (Sunday)', (await A.place(S, p, A.SUN, await A.rowIdx(p, A.SUN, i2), 'extras', 'shaft')).took)
  const i1 = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[A.SAT], from: '10:00', to: '11:00', remarks: 'P7 A6e info' })
  await W.boardOn(p, A.SAT)
  const ri = await A.rowIdx(p, A.SAT, i1)
  A.ok('ALL AVAIL placed in the extras (Saturday)', (await A.place(S, p, A.SAT, ri, 'extras', 'allavail')).took)
  A.said('ⓘ pressed: ' + await A.rowBtn(p, 'data-grinfo', A.SAT, ri))
  await W.boardOff(p); await W.toEdit(L, p)
  await rowToMiddle(A.SUN, 'P7 A6e named')
  const c2 = await A.chips(p, `#eWeek .day[data-day="${A.SUN}"]`, null)
  const r2 = await p.evaluate(d => [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] [data-person]`)].map(e => e.dataset.person), A.SUN)
  A.said(`edit week Sunday: pucks on the day ${JSON.stringify(r2.filter(x => ['bane', 'shaft', 'all', 'allavail'].includes(x)))}; chips painted ${c2.length}`)
  A.ok('EDIT WEEK: a Personal row with only a named extra shows NO chip', c2.length === 0 && r2.includes('shaft'), c2)
  await A.pic(L, p, 'A6e-1-editweek-named-only-row')
  await rowToMiddle(A.SAT, 'P7 A6e info')
  const c1 = await A.chips(p, `#eWeek .day[data-day="${A.SAT}"]`, null)
  A.said(`edit week Saturday (information-only): chips painted ${c1.length}`)
  A.ok('EDIT WEEK: an information-only Personal row with ALL AVAIL shows NO chip', c1.length === 0, c1)
  await A.pic(L, p, 'A6e-2-editweek-infoonly-row')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A6e-X-error').catch(() => {}) }
A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk2b.json'), { errors })
await browser.close()
