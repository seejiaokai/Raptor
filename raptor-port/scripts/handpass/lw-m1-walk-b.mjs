// Walker B — the phone (390 x 844, touch), member Ranger then the admin. Build served on http://localhost:4253/ (frozen).
console.log('lw-m1-walk-b v1')
import { newPhone, signIn, signInPlain, shot, tapSel, finger, holdDrag, centre, T, cellId, vis, has, txt, gotoMonth, openWindow, closeWindow, toggleMonths, bid, lve, cellText, bigText, undo, redo, rec, results, getBrowser, exactDays, lines, states, asMember, asAdmin, dragCells, dumpBtns, topSheet, banner, closeAny, classOf, toggleMonthsKeep } from './lw-m1-walk-b-lib.mjs'
const ONLY = (process.env.SC || '').split(',').filter(Boolean)
const allErrs = []
const SC = {}
const run = async (id, fn) => {
  if (ONLY.length && !ONLY.includes(id)) return
  const env = await newPhone()
  try { await fn(env) } catch (e) { rec(id, 'ERROR', 'script error: ' + String(e).slice(0, 300)); try { await shot(env.page, `${id}-ERROR`) } catch {} }
  if (env.errs.length) allErrs.push(...env.errs.map(x => id + ' ' + x))
  await env.ctx.close()
}

/* ---------- S2 ---------- */
SC.S2 = async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  const chip = await txt(page, T('open-chip'))
  const gap = await page.evaluate(() => { const w = document.querySelector('.openword'), t = document.querySelector('.opentxt'); return w && t ? Math.round((t.getBoundingClientRect().left - w.getBoundingClientRect().right) * 10) / 10 : null })
  await shot(page, 'S2-00-chip-member-clock-2026-02-15', { clip: { x: 0, y: 90, width: 390, height: 40 } })
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-01')))
  await page.waitForTimeout(400)
  const note = await txt(page, T('closed-note-text'))
  const btn = await txt(page, T('closed-inputs'))
  await shot(page, 'S2-01-member-clock-2026-02-15-closed-note-1-apr')
  const want = "Bidding is closed. To change your leave, seek management's approval, then file it on the Inputs page. Your approved leave updates here by itself."
  const norm = s => (s || '').replace(/[’‘]/g, "'")
  const pickerOpen = await vis(page, T('bid-picker'))
  rec('S2a', norm(note) === want && !pickerOpen ? 'PASS' : 'FAIL', `1 Apr closed (Jan-Mar stretch open, other stretch open): note "${note}" (apostrophe curly ’ not straight; words otherwise as ruled); button "${btn}"; bid window open: ${pickerOpen}`, ['S2-01-member-clock-2026-02-15-closed-note-1-apr.png'])
  rec('S2-chip', gap === 0 ? 'FAIL' : 'PASS', `member chip reads "${chip}" in text but the two parts "Open" and "15 Feb – 31 Mar" are drawn ${gap}px apart (no visible space: "Open15 Feb – 31 Mar")`, ['S2-00-chip-member-clock-2026-02-15.png'])
  await tapSel(cdp, page, T('closed-inputs'))
  await page.waitForTimeout(900)
  await shot(page, 'S2-02-open-the-inputs-page-button-goes-to')
  const where = await page.evaluate(() => (document.body.innerText.match(/\n([A-Z]{3,9} 20\d\d)\n/) || ['', '?'])[1])
  rec('S2b', 'RECORD', `"Open the Inputs page" goes to the Inputs page (calendar shows ${where})`, ['S2-02-open-the-inputs-page-button-goes-to.png'])
}

