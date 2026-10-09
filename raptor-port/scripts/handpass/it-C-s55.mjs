import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = [], out = {}
const lines = async (di) => (await C.warnAll(p, di)).filter(x => (x.who || []).includes(rg) || /Overseas|OD |Night|NIGHT|MONDAY|sm55|nw55|od55|EVENT/i.test(x.msg)).map(x => x.sev + '/' + x.code + ': ' + x.msg)

/* ---- part 1: all-day OD "Overseas visit" and a blank-time flying line on Friday ---- */
await C.openBoard(w, 4)
await C.tapBoard(p, '[data-wvadd="4"]'); await sleep(500)
await p.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
const clearF = async (fld) => { const l = p.locator(`#schedBoard [data-bfld="ff:4.0.0.${fld}"]:visible`).first(); await l.click(); await l.fill(''); await l.blur(); await sleep(350) }
await clearF('to'); await clearF('ld')
const line = await p.evaluate(() => { const f = window.DAYS[4].waves[0].formations[0]; return { to: f.to, ld: f.ld, label: window.DAYS[4].waves[0].label } })
await C.closeBoard(p)
// control: untitled OD all day, then Ranger onto the blank-time line
await C.fileNew(w, { iso: '2026-07-17', type: 'OD', person: rg, allday: true, rmk: 'od55' })
const OD = await C.recBy(p, { remarks: 'od55' })
await C.openBoard(w, 4)
const placed = await C.put(p, '[data-slot="4.0.0.0.p"]', [rg])
const ctl1 = await lines(4)
out.p1ctl = { line, placed, OD: { allday: OD.s == null, s: OD.s, e: OD.e }, ctl1 }
console.log('P1 control', JSON.stringify(out.p1ctl))
await C.closeBoard(p)
await C.winRetitle(w, '2026-07-17', OD.iid, { title: 'Overseas visit' })
await C.openBoard(w, 4)
const t1 = await lines(4)
const side1 = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x) && x !== '✕').slice(0, 8)
pics.push(await C.pic(w, 's55-od-titled-board'))
await C.closeBoard(p)
out.p1 = { t1, side1 }
console.log('P1 titled', JSON.stringify(out.p1))

/* ---- part 2: a timed overnight Event, Wed 15 23:00-02:00, and next-day work on Thu 16 01:00-01:30 ---- */
await C.openBoard(w, 3)
const slot = await C.addGroundRow(p, 3, 'NIGHT WORK', '01:00', '01:30', 'nw55')
const pr = await C.putMain(p, slot, rg)
await C.closeBoard(p)
const nrec = await C.fileNew(w, { iso: '2026-07-15', type: 'Event', person: rg, s: '23:00', e: '02:00', rmk: 'ne55' })
const NE = await C.recBy(p, { remarks: 'ne55' })
const ctl2 = { wed: await lines(2), thu: await lines(3), rec: { s: NE && NE.s, e: NE && NE.e, date: NE && NE.date, endDate: NE && NE.endDate } }
console.log('P2 control', JSON.stringify(ctl2), 'putrow', pr)
await C.winRetitle(w, '2026-07-15', NE.iid, { title: 'Night exercise' })
const t2 = { wed: await lines(2), thu: await lines(3) }
await C.openBoard(w, 3); const side2 = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x) && x !== '✕').slice(0, 8); pics.push(await C.pic(w, 's55-night-thu-board')); await C.closeBoard(p)
out.p2 = { ctl2, t2, side2 }
console.log('P2 titled', JSON.stringify(t2), JSON.stringify(side2))

/* ---- part 3: across Sunday -> Monday (the week boundary): Event Sun 19 23:00-02:00, work on Mon 20 01:00-01:30 ---- */
const f3 = await C.fileNew(w, { iso: '2026-07-19', type: 'Event', person: rg, s: '23:00', e: '02:00', rmk: 'sm55', oil: 'no' })
const SM = await C.recBy(p, { remarks: 'sm55' })
await C.weekTo(w, 'Jul 20')
await C.openBoard(w, 0)
const slot3 = await C.addGroundRow(p, 0, 'MONDAY NIGHT WORK', '01:00', '01:30', 'mw55')
const pr3 = await C.putMain(p, slot3, rg)
const mon = await lines(0)
const side3 = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x) && x !== '✕').slice(0, 8)
pics.push(await C.pic(w, 's55-sunmon-control-board'))
await C.closeBoard(p)
const ctl3 = { mon, side3, saved: f3, rec: SM && { s: SM.s, e: SM.e, date: SM.date, endDate: SM.endDate }, pr3 }
console.log('P3 control', JSON.stringify(ctl3))
await C.winRetitle(w, '2026-07-19', SM.iid, { title: 'Night exercise', oil: 'no' })
await C.weekTo(w, 'Jul 20')
await C.openBoard(w, 0)
const mon2 = await lines(0)
const side3b = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x) && x !== '✕').slice(0, 8)
pics.push(await C.pic(w, 's55-sunmon-titled-board'))
await C.closeBoard(p)
// the Sunday side (back to the first week)
await C.weekTo(w, 'Jul 13')
const sun = await lines(6)
out.p3 = { ctl3, mon2, side3b, sun }
console.log('P3 titled', JSON.stringify(out.p3))

const mentions = (arr, t) => arr.some(x => new RegExp(t, 'i').test(x))
const sig = a => a.map(x => x.split(':')[0]).sort().join(',')
const v1 = mentions(t1, 'Overseas visit') && sig(t1) === sig(ctl1)
const v2 = mentions(t2.thu.concat(t2.wed), 'Night exercise') && sig(t2.thu) === sig(ctl2.thu) && sig(t2.wed) === sig(ctl2.wed)
const v3 = mentions(mon2, 'Night exercise') && sig(mon2) === sig(mon)
row(55, size, 'admin', v1 && v2 && v3 ? 'PASS' : 'CHECK',
  `(1) All-day OD, Ranger put on a Friday flying line with take-off and landing blank (${JSON.stringify(line)}): untitled OD -> ${JSON.stringify(ctl1)}; titled "Overseas visit" -> ${JSON.stringify(t1)}. (2) Timed Event Wed 15 23:00-02:00 (saved ${JSON.stringify(ctl2.rec)}) with Ranger's typed row Thu 01:00-01:30: untitled -> Wed ${JSON.stringify(ctl2.wed)} Thu ${JSON.stringify(ctl2.thu)}; titled "Night exercise" -> Wed ${JSON.stringify(t2.wed)} Thu ${JSON.stringify(t2.thu)}. (3) Sunday 19 23:00-02:00 with Monday 20 01:00-01:30 (next week): untitled Monday -> ${JSON.stringify(mon)}; titled -> ${JSON.stringify(mon2)}; Sunday side titled -> ${JSON.stringify(sun)}`, pics)
await C.finish(w, 's55')
