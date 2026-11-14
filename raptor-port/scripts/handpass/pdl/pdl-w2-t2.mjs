/* pdl-w2-t2 v1 — T2 Flight debrief (desktop). Tue 28 Jul published (man A), Thu 30 Jul control (man B). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t2-run1')
console.log('pdl-w2-t2 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
const A = w.ID('Ranger'), B = w.ID('Saber')
for (const [di, who] of [[1, A], [3, B]]) {
  await L.board(page, di); await sleep(400)
  const f = await P.flight(w, di, { to: '1200', ld: '1300', who })
  const g = await P.ground(w, di, { prog: 'BRIEFING', str: '1530', end: '1600', who })
  console.log('day', di, JSON.stringify(f), JSON.stringify(g))
  await L.closeBoard(page)
}
console.log('fixture', JSON.stringify(await page.evaluate(() => [1, 3].map(d => ({ d, f: window.DAYS[d].waves[0].formations[0].to + '-' + window.DAYS[d].waves[0].formations[0].ld + ' ' + window.DAYS[d].waves[0].formations[0].aircraft[0].p, g: window.DAYS[d].ground.map(x => x.prog + ' ' + x.str + '-' + x.end + ' ' + x.who) })))))
async function insights(tag) {
  await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(500)
  await page.locator('#insightBtn:visible').first().click(); await sleep(1000)
  const t = await page.evaluate(() => document.querySelector('#insightBody').innerText.replace(/\s+/g, ' '))
  const seg = (t.match(/WORK HOURS[^]*?(?=NOT ON THE FLYING|CONFLICTS)/i) || [''])[0].trim()
  await P.pic(page, `t2-insights-${tag}`)
  console.log('INSIGHTS', tag, seg, '||', (t.match(/CONFLICTS BY TYPE[^]*?BY DAY/i) || [''])[0], '||', (t.match(/Tuesday[^]*?Wednesday/) || [''])[0], '||', (t.match(/Thursday[^]*?Friday/) || [''])[0])
  await page.locator('#insightClose').click(); await sleep(400)
  return { seg, t }
}
const i0 = await insights('0-before-publish')
const t0 = await P.snapshot(w, 1, A, 't2-0-tue-before')
const u0 = await P.snapshot(w, 3, B, 't2-0-thu-before')
const sp = await X.signAndPublish(w, 1)
console.log('publish', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const t1 = await P.snapshot(w, 1, A, 't2-1-tue-published-before-change')
const i1 = await insights('1-published-before-change')
const lg = await P.setLogic(w, 'debrief', '3h')
console.log('debrief', JSON.stringify(lg))
await P.pic(page, 't2-2-logic-debrief-3h')
const t2 = await P.snapshot(w, 1, A, 't2-3-tue-published-after-change')
const u2 = await P.snapshot(w, 3, B, 't2-3-thu-unpublished-after-change')
const i2 = await insights('2-after-change')
const newIn = (b, a) => P.surfaces(a).map(k => ({ k, added: a[k].items.filter(x => !b[k].items.includes(x)), ringsBefore: b[k].rings, ringsAfter: a[k].rings }))
const dT = newIn(t1, t2), dU = newIn(u0, u2)
console.log('DELTA TUE', JSON.stringify(dT)); console.log('DELTA THU', JSON.stringify(dU))
check('T2.1 Tuesday (published): no new warning line and no new ring on Ranger after debrief 3h (D2005)', dT.every(d => d.added.length === 0 && JSON.stringify(d.ringsBefore) === JSON.stringify(d.ringsAfter) && !d.ringsAfter.some(r => /AMBER|RED/.test(r))), JSON.stringify(dT))
check('T2.2 Thursday (unpublished): a clash/advisory for Saber appears at once on Edit Schedule, View-only and the board', dU.every(d => d.added.length > 0), JSON.stringify(dU))
const hrs = s => (s.match(/Ranger\s*(\d+h(?:\d+)?)/) || [])[1]
note('T2.3 Insights work hours (RECORD, D482: Ranger up by 1h) — report to debrief this week', `before publish: ${i0.seg} | published before change: ${i1.seg} | after change: ${i2.seg}`)
check('T2.4 Insights: Ranger (Tuesday only) hours after the change are 1h more than before it (D482)', (() => { const b = parseInt((hrs(i1.seg) || '').replace(/h.*/, '')), a = parseInt((hrs(i2.seg) || '').replace(/h.*/, '')); return Number.isFinite(b) && Number.isFinite(a) && a === b + 1 })(), `before ${hrs(i1.seg)} after ${hrs(i2.seg)}`)
P.finish(w, { i0: i0.t, i1: i1.t, i2: i2.t, t1, t2, u0, u2 })
await w.browser.close()
