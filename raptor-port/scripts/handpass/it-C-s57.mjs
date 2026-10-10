import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const who = process.argv[3] || 'ad'
const role = who === 'ad' ? 'admin (Saber)' : 'member filer (Ranger)'
const w = await C.world(size, who, { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger'), sb = await C.pid(p, 'Saber')
const SAT = '2026-07-25', FRI = '2026-07-24'
const T = 'Weekend exercise'
const results = []

const cur = async tag => (await p.evaluate(t => window.INPUTS.filter(x => (x.remarks || '').startsWith(t)).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, oil: r.oil })), tag))

/* a door: open(): bring the filing up to the pressing; press(): the save press; after cancel + answer check the record */
async function door(name, tag, { prepare, open, press: pr, existing = false, expectPeople = 'Ranger', shared = false }) {
  const rec = { door: name, tag }
  try {
    if (prepare) await prepare()
    await open()
    const before = await cur(tag)
    await pr()
    if (!(await C.qWait(p, 2500))) { rec.noQuestion = true; rec.pic = await C.pic(w, `s57-${who}-${tag}-noquestion`); results.push(rec); await C.closeWins(p); return }
    const q = await C.qRead(p); rec.q = q
    rec.pic = await C.pic(w, `s57-${who}-${tag}-question`)
    await C.qCancel(w)
    const mid = await cur(tag)
    rec.afterCancel = existing ? mid.map(r => r.date + '/' + r.title) : mid.length
    rec.cancelWrote = existing ? JSON.stringify(mid.map(r => r.date)) !== JSON.stringify(before.map(r => r.date)) : mid.length > 0
    await pr()
    rec.askedAgain = await C.qWait(p, 2500)
    if (rec.askedAgain) await C.qAnswer(w, 'yes')
    await sleep(300)
    await C.closeWins(p)
    const fin = await cur(tag)
    rec.final = fin.map(r => ({ p: r.person === rg ? 'Ranger' : r.person === sb ? 'Saber' : r.person, date: r.date, title: r.title, oil: r.oil }))
  } catch (e) { rec.error = String(e.message).split('\n')[0]; rec.pic = await C.pic(w, `s57-${who}-${tag}-error`) }
  results.push(rec); console.log(JSON.stringify(rec).slice(0, 700))
}

// A. Calendar Add
await door('Calendar Add (window)', 'da57', {
  open: async () => { await C.openNew(w, SAT); await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', rg); await C.setTimes(p, '08:00', '12:00'); await p.fill('input#inpEditTitle', T); await p.fill('#inpEditRmk', 'da57') },
  press: async () => { await C.press(w, p.locator('#inpEditSave')); await sleep(300) },
})
// B. List Add
await door('List Add form', 'db57', {
  open: async () => { await C.listForm(w, { person: rg, type: 'Event', title: T, rmk: 'db57', iso: SAT, s: '08:00', e: '12:00' }) },
  press: async () => { await C.listAddPress(w) },
})
// C. Board Add (admin only)
if (who === 'ad') await door('Board Add (+ INPUTS)', 'dc57', {
  open: async () => { await C.weekTo(w, 'Jul 20'); await C.boardAddOpen(w, 5); await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', rg); await C.setTimes(p, '08:00', '12:00'); await p.fill('input#inpEditTitle', T); await p.fill('#inpEditRmk', 'dc57') },
  press: async () => { await C.press(w, p.locator('#inpEditSave')); await sleep(300) },
})
// D. Shared Add, Calendar window
await door('Shared Add (Calendar window, Several people)', 'dd57', {
  open: async () => { await C.openNew(w, SAT); await p.selectOption('#inpEditType', 'Event'); await C.severalPick(w, [rg, sb]); await C.setTimes(p, '08:00', '12:00'); await p.fill('input#inpEditTitle', T); await p.fill('#inpEditRmk', 'dd57') },
  press: async () => { await C.press(w, p.locator('#inpEditSave')); await sleep(300) },
})
// E. Shared Add, List form
await door('Shared Add (List form, Several people)', 'de57', {
  open: async () => { await C.listForm(w, { ids: [rg, sb], type: 'Event', title: T, rmk: 'de57', iso: SAT, s: '08:00', e: '12:00' }) },
  press: async () => { await C.listAddPress(w) },
})
// F. List pencil: a weekday entry moved to Saturday
await C.fileNew(w, { iso: FRI, type: 'Event', person: rg, title: T, s: '08:00', e: '12:00', rmk: 'df57' })
const DF = await C.recBy(p, { remarks: 'df57' })
await door('List pencil (date Fri 24 -> Sat 25)', 'df57', {
  existing: true,
  open: async () => { await C.pencil(w, DF.iid); await C.press(w, p.locator('#inedCal [data-cal="2026-07-25"]').first()); await sleep(150); await C.press(w, p.locator('#inedCal [data-cal="2026-07-25"]').first()); await sleep(200) },
  press: async () => { await C.press(w, p.locator('#inBody tr.ined [data-save]')); await sleep(400) },
})
// G. existing window, shared weekday entry, dates changed in the window
await C.fileShared(w, { iso: FRI, type: 'Event', ids: [rg, sb], title: T, s: '08:00', e: '12:00', rmk: 'dg57' })
const DG = (await C.recAll(p, { remarks: 'dg57' }))[0]
await door('Existing window (shared entry, date Fri 24 -> Sat 25)', 'dg57', {
  existing: true,
  open: async () => { await C.openSaved(w, FRI, DG.iid); const d = C.win(p).locator('[data-cal="2026-07-25"]').first(); await d.scrollIntoViewIfNeeded().catch(() => {}); await C.press(w, d); await sleep(300) },
  press: async () => { await C.press(w, p.locator('#inpEditSave')); await sleep(400) },
})
const clean = h => h
const good = r => r.q && r.q.head.includes(T) && r.q.ho && r.cancelWrote === false && r.askedAgain && r.final && r.final.length >= 1 && r.final.every(x => x.title === T && x.date === 'Jul 25')
const lines = results.map(r => `${r.door}: ${r.error ? 'ERROR ' + r.error : r.noQuestion ? 'NO QUESTION ASKED' : `heading "${r.q.head}"; HO offered ${r.q.ho}; buttons ${JSON.stringify(r.q.btns)}; Cancel wrote ${r.cancelWrote}; asked again ${r.askedAgain}; saved ${JSON.stringify(r.final)}`}`)
const bad = results.filter(r => !good(r)).map(r => r.door)
row(57, size, role, bad.length === 0 ? 'PASS' : 'FAIL', lines.join(' || ') + (bad.length ? ` || NOT MATCHING: ${bad.join(', ')}` : ''), results.map(r => r.pic).filter(Boolean))
await C.finish(w, `s57-${size}-${who}`)
