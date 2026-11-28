// swl-w1B-probe9 — walker B (chat 203): reproducing s25(e)'s FAIL at both sizes by a second route — Marlin's line hidden, then
// another WSO (Echo) tapped into his seat in his place, then Marlin tapped back into the same seat: the note's words.
//   SWLB_RUN=probe9-<d|p> SZ=d|p node scripts/handpass/swl-w1B-probe9.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, J } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe9 1 · size', SZ)
await T.run('probe9', SZ, async (p, W) => {
  const l1 = await B.mkLine(p, W, 4, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  const a = await B.plan(p, W, 4, l1.rcp, 'cards', 'r1-marlin')
  W.rec('r1', 'Marlin tapped into VL BFM\'s RCP (nothing filed)', 'REC', `placed ${a.placed} · note "${a.toast}"`, a.pic)
  const l = await B.readOpen(p, W, '#eWeek', 4)
  const x = l.lines.find(z => /Marlin — SANS/.test(z.text))
  await B.tapLine(p, W, '#eWeek', 4, x.ix, 'r2-hide')
  const h = await B.readOpen(p, W, '#eWeek', 4)
  W.rec('r2', 'his line hidden (✕)', 'REC', B.listSay(h), await B.listPic(p, W, '#eWeek', 4, 'r2'))
  /* the line removed by its own ✕ ("Remove this line"), then the same line made again (+ Wave, the same words and times) */
  const d = await B.lineDel(p, W, 4, `4.${l1.wi}.0.0`, 'r3')
  const l2 = await B.mkLine(p, W, 4, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  W.rec('r3', 'the line removed by its ✕, then made again the same (+ Wave)', 'REC', `removed ${d.ok} "${d.toast}" · new line ${J(l2.f)} seat ${l2.rcp} · Marlin holds ${J(await B.dayHold(p, 4, 'cards'))}`, d.pic)
  const m = await B.plan(p, W, 4, l2.rcp, 'cards', 'r4-marlin-back')
  W.rec('r4', 'Marlin tapped into the new line\'s RCP: the note (FAIL if the crew list\'s old words "SANS — no availability filed for today")', m.placed && !/SANS — no availability filed/.test(m.toast), `placed ${m.placed} · note "${m.toast}"`, m.pic)
  const f = await B.readOpen(p, W, '#eWeek', 4)
  W.rec('r5', 'the list after (his line hidden or shown)', 'REC', B.listSay(f), await B.listPic(p, W, '#eWeek', 4, 'r5'))
})
