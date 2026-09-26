/* W1-10 (26 Sep 26) — two short walks, desktop, admin:
   (1) the Edit Schedule top bar's own Undo / Redo after a calendar drag (the ONE timeline — the same step the war's
       pair undoes), and what the button says it will undo;
   (2) the noon rule's words: a leave typed 12:00-14:00 on the Inputs page, and what the war's tap list says of it.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-10-desk-topbar-undo.mjs */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, fileInput, shot, resultBook, ROOT, toastSpy, toasts, calOpen, mouseDragChip, chipDays, undoRedo, go } = L
const R = resultBook('W1-10-desk', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w1-10-desk.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-10-THREW-${name}`).catch(() => {}) } }
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }

const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const skip = n => ONLY.length && !ONLY.includes(n)
if (!skip('TOPBAR')) await step('TOPBAR', async () => {
  const f = await file({ person: 'dice', type: 'LL', from: '2026-07-20', remarks: 'W1 top-bar undo' })
  await calOpen(page, '2026-07')
  await mouseDragChip(page, f.iid, '2026-07-20', '2026-07-21')
  const moved = await chipDays(page, f.iid)
  await go(page, 'editsched')
  await shot(page, 'w1-10-topbar-before-undo')
  const u = await undoRedo(page, 'undo', 'edit')
  await calOpen(page, '2026-07')
  const back = await chipDays(page, f.iid)
  R.ck('TOPBAR-undo', moved.join() === '2026-07-21' && u.pressed && back.join() === '2026-07-20', 'Edit Schedule\'s Undo takes the calendar move back (20 Jul)', { moved, u, back })
  R.note('TOPBAR-undo-label', { label: u.label, why: 'what the button names — the change-recording re-test (D148) reads these' })
  const r = await undoRedo(page, 'redo', 'edit')
  await calOpen(page, '2026-07')
  const again = await chipDays(page, f.iid)
  R.ck('TOPBAR-redo', r.pressed && again.join() === '2026-07-21', 'and its Redo puts it on 21 Jul again', { r, again })
  R.note('TOPBAR-inputs-page', { undoOnInputsPage: await (async () => { await L.inputsView(page, 'list'); return page.locator('#undoBtn:visible, [data-testid="lw-undo"]:visible').count() })(), why: 'the Inputs page (and its calendar) carries no Undo of its own — Edit Schedule and the Leave War do' })
})

if (!skip('NOON')) await step('NOON-WORDS', async () => {
  const f = await file({ person: 'beams', type: 'LL', from: '2026-08-24', span: 'custom', start: '12:00', end: '14:00', remarks: 'W1 noon words' })
  await lwOpen(page, '2026-08-24')
  /* a morning bid beside it, so the day holds two records and a tap opens the day's LIST (which prints times) */
  const b = await L.bidOn(page, 'beams', '2026-08-24', 'LL', { portion: 'am' })
  await lwOpen(page, '2026-08-24')
  const s = await tapCell(page, 'beams', '2026-08-24')
  R.note('NOON-bid', b)
  await shot(page, 'w1-10-noon-taplist')
  await closeSheets(page)
  const stored = await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r && { s: r.s, e: r.e } }, f.iid)
  R.ck('NOON-WORDS', !(s.text || '').includes('12:01'), 'the war\'s words for a leave typed 12:00-14:00 read 12:00-14:00, as the Inputs page does (N1 decides the half, not the time shown)', { stored, sheet: s.open, text: (s.text || '').slice(0, 200) })
})

R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
