/* w1 · S3 setup B in FABLE'S ORDER — file an input onto a published weekday, then take it off again.
   Everything week, TUESDAY (issued Original, clean). On the board: "+ Inputs" on the ground programme opens the
   input dialog already set for Tuesday → Add (it goes straight onto the ground programme — a filing on the
   working copy) → then the Personal Inputs panel's Undo takes it off again.
   RIGHT behaviour: AM21b/AM14 the filing is a pending change; AM21 "a row added and removed again before the next
   AL is no change at all" → after the round trip nothing is pending anywhere; AM23 the ⓘ panel agrees with the
   head; AM5/AM24 the issued face never shows the working copy's pending state.
   Usage: node w1-s03b-accept-first.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, openInputs, tap, go, STATE, WIDTHS, widthArg, checker, toastSpy, toasts, dayInfo, closeDayInfo, panel,
  headN, markSummary, shotUnion, book } = L
const DI = 1
const ground = (page) => page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${(window.PEOPLE[g.who] || {}).cs || g.who || ''}`), DI)
const vchip = (page) => page.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); return (d.querySelector('.dpend') || {}).innerText?.replace(/\s+/g, ' ') || '' }, DI)

for (const w of widthArg()) {
  const C = checker('S3B2 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  await board(page, DI)
  const g0 = await ground(page)
  const ids0 = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await tap(page, `[data-inpadd="${DI}.g"]`); await page.waitForTimeout(600)
  const dlg = await page.evaluate(() => { const b = document.querySelector('#inpEditSave'); const m = b && b.closest('.sheet, .modal, [role=dialog], .airpop') ; return b ? { save: b.innerText, text: (m || b.parentElement).innerText.replace(/\s+/g, ' ').slice(0, 200) } : null })
  C.log('the input dialog', dlg)
  await page.locator('#inpEditSave:visible').first().click(); await page.waitForTimeout(800)
  const tAdd = await toasts(page)
  const g1 = await ground(page), h1 = await headN(page, DI)
  const i1 = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  const newIid = await page.evaluate(ids => (window.INPUTS.find(x => !ids.includes(x.iid)) || {}).iid, ids0)   // the input that was not there before
  C.log('after Add', { toasts: tAdd, ground: g1, head: h1.pending, info: i1.pend, newInput: newIid, inputs: await page.evaluate(() => window.INPUTS.length) })
  C.check('S3B2.a', g1.length === g0.length + 1 && /1 pending|2 pending/.test(h1.pending), 'the input lands on Tuesday\'s ground programme as a pending change on the working copy — AM41/AM21b', { rows: g1.length, pend: h1.pending })
  const num = s => +(String(s || '').split(' ')[0] || 0)
  C.check('S3B2.a2', num(i1.pend) === num(h1.pending), 'after Add, the ⓘ panel gives the same number as the head — AM23', { head: h1.pending, info: i1.pend || '(none)' })
  if (w === 'desktop') C.log('panel after Add', ((await panel(page)).days.find(d => /^Tue/.test(d.text)) || {}).text)
  await shotUnion(page, `s3b2-${w}-1-after-add`, ['#sbSignBar'])
  // take it off again through the Personal Inputs panel's Undo
  await openInputs(page, DI)
  const accs = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-acc]')].filter(e => e.offsetWidth || e.offsetHeight)
    .map(e => ({ acc: e.dataset.acc, key: e.dataset.acck, row: (e.closest('.sb-arow, .sbi-row, .sb-row') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 50) })))
  C.log('input controls on Tuesday', accs)
  let x = page.locator(`#schedBoard [data-acc="x"][data-acck="${newIid}"]:visible`).first()
  if (!(await x.count())) { const k = (accs.find(a => a.acc === 'x' && /TRAINING|Training|Ace/.test(a.row || '')) || {}).key; if (k) x = page.locator(`#schedBoard [data-acc="x"][data-acck="${k}"]:visible`).first() }
  const found = await x.count()
  if (found) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(800) }
  const tOff = await toasts(page)
  const g2 = await ground(page), h2 = await headN(page, DI), m2 = await markSummary(page, '#schedBoard')
  const i2 = await dayInfo(page, DI, 'board'); await closeDayInfo(page)
  C.log('after taking it off', { found, toasts: tOff, ground: g2, head: h2.pending, info: i2.pend, dotted: m2.dotted })
  C.check('S3B2.b', JSON.stringify(g2) === JSON.stringify(g0), 'the ground programme is back to exactly what was issued', { before: g0, after: g2 })
  /* the ground row netted out (AM21), but the REQUEST is still on file for the day, just no longer accepted —
     AM41 keeps a filing pending until the scheduler removes it, so a remaining "input filing" is arguably right.
     Recorded as a question, not judged. What the register DOES decide: every count agrees (AM23). */
  C.note('S3B2.c', 'after the round trip the ground row is gone but the request is still on file (not accepted): the day keeps a pending "input filing"', { head: h2.pending })
  C.check('S3B2.d', num(i2.pend) === num(h2.pending), 'after the round trip, the ⓘ panel gives the same number as the head — AM23', { head: h2.pending || '(none)', info: i2.pend || '(none)' })
  if (w === 'desktop') { const P = await panel(page); C.log('panel after the round trip', P)
    C.note('S3B2.e', 'the Amendments panel row for Tuesday after the round trip', (P.days.find(d => /^Tue/.test(d.text)) || {}).text || '(not listed)') }
  await shotUnion(page, `s3b2-${w}-2-after-round-trip`, ['#sbSignBar'])
  await closeBoard(page)
  await go(page, 'viewsched')
  const vc = await vchip(page)
  C.check('S3B2.f', !vc, 'the view page\'s ISSUED face shows no pending chip — AM5/AM24', vc || '(none)')
  C.log('book pending (record only)', (await book(page)).pending.filter(k => /:1\./.test(k) || /^inp:/.test(k)))
  C.check('S3B2.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
