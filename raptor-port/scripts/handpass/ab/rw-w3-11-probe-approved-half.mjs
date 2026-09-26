/* RW-W3-11 — a PROBE the re-walk added (26 Sep 26), from a picture of rw-w3-09 (FR5's setup): on a day whose MORNING the
   war approved, a tap opens the bid sheet with the decision row AND "How much: Whole day / AM / PM", Whole day picked.
   The rule it is read against (register §12, W5-F4 / item D): "a half is offered only when it can be taken". The same
   day with a morning filed on the INPUTS page offers only PM (the first walk, Ghost). What does pressing LL do here —
   with Whole day (the default), and with AM? Recorded both ways, with pictures; each case in its own fresh man.
   Usage: node scripts/handpass/ab/rw-w3-11-probe-approved-half.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwCell } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-11-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-11-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `rw-w3-11-${W}-${n}`)
const rec = async (p, d) => (await recsOf(page, p, [d]))[d]
const inp = async (p, re) => (await inputsOf(page, p)).filter(x => re.test(x.date)).map(x => `${x.type} ${x.date}${x.allday ? '' : ' ' + x.s + '-' + x.e} lw=${x.lw ? 'y' : 'n'}`)
const portions = async () => page.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"] [data-testid^="portion-"]')].filter(b => b.offsetWidth).map(b => `${b.getAttribute('data-testid')}${b.disabled ? '(off)' : ''}${/\bon\b|sel|active/.test(b.className) || b.getAttribute('aria-pressed') === 'true' ? '*' : ''}`))
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }

for (const [id, P, D, how] of [['A-whole', 'bruise', '2026-12-04', null], ['B-am', 'dice', '2026-12-09', 'portion-am']]) {
  await step(id, async () => {
    await lwOpen(page, '2026-12-01')
    await bidOn(page, P, D, 'LL', { portion: 'am' })
    await tapCell(page, P, D); await sheetPress(page, 'decide-approve'); await closeSheets(page)
    const i0 = await inp(P, new RegExp(`Dec ${+D.slice(8)}$`)), r0 = await rec(P, D)
    const s = await tapCell(page, P, D)
    const pz = await portions()
    await pic(`${id}-a-sheet`)
    await toasts(page)
    if (how) await sheetPress(page, how)
    const pr = await sheetPress(page, 'bid-LL')
    let after = await sheetNow(page)
    if (after.open === 'bid-picker' && /Tap the same leave again/i.test(after.text || '')) { await sheetPress(page, 'bid-LL'); after = await sheetNow(page) }
    await pic(`${id}-b-after-LL`)
    await closeSheets(page)
    const t = await toasts(page)
    const i1 = await inp(P, new RegExp(`Dec ${+D.slice(8)}$`)), r1 = await rec(P, D), c1 = await lwCell(page, P, D)
    await L.lwShot(page, `rw-w3-11-${W}-${id}-c-grid`, P, D)
    R.note(id, { before: { inputs: i0, rec: r0 }, sheet: s.open, heading: (s.text || '').slice(0, 60), portions: pz, pressed: pr.pressed, sheetAfter: { open: after.open, text: (after.text || '').slice(0, 260) }, toasts: t, after: { inputs: i1, rec: r1, cell: c1 } })
    const approvedKept = i1.some(x => /0-720 lw=y/.test(x))
    R.ck(`${id}-approved-morning-kept-or-said`, approvedKept || t.length > 0 || /can.t|already|instead|replace/i.test(after.text || ''),
      'pressing LL on a day whose morning the war approved either keeps the approved morning, or says what it did to it (never a silent overwrite of approved leave)', { approvedKept, inputs: i1, rec: r1, toasts: t, sheetText: (after.text || '').slice(0, 200) })
  })
}
/* the control: the same morning FILED on the Inputs page — which halves does the war's sheet offer? */
await step('C-inputs-filed-control', async () => {
  const P = 'pump', D = '2026-12-10'
  await fileInput(page, { person: P, type: 'LL', from: D, span: 'am', remarks: 'RW probe filed morning' })
  await lwOpen(page, '2026-12-01')
  const s = await tapCell(page, P, D)
  const pz = await portions()
  await pic('C-inputs-filed-sheet')
  await closeSheets(page)
  R.note('C-inputs-filed-control', { sheet: s.open, heading: (s.text || '').slice(0, 120), portions: pz })
})
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
