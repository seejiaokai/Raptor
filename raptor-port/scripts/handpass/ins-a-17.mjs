/* Scenario 17 — a reload at every publication state keeps the same answer. One fresh-data flow. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '17'
const state = async p => { const f = await A.face(p, TUE); const i = await A.insNow(p); const v = await A.vface(p, TUE); return { f, i, v } }
const fsame = (a, b) => a.tag === b.tag && a.pending.replace(/\d+ changes?/, '') === b.pending.replace(/\d+ changes?/, '') && a.nys === b.nys && a.alpub === b.alpub && a.signed === b.signed && a.bar.replace(/tap to \w+ [▲▼]/, '') === b.bar.replace(/tap to \w+ [▲▼]/, '')
async function check(p, id, did, expect, name) {
  await L.settle(p)
  const saved = await p.evaluate(() => { const e = document.querySelector('#fastSync, #sbSync'); return e ? (e.title || e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60) : '' })
  const a = await state(p)
  await A.reloadAs(p, 'a')
  const b = await state(p)
  const shot = await A.facePic(p, TUE, name + '-day')
  const ip = await A.insPic(p, name + '-insights', 'foot')
  judge(`${S}.${id}`, `${did}; the save settled (sync: "${saved}"); reload, signed in again; Insights`, [
    ['Insights after the reload is word for word what it was before', A.same(a.i, b.i), A.diffText(a.i, b.i)],
    ['the day\'s version, pending chip, not-signed marker, button and signed line are unchanged', fsame(a.f, b.f), `${A.faceLine(a.f)} ⇒ ${A.faceLine(b.f)}`],
    ['View-only Sched shows the same version and count', a.v.tag === b.v.tag && A.num(a.v.bar) === A.num(b.v.bar), `${JSON.stringify(a.v)} ⇒ ${JSON.stringify(b.v)}`],
    ...expect(b),
  ], [shot, ...ip.shots])
  return b
}
await A.run(S, async p => {
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  const s0 = await check(p, 'a', 'Tuesday signed and published (Original)', b => [
    ['Original stays Original', /ORIG/.test(b.f.tag) && !A.isPending(b.f), b.f.tag],
  ], 's17-a-orig')
  await W.boardOn(p, TUE)
  await A.seatPut(p, '1.1.1.0.p', 'shaft'); await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const s1 = await check(p, 'b', 'board: Anvil on Rebel\'s seat + CX on Go 1\'s VL no. 2 (waiting)', b => [
    ['the change is still pending', A.isPending(b.f), b.f.pending],
    ['pending stays invisible to Insights (the window is the Original\'s)', A.same(s0.i, b.i), A.diffText(s0.i, b.i)],
  ], 's17-b-pending')
  await A.pubAL(p, TUE)
  const s2 = await check(p, 'c', 'Tuesday signed and AL1 published', b => [
    ['AL1 stays counted (31 sorties)', /AL1/.test(b.f.tag) && A.tile(b.i, /Sorties/i) === '31', `${b.f.tag} · ${A.tilesLine(b.i)}`],
    ['the window differs from the Original\'s', !A.same(s0.i, b.i)],
  ], 's17-c-AL1')
  const lk = await A.look(p, TUE, /^Original/)
  const ld = await A.load(p, TUE, { confirm: true })
  const s3 = await check(p, 'd', `plans picker → "${lk.label || lk.err}" → "${ld.said.join('" → "')}"`, b => [
    ['loading the older version stays working-only: the day is AL1, pending', /AL1/.test(b.f.tag) && A.isPending(b.f), A.faceLine(b.f)],
    ['the window is still AL1\'s', A.same(s2.i, b.i), A.diffText(s2.i, b.i)],
  ], 's17-d-loaded')
  await A.toEdit(p); await W.showDay(p, TUE)
  const un = await W.unpublish(p, TUE)
  await check(p, 'e', `Tuesday's "Unpublish" (${un.label || un.why})`, b => [
    ['the day reads Original', /ORIG/.test(b.f.tag), A.faceLine(b.f)],
    ['the window returns to the Original\'s, word for word', A.same(s0.i, b.i), A.diffText(s0.i, b.i)],
  ], 's17-e-unpublished')
})
