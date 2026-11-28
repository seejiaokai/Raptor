// shr-a-a4 — share A, A4 (Astra S06, O-S11, O-S3): three men (Ranger, Hex, Outlaw) on one leave, rows typed in turn.
// Pass O-S11: Ranger start 0900; Outlaw start 0930; Ranger end 1100; Hex end 1200; Outlaw remark `gym` (each Tab).
//   EXPECTED: three inputs — Ranger 09:00–11:00, Outlaw 09:30–10:00 "gym", Hex 08:00–12:00 on the original record.
// Pass S06: Ranger start 0900; Hex end 1200; Ranger end 1100; Hex remark `Hex only`; Ranger remark `Ranger only`.
//   EXPECTED: Ranger 09:00–11:00 "Ranger only", Hex 08:00–12:00 "Hex only" (each his own), Outlaw 08:00–10:00 blank.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk ENG=chromium node scripts/handpass/shr-a-a4.mjs
import { L, J, add, done, world, openBoard, read, boxSel, typeIn, pic, away, fixture, idOf, NAMES, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a4 v1', TAG)
const PASSES = {
  'O-S11': { seq: [['Ranger', 'str', '0900'], ['Outlaw', 'str', '0930'], ['Ranger', 'end', '1100'], ['Hex', 'end', '1200'], ['Outlaw', 'rmks', 'gym']], want: { Ranger: '540-660 ""', Outlaw: '570-600 "gym"', Hex: '480-720 ""' }, orig: 'Hex' },
  'S06': { seq: [['Ranger', 'str', '0900'], ['Hex', 'end', '1200'], ['Ranger', 'end', '1100'], ['Hex', 'rmks', 'Hex only'], ['Ranger', 'rmks', 'Ranger only']], want: { Ranger: '540-660 "Ranger only"', Hex: '480-720 "Hex only"', Outlaw: '480-600 ""' }, orig: 'Outlaw' },
}
for (const [name, P] of Object.entries(PASSES)) {
  const id = `A4-${name}`, steps = [], pics = []
  try {
    const w = await world(); const p = w.page
    const outlaw = await idOf(p, 'Outlaw'); NAMES[outlaw] = 'Outlaw'
    const ids = ['bane', 'rocky', outlaw]
    const iid = await fixture(w, [L.RANGER, L.HEX, outlaw]); await openBoard(w)
    steps.push(await read(p, 'filed', ids))
    for (const [man, f, v] of P.seq) {
      const sel = await boxSel(p, man, f)
      await typeIn(w, sel, v, 'Tab')
      steps.push(await read(p, `${man} ${f} ${v} Tab (in ${sel.match(/"(.+)"/)[1]})`, ids))
    }
    pics.push(await pic(w, `${id}-caret-in`))
    await away(w); steps.push(await read(p, 'caret left', ids)); pics.push(await pic(w, `${id}-caret-left`))
    const s = steps.at(-1).store
    const each = Object.entries(P.want).map(([m, t]) => { const mine = s.filter(x => new RegExp(`^LL ${m} Jul 15 `).test(x)); return [m, mine.length === 1 && mine[0].includes(` ${t}`), mine] })
    const origKept = s.some(x => x.includes(`[${iid}]`) && new RegExp(`^LL ${P.orig} `).test(x))
    const ok = s.length === 3 && each.every(e => e[1]) && origKept && steps.every(x => x.agree.bad.length === 0)
    add(id, ok ? 'PASS' : 'FAIL', { fixture: iid, each, originalRecordNowHolds: s.find(x => x.includes(`[${iid}]`)), agreeBad: steps.map(x => x.agree.bad).filter(b => b.length), steps }, pics)
    await w.ctx.close()
  } catch (e) { add(id, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
}
await done('a4')
