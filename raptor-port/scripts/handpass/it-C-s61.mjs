import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const men = [rg, await C.pid(p, 'Ace'), await C.pid(p, 'Blade'), await C.pid(p, 'Cinch')]
const SAT = '2026-07-18'
const pics = []
await C.fileNew(w, { iso: SAT, type: 'Event', person: rg, title: 'Weekend exercise', s: '08:00', e: '12:00', rmk: 'n61', oil: 'yes' })
await C.fileNew(w, { iso: SAT, type: 'Event', person: 'allavail', title: 'Weekend crowd', s: '13:00', e: '17:00', rmk: 'a61', oil: 'yes' })
const N = (await C.recAll(p, { remarks: 'n61' }))[0], A = (await C.recAll(p, { remarks: 'a61' }))[0]
await C.openBoard(w, 5)
const pub = await C.publishOpenDay(w, 5)
await C.closeBoard(p)
const cells0 = (await C.lwCells(w, men, [SAT]))[SAT]
await C.go(p, 'editsched')
const names0 = { edit: await C.weekNames(p, '#eWeek', 5), pend: await C.pendChip(p, 5) }
console.log('PUBLISHED', JSON.stringify(pub), JSON.stringify(cells0), JSON.stringify(names0))
// retitle both
await C.winRetitle(w, SAT, N.iid, { title: 'Games afternoon' })
await C.winRetitle(w, SAT, A.iid, { title: 'Games crowd' })
const cells1 = (await C.lwCells(w, men, [SAT]))[SAT]
await C.go(p, 'editsched')
const edit1 = await C.weekNames(p, '#eWeek', 5), pend1 = await C.pendChip(p, 5)
const pl = await C.pendListText(w, 5)
pics.push(pl.pic)
await C.go(p, 'viewsched'); const view1 = await C.weekNames(p, '#vWeek', 5)
await C.go(p, 'editsched'); pics.push(await C.pic(w, 's61-edit-pending'))
console.log('PENDING', JSON.stringify(cells1), JSON.stringify({ edit1, pend1, view1, pl: pl.text }))
// sign + publish the amendment
await C.openBoard(w, 5)
const pub2 = await C.publishOpenDay(w, 5)
await C.closeBoard(p)
const cells2 = (await C.lwCells(w, men, [SAT]))[SAT]
await C.go(p, 'editsched')
const edit2 = await C.weekNames(p, '#eWeek', 5), pend2 = await C.pendChip(p, 5)
await C.go(p, 'viewsched'); const view2 = await C.weekNames(p, '#vWeek', 5)
await C.go(p, 'editsched'); pics.push(await C.pic(w, 's61-after-AL'))
console.log('AFTER AL', JSON.stringify(pub2), JSON.stringify(cells2), JSON.stringify({ edit2, pend2, view2 }))
const same = JSON.stringify(cells0) === JSON.stringify(cells1) && JSON.stringify(cells1) === JSON.stringify(cells2)
const okNames = edit1.some(x => /GAMES AFTERNOON/.test(x)) && view1.some(x => /WEEKEND EXERCISE/.test(x)) && view2.some(x => /GAMES AFTERNOON/.test(x)) && view2.some(x => /GAMES CROWD/.test(x))
row(61, size, 'admin', pub.published && pub2.published && same && okNames ? 'PASS' : 'CHECK',
  `Sat 18 Jul: Ranger Event "Weekend exercise" + ALL AVAIL Event "Weekend crowd", both answered Yes, day published (${pub.version}). Leave War figures for Ranger and three ALL AVAIL men (Ace, Blade, Cinch) — published ${JSON.stringify(cells0)}; after retitling both (pending) ${JSON.stringify(cells1)}; after the amendment published (${pub2.published ? pub2.kind + ' ' + pub2.version : pub2.why}) ${JSON.stringify(cells2)}; identical: ${same}. Edit Schedule rows: published ${JSON.stringify(names0.edit)} -> retitled ${JSON.stringify(edit1)} (pending chip "${pend1}") -> after AL ${JSON.stringify(edit2)} (chip "${pend2}"). View-only: while pending ${JSON.stringify(view1)}; after AL ${JSON.stringify(view2)}. To go out: "${pl.text}"`, pics)
await C.finish(w, 's61')
