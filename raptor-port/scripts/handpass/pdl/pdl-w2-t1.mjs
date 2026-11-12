/* pdl-w2-t1 v1 — T1 Long work day (desktop). Tue 28 Jul published, Thu 30 Jul unpublished control. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t1-run1')
console.log('pdl-w2-t1 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, hit } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
const A = w.ID('Ranger'), B = w.ID('Saber')
for (const [di, who, nm] of [[1, A, 'Ranger'], [3, B, 'Saber']]) {
  await L.board(page, di); await sleep(400)
  const f = await P.flight(w, di, { to: '0800', ld: '1500', who })
  const it = await P.setInTime(w, di, f.gi, '06:00 IN TIME')
  console.log('day', di, nm, JSON.stringify(f), 'intimes', it)
  await L.closeBoard(page)
}
console.log('fixture', JSON.stringify(await page.evaluate(() => [1, 3].map(d => ({ d, intimes: window.DAYS[d].waves[0].intimes, f: window.DAYS[d].waves[0].formations[0].to + '-' + window.DAYS[d].waves[0].formations[0].ld + ' ' + window.DAYS[d].waves[0].formations[0].aircraft[0].p })))))
const t0 = await P.snapshot(w, 1, A, 't1-0-tue-before')
const u0 = await P.snapshot(w, 3, B, 't1-0-thu-before')
check('T1.0 fixture: no long-day note on either day before the change (threshold 12h)', P.surfaces(t0).every(k => !/long/i.test(t0[k].items.join(' '))) && P.surfaces(u0).every(k => !/long/i.test(u0[k].items.join(' '))), `Tue ${JSON.stringify(t0.edit.items)} | Thu ${JSON.stringify(u0.edit.items)}`)
const sp = await X.signAndPublish(w, 1)
console.log('publish', JSON.stringify({ sg: sp.sg, p: sp.p, h: sp.h }))
await L.closeBoard(page)
const t1 = await P.snapshot(w, 1, A, 't1-1-tue-published-before-change')
const lg = await P.setLogic(w, 'longDay', '10h')
console.log('longDay', JSON.stringify(lg))
await P.pic(page, 't1-2-logic-longday-10h')
const t2 = await P.snapshot(w, 1, A, 't1-3-tue-published-after-change')
const u2 = await P.snapshot(w, 3, B, 't1-3-thu-unpublished-after-change')
check('T1.1 Tuesday (published) shows NO long-day note anywhere after the change (D2005)', hit(t2, /long/i).length === 0, `edit ${JSON.stringify(t2.edit.items)} | view ${JSON.stringify(t2.view.items)} | board ${JSON.stringify(t2.board.items)} | rings ${JSON.stringify([t2.edit.rings, t2.view.rings, t2.board.rings])} | tags ${t2.edit.tag} / ${t2.view.tag}`)
check('T1.2 Thursday (unpublished) shows the long-day note at once on Edit Schedule, View-only and the board', hit(u2, /long/i).length === 3, `edit ${JSON.stringify(u2.edit.items)} | view ${JSON.stringify(u2.view.items)} | board ${JSON.stringify(u2.board.items)} | rings ${JSON.stringify([u2.edit.rings, u2.view.rings, u2.board.rings])}`)
P.finish(w, { t0, u0, t1, t2, u2, lg })
await w.browser.close()