/* ---------- S2c : a closed day inside a part-open month, other stretch open (admin makes it, member taps) ---------- */
SC.S2c = async ({ page, cdp }) => {
  await signInPlain(page, 'admin')
  await openWindow(cdp, page)
  const r = await exactDays(cdp, page, '2026-01-01', '2026-03-10', '2026-03-20')
  const st = await states(page, ['2026-03'])
  await shot(page, 'S2c-01-admin-window-10-20-mar-only')
  await closeWindow(cdp, page)
  await asMember(page)
  await gotoMonth(cdp, page, 'MAR')
  await tapSel(cdp, page, T(cellId('bane', '2026-03-25')))
  await page.waitForTimeout(400)
  const closedWords = await txt(page, T('closed-note-text'))
  const p1 = await vis(page, T('bid-picker'))
  await shot(page, 'S2c-02-member-clock-2026-02-15-closed-25-mar-in-part-open-month')
  await closeAny(cdp, page)
  await tapSel(cdp, page, T(cellId('bane', '2026-03-15')))
  await page.waitForTimeout(400)
  const p2 = await vis(page, T('bid-picker'))
  await shot(page, 'S2c-03-member-clock-2026-02-15-open-15-mar-bid-window')
  rec('S2c', closedWords && !p1 && p2 ? 'PASS' : 'FAIL', `admin set only ${JSON.stringify(r.lines)} (Mar state ${JSON.stringify(st)}); member 25 Mar: note "${(closedWords || '').slice(0, 40)}…" window open ${p1}; member 15 Mar: bid window open ${p2}`, ['S2c-02-member-clock-2026-02-15-closed-25-mar-in-part-open-month.png', 'S2c-03-member-clock-2026-02-15-open-15-mar-bid-window.png'])
}
/* ---------- F1 : S25 (moves while open) · S3 · S4 · S7 · S25c — one admin/member fixture on real storage ---------- */
SC.F1 = async ({ page, cdp }) => {
  const P = {}   // scratch reads
  /* Phase A — admin opens APR and MAY (Jan-Mar is the demo's open stretch) */
  await signInPlain(page, 'admin')
  const st = await toggleMonths(cdp, page, ['2026-04', '2026-05'])
  rec('F1-A', st['2026-04'] === 'open' && st['2026-05'] === 'open' ? 'PASS' : 'FAIL', `admin opened APR and MAY: ${JSON.stringify(st)}`)
  /* Phase B — member, clock 15 Feb 26 */
  await asMember(page)
  await gotoMonth(cdp, page, 'APR')
  // S25a (1): the one-day window's Move
  const l0 = await lve(page, 'bane')
  await bid(cdp, page, 'bane', '2026-04-20', 'LL')
  const placed = await cellText(page, 'bane', '2026-04-20')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-20')))
  await page.waitForSelector(T('decide-shift'))
  const moveOffered = await vis(page, T('decide-shift'))
  await tapSel(cdp, page, T('decide-shift'))
  await page.waitForTimeout(400)
  P.b1 = await banner(page)
  await tapSel(cdp, page, T(cellId('bane', '2026-04-22')))
  await page.waitForTimeout(400)
  P.b2 = await banner(page)
  await shot(page, 'S25a-01-member-clock-2026-02-15-move-20-to-22-apr-confirm')
  await tapSel(cdp, page, T('move-confirm'))
  await page.waitForTimeout(600)
  const c20 = await cellText(page, 'bane', '2026-04-20'), c22 = await cellText(page, 'bane', '2026-04-22'), cls22 = await classOf(page, 'bane', '2026-04-22')
  await shot(page, 'S25a-02-member-after-move-20-to-22-apr')
  rec('S25a-one', moveOffered && placed === 'LL' && c20 === '' && c22 === 'LL' && !/appr|ref/.test(cls22 || '') ? 'PASS' : 'FAIL', `Move chip offered ${moveOffered}; banner "${P.b1}" then "${P.b2}"; after: 20 Apr "${c20}", 22 Apr "${c22}" (class ${cls22}) — lands undecided`, ['S25a-01-member-clock-2026-02-15-move-20-to-22-apr-confirm.png', 'S25a-02-member-after-move-20-to-22-apr.png'])
  // S25b: landing on a closed day (3 Jun) — refused with its reason
  await tapSel(cdp, page, T(cellId('bane', '2026-04-22')))
  await page.waitForSelector(T('decide-shift'))
  await tapSel(cdp, page, T('decide-shift'))
  await page.waitForTimeout(300)
  await gotoMonth(cdp, page, 'JUN')
  await tapSel(cdp, page, T(cellId('bane', '2026-06-03')))
  await page.waitForTimeout(500)
  P.refB = { banner: await banner(page), toast: await page.evaluate(() => (document.querySelector('.toast, [role="status"], [data-testid="toast"]') || {}).innerText || null), sheet: await topSheet(page) }
  await shot(page, 'S25b-01-member-move-landing-3-jun-closed')
  const confirmB = await vis(page, T('move-confirm'))
  rec('S25b', !confirmB ? 'PASS' : 'FAIL', `landing on closed 3 Jun: confirm offered ${confirmB}; banner "${P.refB.banner}"; toast "${P.refB.toast}"`, ['S25b-01-member-move-landing-3-jun-closed.png'])
  // S25d: landing before today (10 Feb, inside the open Jan-Mar stretch)
  await gotoMonth(cdp, page, 'FEB')
  await tapSel(cdp, page, T(cellId('bane', '2026-02-10')))
  await page.waitForTimeout(500)
  P.refD = { banner: await banner(page), confirm: await vis(page, T('move-confirm')), toast: await page.evaluate(() => (document.querySelector('.toast, [role="status"], [data-testid="toast"]') || {}).innerText || null) }
  await shot(page, 'S25d-01-member-move-landing-10-feb-before-today')
  rec('S25d', !P.refD.confirm ? 'PASS' : 'FAIL', `landing 10 Feb (before today 15 Feb): confirm offered ${P.refD.confirm}; banner "${P.refD.banner}"; toast "${P.refD.toast}"`, ['S25d-01-member-move-landing-10-feb-before-today.png'])
  await closeAny(cdp, page)
  await page.waitForTimeout(300)
  // S25a (2): the day's list Move — 7 May AM LL + PM OL, move the LL record to 8 May
  await gotoMonth(cdp, page, 'MAY')
  await bid(cdp, page, 'bane', '2026-05-07', 'LL', { portion: 'am' })
  await bid(cdp, page, 'bane', '2026-05-07', 'OL', { portion: 'pm' })
  await tapSel(cdp, page, T(cellId('bane', '2026-05-07')))
  await page.waitForSelector(T('daylist'))
  const dlMove = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-move-"]')].map(e => e.dataset.testid))
  await tapSel(cdp, page, T(dlMove[0]))
  await page.waitForTimeout(300)
  await tapSel(cdp, page, T(cellId('bane', '2026-05-08')))
  await page.waitForTimeout(300)
  await shot(page, 'S25a-03-member-day-list-move-confirm-7-to-8-may')
  const bnr = await banner(page)
  if (await vis(page, T('move-confirm'))) await tapSel(cdp, page, T('move-confirm'))
  await page.waitForTimeout(500)
  const c7 = await cellText(page, 'bane', '2026-05-07'), c8 = await cellText(page, 'bane', '2026-05-08')
  await shot(page, 'S25a-04-member-after-day-list-move')
  rec('S25a-list', dlMove.length === 2 && c8.includes('LL') && !c7.includes('LL') ? 'PASS' : 'FAIL', `day's list offered ${dlMove.length} Move chips; banner "${bnr}"; after: 7 May "${c7.replace(/\s+/g, ' ')}", 8 May "${c8.replace(/\s+/g, ' ')}"`, ['S25a-03-member-day-list-move-confirm-7-to-8-may.png', 'S25a-04-member-after-day-list-move.png'])
  // S25a (3): the drag — a bid on 23 Apr, drag-select 23-24 Apr, Move from the selection sheet
  await gotoMonth(cdp, page, 'APR')
  await bid(cdp, page, 'bane', '2026-04-23', 'LL')
  await dragCells(cdp, page, 'bane', '2026-04-23', '2026-04-24')
  const sel = await topSheet(page)
  await shot(page, 'S25a-05-member-drag-select-23-24-apr-sheet')
  const selMove = (sel?.tids || []).find(t => /move|shift/.test(t))
  let c23 = null, c27 = null
  if (selMove) {
    await tapSel(cdp, page, T(selMove)); await page.waitForTimeout(300)
    await tapSel(cdp, page, T(cellId('bane', '2026-04-27'))); await page.waitForTimeout(300)
    if (await vis(page, T('move-confirm'))) await tapSel(cdp, page, T('move-confirm'))
    await page.waitForTimeout(500)
    c23 = await cellText(page, 'bane', '2026-04-23'); c27 = await cellText(page, 'bane', '2026-04-27')
    await shot(page, 'S25a-06-member-after-drag-move')
  }
  rec('S25a-drag', selMove && c27 === 'LL' && c23 === '' ? 'PASS' : 'FAIL', `selection sheet: ${sel ? sel.text : 'none'}; Move control ${selMove || 'NOT OFFERED'}; after: 23 Apr "${c23}", 27 Apr "${c27}"`, ['S25a-05-member-drag-select-23-24-apr-sheet.png', 'S25a-06-member-after-drag-move.png'])
  await closeAny(cdp, page)
  // bids for S3 / S4 / S7 in May and April
  await bid(cdp, page, 'bane', '2026-04-15', 'LL')
  await gotoMonth(cdp, page, 'MAY')
  for (const [d, t, o] of [['2026-05-11', 'LL', {}], ['2026-05-14', 'LL', {}], ['2026-05-21', 'LL', { portion: 'am' }], ['2026-05-21', 'OL', { portion: 'pm' }], ['2026-05-25', 'LL', {}], ['2026-05-26', 'LL', {}], ['2026-05-27', 'LL', {}], ['2026-05-28', 'LL', { portion: 'am' }], ['2026-05-28', 'OL', { portion: 'pm' }], ['2026-05-29', 'LL', { portion: 'am' }]])
    P['bid' + d + t] = await bid(cdp, page, 'bane', d, t, o)
  await shot(page, 'F1-B-member-bids-in-may-before-closing')
  P.lveBefore = await lve(page, 'bane')
  console.log('Phase B bids', JSON.stringify(P))
  /* Phase C — admin approves 15 Apr, 11 May and the 28 May morning, then closes MAY */
  await asAdmin(page)
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-15'))); await page.waitForSelector(T('decide-approve'))
  await tapSel(cdp, page, T('decide-approve')); await page.waitForTimeout(500); await closeAny(cdp, page)
  await gotoMonth(cdp, page, 'MAY')
  await tapSel(cdp, page, T(cellId('bane', '2026-05-11'))); await page.waitForSelector(T('decide-approve'))
  await tapSel(cdp, page, T('decide-approve')); await page.waitForTimeout(500); await closeAny(cdp, page)
  await tapSel(cdp, page, T(cellId('bane', '2026-05-28'))); await page.waitForSelector(T('daylist'))
  const apr = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-approve-"]')].map(e => e.dataset.testid))
  await shot(page, 'F1-C-admin-day-list-28-may')
  await tapSel(cdp, page, T(apr[0])); await page.waitForTimeout(500); await closeAny(cdp, page)
  P.cls = { a11: await classOf(page, 'bane', '2026-05-11'), a28: await cellText(page, 'bane', '2026-05-28') }
  const st2 = await toggleMonths(cdp, page, ['2026-05'])
  P.maySt = st2
  await shot(page, 'F1-C-admin-after-closing-may')
  rec('F1-C', st2['2026-05'] === 'closed' ? 'PASS' : 'FAIL', `admin approved 15 Apr, 11 May, the 28 May morning (${apr.length} approve chips in the list), then closed MAY: ${JSON.stringify(st2)}; cells ${JSON.stringify(P.cls)}`)
  /* Phase D — member again (clock 15 Feb 26): May is closed for everyone */
  await asMember(page)
  await gotoMonth(cdp, page, 'MAY')
  const D = {}
  const noPicker = async () => !(await vis(page, T('bid-picker')))
  const dump = async () => JSON.stringify(await topSheet(page))
  // S4a: a closed day holding his own pending bid — only the note and Delete; nothing to change LL into OL
  await tapSel(cdp, page, T(cellId('bane', '2026-05-14'))); await page.waitForTimeout(400)
  D.s4a = await topSheet(page)
  const hasOL = await vis(page, T('bid-OL'))
  await shot(page, 'S3-01-member-clock-2026-02-15-closed-14-may-own-pending-bid')
  rec('S4a', D.s4a && /pending-note/.test(D.s4a.tids.join()) && !hasOL ? 'PASS' : 'FAIL', `tap on closed 14 May with his pending LL: ${D.s4a ? D.s4a.text : 'no sheet'}; leave buttons offered: ${hasOL}`, ['S3-01-member-clock-2026-02-15-closed-14-may-own-pending-bid.png'])
  // S3 single: Delete, balance gives the day back, Undo puts it back
  const lv0 = await lve(page, 'bane')
  await tapSel(cdp, page, T('closed-delete')); await page.waitForTimeout(600)
  const afterDel = await cellText(page, 'bane', '2026-05-14'), lv1 = await lve(page, 'bane')
  await shot(page, 'S3-02-member-after-delete-14-may')
  await undo(cdp, page)
  const afterUndo = await cellText(page, 'bane', '2026-05-14'), lv2 = await lve(page, 'bane')
  await shot(page, 'S3-03-member-after-undo-14-may')
  rec('S3-single', afterDel === '' && lv1 !== lv0 && afterUndo === 'LL' && lv2 === lv0 ? 'PASS' : 'FAIL', `Delete on closed 14 May: cell "${afterDel}", balance "${lv0}" → "${lv1}"; Undo: cell "${afterUndo}", balance "${lv2}"`, ['S3-02-member-after-delete-14-may.png', 'S3-03-member-after-undo-14-may.png'])
  // S3 day's list (21 May AM LL + PM OL): lines carry Delete only
  await tapSel(cdp, page, T(cellId('bane', '2026-05-21'))); await page.waitForSelector(T('daylist'), { timeout: 3000 }).catch(() => {})
  D.dl = await topSheet(page)
  await shot(page, 'S3-04-member-day-list-closed-21-may')
  const dlClear = (D.dl?.tids || []).filter(t => /^dl-(clear|delete)/.test(t)), dlMv = (D.dl?.tids || []).filter(t => /^dl-move/.test(t))
  if (dlClear[0]) { await tapSel(cdp, page, T(dlClear[0])); await page.waitForTimeout(600) }
  const afterDl = await cellText(page, 'bane', '2026-05-21')
  await shot(page, 'S3-05-member-after-day-list-delete-21-may')
  rec('S3-daylist', dlClear.length === 2 && dlMv.length === 0 && afterDl.replace(/[<>\s]/g, '') !== 'LLOL' ? 'PASS' : 'FAIL', `day's list on closed 21 May: ${D.dl ? D.dl.text : 'none'}; Delete chips ${dlClear.length}, Move chips ${dlMv.length}; after deleting the first: cell "${afterDl}"`, ['S3-04-member-day-list-closed-21-may.png', 'S3-05-member-after-day-list-delete-21-may.png'])
  await closeAny(cdp, page)
  // S3 drag-select (25-27 May)
  await dragCells(cdp, page, 'bane', '2026-05-25', '2026-05-27')
  D.sel = await topSheet(page)
  await shot(page, 'S3-06-member-drag-select-closed-25-27-may')
  const selDel = (D.sel?.tids || []).find(t => /^sel-(clear|delete)/.test(t)), selMv = (D.sel?.tids || []).find(t => /move|shift/.test(t)), selFill = await vis(page, T('sel-LL'))
  if (selDel) { await tapSel(cdp, page, T(selDel)); await page.waitForTimeout(500); D.selConfirm = await topSheet(page); await shot(page, 'S3-06b-member-drag-delete-asks-tap-again'); await tapSel(cdp, page, T(selDel)).catch(() => {}); await page.waitForTimeout(700) }
  const afterSel = ['25', '26', '27'].map(d => null)
  const cs = []; for (const d of ['2026-05-25', '2026-05-26', '2026-05-27']) cs.push(await cellText(page, 'bane', d))
  await shot(page, 'S3-07-member-after-drag-delete-25-27-may')
  rec('S3-drag', selDel && cs.every(c => c === '') ? 'PASS' : 'FAIL', `drag-select over closed 25–27 May: ${D.sel ? D.sel.text : 'none'}; Delete ${selDel || 'NOT OFFERED'}, Move ${selMv || 'not offered'}, fill-LL offered ${selFill}; after: ${JSON.stringify(cs)}`, ['S3-06-member-drag-select-closed-25-27-may.png', 'S3-07-member-after-drag-delete-25-27-may.png'])
  await closeAny(cdp, page)
  // S3 half-day (29 May AM LL)
  await tapSel(cdp, page, T(cellId('bane', '2026-05-29'))); await page.waitForTimeout(400)
  D.half = await topSheet(page)
  await shot(page, 'S3-08-member-half-day-closed-29-may')
  if (await vis(page, T('closed-delete'))) { await tapSel(cdp, page, T('closed-delete')); await page.waitForTimeout(600) }
  const afterHalf = await cellText(page, 'bane', '2026-05-29')
  rec('S3-half', /pending-note/.test((D.half?.tids || []).join()) && afterHalf === '' ? 'PASS' : 'FAIL', `closed 29 May morning-only bid: ${D.half ? D.half.text : 'none'}; after Delete: cell "${afterHalf}"`, ['S3-08-member-half-day-closed-29-may.png'])
  await closeAny(cdp, page)
  /* S4: Pick a range 28 Apr - 10 May: April is open, May is closed */
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-28'))); await page.waitForSelector(T('bid-picker'))
  await tapSel(cdp, page, T('span-range')); await page.waitForTimeout(500)
  await shot(page, 'S4-01-member-pick-a-range-28-apr')
  const rb = {}; for (const d of ['2026-04-28','2026-04-29','2026-04-30','2026-05-07','2026-05-08','2026-05-09','2026-05-10']) rb[d] = await cellText(page, 'bane', d)
  await tapSel(cdp, page, T('span-next')); await page.waitForTimeout(300)
  const mayDayOk = await vis(page, T('span-day-2026-05-10'))
  if (mayDayOk) { await tapSel(cdp, page, T('span-day-2026-05-10')); await page.waitForTimeout(300) }
  D.rangeSel = await txt(page, T('span-selection'))
  await shot(page, 'S4-02-member-range-28-apr-10-may-picked')
  await tapSel(cdp, page, T('bid-LL')); await page.waitForTimeout(600)
  if (await vis(page, T('bid-picker'))) { await tapSel(cdp, page, T('bid-LL')); await page.waitForTimeout(600) }
  D.afterRange = await topSheet(page); D.toast = await page.evaluate(() => (document.querySelector('.toast, [role="status"], [role="alert"]') || {}).innerText || null)
  await shot(page, 'S4-03-member-after-range-28-apr-10-may')
  const ra = {}; for (const d of ['2026-04-28','2026-04-29','2026-04-30']) ra[d] = await cellText(page, 'bane', d)
  await gotoMonth(cdp, page, 'MAY')
  for (const d of ['2026-05-07','2026-05-08','2026-05-09','2026-05-10']) ra[d] = await cellText(page, 'bane', d)
  await shot(page, 'S4-04-member-may-after-range')
  const mayWritten = ['2026-05-09','2026-05-10'].some(d => ra[d] !== '') || ra['2026-05-07'] !== rb['2026-05-07'] || ra['2026-05-08'] !== rb['2026-05-08']
  rec('S4-range', ['2026-04-28','2026-04-29','2026-04-30'].every(d => ra[d] === 'LL') && !mayWritten ? 'PASS' : 'FAIL', `range ${D.rangeSel} filled LL: April 28-30 now ${JSON.stringify([ra['2026-04-28'], ra['2026-04-29'], ra['2026-04-30']])}; May 7-10 before ${JSON.stringify([rb['2026-05-07'], rb['2026-05-08'], rb['2026-05-09'], rb['2026-05-10']])} after ${JSON.stringify([ra['2026-05-07'], ra['2026-05-08'], ra['2026-05-09'], ra['2026-05-10']])}; after the press: sheet ${D.afterRange ? D.afterRange.text.slice(-200) : 'closed'}; toast ${D.toast}`, ['S4-02-member-range-28-apr-10-may-picked.png', 'S4-03-member-after-range-28-apr-10-may.png', 'S4-04-member-may-after-range.png'])
  await closeAny(cdp, page)
  // S4: drag-select 29 Apr - 4 May and fill LL (April open, May closed). First clean the range's April bids.
  await gotoMonth(cdp, page, 'APR')
  for (const d of ['2026-04-28', '2026-04-29', '2026-04-30']) {
    await tapSel(cdp, page, T(cellId('bane', d))); await page.waitForSelector(T('bid-picker'))
    await tapSel(cdp, page, T('bid-clear')); await page.waitForTimeout(400); await closeAny(cdp, page)
  }
  await dragCells(cdp, page, 'bane', '2026-04-29', '2026-05-02').catch(e => console.log('dragfail', e.message))
  D.fillSel = await topSheet(page)
  await shot(page, 'S4-05-member-drag-select-29-apr-to-2-may')
  console.log('FILLSEL', JSON.stringify(D.fillSel))
  let fillRes = null
  if (D.fillSel && (D.fillSel.tids || []).includes('sel-LL')) {
    await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(600)
    if (await vis(page, T('select-sheet')) && /below zero|again/i.test((await topSheet(page)).text)) { await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(600) }
    fillRes = await topSheet(page)
    await shot(page, 'S4-06-member-after-drag-fill-29-apr-to-2-may')
  }
  const fl = {}; for (const d of ['2026-04-29', '2026-04-30']) fl[d] = await cellText(page, 'bane', d)
  await gotoMonth(cdp, page, 'MAY')
  for (const d of ['2026-05-01', '2026-05-02']) fl[d] = await cellText(page, 'bane', d)
  await shot(page, 'S4-07-member-may-after-drag-fill')
  rec('S4-dragfill', fl['2026-04-29'] === 'LL' && fl['2026-04-30'] === 'LL' && fl['2026-05-01'] === '' && fl['2026-05-02'] === '' ? 'PASS' : 'FAIL', `drag-select 29 Apr - 2 May: ${D.fillSel ? D.fillSel.text.slice(0, 80) : 'no sheet'}; after LL: ${JSON.stringify(fl)}; sheet then: ${fillRes ? fillRes.text.slice(-160) : 'closed'}`, ['S4-05-member-drag-select-29-apr-to-2-may.png', 'S4-06-member-after-drag-fill-29-apr-to-2-may.png', 'S4-07-member-may-after-drag-fill.png'])
  await closeAny(cdp, page)
  // S4: Move an April bid +7 into closed May (27 Apr -> 4 May)
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-27'))); await page.waitForSelector(T('decide-shift'))
  await tapSel(cdp, page, T('decide-shift')); await page.waitForTimeout(300)
  await gotoMonth(cdp, page, 'MAY')
  await tapSel(cdp, page, T(cellId('bane', '2026-05-04'))); await page.waitForTimeout(500)
  const mvb = await banner(page), mvc = await vis(page, T('move-confirm'))
  await shot(page, 'S4-08-member-move-27-apr-into-closed-4-may')
  rec('S4-move', !mvc ? 'PASS' : 'FAIL', `landing on closed 4 May: confirm offered ${mvc}; banner "${mvb}"`, ['S4-08-member-move-27-apr-into-closed-4-may.png'])
  await closeAny(cdp, page)
  // S25c: source day closed since — Move is not offered (only Delete): already read on S3 (closed-note sheet has Delete only; the day's list 0 Move chips, the drag sheet no Move)
  rec('S25c', D.s4a && !/Move/.test(D.s4a.text) && !selMv && dlMv.length === 0 ? 'PASS' : 'FAIL', `source day closed since: single-bid sheet "${D.s4a ? D.s4a.text : ''}" (no Move word: ${D.s4a ? !/Move/.test(D.s4a.text) : '?'}); day's list Move chips ${dlMv.length}; drag-select Move ${selMv || 'not offered'}`, ['S3-01-member-clock-2026-02-15-closed-14-may-own-pending-bid.png', 'S3-04-member-day-list-closed-21-may.png', 'S3-06-member-drag-select-closed-25-27-may.png'])
  // S7: his own approved leave — remarks at any time (11 May closed, 15 Apr open), no other change
  await tapSel(cdp, page, T(cellId('bane', '2026-05-11'))); await page.waitForTimeout(500)
  D.rem11 = await topSheet(page)
  await shot(page, 'S7-01-member-clock-2026-02-15-approved-leave-closed-11-may')
  const rem11 = D.rem11 && (D.rem11.tids || []).some(t => /remarks-/.test(t))
  await closeAny(cdp, page)
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('bane', '2026-04-15'))); await page.waitForTimeout(500)
  D.rem15 = await topSheet(page)
  await shot(page, 'S7-02-member-clock-2026-02-15-approved-leave-open-15-apr')
  const rem15 = D.rem15 && (D.rem15.tids || []).some(t => /remarks-/.test(t))
  const banned = t => t && /Delete|Move|Refuse|Back to bid|Approve|bid-LL/.test(t.text + ' ' + t.tids.join(' '))
  rec('S7a', rem11 && rem15 && !banned(D.rem11) && !banned(D.rem15) ? 'PASS' : 'FAIL', `approved leave on closed 11 May: ${D.rem11 ? D.rem11.text.slice(0, 160) : 'nothing'}; on open 15 Apr: ${D.rem15 ? D.rem15.text.slice(0, 160) : 'nothing'}; remarks editor on both: ${rem11}/${rem15}`, ['S7-01-member-clock-2026-02-15-approved-leave-closed-11-may.png', 'S7-02-member-clock-2026-02-15-approved-leave-open-15-apr.png'])
  await closeAny(cdp, page)
  // S7 day's list: 28 May — approved morning + pending afternoon on a closed day
  await gotoMonth(cdp, page, 'MAY')
  await tapSel(cdp, page, T(cellId('bane', '2026-05-28'))); await page.waitForTimeout(500)
  D.dl28 = await topSheet(page)
  await shot(page, 'S7-03-member-day-list-approved-plus-pending-closed-28-may')
  const note28 = (D.dl28?.tids || []).some(t => /^dl-note-/.test(t))
  rec('S7b', note28 ? 'PASS' : 'FAIL', `day's list on closed 28 May: ${D.dl28 ? D.dl28.text : 'none'}; a Note chip on the approved line: ${note28}`, ['S7-03-member-day-list-approved-plus-pending-closed-28-may.png'])
  await closeAny(cdp, page)
  // S35: a member taps a closed day on someone else's row (Saber, 5 May)
  await tapSel(cdp, page, T(cellId('stiff', '2026-05-05'))); await page.waitForTimeout(500)
  D.s35 = await topSheet(page)
  await shot(page, 'S35-01-member-clock-2026-02-15-closed-day-on-saber-row')
  rec('S35', 'RECORD', `member taps closed 5 May on Saber's row: ${D.s35 ? D.s35.text.slice(0, 200) : 'nothing opened'}`, ['S35-01-member-clock-2026-02-15-closed-day-on-saber-row.png'])
  await closeAny(cdp, page)
  // S35b: an OPEN day on someone else's row too (Saber, 20 Apr)
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('stiff', '2026-04-20'))); await page.waitForTimeout(500)
  D.s35b = await topSheet(page)
  await shot(page, 'S35-02-member-clock-2026-02-15-open-day-on-saber-row')
  rec('S35b', 'RECORD', `member taps open 20 Apr on Saber's row: ${D.s35b ? D.s35b.text.slice(0, 200) : 'nothing opened'}`, ['S35-02-member-clock-2026-02-15-open-day-on-saber-row.png'])
  await closeAny(cdp, page)
  console.log('D', JSON.stringify(D))
}
/* ---------- S14 / S21 / S22 : the window on a phone, admin ---------- */
SC.S14 = async ({ page, cdp }) => {
  await signIn(page, 'admin')
  await openWindow(cdp, page)
  // close the demo's JAN-MAR first so the drag starts from nothing open
  const K = m => `2026-${String(m).padStart(2, '0')}`
  const ctr = async m => centre(page, T(`od-month-${K(m)}`))
  await toggleMonthsKeep(cdp, page, [K(1), K(2), K(3)])
  const may = await ctr(5), jun = await ctr(6), sep = await ctr(9)
  const path = [may, { x: (may.x + jun.x) / 2, y: may.y }, jun, { x: jun.x - 40, y: jun.y + 14 }, { x: jun.x - 100, y: jun.y + 30 }, { x: sep.x + 20, y: sep.y - 6 }, sep]
  await holdDrag(cdp, page, path.map(p => ({ x: p.x, y: p.y })), 320)
  await page.waitForTimeout(400)
  const ls = await lines(page), st = await states(page, [K(4), K(5), K(6), K(7), K(8), K(9), K(10)])
  await shot(page, 'S14-01-admin-phone-hold-may-drag-to-sep-row-2')
  rec('S14-phone', ls.length === 1 && /1? ?May.*30 Sep|May.*Sep/.test(ls[0]) && ['05', '06', '07', '08', '09'].every(m => st[K(+m)] === 'open') && st[K(4)] === 'closed' && st[K(10)] === 'closed' ? 'PASS' : 'FAIL', `hold MAY, drag through JUN then straight to SEP on the second row (never over JUL, AUG): lines ${JSON.stringify(ls)}; states ${JSON.stringify(st)}`, ['S14-01-admin-phone-hold-may-drag-to-sep-row-2.png'])
  // one Undo takes the whole drag back (B12)
  await closeWindow(cdp, page)
  await undo(cdp, page)
  await openWindow(cdp, page)
  const lsU = await lines(page)
  rec('S14-undo', lsU.every(l => !/May|Sep/.test(l)) ? 'PASS' : 'FAIL', `one Undo after the drag: lines now ${JSON.stringify(lsU)}`, [])
  // S21: a finger that scrolls opens nothing; a quick tap with jitter opens exactly one month
  const before = await states(page, [K(4), K(5), K(6), K(7)])
  const a = await ctr(7)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }] })
  for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + 1, y: a.y + i * 12, id: 1 }] }); await page.waitForTimeout(25) }
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(400)
  const afterScroll = await states(page, [K(4), K(5), K(6), K(7)])
  await shot(page, 'S21-01-admin-phone-vertical-swipe-from-jul')
  // a hold-then-vertical-move
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }] })
  await page.waitForTimeout(60)
  for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y - i * 10, id: 1 }] }); await page.waitForTimeout(25) }
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(400)
  const afterSwipeUp = await states(page, [K(4), K(5), K(6), K(7)])
  // tap with 3px jitter
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }] })
  await page.waitForTimeout(30)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + 3, y: a.y + 2, id: 1 }] })
  await page.waitForTimeout(40)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(400)
  const afterJitter = await states(page, [K(4), K(5), K(6), K(7)])
  const openCount = o => Object.values(o).filter(v => v === 'open').length
  await shot(page, 'S21-02-admin-phone-tap-with-jitter-on-jul')
  rec('S21', openCount(afterScroll) === 0 && openCount(afterSwipeUp) === 0 && afterJitter[K(7)] === 'open' && openCount(afterJitter) === 1 ? 'PASS' : 'FAIL', `states before ${JSON.stringify(before)}; after a downward swipe starting on JUL ${JSON.stringify(afterScroll)}; after a short hold then upward move ${JSON.stringify(afterSwipeUp)}; after a quick tap with 3px jitter ${JSON.stringify(afterJitter)}`, ['S21-01-admin-phone-vertical-swipe-from-jul.png', 'S21-02-admin-phone-tap-with-jitter-on-jul.png'])
}
SC.S22 = async ({ page, cdp }) => {
  await signIn(page, 'admin')
  const rowH = async () => page.evaluate(() => { const c = document.querySelector('[data-testid="open-chip"]'); const row = c.parentElement; const r = c.getBoundingClientRect(), p = row.getBoundingClientRect(); const lg = document.querySelector('[data-testid="legend-open"]').getBoundingClientRect(); return { chipH: Math.round(r.height), rowH: Math.round(p.height), chipW: Math.round(r.width), legendRight: Math.round(lg.right), legendTop: Math.round(lg.top), chipTop: Math.round(r.top), text: c.innerText.replace(/\s+/g, ' ') } })
  const one = await rowH()
  await openWindow(cdp, page)
  await toggleMonthsKeep(cdp, page, ['2026-04'])           // adds a second stretch? Jan-Mar plus Apr joins - so open MAY..AUG alone instead
  await toggleMonthsKeep(cdp, page, ['2026-04'])           // back to closed
  await toggleMonthsKeep(cdp, page, ['2026-05', '2026-06', '2026-07', '2026-08'])
  const ls = await lines(page)
  await closeWindow(cdp, page)
  await page.waitForTimeout(400)
  const two = await rowH()
  await shot(page, 'S22-01-admin-phone-two-stretches-second-line', { clip: { x: 0, y: 90, width: 390, height: 60 } })
  rec('S22', ls.length === 2 && two.chipH <= one.chipH + 2 && two.rowH <= one.rowH + 2 && two.legendRight <= 390 && two.legendTop === one.legendTop ? 'PASS' : 'FAIL', `lines in the window ${JSON.stringify(ls)}; one stretch: chip ${JSON.stringify(one)}; two stretches: chip ${JSON.stringify(two)} (line height ${two.rowH}px vs ${one.rowH}px; the Legend stays at the same height and inside 390)`, ['S22-01-admin-phone-two-stretches-second-line.png'])
}

