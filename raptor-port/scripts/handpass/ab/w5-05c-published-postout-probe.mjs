/* W5 — the probe behind ORDER 5's published-Friday pair (26 Sep 26): after Friday 17 Jul is published, a late leave for a
   man and a Post out from 15 Jul (archive on — the sheet's default), in both orders. Does the war still draw each man's row
   in July (he was in until 14 Jul) and show his 17 Jul leave with the PO tag (CURRENT-STATE item 13, answer C)?
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-05c-published-postout-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, rowRun, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`W5-05c-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-05c-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `w5-05c-${W}-${n}`
const FISO = '2026-07-17'
const arch = id => page.evaluate(p => !!(window.PEOPLE[p] || {}).archived, id)
const row = async id => { await lwOpen(page, FISO); return rowRun(page, id, ['2026-07-13', '2026-07-14', '2026-07-15', FISO]) }
async function postOut(id, tapIso, fromIso) {
  await lwOpen(page, tapIso)
  const t = await tapCell(page, id, tapIso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { done: false, why: 'opened ' + t.open } }
  await sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill(fromIso); await page.waitForTimeout(200)
  const archOn = (await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed')) === 'true'
  const p = await sheetPress(page, 'po-confirm')
  const after = await sheetNow(page)
  await closeSheets(page)
  return { done: p.pressed && after.open === 'nothing', archiveDefaultOn: archOn }
}
const [P1, P2] = await S.freeMen(page, [4])
const pub = await S.pubAndSign(page, 4)
R.note('cast', { P1, P2, published: pub.pub.p.pressed })
/* P1: file then post out */
const f1 = await fileInput(page, { person: P1, type: 'LL', from: FISO, remarks: 'W5 late leave, then posted out' })
const r1a = await row(P1)
const po1 = await postOut(P1, '2026-07-14', '2026-07-15')
const r1b = await row(P1)
await lwShot(page, pic('P1-after-file-then-postout'), P1, FISO)
R.note('P1', { filed: f1.added, beforePO: r1a, po: po1, afterPO: r1b, archived: await arch(P1) })
R.ck('P1-row-kept', !r1b.some(x => /NO CELL/.test(x)) && /LL/.test(r1b[3]) && /PO/.test(r1b[3]), 'file then post out: his July row still draws, 17 Jul LL with the PO tag', r1b)
/* P2: post out then file */
const po2 = await postOut(P2, '2026-07-14', '2026-07-15')
const r2a = await row(P2)
const f2 = await fileInput(page, { person: P2, type: 'LL', from: FISO, remarks: 'W5 posted out, then late leave' })
const r2b = await row(P2)
await lwShot(page, pic('P2-after-postout-then-file'), P2, FISO)
R.note('P2', { po: po2, afterPO: r2a, filed: f2.added, afterFile: r2b, archived: await arch(P2) })
R.ck('P2-row-kept', !r2b.some(x => /NO CELL/.test(x)) && /LL/.test(r2b[3]) && /PO/.test(r2b[3]), 'post out then file: his July row still draws, 17 Jul LL with the PO tag', r2b)
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
