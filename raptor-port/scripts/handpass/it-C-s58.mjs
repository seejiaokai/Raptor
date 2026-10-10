import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger'), sb = await C.pid(p, 'Saber')
const SAT = '2026-07-18', SUN = '2026-07-19'
const pics = []
const snap = async () => p.evaluate(() => window.INPUTS.filter(x => /^[yns]58/.test(x.remarks)).map(x => ({ rmk: x.remarks, p: window.PEOPLE[x.person] ? window.PEOPLE[x.person].cs : x.person, title: x.title || null, oil: x.oil == null ? null : x.oil, date: x.date })).sort((a, b) => (a.rmk + a.p).localeCompare(b.rmk + b.p)))
const fig = async () => (await C.lwCells(w, [rg, sb], [SAT, SUN]))
/* fixtures: Y (Sat, answered yes), N (Sun, answered no), S (Sat shared Ranger+Saber, different answers) */
await C.fileNew(w, { iso: SAT, type: 'Event', person: rg, title: 'Alpha one', s: '08:00', e: '12:00', rmk: 'y58', oil: 'yes' })
await C.fileNew(w, { iso: SUN, type: 'Event', person: rg, title: 'Bravo one', s: '08:00', e: '12:00', rmk: 'n58', oil: 'no' })
await C.fileShared(w, { iso: SAT, type: 'Event', ids: [rg, sb], title: 'Charlie one', s: '13:00', e: '17:00', rmk: 's58', oil: 'yes' })
// Ranger changes his own answer on the shared one to No (his own "Change..." in the window)
await C.switchUser(w, 'us')
const srec = (await C.recAll(p, { remarks: 's58' })).find(r => r.person === rg)
await C.openSaved(w, SAT, srec.iid)
await C.press(w, p.locator('[data-testid="oil-revise-own"]')); await sleep(500)
await C.qAnswer(w, 'no'); await sleep(400)
await C.closeWins(p)
await C.switchUser(w, 'ad')
await C.openBoard(w, 5); const pubS = await C.publishOpenDay(w, 5); await C.closeBoard(p)
await C.openBoard(w, 6); const pubU = await C.publishOpenDay(w, 6); await C.closeBoard(p)
console.log('PUBLISHED', JSON.stringify([pubS, pubU]))
const base = await snap(); const baseFig = await fig()
console.log('BASE', JSON.stringify(base), JSON.stringify(baseFig))
const Y = (await C.recAll(p, { remarks: 'y58' }))[0], N = (await C.recAll(p, { remarks: 'n58' }))[0], S = await C.recAll(p, { remarks: 's58' })
const stages = []
const check = async (label, expectTitles) => {
  const s = await snap(), f = await fig()
  const same = JSON.stringify(s.map(x => [x.rmk, x.p, x.oil, x.date])) === JSON.stringify(base.map(x => [x.rmk, x.p, x.oil, x.date])) && JSON.stringify(f) === JSON.stringify(baseFig)
  const titles = s.map(x => x.rmk + ':' + x.p + ':' + x.title).join(' | ')
  stages.push({ label, same, titles })
  console.log(label, same, titles)
  return same
}
let asked = []
// window retitle (Y)
{ const r = await C.winRetitle(w, SAT, Y.iid, { title: 'Alpha two' }); asked.push(['window', r.asked]); await check('Y retitled in the window') }
await C.go(p, 'inputs'); pics.push(await C.pic(w, 's58-after-window'))
// pencil retitle (N)
{ const r = await C.pencilSave(w, N.iid, { title: 'Bravo two' }); asked.push(['pencil', r.asked]); await check('N retitled with the pencil') }
// shared editor retitle (S)
{ const r = await C.winRetitle(w, SAT, S[0].iid, { title: 'Charlie two' }); asked.push(['shared', r.asked]); await check('S retitled in the shared window') }
pics.push(await C.pic(w, 's58-after-shared'))
// undo x3, redo x3
const undos = []
for (let i = 0; i < 3; i++) { await C.go(p, 'inputs'); undos.push(await C.undoBtn(w, 'undo')); await check('after undo ' + (i + 1)) }
for (let i = 0; i < 3; i++) { await C.go(p, 'inputs'); undos.push(await C.undoBtn(w, 'redo')); await check('after redo ' + (i + 1)) }
// reload
await C.reload(w)
await check('after reload')
// a member (Ranger) retitles his own Yes / No inputs through window and pencil
await C.switchUser(w, 'us')
{ const r1 = await C.winRetitle(w, SAT, Y.iid, { title: 'Alpha three' }); const r2 = await C.pencilSave(w, N.iid, { title: 'Bravo three' }); asked.push(['member window', r1.asked], ['member pencil', r2.asked]) }
await C.switchUser(w, 'ad')
await check('after the member retitled his own two')
pics.push(await C.pic(w, 's58-final'))
const ok = stages.every(s => s.same) && asked.every(a => a[1] === false)
row(58, size, 'admin then member (Ranger)', ok ? 'PASS' : 'FAIL',
  `Fixtures (Sat 18 and Sun 19 Jul, both days then published: ${JSON.stringify([pubS.published, pubU.published])}): Sat Event Ranger answered Yes; Sun Event Ranger answered No; Sat shared Event Ranger+Saber (filer said Yes, Ranger then changed his own to No). Base answers ${JSON.stringify(base.map(x => x.rmk + ':' + x.p + '=' + JSON.stringify(x.oil)))}; Leave War cells ${JSON.stringify(baseFig)}. Title-only saves — question asked? ${JSON.stringify(asked)}. After each stage answers and Leave War cells unchanged: ${stages.map(s => s.label + '=' + s.same).join('; ')}. Undo/redo presses: ${JSON.stringify(undos)}. Final titles: ${stages[stages.length - 1].titles}`, pics)
await C.finish(w, 's58')
