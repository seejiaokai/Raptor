/* W3-07 — THE MEMBER on the war (us = Ranger, person bane; D166): only his own row answers; another man's cell opens
   nothing or the read-only sheet; no decisions, no postings, no awards; his drag stays on his own row; the stages
   CLOSED and PUBLISHED as he sees them. Assertions of the RIGHT behaviour.
   Usage: node scripts/handpass/ab/w3-07-member.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, stageGo, stageNow, relogin, dragRect, selPress } = L
const PHONE = W === 'phone'
const R = resultBook(`W3-07-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-07-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `w3-07-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const ADMINONLY = /^(decide-|bid-oil|bid-postout|bid-postin|dl-approve|dl-ack|dl-refuse|dl-oil-edit|sel-approve|sel-refuse|sel-pending|sel-postout)/
const clean = (s) => !(s.buttons || []).some(b => ADMINONLY.test(b))

await step('admin-setup', async () => {
  await lwOpen(page, '2026-07-20')
  const a = await bidOn(page, 'bane', '2026-07-22', 'LL'); await tapCell(page, 'bane', '2026-07-22'); const ap = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  const b = await bidOn(page, 'pump', '2026-07-21', 'LL')
  const c = await fileInput(page, { person: 'stiff', type: 'LL', from: '2026-07-23', remarks: 'W3 Saber leave' })
  await lwOpen(page, '2026-07-20')
  const d = await L.lwAward(page, 'bane', '2026-07-24', '1', 'W3 member award')
  const e = await bidOn(page, 'pump', '2026-02-11', 'LL')
  const g = await L.lwAward(page, 'bane', '2026-02-12', '1', 'W3 member award in window')
  R.note('admin-setup', { baneApproved: [a.placed, ap.pressed], pumpBid: b.placed, saberLeave: c.added, award: d.given, pumpFeb: e.placed })
  await relogin(page, 'm')
})

await step('M-open', async () => {
  await lwOpen(page, '2026-07-20')
  const who = await page.locator('[data-testid="lw-viewing"]:visible').allInnerTexts()
  const o = {}
  o.otherBid = await tapCell(page, 'pump', '2026-07-21'); await closeSheets(page)
  o.otherEmpty = await tapCell(page, 'pump', '2026-07-27'); await closeSheets(page)
  o.otherInputs = await tapCell(page, 'stiff', '2026-07-23'); await pic('M-other-inputs-leave'); await closeSheets(page)
  o.ownOutsideWindow = await tapCell(page, 'bane', '2026-07-20'); await closeSheets(page)
  o.ownApproved = await tapCell(page, 'bane', '2026-07-22'); await pic('M-own-approved-open'); await closeSheets(page)
  o.ownAward = await tapCell(page, 'bane', '2026-07-24'); await pic('M-own-award-open'); await closeSheets(page)
  const lite = Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { open: v.open, buttons: v.buttons, text: (v.text || '').slice(0, 140) }]))
  R.note('M-open', { viewing: who, ...lite })
  R.ck('M-other-rows-closed', ['nothing', 'COVERED'].includes(o.otherBid.open) && ['nothing', 'COVERED'].includes(o.otherEmpty.open), 'OPEN, member: another man\'s bid or empty day opens nothing', { otherBid: o.otherBid.open, otherEmpty: o.otherEmpty.open })
  R.ck('M-other-inputs-readonly', o.otherInputs.open === 'raptor-sheet' && clean(o.otherInputs), 'OPEN, member: another man\'s Inputs-filed leave opens the read-only sheet only', lite.otherInputs)
  await lwOpen(page, '2026-02-09')
  o.ownAwardInWindow = await tapCell(page, 'bane', '2026-02-12'); await pic('M-own-award-in-window'); await closeSheets(page)
  const detail = /REASON|W3 member award/i.test(o.ownAwardInWindow.text || '')
  R.note('M-own-award-in-window', { open: o.ownAwardInWindow.open, buttons: o.ownAwardInWindow.buttons, text: (o.ownAwardInWindow.text || '').slice(0, 300) })
  R.ck('M-own-award-readable', o.ownAward.open !== 'nothing' && detail, 'a member can read his OWN award (reason, given by, days) with one tap on it — outside the bidding window too (owner 21 Sep 26: "a member reading his own OIL is entitled to know why it is there and who gave it")', { july: o.ownAward.open, febInWindow: o.ownAwardInWindow.open, febShowsDetail: detail })
  R.ck('M-own-nothing-admin', [o.ownApproved, o.ownAward, o.ownOutsideWindow].every(clean), 'OPEN, member: nothing he opens on his own row carries a decision, a posting or an award control', { ownApproved: lite.ownApproved, ownAward: lite.ownAward, ownOutsideWindow: lite.ownOutsideWindow })
})

await step('M-bid-own', async () => {
  await lwOpen(page, '2026-02-09')
  const s = await tapCell(page, 'bane', '2026-02-10')
  await pic('M-own-bid-sheet')
  await closeSheets(page)
  const b = await bidOn(page, 'bane', '2026-02-10', 'LL')
  const s2 = await tapCell(page, 'bane', '2026-02-10'); await closeSheets(page)
  const other = await tapCell(page, 'pump', '2026-02-11'); await closeSheets(page)
  R.ck('M-bid-own', s.open === 'bid-picker' && clean(s) && b.placed && clean(s2), 'inside the bidding window he bids on his own row; the sheet has no Ack / Approve / Refuse / Move, no +OIL, PO or PI', { first: { open: s.open, buttons: s.buttons }, placed: b.placed, again: { open: s2.open, buttons: s2.buttons } })
  R.ck('M-other-feb-closed', ['nothing', 'COVERED'].includes(other.open), 'another man\'s February bid opens nothing for him', { open: other.open })
})

await step('M-drag', async () => {
  const s = await dragRect(page, 'bane', '2026-02-16', 'stiff', '2026-02-18')
  await pic('M-drag-sheet')
  const f = s.open === 'select-sheet' ? await selPress(page, 'sel-OL') : null
  await closeSheets(page)
  const recs = { bane: await recsOf(page, 'bane', ['2026-02-16', '2026-02-17', '2026-02-18']), pump: await recsOf(page, 'pump', ['2026-02-16', '2026-02-17']), stiff: await recsOf(page, 'stiff', ['2026-02-16']) }
  R.ck('M-drag-own-row', s.open === 'select-sheet' && /Ranger/.test(s.text) && clean(s) && /OL/.test(Object.values(recs.bane).join()) && !/request/.test(Object.values(recs.pump).join() + Object.values(recs.stiff).join()),
    'a member\'s drag across three rows selects his own row only (named Ranger), with no Decide / PO, and the fill writes only on his row', { open: s.open, text: (s.text || '').slice(0, 120), buttons: s.buttons, note: f && f.note, recs })
  const u = await lwHist(page, 'undo')
  const r2 = await recsOf(page, 'bane', ['2026-02-16'])
  R.ck('M-undo-own', !/request/.test(r2['2026-02-16']), 'his Undo takes his own fill back', { undo: u.title, rec: r2 })
})

await step('M-closed', async () => {
  await relogin(page, 'a'); await lwOpen(page, '2026-02-09')
  const a = await stageGo(page, 'advance')
  await relogin(page, 'm'); await lwOpen(page, '2026-02-09')
  const st = await stageNow(page)
  const own = await tapCell(page, 'bane', '2026-02-10'); await pic('M-closed-own-bid'); await closeSheets(page)
  const drag = await dragRect(page, 'bane', '2026-02-19', 'bane', '2026-02-20'); await closeSheets(page)
  const stageCtl = await page.locator('[data-testid="stage-advance"]:visible, [data-testid="stage-back"]:visible').count()
  R.ck('M-closed', /CLOSED/i.test(st) && clean(own) && drag.open === 'nothing' && stageCtl === 0, 'CLOSED, member: his own bid opens nothing he could change (no decision), a drag selects nothing, and he has no stage control', { stage: st, own: { open: own.open, buttons: own.buttons }, drag: drag.open, stageCtl })
})

await step('M-published', async () => {
  await relogin(page, 'a'); await lwOpen(page, '2026-07-20')
  const a = await stageGo(page, 'advance')
  await relogin(page, 'm'); await lwOpen(page, '2026-07-20')
  const st = await stageNow(page)
  const own = await tapCell(page, 'bane', '2026-07-22'); await pic('M-published-own-approved')
  let saved = null
  if (own.open === 'remarks-sheet') {
    await page.locator('[data-testid="remarks-field"]').fill('W3 member note')
    saved = await sheetPress(page, 'remarks-save')
  }
  await closeSheets(page)
  const other = await tapCell(page, 'stiff', '2026-07-23'); await closeSheets(page)
  const otherBid = await tapCell(page, 'pump', '2026-07-21'); await closeSheets(page)
  const rem = (await L.inputsOf(page, 'bane')).filter(x => /Jul 22/.test(x.date)).map(x => x.remarks)
  R.ck('M-published', /PUBLISHED/i.test(st) && own.open === 'remarks-sheet' && /W3 member note/.test(rem.join()) && clean(other) && ['nothing', 'COVERED'].includes(otherBid.open),
    'PUBLISHED, member: his own approved leave opens the note editor and his note saves; another man\'s leave stays read-only and his bid opens nothing', { stage: st, own: own.open, saved: saved && saved.sheet.open, remarks: rem, other: { open: other.open, buttons: other.buttons }, otherBid: otherBid.open })
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
