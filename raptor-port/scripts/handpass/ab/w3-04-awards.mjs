/* W3-04 — AWARDS on the war: the bid sheet's +OIL — one number in halves; 0.25 / 0.75 / 0 / negative / "abc" refused
   with a sentence and nothing written, never rounded (N19, Astra 30) — and the same on the OIL tracker's award editor;
   an award beside a bid; an award's reason / giver / days edited on the tap list and ONE Undo takes all three back
   (Fable S40); the tap list's per-record Clear takes only its own record; the read-only sheet's routing for an
   Inputs-filed leave, a schedule-earned credit and an input-earned credit (Astra 38).
   Written as assertions of the RIGHT behaviour. Usage: node scripts/handpass/ab/w3-04-awards.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, reload, figures, lwTracker } = L
const PHONE = W === 'phone'
const R = resultBook(`W3-04-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-04-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `w3-04-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const rec = async (p, d) => (await recsOf(page, p, [d]))[d]

/* ---- the fixture: an Inputs-filed leave (Ghost 22 Jul), a Duty input with its OIL claim on Sat 18 Jul (Wisp), and
   Saturday published — Fable (SDO) earns off the schedule, Wisp off his accepted input ---- */
await step('fixture', async () => {
  const a = await fileInput(page, { person: 'riddler', type: 'LL', from: '2026-07-22', remarks: 'W3 Inputs leave' })
  const b = await fileInput(page, { person: 'shrek', type: 'Duty', from: '2026-07-18', remarks: 'W3 weekend duty', oil: 'yes' })
  const p = await S.pubOnBoard(page, 5)
  R.note('fixture', { leave: a.added, duty: b.added, dutyAsked: b.asked, pub: p.p })
})
await lwOpen(page, '2026-07-20')

/* ---- the +OIL number (N19, Astra 30) ---- */
const VALUES = [['0.25', false], ['0.75', false], ['0', false], ['-1', false], ['abc', false], ['1.25', false], ['0.5', true], ['1.5', true]]
let day = 20
for (const [v, ok] of VALUES) {
  await step(`N19-${v}`, async () => {
    const d = `2026-07-${String(day++).padStart(2, '0')}`
    await tapCell(page, 'mamba', d)
    await sheetPress(page, 'bid-oil')
    await page.locator('[data-testid="oil-why"]').fill(`W3 N19 ${v}`)
    await page.locator('[data-testid="oil-days"]').fill(v)
    const label = (await page.locator('[data-testid="oil-give"]').innerText()).trim()
    const g = await sheetPress(page, 'oil-give')
    const err = (await page.locator('[data-testid="oil-err"]').allInnerTexts()).join(' ')
    if (v === '0.25' || v === 'abc') await pic(`N19-${v}-refused`)
    if (g.sheet.open !== 'nothing') await closeSheets(page)
    const r = await rec('mamba', d)
    if (ok) R.ck(`N19-${v}`, g.sheet.open === 'nothing' && new RegExp(`/d${v}$`).test(r), `${v} days is a half-step: the award lands as ${v} (button said "${label}")`, { label, rec: r })
    else R.ck(`N19-${v}`, g.sheet.open === 'bid-picker' && err.length > 0 && r === '-', `${v} is refused with a sentence on the sheet and NOTHING is written, never rounded`, { label, err, rec: r })
  })
}

/* ---- the same numbers on the OIL tracker's award editor ---- */
await step('N19-tracker', async () => {
  await lwOpen(page, '2026-07-20')
  await closeSheets(page)
  await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await page.waitForTimeout(1500)
  await page.locator('[data-testid="oil-row-mamba"]').first().waitFor({ timeout: 8000 }).catch(() => {})
  const btn = page.locator('[data-testid^="oil-note-mamba-"][data-testid$="2026-07-26"]').first()
  const n = await btn.count()
  await pic('N19-tracker-open')
  const out = []
  if (n) {
    for (const v of ['0.25', '-1', 'abc']) {
      await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await btn.click(); await page.waitForTimeout(400)
      await page.locator('[data-testid="oil-note-days"]').fill(v)
      await page.locator('[data-testid="oil-note-save"]').click(); await page.waitForTimeout(500)
      const err = (await page.locator('[data-testid="oil-note-err"]').allInnerTexts()).join(' ')
      const still = await page.locator('[data-testid="oil-note-days"]').count()
      if (v === '0.25') await pic('N19-tracker-0.25')
      out.push({ v, err, stillOpen: still })
      if (still) await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    }
  }
  await page.locator('[data-testid="oil-close"]:visible').first().click().catch(() => {}); await page.waitForTimeout(400)
  const r = await rec('mamba', '2026-07-26')
  R.ck('N19-tracker', n > 0 && out.every(o => o.err && o.stillOpen) && /\/d0\.5$/.test(r), 'the tracker\'s award editor refuses 0.25, −1 and "abc" with a sentence, leaving the 0.5-day award as it was', { found: n, out, rec: r })
})

