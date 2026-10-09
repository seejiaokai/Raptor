import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const order = process.argv[2] || '1'   // 1: hand-written row first; 2: the Training input first
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = []
const DI = 4, ISO = '2026-07-17'
const handRow = async () => {
  await C.openBoard(w, DI)
  const slot = await C.addGroundRow(p, DI, 'MEETING', '10:00', '11:00', 'hw54')
  const r = await C.putMain(p, slot, rg)
  await C.closeBoard(p)
  return { slot, r }
}
const training = () => C.fileNew(w, { iso: ISO, type: 'Training', person: rg, title: 'Meeting', s: '10:00', e: '11:00', rmk: 't54' })
const read = async (label) => {
  const all = (await C.warnAll(p, DI)).filter(x => x.code !== 'CREW_REST')
  await C.openBoard(w, DI)
  const side = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x) && !/^✕$/.test(x)).slice(0, 8)
  const names = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="gr:4."][data-bfld$=".prog"]')].map(x => (x.value || x.textContent || '').trim()))
  const hw = await p.evaluate(() => { const t = [...document.querySelectorAll('#schedBoard textarea[data-bfld$=".rmks"]')].find(x => x.value === 'hw54'); const r = t && t.closest('.sb-arow'); return r ? [...r.querySelectorAll('.puck')].map(x => x.dataset.person).join(',') : null })
  await C.closeBoard(p)
  return { label, all: all.map(x => `${x.sev}/${x.code}: ${x.msg}`), side, names, hwPucks: hw }
}
let hand, R
if (order === '1') { hand = await handRow(); await training() } else { await training(); hand = await handRow() }
R = await C.recBy(p, { remarks: 't54' })
const s1 = await read('both present'); console.log(JSON.stringify(s1))
await C.openBoard(w, DI); pics.push(await C.pic(w, `s54-o${order}-board`)); await C.closeBoard(p)
await C.winRetitle(w, ISO, R.iid, { title: 'Renamed away' })
const s2 = await read('request renamed away'); console.log(JSON.stringify(s2))
await C.winRetitle(w, ISO, R.iid, { title: 'Meeting' })
const s3 = await read('request renamed back to Meeting'); console.log(JSON.stringify(s3))
await C.openBoard(w, DI); pics.push(await C.pic(w, `s54-o${order}-board-back`)); await C.closeBoard(p)
const has = (s, re) => s.all.some(x => re.test(x))
const clash = /hard\/DOUBLE_BOOK: MEETING & MEETING clash|hard\/DOUBLE_BOOK/
const two = /two items called MEETING at once/i
const ok = hand.r === rg && has(s1, clash) && has(s1, two) && s1.hwPucks && s1.hwPucks.includes(rg) && !has(s2, two) && has(s3, clash) && has(s3, two)
row(54, size, 'admin', ok ? 'PASS' : 'FAIL',
  `[order ${order === '1' ? 'hand-written row first, then Training request' : 'Training request first, then the hand-written row'}] Friday 17 Jul 10:00-11:00, Ranger on a typed Ground Programme row "MEETING" (seated: ${hand.r === rg}) and on Training titled "Meeting". Both present: ${JSON.stringify(s1.all)}; board name boxes ${JSON.stringify(s1.names)}; typed row's people ${s1.hwPucks}. Request renamed "Renamed away": ${JSON.stringify(s2.all)}. Renamed back "Meeting": ${JSON.stringify(s3.all)}; board list ${JSON.stringify(s3.side)}`, pics)
await C.finish(w, 's54-o' + order)
