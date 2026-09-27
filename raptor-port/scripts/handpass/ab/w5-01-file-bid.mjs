/* W5 — ORDER 1: FILE then BID / BID then FILE (Fable S7, Astra 5), on UNPUBLISHED days, with undo / redo / reload and
   the two accounts. Written as assertions of the RIGHT behaviour — a PASS means correct; re-running it IS the re-walk.
   Rules: item 17 / B6 (the free half beside Inputs-filed leave is offered, the other named), N3 / answer B (an Inputs
   filing replaces the clashing half of a bid and leaves a notice), D166 (5) (the notice names the filer by CALLSIGN),
   "the member's own filing leaves a message, no notice", the one timeline (one Undo takes the whole filing back —
   the bid returns, the notice goes; Redo re-makes it with the same actor), persistence (a reload keeps the last state).
   A member bids only inside the war's bidding window (canEditCell: 1 Jan – 31 Mar 26) and only on his own row (D166 (4)),
   so the member's days are in early February 2026. Usage (from raptor-port/, the build on 4175):
     node scripts/handpass/ab/w5-01-file-bid.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { relogin } = await import('../am/w4-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, lwShot, figures, rowRun, bidOn } = L
const { undo, redo, reload, snap } = X
const PHONE = W === 'phone'
const R = resultBook(`W5-01-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-01-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w5-01-${W}-THREW-${name}`).catch(() => {}) } }
const P = 'bane'   // Ranger — the member account `us`
const A = '2026-02-02', B = '2026-02-03', C = '2026-02-04', D = '2026-02-05', E = '2026-02-06', F = '2026-02-09'
const ALL = [A, B, C, D, E, F]
const pic = n => `w5-01-${W}-${n}`
const lvOf = figs => figs ? Object.entries(figs).filter(([k]) => /^(ll|lve|ol|oil|med)/i.test(k)).map(([k, v]) => `${k}=${v}`).join(' ') : ''

/* ---- session 1, the admin: file the morning of A, and the whole of E, on the Inputs page */
let base
await step('s1-admin-files', async () => {
  await lwOpen(page, A)
  base = await snap(page, P, ALL)
  R.note('s1-baseline', base)
  const a = await fileInput(page, { person: P, type: 'LL', from: A, span: 'am', remarks: 'W5 A morning, filed' })
  const e = await fileInput(page, { person: P, type: 'LL', from: E, remarks: 'W5 E whole day, filed' })
  R.ck('s1-filed', a.added === 1 && e.added === 1, 'the admin files Ranger LL (AM) on A and LL (whole day) on E', { a, e })
})

/* ---- session 2, the member (Ranger): file-then-bid on A, bids on B C D F, his own filing over his own bid on D */
await step('s2-signin-member', async () => {
  await relogin(page, 'm'); await toastSpy(page)
  const who = await page.evaluate(() => (document.querySelector('.lw-viewing, .whoami, #whoBadge, .acct') || {}).innerText || '')
  R.note('s2-signed-in-as', who)
})
await step('A-file-then-bid', async () => {
  await lwOpen(page, A)
  const before = await L.lwCell(page, P, A)
  const t = await tapCell(page, P, A)
  await shot(page, pic('A1-member-taps-filed-morning'))
  const offered = (t.buttons || []).filter(b => /^portion-/.test(b))
  R.ck('A-sheet-afternoon-only', t.open === 'bid-picker' && offered.length === 1 && /portion-pm/.test(offered[0]) && /morning is .*Inputs page/i.test(t.text || ''),
    'the bid sheet opens on the AFTERNOON only, and names the morning as filed on the Inputs page (item 17)', { box: before.box, open: t.open, portions: offered, text: (t.text || '').slice(0, 260) })
  const b = await sheetPress(page, 'bid-LL')
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
  await closeSheets(page)
  const after = await L.lwCell(page, P, A)
  R.ck('A-box-after-pm-bid', b.pressed && /LL/.test(after.box) && /\+1/.test(after.mark || '') && !/!/.test(after.mark || ''),
    'the box keeps the filed morning and wears +1 for the afternoon bid; no amber (the two halves do not meet)', { before, after })
  await lwShot(page, pic('A2-after-pm-bid'), P, A)
})
await step('member-bids-B-C-D-F', async () => {
  const rb = await bidOn(page, P, B, 'LL', { portion: 'pm' })
  const rc = await bidOn(page, P, C, 'LL', { portion: 'pm' })
  const rd = await bidOn(page, P, D, 'LL', { portion: 'pm' })
  const rf = await bidOn(page, P, F, 'LL', { portion: 'full' })
  R.ck('member-bids', rb.placed && rc.placed && rd.placed && rf.placed, 'Ranger bids LL (PM) on B, C, D and LL (whole day) on F on his own row', { rb, rc, rd, rf })
  R.note('member-bids-row', await rowRun(page, P, ALL))
})
let figsAfterBids
await step('D-own-filing-over-own-bid', async () => {
  figsAfterBids = await snap(page, P, ALL)
  await toasts(page)
  const d = await fileInput(page, { remarks: 'W5 D my own leave', type: 'LL', from: D })
  const ts = await toasts(page)
  await lwOpen(page, D)
  const cell = await L.lwCell(page, P, D)
  const t = await tapCell(page, P, D)
  await shot(page, pic('D1-own-filing-over-own-bid'))
  await closeSheets(page)
  const notice = (t.lines || []).some(l => /replaced by/i.test(l)) || /replaced by/i.test(t.text || '')
  R.ck('D-no-notice', d.added === 1 && !notice && !/!/.test(cell.mark || ''), 'his own filing over his own afternoon bid: the bid half goes, NO notice, no amber', { added: d.added, cell, open: t.open, lines: t.lines, text: (t.text || '').slice(0, 200) })
  R.ck('D-message', ts.length > 0 || !!d.toast, 'he is told what happened to his bid (a message)', { toasts: ts, formToast: d.toast })
})
await step('E-member-taps-filed-whole-day', async () => {
  const t = await tapCell(page, P, E)
  await shot(page, pic('E1-member-taps-filed-whole-day'))
  await closeSheets(page)
  R.ck('E-read-only', t.open === 'raptor-sheet' && /Inputs page/i.test(t.text || '') && !(t.buttons || []).some(b => /^bid-(LL|OL)/.test(b)),
    'a whole day filed on the Inputs page opens the read-only "Leave from Raptor" sheet that sends him to the Inputs page — no bid offered', { open: t.open, text: (t.text || '').slice(0, 200), buttons: t.buttons })
})

