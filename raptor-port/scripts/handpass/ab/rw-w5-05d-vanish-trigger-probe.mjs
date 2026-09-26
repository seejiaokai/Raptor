/* W5 — which earlier step makes a freshly posted-out man's row VANISH from the war (seen in w5-05's world, not in a fresh
   one — w5-05c)? Three fresh worlds, each: [a trigger] → file LL 17 Jul for Drifter → Post out Drifter from 15 Jul (archive
   on, the sheet's default) → is his July row drawn?  V0 no trigger (control) · V1 a reload first · V2 a Post out + the posting
   sheet's "Undo post out (PO)" on another man first.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-05d-vanish-trigger-probe.mjs */
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, rowRun } = L
const R = resultBook('RW-W5-05d', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-05d.txt`)
const JUL = ['2026-07-13', '2026-07-14', '2026-07-17']
async function postOut(page, id, tapIso, fromIso) {
  await lwOpen(page, tapIso)
  const t = await tapCell(page, id, tapIso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { done: false, why: 'opened ' + t.open } }
  await sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill(fromIso); await page.waitForTimeout(200)
  const p = await sheetPress(page, 'po-confirm')
  const after = await sheetNow(page)
  await closeSheets(page)
  return { done: p.pressed && after.open === 'nothing' }
}
async function world(tag, trigger) {
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
  await toastSpy(page)
  const t = await trigger(page)
  await fileInput(page, { person: 'slipway', type: 'LL', from: '2026-07-17', remarks: 'W5 ' + tag })
  const po = await postOut(page, 'slipway', '2026-07-10', '2026-07-15')
  await lwOpen(page, '2026-07-17')
  let r = await rowRun(page, 'slipway', JUL)
  await shot(page, `rw-w5-05d-${tag}`)
  if (tag.startsWith('V4')) { const rl = await X.reload(page, 'a'); await lwOpen(page, '2026-07-17'); const r2 = await rowRun(page, 'slipway', JUL); await shot(page, `rw-w5-05d-${tag}-after-reload`); R.note(tag + '-before-reload', r); r = r2 }
  R.ck(tag, !r.some(x => /NO CELL/.test(x)), `${tag}: Drifter's July row is still drawn after his Post out`, { trigger: t, po, row: r, errors: errors.slice(0, 5) })
  await browser.close()
}
async function cobraOutAndUndo(page) {
  await fileInput(page, { person: 'taipan', type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 clearing leave' })
  const po = await postOut(page, 'taipan', '2026-07-28', '2026-08-01')
  await lwOpen(page, '2026-09-14')
  const t = await tapCell(page, 'taipan', '2026-09-14')
  const u = t.open === 'postout-sheet' ? await sheetPress(page, 'postout-undo') : { pressed: false, why: t.open }
  await closeSheets(page)
  return { po, undo: u.pressed, why: u.why }
}
const only = process.argv[2]
if (!only || only === 'V0') await world('V0-control', async () => 'none')
if (!only || only === 'V1') await world('V1-after-reload', async (page) => { await fileInput(page, { person: 'bane', type: 'LL', from: '2026-08-20', remarks: 'W5 a write first' }); return X.reload(page, 'a') })
if (!only || only === 'V2') await world('V2-after-undo-postout-of-another', cobraOutAndUndo)
if (!only || only === 'V3') await world('V3-another-man-posted-out-kept', async (page) => {
  await fileInput(page, { person: 'bruise', type: 'LL', from: '2026-09-10', to: '2026-09-11', remarks: 'W5 leave before PO' })
  return postOut(page, 'bruise', '2026-07-28', '2026-08-01')
})
if (!only || only === 'V4') await world('V4-after-undo-postout-then-reload', cobraOutAndUndo)
R.save()
