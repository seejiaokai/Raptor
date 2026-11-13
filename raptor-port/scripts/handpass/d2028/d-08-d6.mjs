/* d-08-d6 v1 — D6: earned OIL through another row (desktop; the Leave War). usage (from raptor-port/): node scripts/handpass/d2028/d-08-d6.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d6-' + KIND
console.log('d-08-d6 v1', KIND, process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const C = await import('../rcsb/w1/rcsb-w1-common.mjs')
const { X, L, sleep, j, row, SAT, ISO } = D
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
const ranger = w.ID('Ranger')
const iso = ISO[SAT]

async function lw(tag, id = ranger) {
  const grid = await C.lwGrid(w, id, iso, tag)
  const person = await X.lwOil(w, id, iso, tag + '-lw-person')
  const o = await C.lwOther(w, id, iso, tag)
  return { box: grid.box, title: grid.title, win: (grid.win || '').slice(0, 200), person: person.oil, tracker: o.tracker, trackerText: o.trackerText, balOil: o.balOil }
}

const b = await D.addCommon(w, SAT, 'Briefing', '09:00')
console.log('briefing', j(b), await D.drop(w, `a:${SAT}.${b.ri}.+`, ranger))
const t = await D.addCommon(w, SAT, 'Tasking', '10:15', '17:15')
console.log('tasking', j(t), await D.drop(w, `a:${SAT}.${t.ri}.+`, 'allavail'))
console.log('rows', await page.evaluate(i => JSON.stringify(window.DAYS[i].allhands.map(a => [a.prog, a.str, a.end, a.who, a.more])), SAT))
await D.shot(page, 'd6-0-board-built')
const p = await D.pub(w, SAT)
console.log('published', j(p.pressed), j(p.head && { tag: p.head.tag, pending: p.head.pending }))
const s4 = await D.signFour(w, SAT)
console.log('signed four again', j(s4.head && s4.head.signs))
await L.closeBoard(page)
const w0 = await D.readOne(w, 'edit', 'd6-1-tasking-before', SAT, /Tasking/)
console.log('TASKING WINDOW BEFORE', j(w0))
const other = (w0.people || []).find(x => x !== 'Ranger')
console.log('another listed man', other)
const otherId = other ? Object.keys(w.CS).find(k => w.CS[k] === other) : null
const lw0 = await lw('d6-2-before')
const lwOther0 = otherId ? await lw('d6-2-before-other', otherId) : null
console.log('LW BEFORE', j({ lw0, lwOther0 }))
const face0 = await D.face(w, 'd6-2-before', SAT)
const lg = await D.setLogic(w, 'openEnd', '2h', 'd6-3-logic-2h')
console.log('logic', j(lg))
const lw1 = await lw('d6-4-after-logic')
const face1 = await D.face(w, 'd6-4-after-logic', SAT)
const w1 = await D.readOne(w, 'edit', 'd6-4-tasking-after-logic', SAT, /Tasking/)
console.log('LW AFTER LOGIC', j({ lw1, face1, w1 }))
// a real change: a remark on the SDO desk, sign, publish the amendment
await L.board(page, SAT)
await X.typeIn(w, '[data-bfld="dr:5.0.0.rmks"]', 'D6 remark')
await sleep(500)
const pa = await D.pub(w, SAT)
console.log('AL published', j(pa.pressed), j(pa.head && { tag: pa.head.tag, pending: pa.head.pending }))
const lw2 = await lw('d6-5-after-amendment')
const lwOther2 = otherId ? await lw('d6-5-after-amendment-other', otherId) : null
const face2 = await D.face(w, 'd6-5-after-amendment', SAT)
const w2 = await D.readOne(w, 'edit', 'd6-5-tasking-after-amendment', SAT, /Tasking/)
console.log('LW AFTER AL', j({ lw2, lwOther2, face2, w2 }))
row(`D6-${P}`, 'RECORD', j({ w0, other, lw0, lwOther0, face0, lg, lw1, face1, w1, lw2, lwOther2, face2, w2 }))
D.finish(w, 'd6-' + KIND)
await w.browser.close()
