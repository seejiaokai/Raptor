/* W5 RE-WALK (26 Sep 26) — the rebuilt app still loses a freshly posted-out man's row in rw-w5-05's world (its published
   Friday pair, after the Cobra and Gambit steps and a reload), though w5-05d's V2 trigger (another man's "Undo post out")
   no longer does it. Which earlier step does? Fresh worlds, each: [a prefix] → the P-step (Friday 17 Jul published and
   signed, LL Fri for a free man, Post out from 15 Jul through the bid sheet, archive on — the default) → is his July row
   still drawn (13–14 Jul he was in)?
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w5-05e-vanish-bisect.mjs [T1|T2|…] */
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, fileInput, shot, toastSpy, resultBook, ROOT, rowRun } = L
const R = resultBook('RW-W5-05e', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-05e.txt`)
const FISO = '2026-07-17', JUL = ['2026-07-13', '2026-07-14', '2026-07-15', FISO]

async function pStep(page, tag, { publish = true, who = null, counts = false } = {}) {
  const [P1] = who ? [who] : await S.freeMen(page, [4])
  if (publish) await S.pubAndSign(page, 4)
  await fileInput(page, { person: P1, type: 'LL', from: FISO, remarks: 'W5 rewalk ' + tag })
  /* rw-w5-05's P-step reads every pending count between the filing and the Post out (the week, the ⓘ panels, the
     Amendments panel, the board) — T9/T10 ask whether that is the trigger */
  if (counts) await S.counts(page, 4)
  const po = await Q.postOutBid(page, P1, '2026-07-14', '2026-07-15', true)
  await lwOpen(page, FISO)
  const r = await rowRun(page, P1, JUL)
  await L.lwShot(page, `rw-w5-05e-${tag}`, P1, FISO)
  const st = await page.evaluate(p => { const x = window.PEOPLE[p] || {}; return { archived: !!x.archived, archivedBy: x.archivedBy || '' } }, P1)
  return { P1, po, r, st }
}
async function world(tag, prefix, opts) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
  await toastSpy(page)
  let t
  try { t = await prefix(page) } catch (e) { t = 'THREW ' + String(e.message || e).slice(0, 200) }
  const p = await pStep(page, tag, opts)
  R.ck(tag, !p.r.some(x => /NO CELL/.test(x)) && /PO/.test(p.r[3]), `${tag}: the posted-out man's July row is still drawn, 17 Jul LL with the PO tag`, { prefix: t, ...p, errors: errors.slice(0, 5) })
  await browser.close()
}
const cobraA = async (page) => {
  /* rw-w5-05's A: Cobra posted out from 1 Aug, LL 10–11 Sep, Place-instead LL on 14 Sep, the war's Undo + Redo,
     the posting sheet's "Undo post out", the war's Undo + Redo */
  await fileInput(page, { person: 'taipan', type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 clearing leave' })
  await Q.postOutBid(page, 'taipan', '2026-07-28', '2026-08-01', true)
  await lwOpen(page, '2026-09-14')
  const t = await tapCell(page, 'taipan', '2026-09-14')
  if (t.open === 'postout-sheet') { await sheetPress(page, 'postout-place'); await sheetPress(page, 'bid-LL'); const s = await L.sheetNow(page); if (/Tap the same leave again/i.test(s.text || '')) await sheetPress(page, 'bid-LL') }
  await closeSheets(page)
  await X.undo(page); await X.redo(page)
  const u = await Q.postingSheet(page, 'taipan', '2026-09-15', { undo: true })
  await lwOpen(page, '2026-09-10'); await X.undo(page); await X.redo(page)
  return { undo: u.undo }
}
const gambitB = async (page) => {
  await fileInput(page, { person: 'bruise', type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 leave before the PO' })
  return Q.postOutBid(page, 'bruise', '2026-07-28', '2026-08-01', true)
}
const poThenLeave = async (page) => {
  const po = await Q.postOutBid(page, 'taipan', '2026-07-28', '2026-08-01', true)
  const f = await fileInput(page, { person: 'taipan', type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 clearing leave after PO' })
  return { po: po.done, filed: f.added }
}
const reload = async (page) => { await fileInput(page, { person: 'bane', type: 'LL', from: '2026-08-20', remarks: 'W5 a write first' }); return X.reload(page, 'a') }
const only = process.argv[2]
const V = {
  T0: [async () => 'none', {}],                                                       // control (= 05c)
  T1: [cobraA, {}],                                                                   // A only
  T2: [async (p) => ({ b: await gambitB(p), rl: await X.reload(p, 'a') }), {}],       // B + reload
  T3: [reload, {}],                                                                   // reload only
  T4: [gambitB, {}],                                                                  // B, no reload
  T5: [async (p) => ({ b: await gambitB(p), rl: await X.reload(p, 'a') }), { publish: false }],   // B + reload, no publish
  T6: [async (p) => ({ a: await cobraA(p), b: await gambitB(p), rl: await X.reload(p, 'a') }), {}],   // A + B + reload
  T7: [async (p) => ({ a: await cobraA(p), b: await gambitB(p) }), {}],                              // A + B
  T8: [async (p) => ({ a: await cobraA(p), rl: await X.reload(p, 'a') }), {}],                       // A + reload
  T9: [async () => 'none', { counts: true }],                                                         // the counts read between file and PO
  T10: [async () => 'none', { counts: true, publish: false }],                                        // the same, nothing published
  T11: [gambitB, { counts: true }],                                                                   // B + the counts read
  T12: [async (p) => Q.postOutBid(p, 'taipan', '2026-07-28', '2026-08-01', true), { counts: true }],  // a bare Post out + the counts read
  T13: [async (p) => Q.postOutBid(p, 'taipan', '2026-07-28', '2026-08-01', true), { counts: true, publish: false }],  // the same, nothing published
  T14: [poThenLeave, {}],                                                                             // rw-w5-05's A1 order: Post out, THEN leave after it
  T15: [poThenLeave, { publish: false }],                                                             // the same, nothing published
  T16: [async (p) => { const r = await poThenLeave(p); await lwOpen(p, '2026-09-10'); return r }, {}], // … and the war left on September
  T17: [async (p) => { await lwOpen(p, '2026-09-10'); return poThenLeave(p) }, {}],                   // the war FIRST opened on September, then A1
  T18: [async (p) => { await lwOpen(p, '2026-09-10'); return Q.postOutBid(p, 'taipan', '2026-07-28', '2026-08-01', true) }, {}],  // September first, a bare Post out
  T19: [async (p) => { await lwOpen(p, '2026-09-10'); return 'war opened on Sep, nothing else' }, {}],  // September first, nothing else
}
for (const [k, [pre, o]] of Object.entries(V)) if (!only || only.split(',').includes(k)) await world(k, pre, o)
R.save()