/* ---- an award beside a bid, then the tap list: edit all three, ONE undo (Fable S40); per-record Clear ---- */
await step('S40-edit-one-undo', async () => {
  await lwOpen(page, '2026-07-27')
  await L.lwAward(page, 'nact', '2026-07-27', '1', 'W3 first reason')
  const b = await bidOn(page, 'nact', '2026-07-27', 'LL')
  const s = await tapCell(page, 'nact', '2026-07-27')
  R.ck('award-beside-bid', b.placed && s.open === 'daylist-sheet' && s.lines.length === 2, 'a bid on a day holding an award lands beside it — the box shows +1 and the tap list both', { placed: b.placed, why: b.why, open: s.open, lines: s.lines })
  const edit = page.locator('[data-testid^="dl-oil-edit-"]:visible').first()
  await edit.click(); await page.waitForTimeout(300)
  const id = (await edit.getAttribute('data-testid')).replace('dl-oil-edit-', '')
  await page.locator(`[data-testid="oil-edit-days-${id}"]`).fill('1.25')
  await page.locator(`[data-testid="oil-edit-save-${id}"]`).click(); await page.waitForTimeout(400)
  const msg = (await page.locator('[data-testid="daylist-msg"]').allInnerTexts()).join(' ')
  const r0 = await rec('nact', '2026-07-27')
  R.ck('S40-1.25-refused', /halves/i.test(msg) && /\/d1(,|$)/.test(r0), '1.25 on the tap list is refused with "Days come in halves", nothing written', { msg, rec: r0 })
  await page.locator(`[data-testid="oil-edit-why-${id}"]`).fill('W3 second reason')
  await page.locator(`[data-testid="oil-edit-given-${id}"]`).fill('OC Ops')
  await page.locator(`[data-testid="oil-edit-days-${id}"]`).fill('2')
  await pic('S40-edit-three')
  await page.locator(`[data-testid="oil-edit-save-${id}"]`).click(); await page.waitForTimeout(500)
  const s2 = await sheetNow(page)
  await closeSheets(page)
  const f1 = await figures(page, 'nact')
  const u = await lwHist(page, 'undo')
  const s3 = await tapCell(page, 'nact', '2026-07-27'); await pic('S40-after-one-undo'); await closeSheets(page)
  const f2 = await figures(page, 'nact')
  R.note('S40-after-save', { lines: s2.lines, oil: f1.oil })
  R.ck('S40-one-undo', /first reason/.test(s3.lines.join(' ')) && !/OC Ops/.test(s3.lines.join(' ')) && f2.oil !== f1.oil, 'ONE Undo takes the reason, the giver and the days back together', { undo: u.title, lines: s3.lines, oil: [f1.oil, f2.oil] })
  await lwHist(page, 'redo')
  const clr = await tapCell(page, 'nact', '2026-07-27')
  const reqClear = page.locator('[data-testid^="dl-clear-r"]:visible').first()
  await reqClear.click(); await page.waitForTimeout(500); await closeSheets(page)
  const r1 = await rec('nact', '2026-07-27')
  R.ck('taplist-clear-own-record', /credit:FO\/manual/.test(r1) && !/request/.test(r1), 'the tap list\'s Clear on the BID line takes the bid only; the award stays', { rec: r1 })
})

/* ---- the read-only sheet's routing (Astra 38) — as the admin, then as the member ---- */
const route = async (who) => {
  const out = {}
  await lwOpen(page, '2026-07-18')
  for (const [k, p, d] of [['inputsLeave', 'riddler', '2026-07-22'], ['scheduleCredit', 'plasma', '2026-07-18'], ['inputCredit', 'shrek', '2026-07-18']]) {
    const s = await tapCell(page, p, d)
    const note = (await page.locator('[data-testid="raptor-note"]:visible').allInnerTexts()).join(' ')
    out[k] = { open: s.open, note, buttons: s.buttons, box: (await L.lwCell(page, p, d)).box }
    await pic(`R38-${who}-${k}`)
    await closeSheets(page)
  }
  return out
}
await step('R38-admin', async () => {
  const o = await route('admin')
  R.note('R38-admin', o)
  R.ck('R38-admin-inputs-leave', o.inputsLeave.open === 'raptor-sheet' && /Inputs page/.test(o.inputsLeave.note), 'admin: an Inputs-filed leave opens the read-only sheet that sends him to the Inputs page', o.inputsLeave)
  R.ck('R38-admin-schedule-credit', /published schedule/.test(o.scheduleCredit.note), 'admin: the schedule-earned credit says "earned off the published schedule — change the schedule"', o.scheduleCredit)
  R.ck('R38-admin-input-credit', /duty input/.test(o.inputCredit.note), 'admin: the input-earned credit says "earned off a duty input … change that input, not the schedule"', o.inputCredit)
})
await step('R38-member', async () => {
  await L.relogin(page, 'm')
  const o = await route('member')
  R.note('R38-member', o)
  const noEdit = (x) => !(x.buttons || []).some(b => /^(bid-(?!cancel)|decide-|oil-give|dl-)/.test(b))
  R.ck('R38-member-routing', o.inputsLeave.open === 'raptor-sheet' && /Inputs page/.test(o.inputsLeave.note) && /published schedule/.test(o.scheduleCredit.note) && /duty input/.test(o.inputCredit.note) && [o.inputsLeave, o.scheduleCredit, o.inputCredit].every(noEdit),
    'member (another man\'s cells): each opens the read-only sheet with its own source sentence and no controls', o)
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