/* ---- session 3, the admin: bid-then-file on B (morning), C (whole day over the PM bid), F (whole day over a whole bid) */
await step('s3-signin-admin', async () => { await relogin(page, 'a'); await toastSpy(page) })
await step('B-bid-then-file-other-half', async () => {
  const b = await fileInput(page, { person: P, type: 'LL', from: B, span: 'am', remarks: 'W5 B morning, filed after his PM bid' })
  await lwOpen(page, B)
  const cell = await L.lwCell(page, P, B)
  const t = await tapCell(page, P, B)
  await shot(page, pic('B1-bid-then-file-other-half'))
  await closeSheets(page)
  const notice = (t.lines || []).some(l => /replaced by/i.test(l))
  R.ck('B-bid-untouched', b.added === 1 && !notice && /\+1/.test(cell.mark || '') && !/!/.test(cell.mark || ''),
    'filing the morning after his afternoon bid: the bid is untouched (real times do not meet), +1, NO notice, no amber', { cell, open: t.open, lines: t.lines })
})
let cRead = {}
await step('C-file-whole-day-over-pm-bid', async () => {
  await toasts(page)
  const c = await fileInput(page, { person: P, type: 'LL', from: C, remarks: 'W5 C whole day, filed over his PM bid' })
  const ts = await toasts(page)
  await lwOpen(page, C)
  const cell = await L.lwCell(page, P, C)
  const t = await tapCell(page, P, C)
  await shot(page, pic('C1-notice-after-filing'))
  await closeSheets(page)
  const nl = (t.lines || []).find(l => /replaced by/i.test(l)) || ''
  cRead.filed = { cell, lines: t.lines, snap: await snap(page, P, [C]) }
  R.ck('C-notice', c.added === 1 && /replaced by LL/i.test(nl) && /\(Saber\)/.test(nl) && /!/.test(cell.mark || ''),
    'the whole-day filing takes the clashing afternoon bid; a notice names the filer by callsign — "Ranger’s LL bid was replaced by LL (Saber)" — with the amber !', { added: c.added, cell, notice: nl, toasts: ts })
})
await step('C-undo', async () => {
  await lwOpen(page, C)
  const u = await undo(page)
  const cell = await L.lwCell(page, P, C)
  const t = await tapCell(page, P, C)
  await shot(page, pic('C2-after-one-undo'))
  await closeSheets(page)
  const ins = (await inputsOf(page, P)).filter(x => /Feb 4/.test(x.date))
  cRead.undone = { u, cell, t: t.open, ins }
  R.ck('C-undo-one-step', u.pressed && !ins.length && !(t.lines || []).some(l => /replaced by/i.test(l)) && /LL/.test(cell.box),
    'ONE Undo takes the whole filing back: the input gone, his afternoon bid back, the notice gone', { undo: u, cell, open: t.open, lines: t.lines, text: (t.text || '').slice(0, 120), inputs: ins })
})
await step('C-redo', async () => {
  const r = await redo(page)
  const cell = await L.lwCell(page, P, C)
  const t = await tapCell(page, P, C)
  await shot(page, pic('C3-after-redo'))
  await closeSheets(page)
  const nl = (t.lines || []).find(l => /replaced by/i.test(l)) || ''
  R.ck('C-redo-same-actor', r.pressed && /\(Saber\)/.test(nl) && /!/.test(cell.mark || ''), 'Redo re-makes the filing, the bid half gone again and the notice back with the same actor (Saber)', { redo: r, cell, notice: nl })
})
await step('F-file-whole-day-over-whole-bid', async () => {
  const f = await fileInput(page, { person: P, type: 'LL', from: F, remarks: 'W5 F whole day, filed over his whole-day bid' })
  await lwOpen(page, F)
  const cell = await L.lwCell(page, P, F)
  const t = await tapCell(page, P, F)
  await shot(page, pic('F1-notice-whole-over-whole'))
  await closeSheets(page)
  const nl = (t.lines || []).find(l => /replaced by/i.test(l)) || ''
  R.ck('F-notice', f.added === 1 && /\(Saber\)/.test(nl), 'a whole-day filing over his whole-day bid replaces it and leaves a notice naming Saber', { cell, open: t.open, lines: t.lines, text: (t.text || '').slice(0, 200) })
})
let s3
await step('s3-money', async () => {
  s3 = await snap(page, P, ALL)
  R.note('s3-row-and-figures', s3)
  R.note('s3-money-vs-baseline', { base: lvOf(base && base.figs), now: lvOf(s3.figs), balBase: base && base.bal, balNow: s3.bal })
})
await step('s3-reload', async () => {
  const rl = await reload(page, 'a')
  await lwOpen(page, A)
  const after = await snap(page, P, ALL)
  await lwShot(page, pic('R1-after-reload-admin'), P, C)
  R.ck('s3-reload-keeps', JSON.stringify(after.run) === JSON.stringify(s3.run) && after.bal === s3.bal && lvOf(after.figs) === lvOf(s3.figs),
    'a reload keeps every box, mark, balance and figure exactly as last left', { rl, before: { run: s3.run, bal: s3.bal }, after: { run: after.run, bal: after.bal, figs: lvOf(after.figs) } })
})

