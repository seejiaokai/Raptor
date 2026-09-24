/* w4 · S27 (Fable) + Astra rank 21 + roll-call R22 — leave filed for a man who stands behind the ALL AVAIL
   puck on the published Saturday (FAMILY DAY 10:00-14:00).
   The rules (register): AM42/D44 — who stood behind the puck is FROZEN at publication; the working copy shows
   today's answer; the difference raises the ordinary pending mark. AM13/D45 — a change in who was available
   NEVER invalidates a signature. AM40 — nothing on a published schedule changes without the scheduler
   acknowledging it. AM47 — the war does not move until the day is published again.
   Steps: sign the four on the published Saturday (nothing to publish yet) → file LL for Ghost (riddler) on
   Sat 18 Jul through the Inputs page → read the edit week (pending, sign-offs, Publish AL1), the Amendments
   panel, the view page's issued face and its count chip, the working-draft peek, the ALL AVAIL window on the
   issued face and on the working copy, and Ghost's box on the war → Publish AL1 → read the war again.
   Usage: node w4-05-s27-allavail.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, SAT, SATISO, lwOpen, lwCell, lwOilFig, lwCloseSheet, lwShot, editWeek, board, closeBoard, head,
  signDay, publishAL, shot, toastNow, clearToast, checker, go, frame, alPanel, fileInput, viewDay, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S27 ' + w)
const M = 'riddler'   // Ghost — earns HO* from the FAMILY DAY crowd as issued
const pic = s => `s27-${w}-${s}`

/** The FAMILY DAY count chip on a surface, and the window it opens: who is listed, and from which version. */
async function crowd(scopeSel, label) {
  const chip = page.locator(`${scopeSel} .oilcount:visible`).first()
  if (!(await chip.count())) return { chip: 'NO CHIP' }
  const c = await chip.evaluate(e => ({ txt: e.innerText.trim(), ver: e.dataset.oilver || '', title: (e.getAttribute('title') || '').slice(0, 140) }))
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await chip.click(); await page.waitForTimeout(800)
  const win = await page.evaluate(m => {
    const wv = document.querySelector('.availwin:not([hidden])')
    if (!wv) return { open: false }
    const ppl = [...wv.querySelectorAll('[data-person]')].map(e => e.dataset.person)
    return { open: true, title: (wv.querySelector('.win-ttl') || {}).innerText?.replace(/\s+/g, ' '), from: (wv.querySelector('.win-from') || {}).innerText || '',
      n: ppl.length, hasM: ppl.includes(m), mLine: (() => { const e = wv.querySelector(`[data-person="${m}"]`); return e ? (e.closest('.win-row, li, .aw-row, div') || e).innerText.replace(/\s+/g, ' ').slice(0, 120) : '' })() }
  }, M)
  await shot(page, pic(label))
  const x = page.locator('.availwin .win-x:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(400) }
  return { chip: c, win }
}

/* ---- 0. sign the four on the published Saturday: nothing to publish, the short note says so ---- */
await editWeek(page)
await clearToast(page)
note('sign', await signDay(page, SAT))
const t0 = await toastNow(page)
const h0 = await head(page, SAT)
note('signed, before the leave', { head: h0, toast: t0 })
ck('AM15b: "All signed — no changes to publish right now"', /no changes to publish/i.test(t0 || ''), 'the note', t0)
ck('AM15: no Publish button when nothing to publish', !h0.alpub, 'no Publish AL1', h0.alpub)
await frame(page, `#eWeek .day[data-day="${SAT}"]`)
await shot(page, pic('0-signed'))
const v0 = await viewDay(page, SAT)
const c0 = await crowd(`#vWeek .day[data-day="${SAT}"]`, '0-issued-window-before')
note('issued face before', { tag: v0.tag, crowd: c0 })
ck('Ghost is in the FAMILY DAY crowd as issued', c0.win?.hasM === true, 'listed', c0.win)
await lwOpen(page)
const lw0 = await lwCell(page, M)
note('Ghost on the war before', lw0)

/* ---- 1. leave for Ghost on the published Saturday, through the Inputs page ---- */
const f = await fileInput(page, { person: M, type: 'LL', from: SATISO, span: 'all', remarks: 'w4 S27 leave' })
note('Inputs page: LL for Ghost on 18 Jul', f)
ck('the leave was filed', f.added >= 1, 'one input added', f)
await shot(page, pic('1-inputs-filed'))

/* ---- 2. the working copy, the signatures, the panel ---- */
await editWeek(page)
const h1 = await head(page, SAT)
const p1 = await alPanel(page)
note('edit week after the leave', { head: h1, panel: p1 })
await frame(page, `#eWeek .day[data-day="${SAT}"]`)
await shot(page, pic('2-edit-after-leave'))
ck('AM42/D44: the crowd change raises the pending mark', /pending/.test(h1.pending || ''), 'N pending', h1.pending)
ck('AM13/D45 (Astra 21): the four signatures stay valid', h1.signs.every(s => !/name/.test(s)), 'all four still named', h1.signs.join('/'))
ck('D45: Publish AL1 is open without signing again', h1.alpub && !h1.alpub.disabled, 'Publish AL1 enabled', h1.alpub)
/* AM24 draws "Not yet signed" on the working copy whenever it differs from the issued version. In the app's
   own words "signed" means "issued" (the warnings say "new once signed"), so this is the rule working — but
   under D45 the four sign-offs below it are still valid. Recorded as wording, not judged. */
note('AM24 — "Not yet signed" beside four still-valid sign-offs (D45)', { nys: h1.nys, signs: h1.signs.join('/'), line: h1.signState })
if (w === 'desktop') ck('AM25: the panel says what this day earns changed', /earns changed/i.test(p1), 'the words', p1)

/* ---- 3. the view page: issued face frozen, working-draft peek shows today ---- */
const v1 = await viewDay(page, SAT)
await frame(page, `#vWeek .day[data-day="${SAT}"]`)
await shot(page, pic('3-view-issued'))
const c1 = await crowd(`#vWeek .day[data-day="${SAT}"]`, '3-issued-window-after')
note('issued face after the leave', { tag: v1.tag, unavail: v1.unavail, crowd: c1 })
ck('AM42: the issued count chip is unchanged', c1.chip?.txt === c0.chip?.txt, c0.chip?.txt, c1.chip?.txt)
ck('AM42: Ghost is still in the ISSUED crowd', c1.win?.hasM === true, 'listed', c1.win)
const sel = page.locator(`#vWeek select[data-vwork="${SAT}"]:visible`).first()
if (await sel.count()) {
  await sel.selectOption('working'); await page.waitForTimeout(700)
  const v2 = await viewDay(page, SAT)
  await frame(page, `#vWeek .day[data-day="${SAT}"]`)
  await shot(page, pic('4-view-working'))
  const c2 = await crowd(`#vWeek .day[data-day="${SAT}"]`, '4-working-window')
  note('working-draft peek', { head: v2.head, bar: v2.bar, crowd: c2 })
  ck('AM42: the working copy shows today\'s crowd (Ghost out, or flagged)', c2.win?.hasM === false || /LL|leave/i.test(c2.win?.mLine || ''), 'Ghost not counted in today\'s crowd', c2.win)
  await page.locator(`#vWeek select[data-vwork="${SAT}"]:visible`).first().selectOption('issued').catch(() => {})
} else note('working-draft peek', 'NO PICKER')

/* the board is the working copy too (R22 — the window opened on the edit side) */
await board(page, SAT)
const c3 = await crowd('#schedBoard', '5-board-window')
note('board (working copy) window', c3)
await closeBoard(page)

/* ---- 4. the war has not moved (AM47), then Publish AL1 and it does ---- */
await lwOpen(page)
const lw1 = await lwCell(page, M)
await lwShot(page, pic('6-lw-before-al1'), M)
const fig1 = (await lwOilFig(page, M)).oil
await lwCloseSheet(page)
const tap1 = await L.lwTap(page, M)
await shot(page, pic('6b-lw-taplist-before-al1'))
await lwCloseSheet(page)
note('Ghost on the war after the leave, before AL1', { box: lw1, oil: fig1, tap: tap1 })
/* the box shows ONE code by the war's ladder (his filed LL outranks the credit) and the amber ! says the
   day holds a clash; the MONEY is the question for AM47 — his figure and the credit line in the tap list */
ck('AM47: Ghost keeps the issued Saturday credit until AL1 (the money has not moved)', String(fig1) === '0.5' && (tap1.lines.some(l => /HO|OIL|credit|earn/i.test(l)) || /HO/.test(tap1.head)),
  'OIL figure still 0.5; the HO* credit still listed under the LL', { box: lw1.box + ' ' + lw1.mark, oil: fig1, lines: tap1.lines })
await editWeek(page)
await clearToast(page)
const pub = await publishAL(page, SAT)
note('Publish AL1 (on the signatures given BEFORE the leave)', { ...pub, toast: await toastNow(page) })
ck('D45: AL1 publishes on the earlier signatures', pub.pressed === true, 'published', pub)
await lwOpen(page)
const lw2 = await lwCell(page, M)
const fig2 = (await lwOilFig(page, M)).oil
await lwCloseSheet(page)
await lwShot(page, pic('7-lw-after-al1'), M)
note('Ghost on the war after AL1', { lw2, fig2 })
ck('AM46: AL1 no longer credits Ghost for the FAMILY DAY', !/HO\*|FO\*/.test(lw2.box), 'no credit (his leave is the day)', lw2)
const v3 = await viewDay(page, SAT)
const c4 = await crowd(`#vWeek .day[data-day="${SAT}"]`, '8-issued-window-al1')
note('issued face at AL1', { tag: v3.tag, crowd: c4 })
ck('the AL1 issued crowd no longer lists Ghost', c4.win?.hasM === false, 'not listed', c4.win)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