/* ---------- S26 : D1211 today edges, clock 15 Feb 26 (member) and the admin ---------- */
const probeTaps = async (cdp, page, who, dates) => {
  const out = {}
  for (const d of dates) {
    await tapSel(cdp, page, T(cellId(who, d))); await page.waitForTimeout(450)
    out[d] = (await vis(page, T('bid-picker'))) ? 'bid window' : (await vis(page, T('closed-note-text'))) ? 'closed note' : (await vis(page, T('pending-note'))) ? 'pending note' : 'nothing'
    await closeAny(cdp, page)
  }
  return out
}
const boxes = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-box"]')].map(e => e.dataset.from + '..' + (e.dataset.to || '?')))
SC.S26 = async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  const m = await probeTaps(cdp, page, 'bane', ['2026-02-14', '2026-02-15', '2026-02-16'])
  const mb = await boxes(page)
  await shot(page, 'S26-01-member-clock-2026-02-15-outline-from-today')
  await dragCells(cdp, page, 'bane', '2026-02-12', '2026-02-18')
  const sel = await topSheet(page)
  let fill = null
  if (sel && sel.tids.includes('sel-LL')) {
    await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(600)
    if (/below zero|again/i.test((await topSheet(page)).text)) { await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(600) }
    fill = await topSheet(page)
  }
  const cs = {}; for (const d of ['2026-02-12', '2026-02-13', '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18']) cs[d.slice(8)] = await cellText(page, 'bane', d)
  await shot(page, 'S26-02-member-clock-2026-02-15-drag-fill-12-to-18-feb')
  rec('S26-member', m['2026-02-14'] !== 'bid window' && m['2026-02-15'] === 'bid window' && m['2026-02-16'] === 'bid window' && cs['12'] === '' && cs['13'] === '' && cs['14'] === '' && cs['15'] === 'LL' && cs['18'] === 'LL' ? 'PASS' : 'FAIL', `taps: 14 Feb ${m['2026-02-14']}, 15 Feb ${m['2026-02-15']}, 16 Feb ${m['2026-02-16']}; outline ${JSON.stringify(mb)}; drag 12-18 Feb fill LL: cells ${JSON.stringify(cs)}; the sheet then said: ${fill ? fill.text.slice(-130) : 'closed'}`, ['S26-01-member-clock-2026-02-15-outline-from-today.png', 'S26-02-member-clock-2026-02-15-drag-fill-12-to-18-feb.png'])
}
SC.S26a = async ({ page, cdp }) => {
  await signIn(page, 'admin')
  await gotoMonth(cdp, page, 'FEB')
  const a = await probeTaps(cdp, page, 'stiff', ['2026-02-14', '2026-02-15', '2026-02-16'])
  const ab = await boxes(page)
  await shot(page, 'S26-03-admin-outline-whole-stretch')
  rec('S26-admin', Object.values(a).every(v => v === 'bid window') && ab.length === 1 && ab[0].startsWith('2026-01-01') ? 'PASS' : 'FAIL', `admin taps on Saber's 14, 15, 16 Feb: ${JSON.stringify(a)}; outline ${JSON.stringify(ab)}`, ['S26-03-admin-outline-whole-stretch.png'])
}
/* ---------- S34b : the admin's member view (tap his name badge) ---------- */
SC.S34b = async ({ page, cdp }) => {
  const flip = async () => { await tapSel(cdp, page, '#burger'); await page.waitForTimeout(500); const b = page.getByRole('button', { name: /member view|admin view/i }).first(); const c = await b.boundingBox(); await finger(cdp, page, c.x + c.width / 2, c.y + c.height / 2); await page.waitForTimeout(800) }
  await signIn(page, 'admin')
  await page.evaluate(() => window.lwSetMemberToday('2026-02-15'))
  await gotoMonth(cdp, page, 'FEB')
  const asAdm = { box: await boxes(page), locked: await page.locator('td.locked').count() }
  await flip()
  await gotoMonth(cdp, page, 'FEB')
  const asMem = { box: await boxes(page), locked: await page.locator('td.locked').count(), badge: await txt(page, T('lw-viewing')) }
  await gotoMonth(cdp, page, 'APR')
  await tapSel(cdp, page, T(cellId('stiff', '2026-04-01'))); await page.waitForTimeout(500)
  const note = (await vis(page, T('closed-note-text'))) ? 'closed note' : (await vis(page, T('bid-picker'))) ? 'bid window' : 'nothing'
  await shot(page, 'S34b-01-admin-member-view-clock-2026-02-15-closed-1-apr-on-own-row')
  await closeAny(cdp, page)
  await flip()
  await gotoMonth(cdp, page, 'FEB')
  const back = { box: await boxes(page), locked: await page.locator('td.locked').count(), badge: await txt(page, T('lw-viewing')) }
  await tapSel(cdp, page, T(cellId('stiff', '2026-04-01'))); await page.waitForTimeout(500)
  const noteBack = (await vis(page, T('bid-picker'))) ? 'bid window' : (await vis(page, T('closed-note-text'))) ? 'closed note' : 'nothing'
  await shot(page, 'S34b-02-admin-back-closed-1-apr-opens-bid-window')
  await closeAny(cdp, page)
  rec('S34b', asMem.locked > 0 && asAdm.locked === 0 && note === 'closed note' && back.locked === 0 && noteBack === 'bid window' && /2026-02-15/.test(asMem.box.join()) && /2026-01-01/.test(back.box.join()) ? 'PASS' : 'FAIL', `as admin: ${JSON.stringify(asAdm)}; member view: ${JSON.stringify(asMem)}, tap 1 Apr on his own row -> ${note}; back to admin (no reload): ${JSON.stringify(back)}, same tap -> ${noteBack}`, ['S34b-01-admin-member-view-clock-2026-02-15-closed-1-apr-on-own-row.png', 'S34b-02-admin-back-closed-1-apr-opens-bid-window.png'])
}
/* ---------- S30 + S29 : the admin's drag-select panel behind other changes ---------- */
SC.S30 = async ({ page, cdp }) => {
  await signIn(page, 'admin')
  await gotoMonth(cdp, page, 'FEB')
  await bid(cdp, page, 'bane', '2026-02-05', 'LL')
  const placed = await classOf(page, 'bane', '2026-02-05')
  await dragCells(cdp, page, 'bane', '2026-02-04', '2026-02-06')
  const panel = await topSheet(page)
  await shot(page, 'S30-01-admin-drag-select-panel-4-6-feb-with-pending-ll')
  // tap Ranger's 5 Feb behind the panel, refuse it
  await tapSel(cdp, page, T(cellId('bane', '2026-02-05'))); await page.waitForTimeout(500)
  const over = await topSheet(page)
  const canRefuse = await vis(page, T('decide-refuse'))
  if (canRefuse) { await tapSel(cdp, page, T('decide-refuse')); await page.waitForTimeout(500) }
  const afterRefuse = await classOf(page, 'bane', '2026-02-05')
  const panelStill = await vis(page, T('select-sheet'))
  await shot(page, 'S30-02-admin-after-refusing-5-feb-behind-the-panel')
  let afterApprove = null, said = null
  if (panelStill && await vis(page, T('sel-approve'))) {
    await tapSel(cdp, page, T('sel-approve')); await page.waitForTimeout(600)
    afterApprove = await classOf(page, 'bane', '2026-02-05'); said = (await topSheet(page))?.text.slice(-140)
    await shot(page, 'S30-03-admin-stale-approve-pressed')
  }
  const approvedAnyway = afterApprove && /appr/.test(afterApprove)
  rec('S30', canRefuse && panelStill && afterApprove !== null && !approvedAnyway ? 'PASS' : (!panelStill ? 'RECORD' : 'FAIL'), `placed LL class ${placed}; panel: ${panel ? panel.text.slice(0, 70) : 'none'}; tap on 5 Feb behind it opened: ${over ? over.text.slice(0, 60) : 'nothing'}; refuse offered ${canRefuse}; after refuse class ${afterRefuse}, select panel still up: ${panelStill}; after the panel's Approve class ${afterApprove}; screen said ${said}`, ['S30-01-admin-drag-select-panel-4-6-feb-with-pending-ll.png', 'S30-02-admin-after-refusing-5-feb-behind-the-panel.png', 'S30-03-admin-stale-approve-pressed.png'])
}
SC.S29 = async ({ page, cdp }) => {
  await signIn(page, 'admin')
  await gotoMonth(cdp, page, 'FEB')
  await dragCells(cdp, page, 'bane', '2026-02-04', '2026-02-06')
  const before = await topSheet(page)
  const chipVis = await vis(page, T('open-chip'))
  let after = null, closedFeb = null
  if (chipVis) {
    await tapSel(cdp, page, T('open-chip')); await page.waitForTimeout(500)
    const inWin = await vis(page, T('open-dates'))
    if (inWin) { await tapSel(cdp, page, T('od-month-2026-02')); await page.waitForTimeout(400); closedFeb = (await lines(page)); await closeWindow(cdp, page) }
    after = { selectSheetStillUp: await vis(page, T('select-sheet')), sheet: (await topSheet(page))?.text.slice(0, 120) }
  }
  await shot(page, 'S29-01-admin-after-closing-feb-with-the-select-panel')
  let fill = null
  if (after?.selectSheetStillUp && await vis(page, T('sel-LL'))) { await tapSel(cdp, page, T('sel-LL')); await page.waitForTimeout(600); fill = { cells: [await cellText(page, 'bane', '2026-02-04'), await cellText(page, 'bane', '2026-02-05'), await cellText(page, 'bane', '2026-02-06')] } }
  rec('S29', 'RECORD', `admin selects 4-6 Feb (panel: ${before ? before.text.slice(0, 60) : 'none'}), chip reachable ${chipVis}, closes FEB (lines then ${JSON.stringify(closedFeb)}); the panel afterwards: ${JSON.stringify(after)}; pressing LL in it wrote ${JSON.stringify(fill)}. The member-side half (a member's bid window open while the admin closes the day) needs two live sessions: NOT WALKED`, ['S29-01-admin-after-closing-feb-with-the-select-panel.png'])
}
/* ---------- S9 : year end, member clock 15 Dec 26 ---------- */
SC.S9 = async ({ page, cdp }) => {
  await signInPlain(page, 'admin')
  await toggleMonths(cdp, page, ['2026-12'])
  await tapSel(cdp, page, T('war-picker')); await page.waitForTimeout(500)
  const pick = await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"], [role="option"], .warmenu button, [data-testid^="war-"]')].map(e => (e.dataset.testid || '') + '|' + e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 8))
  console.log('WARPICK', JSON.stringify(pick))
  await shot(page, 'S9-00-admin-war-picker')
}
SC.S27 = async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  const awards = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-bane-"]')].filter(td => /FO|HO/.test(td.innerText)).map(td => td.dataset.testid + ':' + td.innerText))
  rec('S27-probe', 'RECORD', `Ranger's demo row cells reading FO/HO: ${JSON.stringify(awards)}`)
}

for (const id of Object.keys(SC)) await run(id, SC[id])
console.log('RESULTS', JSON.stringify(results.map(r => [r.id, r.verdict])))
console.log('ERRORS', allErrs.length, JSON.stringify(allErrs.slice(0, 10)))
process.exit(0)