/* ---- session 4, the member: "OK, seen" on C, then what Undo does for him (D148 is decided, not built — RECORD only) */
await step('s4-member-seen', async () => {
  await relogin(page, 'm'); await toastSpy(page)
  await lwOpen(page, C)
  const t = await tapCell(page, P, C)
  await shot(page, pic('S1-member-reads-notice'))
  const nl = (t.lines || []).find(l => /replaced by/i.test(l)) || ''
  R.ck('S-member-notice-words', /^Your LL bid was replaced by LL \(Saber\)/i.test(nl) || /Your .*LL.* bid was replaced by LL \(Saber\)/i.test(nl), 'Ranger reads "Your LL bid was replaced by LL (Saber)"', { lines: t.lines })
  const seen = (t.buttons || []).find(b => /^dl-seen-/.test(b))
  const p = seen ? await sheetPress(page, seen.split(':')[0]) : { pressed: false, why: 'no OK, seen button' }
  await closeSheets(page)
  const cell = await L.lwCell(page, P, C)
  const t2 = await tapCell(page, P, C)
  await shot(page, pic('S2-after-ok-seen'))
  await closeSheets(page)
  R.ck('S-ok-seen-clears', p.pressed && !(t2.lines || []).some(l => /replaced by/i.test(l)) && !/!/.test(cell.mark || ''), '"OK, seen" clears the notice and its amber', { pressed: p, cell, after: t2.lines || t2.open })
})
await step('s4-member-undo', async () => {
  const u = await undo(page)
  const cell = await L.lwCell(page, P, C)
  const ins = (await inputsOf(page, P)).map(x => `${x.type} ${x.date}${x.endDate ? '–' + x.endDate : ''} ${x.allday ? 'all' : x.s + '-' + x.e}`)
  await lwShot(page, pic('S3-member-undo'), P, C)
  R.note('S-member-undo-RECORD (D148 not built)', { undo: u, cellC: cell, inputs: ins })
  if (u.pressed) { const u2 = await undo(page); R.note('S-member-undo-2-RECORD', { undo: u2, row: await rowRun(page, P, ALL) }) }
})
await step('s4-reload', async () => {
  const rl = await reload(page, 'm')
  await lwOpen(page, A)
  R.note('s4-after-reload', { rl, row: await rowRun(page, P, ALL), inputs: (await inputsOf(page, P)).length })
  await lwShot(page, pic('S4-member-after-reload'), P, C)
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
