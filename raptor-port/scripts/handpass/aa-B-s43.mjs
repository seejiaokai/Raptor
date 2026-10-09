import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, availSet, warnLines, typeIfld, closeWin, savePart } from './aa-B-lib.mjs'
import { openInputs } from './lib.mjs'
const P = 'dice'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's43'
const { page } = w
const d = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S43duty', s: '09:00', e: '12:00', oil: 'no' })
const ev = await fileInput(page, { iso: '2026-07-18', kind: 'Event', person: P, rmk: 'S43ev', s: '10:00', e: '11:00', oil: 'no' })
say('filed duty', JSON.stringify(d.rec), 'event', JSON.stringify(ev.rec))
await openBoard(page, 5)
const crowd = async (label, iid, nth = 0) => {
  await openCount(page, iid, nth); await tabTo(page, 'avail')
  const a = await availSet(page); const r = { n: a.ids.length, P: a.ids.includes(P), tab: a.tabs[0] }; say(label, JSON.stringify(r)); out[label] = r; return a
}
const cnt = async (iid) => (await page.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]`).first().innerText())
say('count shown on duty row', await cnt(d.rec.iid))
await crowd('duty crowd with P on named Event 10-11', d.rec.iid); await pic(w, 'crowd-busy'); await closeWin(page)
await openInputs(page, 5)
await typeIfld(page, ev.rec.iid, 'str', '13:00'); await typeIfld(page, ev.rec.iid, 'end', '14:00')
say('event moved to', await page.evaluate(i => { const x = window.INPUTS.find(v => v.iid === i); return x.s + '-' + x.e }, ev.rec.iid))
say('count shown on duty row after move', await cnt(d.rec.iid))
await crowd('duty crowd with Event moved to 13-14', d.rec.iid); await pic(w, 'crowd-free'); await closeWin(page)
await typeIfld(page, ev.rec.iid, 'str', '10:00'); await typeIfld(page, ev.rec.iid, 'end', '11:00')
await crowd('duty crowd with Event back on 10-11', d.rec.iid); await closeWin(page)
const before = await warnLines(page); say('warnings before placeholder Event', JSON.stringify(before))
// a placeholder Event overlapping
const pe = await fileInput(page, { iso: '2026-07-18', kind: 'Event', person: 'allavail', rmk: 'S43pev', s: '10:00', e: '11:00', oil: 'no' })
say('placeholder event', JSON.stringify(pe.rec))
await openBoard(page, 5)
say('counts: duty', await cnt(d.rec.iid), 'placeholder event', await cnt(pe.rec.iid))
await crowd('duty crowd with a placeholder Event overlapping', d.rec.iid); await pic(w, 'duty-crowd-after-pev'); await closeWin(page)
await crowd('placeholder Event crowd', pe.rec.iid); await pic(w, 'pev-crowd'); await closeWin(page)
out.warnAfter = await warnLines(page); say('warnings after', JSON.stringify(out.warnAfter))
await pic(w, 'warnings')
out.warnBefore = before
out.errors = w.errors
await w.browser.close()
savePart('s43-run', { out, log })
