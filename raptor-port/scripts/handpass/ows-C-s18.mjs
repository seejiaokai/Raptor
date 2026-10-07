/* walker C — S18: Undo, Redo and reload around publication. Flight 12:00–13:00, IN TIME 08:30 (390, FO). Sign + publish; Undo; Redo; reload.
   Then around an amendment that changes the report to 10:00 (300, HO). Every step reads the three downstream numbers and the day. */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, world, judge, row, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const ST = {}
const di = C.SATI, M = 'bane'
await C.expiryForever(p)
await L.go(p, 'editsched'); await sleep(400)
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: M })
const its = await C.inTime(p, di, w.wi, 'IN TIME 08:30')
await S.closeBoard(p)
async function snap(tag) {
  const d = await C.dayState(p, di, tag, { list: false })
  const o = await C.oilOf(p, M, SAT, tag, { sheet: true })
  const topUndo = await p.evaluate(() => { const u = document.querySelector('#undoBtn'), r = document.querySelector('#redoBtn'); return { undo: u ? (u.title || '') + (u.disabled ? ' (off)' : '') : 'none', redo: r ? (r.title || '') + (r.disabled ? ' (off)' : '') : 'none' } })
  return { d, o, topUndo, line: `tag "${d.head.tag}" chip "${d.head.pending}" · cell "${o.cell.text}" · tracker "${(o.row || '').slice(0, 130)}" · bal ${o.bal} · undo "${topUndo.undo}" redo "${topUndo.redo}"`, pics: [...d.pics, ...o.pics] }
}
const s0 = await snap('S18-0-unpub'); console.log('S0', s0.line)
const pub = await C.pubOrig(p, di)
const s1 = await snap('S18-1-published'); console.log('S1', s1.line)
await spyAndUndo('undo', 'S18-2')
async function spyAndUndo(dir, tag) {
  await S.closeBoard(p); await S.toWeek(p)
  await C.spyOn(p); await p.evaluate(() => { window.__w1toast = [] })
  const r = await W.door(p, 'top', dir)
  await sleep(500)
  const sp = await C.spoken(p)
  const s = await snap(tag)
  s.door = r; s.spoke = sp
  ST[tag] = s
  console.log(tag.toUpperCase(), JSON.stringify(r).slice(0, 200), JSON.stringify(sp), s.line)
}
const s2 = ST['S18-2']
await spyAndUndo('redo', 'S18-3'); const s3 = ST['S18-3']
await C.reloadAs(p, 'a'); await sleep(500)
const s4 = await snap('S18-4-reload'); console.log('S4', s4.line)
judge('S18.a', 'sign + Publish (ORIG) → Undo (top bar) → Redo → reload', [
  ['before: nothing on the Leave War (candidate only)', !/FO|HO/.test(s0.o.cell.text) && s0.d.head.tag !== 'ORIG', s0.line],
  ['published: FO, 08:30–15:00, balance B+1', s1.o.letters === 'FO' && /08:30.15:00/.test(s1.o.row) && s1.o.bal === '1', s1.line],
  ['Undo took the publication back: day not ORIG, no automatic FO on the war, balance back to 0 (RECORDED if the Undo did something else)', !/FO|HO/.test(s2.o.cell.text) && s2.d.head.tag !== 'ORIG' && s2.o.bal === '0', { door: s2.door, spoke: s2.spoke, line: s2.line }],
  ['Redo brought it back: ORIG, FO 08:30–15:00, balance 1', s3.d.head.tag === 'ORIG' && s3.o.letters === 'FO' && /08:30.15:00/.test(s3.o.row) && s3.o.bal === '1', { door: s3.door, spoke: s3.spoke, line: s3.line }],
  ['after a reload: the same as after Redo', s4.d.head.tag === s3.d.head.tag && s4.o.letters === s3.o.letters && s4.o.bal === s3.o.bal, s4.line],
], [...s1.pics, ...s2.pics, ...s3.pics, ...s4.pics])

/* around an amendment: report 08:30 → 10:00 (300, HO) */
await C.inTimeChange(p, di, w.wi, 0, 'IN TIME 10:00'); await S.closeBoard(p)
const am = await C.pubAL(p, di)
const t1 = await snap('S18-5-amended'); console.log('T1', t1.line)
await spyAndUndo('undo', 'S18-6'); const t2 = ST['S18-6']
await spyAndUndo('redo', 'S18-7'); const t3 = ST['S18-7']
await C.reloadAs(p, 'a'); await sleep(500)
const t4 = await snap('S18-8-reload'); console.log('T4', t4.line)
judge('S18.b', 'the in-time changed to 10:00 on the working copy, Publish AL → Undo → Redo → reload', [
  ['AL1: HO, 10:00–15:00, balance 0.5', /AL\s*1/.test(am.head.tag) && t1.o.letters === 'HO' && /10:00.15:00/.test(t1.o.row) && t1.o.bal === '0.5', t1.line],
  ['Undo: back to ORIG\'s FO 08:30–15:00, balance 1 (RECORDED if the Undo did something else)', t2.o.letters === 'FO' && /08:30.15:00/.test(t2.o.row) && t2.o.bal === '1', { door: t2.door, spoke: t2.spoke, line: t2.line }],
  ['Redo: HO 10:00–15:00, balance 0.5', t3.o.letters === 'HO' && /10:00.15:00/.test(t3.o.row) && t3.o.bal === '0.5', { door: t3.door, spoke: t3.spoke, line: t3.line }],
  ['reload: the same as after Redo', t4.o.letters === t3.o.letters && t4.o.bal === t3.o.bal && t4.d.head.tag === t3.d.head.tag, t4.line],
], [...t1.pics, ...t2.pics, ...t3.pics, ...t4.pics])
await C.finish(browser, errors, 'ows-C-s18')
