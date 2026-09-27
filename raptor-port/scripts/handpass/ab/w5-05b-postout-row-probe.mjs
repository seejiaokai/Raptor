/* W5 — the probe behind ORDER 5's two surprises (26 Sep 26): after a Post out WITH "Archive on PO date",
   (1) does the man's row still draw in the months he was IN the squadron and in the month his leave sits after the PO?
   (2) does the posting sheet's own "Undo post out (PO)" take back the archive the same Post out made, so his row (and the
       leave on it) comes back?
   Rules: CURRENT-STATE item 13 (the row stretches to reach his records; display only), answer C / N8 (leave after the PO is
   held, shown and charged), the posting sheet's Undo reverses the posting. Reads of window.PEOPLE are for the table only.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-05b-postout-row-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, lwShot, rowRun, go } = L
const PHONE = W === 'phone'
const R = resultBook(`W5-05b-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-05b-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `w5-05b-${W}-${n}`
const person = id => page.evaluate(p => { const x = window.PEOPLE[p] || {}; return { cs: x.cs, archived: !!x.archived, arch: x.arch, po: x.postOut || x.po || x.poFrom || null, keys: Object.keys(x).filter(k => /arch|post|po|join|pi/i.test(k)).map(k => `${k}=${JSON.stringify(x[k])}`) } }, id)
const drawn = async (id, iso) => { await lwOpen(page, iso); return (await rowRun(page, id, [iso]))[0] }
async function postOut(id, tapIso, fromIso, archive) {
  await lwOpen(page, tapIso)
  const t = await tapCell(page, id, tapIso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { done: false, why: 'opened ' + t.open } }
  await sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill(fromIso); await page.waitForTimeout(200)
  const arch = page.locator('[data-testid="po-archive"]')
  const on = (await arch.getAttribute('aria-pressed')) === 'true'
  if (on !== archive) { await arch.click(); await page.waitForTimeout(150) }
  const p = await sheetPress(page, 'po-confirm')
  const after = await sheetNow(page)
  await closeSheets(page)
  return { done: p.pressed && after.open === 'nothing', archiveDefault: on }
}

/* (1) Drifter (slipway): LL Fri 17 Jul, then Post out from 15 Jul, archive ON */
const D = 'slipway'
const f = await fileInput(page, { person: D, type: 'LL', from: '2026-07-17', remarks: 'W5 probe leave' })
const before = { jun: await drawn(D, '2026-06-15'), jul14: await drawn(D, '2026-07-14'), jul17: await drawn(D, '2026-07-17'), p: await person(D) }
const po = await postOut(D, '2026-07-10', '2026-07-15', true)
const after = { jun: await drawn(D, '2026-06-15'), jul14: await drawn(D, '2026-07-14'), jul17: await drawn(D, '2026-07-17'), p: await person(D) }
await lwOpen(page, '2026-07-14'); await shot(page, pic('1-drifter-after-po-archive-on'))
R.note('1-drifter', { filed: f.added, po, before, after })
R.ck('1-row-kept-in-his-months', !/NO CELL/.test(after.jul14) && !/NO CELL/.test(after.jun) && /LL/.test(after.jul17),
  'after Post out from 15 Jul (archive on), Drifter\'s row still draws in June and on 14 Jul (he was in), and 17 Jul shows his LL with the PO tag', after)

/* (2) the same with archive OFF, for Hunter (prowler) */
const H = 'prowler'
const f2 = await fileInput(page, { person: H, type: 'LL', from: '2026-07-17', remarks: 'W5 probe leave' })
const po2 = await postOut(H, '2026-07-10', '2026-07-15', false)
const after2 = { jun: await drawn(H, '2026-06-15'), jul14: await drawn(H, '2026-07-14'), jul17: await drawn(H, '2026-07-17'), p: await person(H) }
R.note('2-hunter-archive-off', { filed: f2.added, po: po2, after: after2 })
R.ck('2-row-kept-archive-off', !/NO CELL/.test(after2.jul14) && /LL/.test(after2.jul17), 'with archive OFF the row draws in his months and 17 Jul shows LL with the PO tag', after2)

/* (3) Undo post out on Drifter (archive ON): the posting AND the archive it made should go, the row back */
let u = { pressed: false }
if (!/NO CELL/.test(after.jul17)) {
  await lwOpen(page, '2026-07-20')
  const t = await tapCell(page, D, '2026-07-20')
  if (t.open === 'postout-sheet') u = await sheetPress(page, 'postout-undo')
  await closeSheets(page)
} else {
  /* the row is not drawn — the only door left is Quals (restore from the archive) — record, do not work around */
  u = { pressed: false, why: 'no row to tap — the posting sheet cannot be reached' }
}
const after3 = { jun: await drawn(D, '2026-06-15'), jul14: await drawn(D, '2026-07-14'), jul17: await drawn(D, '2026-07-17'), p: await person(D) }
await lwOpen(page, '2026-07-17'); await shot(page, pic('3-drifter-after-undo-postout'))
R.note('3-undo-postout', { undo: u, after: after3 })

/* (4) Cobra (taipan): leave 10–11 Sep, Post out from 1 Aug archive ON, then Undo post out */
const C = 'taipan'
await fileInput(page, { person: C, type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 probe clearing leave' })
const po4 = await postOut(C, '2026-07-28', '2026-08-01', true)
const mid4 = { jul: await drawn(C, '2026-07-28'), aug: await drawn(C, '2026-08-05'), sep: await drawn(C, '2026-09-10'), p: await person(C) }
await lwOpen(page, '2026-09-14')
const t4 = await tapCell(page, C, '2026-09-14')
let u4 = { pressed: false, why: 'opened ' + t4.open }
if (t4.open === 'postout-sheet') u4 = await sheetPress(page, 'postout-undo')
await closeSheets(page)
const after4 = { jul: await drawn(C, '2026-07-28'), aug: await drawn(C, '2026-08-05'), sep: await drawn(C, '2026-09-10'), p: await person(C) }
await lwOpen(page, '2026-09-10'); await shot(page, pic('4-cobra-after-undo-postout-sep'))
await lwOpen(page, '2026-07-28'); await shot(page, pic('4-cobra-after-undo-postout-jul'))
R.note('4-cobra', { po: po4, mid: mid4, undo: u4.pressed, after: after4 })
R.ck('4-undo-postout-restores', u4.pressed && !/NO CELL/.test(after4.jul) && /LL/.test(after4.sep) && !after4.p.archived,
  '"Undo post out (PO)" takes the posting AND its archive back: Cobra\'s row draws again in July and his September leave shows (no PO tag)', after4)
/* Quals: where is he listed now? */
await go(page, 'quals'); await page.waitForTimeout(600)
const q = await page.evaluate(cs => { const t = document.body.innerText; const i = t.indexOf(cs); return i >= 0 ? t.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' ') : 'NOT ON THE QUALS PAGE' }, 'Cobra')
R.note('4-cobra-on-quals', q)
await shot(page, pic('4-quals-after-undo'))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
