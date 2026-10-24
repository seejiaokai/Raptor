// Walker 2 — break tests 4, 5, 6 (the drag window's words; his approved leave's window; the closed-day window) and scenario 34 (two tabs).
// usage: node lw-night-w2-breaks.mjs <4|5|6|34> [desk|phone]
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOf, inputsOn, warRecs, dragCells, typeInto } = H
const part = process.argv[2] || '4'
const which = process.argv[3] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone'
const tag = `b${part}-${which === 'desk' ? 'dk' : 'ph'}`
console.log('lw-night-w2-breaks v1', part, which, tag)
H.clearPics(tag)
H.KEEP.toasts = true
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const fmtS = a => JSON.stringify(a)
const w = await L.newCtx(size)
const P = w.page
const dialogs = []
const watch = pg => pg.on('dialog', d => { dialogs.push(`${d.type()}: ${d.message()}`); d.dismiss().catch(() => {}) })
watch(P)
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const ME = ids.Ranger
const shots = []
const snap = async (n, tab = w) => { await L.shot(tab, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const sc = async (id, fn) => { console.log(`-- ${id} [${which}]`); try { await fn() } catch (e) { rec(id, which, 'NOT DONE', String(e).slice(0, 500), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }
const lone = s => /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s)
/* a second tab in the same browser context, signed in as `who` */
async function newTab(who) {
  const pg = await w.ctx.newPage(); watch(pg)
  const errs = []; pg.on('console', m => { if (m.type() === 'error') errs.push('tabB console: ' + m.text().slice(0, 200)) }); pg.on('pageerror', e => errs.push('tabB pageerror: ' + String(e).slice(0, 200))); pg.on('response', r => { if (r.status() >= 400) errs.push(`tabB http ${r.status()}: ` + r.url().slice(0, 100)) })
  const tab = { ...w, page: pg, errsB: errs }
  await H.signInAs(tab, who)
  return tab
}
const anywhere = async text => P.evaluate(t => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && (k.startsWith('raptor:leavewar/rec:') || k.startsWith('raptor:inputs/')) && (localStorage.getItem(k) || '').includes(t)) o.push(k.slice(0, 44)) } return o }, text)

if (part === '4') {
  await sc('B4', async () => {
    const D = ids.Drifter
    await place(w, D, dd(1), 'LL', { approve: false, remarks: 'b4-one' })
    await place(w, D, dd(2), 'OL', { approve: false, remarks: 'b4-two' })
    if (!(await dragCells(w, [D, dd(1)], [D, dd(2)]))) throw new Error('no drag window')
    const payload = '<script>alert(1)</script> <img src=x onerror="window.__xss=1"> 😀 first line\nsecond line after a break ' + 'abcdefghij'.repeat(30)
    const pasted = payload.slice(0, 300)
    await L.press(w, T('sel-remarks')); await P.keyboard.insertText(pasted); await sleep(w, 400)
    const inBox = await P.locator(T('sel-remarks')).inputValue()
    const rows = await P.evaluate(() => { const t = document.querySelector('[data-testid="sel-remarks"]'); return { sh: t.scrollHeight, ch: t.clientHeight } })
    await snap('01-pasted')
    await (w.phone ? L.step(w, `${tag}-02-approve`, T('sel-approve')) : L.press(w, T('sel-approve'))); await sleep(w, 700)
    if (!w.phone) await snap('02-approve')
    const st = (await inputsOf(P, D)).filter(i => i.from >= dd(1) && i.from <= dd(2)).map(i => i.remarks)
    const one = st[0] ?? ''
    const checks = { len: one.length, noBreak: !/[\r\n]/.test(one), literal: one.includes('<script>alert(1)</script>'), img: one.includes('<img src=x onerror='), lone: lone(one), same: st.every(x => x === st[0]), boxLen: inBox.length, boxNoBreak: !/[\r\n]/.test(inBox) }
    // every window and the Inputs page, shown literally
    await L.openCellR(w, D, dd(1)); const win = await P.evaluate(() => ({ v: document.querySelector('[data-testid="bid-remarks"]')?.value ?? null, scripts: document.querySelectorAll('[data-testid="bid-picker"] script').length })); await snap('03-window'); await closeSheet(w)
    const rowsI = await H.inputsPageRows(w, 'Drifter', `${tag}-04-inputs`)
    const inputsHtml = await P.evaluate(() => ({ scripts: document.querySelectorAll('#page-inputs script, #inBody script').length, imgs: document.querySelectorAll('#inBody img[src="x"]').length, text: [...document.querySelectorAll('#inBody tr')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 120)).filter(t => /script/.test(t)).slice(0, 2) }))
    const xss = await P.evaluate(() => window.__xss ?? null)
    rec('B4a', which, checks.len <= 200 && checks.noBreak && checks.literal && !checks.lone && checks.same && dialogs.length === 0 && xss === null && inputsHtml.scripts === 0 && inputsHtml.imgs === 0 && win.v === one ? 'PASS' : 'FAIL',
      `300 characters pasted (with a line break, <script>alert(1)</script>, an <img onerror> and an emoji): the box holds ${checks.boxLen} characters, one line: ${checks.boxNoBreak} (scrollHeight ${rows.sh}, clientHeight ${rows.ch}); after Approve the saved words: ${one.length} characters, no line break: ${checks.noBreak}, <script> kept literally: ${checks.literal}, a broken emoji half at the end: ${checks.lone}; both days the same: ${checks.same}; 1 Dec's window shows the same words: ${win.v === one}; the Inputs page row text: ${fmtS(inputsHtml.text)}, script elements there: ${inputsHtml.scripts}, img elements: ${inputsHtml.imgs}; alert dialogs raised: ${dialogs.length} ${fmtS(dialogs)}; window.__xss: ${xss}`, [`${tag}-01-pasted`, `${tag}-03-window`, `${tag}-04-inputs`])
    // an emoji across the 200th place
    await H.toWar(w, 'admin')
    const R = ids.Ridge
    await place(w, R, dd(1), 'LL', { approve: false, remarks: 'b4-r1' })
    await place(w, R, dd(2), 'LL', { approve: false, remarks: 'b4-r2' })
    if (!(await dragCells(w, [R, dd(1)], [R, dd(2)]))) throw new Error('no drag window (emoji)')
    const edge = 'a'.repeat(199) + '😀' + 'tail'
    await L.press(w, T('sel-remarks')); await P.keyboard.insertText(edge); await sleep(w, 300)
    const eb = await P.locator(T('sel-remarks')).inputValue()
    await L.press(w, T('sel-approve')); await sleep(w, 600)
    const es = (await inputsOf(P, R)).filter(i => i.from >= dd(1) && i.from <= dd(2)).map(i => i.remarks)
    rec('B4b', which, es.every(x => x.length <= 200 && !lone(x)) ? 'PASS' : 'FAIL', `199 letters then an emoji then "tail" pasted: the box kept ${eb.length} units (ends ${fmtS([...eb.slice(-3)].map(c => c.codePointAt(0).toString(16)))}), lone half of an emoji: ${lone(eb)}; saved ${fmtS(es.map(x => ({ len: x.length, lone: lone(x) })))}`, [])
    // two men dragged → no box at all
    await L.closeAny(w)
    if (!(await dragCells(w, [D, dd(5)], [R, dd(6)]))) throw new Error('no drag window over two men')
    const boxes = await P.locator(T('sel-remarks')).count(), row = await L.vis(P, T('sel-rmk-row'))
    await snap('05-two-men'); await closeSheet(w)
    rec('B4c', which, boxes === 0 && !row ? 'PASS' : 'FAIL', `two men dragged: Remarks boxes ${boxes}, Remarks row visible ${row}`, [`${tag}-05-two-men`])
  })
}

if (part === '5') {
  await sc('B5', async () => {
    H.KEEP.toasts = true
    // fixtures as admin: Ranger's approved LL on 14 Dec ("Orig") and on 16 Dec ("Two")
    await place(w, ME, dd(14), 'LL', { approve: true, remarks: 'Orig' })
    await place(w, ME, dd(16), 'LL', { approve: true })
    const M = await newTab('member')   // tab B: Ranger
    const badgeA = await P.evaluate(() => document.querySelector('#roleBadge')?.innerText.trim()), badgeM = await M.page.evaluate(() => document.querySelector('#roleBadge')?.innerText.trim())
    console.log('badges: tab A', badgeA, '| tab M', badgeM)
    // two lines pasted → Enter → one line
    await L.openCellR(M, ME, dd(16))
    if ((await H.sheetOf(M.page)) !== 'remarks-sheet') throw new Error('16 Dec opened ' + await H.sheetOf(M.page))
    await L.press(M, T('remarks-remarks')); await M.page.keyboard.insertText('line one\nline two'); await M.page.keyboard.press('Enter'); await sleep(M, 500)
    const two = (await inputsOn(M.page, ME, dd(16)))[0]?.remarks
    const boxTwo = await M.page.locator(T('remarks-remarks')).inputValue()
    await closeSheet(M)
    rec('B5b', which, two === 'line one line two' ? 'PASS' : 'FAIL', `two lines pasted in his window ("line one" / "line two"), Enter: the box reads "${boxTwo}"; saved "${two}"`, [])
    // the leave deleted by the admin in the other tab while his window is open
    await L.openCellR(M, ME, dd(14))
    if ((await H.sheetOf(M.page)) !== 'remarks-sheet') throw new Error('14 Dec opened ' + await H.sheetOf(M.page))
    await snap('01-his-window-open', M)
    // tab A: the admin deletes it
    await L.reachCell(w, ME, dd(14))
    await L.openCellR(w, ME, dd(14))
    if ((await H.sheetOf(P)) !== 'bid-picker') throw new Error('admin 14 Dec opened ' + await H.sheetOf(P))
    await L.press(w, T('bid-clear')); await sleep(w, 400)
    if (await L.vis(P, T('bid-clear')) && (await H.sheetOf(P)) === 'bid-picker') { await L.press(w, T('bid-clear')); await sleep(w, 600) }
    const gone = (await inputsOn(P, ME, dd(14))).length === 0
    const cellA = await L.boxes(w, ME, dd(14))
    console.log('admin deleted; stored left on 14 Dec:', fmtS(await inputsOn(P, ME, dd(14))))
    // tab M: type and Enter
    await L.press(M, T('remarks-remarks')); await M.page.keyboard.press('Control+A'); await M.page.keyboard.type('Late words'); await M.page.keyboard.press('Enter'); await sleep(M, 800)
    const toasts = await M.page.evaluate(() => { const o = []; const t = document.querySelector('#toastEl'); if (t && t.innerText.trim() && getComputedStyle(t).visibility !== 'hidden' && t.getBoundingClientRect().height > 0) o.push('toast: ' + t.innerText.trim()); for (const e of document.querySelectorAll('.savestat, .saveband')) if (e.getBoundingClientRect().height > 0 && e.innerText.trim()) o.push(e.className + ': ' + e.innerText.trim()); return o })
    const sheetStill = await H.sheetOf(M.page)
    const winText = await M.page.evaluate(() => document.querySelector('[data-testid="remarks-sheet"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null)
    await snap('02-after-late-enter', M)
    const after = await inputsOn(P, ME, dd(14))
    await closeSheet(M)
    const afterClose = await inputsOn(P, ME, dd(14))
    const msgOk = toasts.length > 0 || (winText && /could not|couldn.t|not saved|no longer/i.test(winText))
    rec('B5a', which, gone && !msgOk && after.length ? 'FAIL' : (msgOk ? 'PASS' : 'RECORD'), `the admin deleted Ranger's 14 Dec leave in tab A (stored then: ${gone ? 'gone' : 'STILL THERE'}; tab A's cell: ${fmtS(cellA)}); in tab B his window was still open: typed "Late words" + Enter → what he sees: toasts/notes ${fmtS(toasts)}; the window ${sheetStill === 'remarks-sheet' ? 'stays open' : 'closed'}: "${winText}". Stored on 14 Dec after his Enter: ${fmtS(after.map(i => `${i.type} "${i.remarks}"`))}; after he closes the window: ${fmtS(afterClose.map(i => `${i.type} "${i.remarks}"`))}. The window says it could not be saved: ${msgOk}`, [`${tag}-01-his-window-open`, `${tag}-02-after-late-enter`])
    rec('B5-badges', which, 'RECORD', `after the second tab signed in: tab A reads "${badgeA}", tab B "${badgeM}"`, [])
    if (M.errsB.length) rec('B5-errors-B', which, 'FAIL', M.errsB.slice(0, 5).join(' || '), [])
  })
}

if (part === '27') {
  await sc('S27', async () => {
    // an approved leave the save cannot reach: the drag window of tab A holds typed words over it; tab B (the admin again) deletes the leave; tab A closes its window
    await place(w, ME, dd(14), 'LL', { approve: true, remarks: 'Orig' })
    await place(w, ME, dd(15), 'LL', { approve: false, remarks: 'Pend15' })
    const B = await newTab('admin')
    await P.bringToFront()
    if (!(await dragCells(w, [ME, dd(14)], [ME, dd(15)]))) throw new Error('no drag window over 14–15 Dec')
    await typeInto(w, T('sel-remarks'), 'Stale words')
    await snap('01-typed')
    await B.page.bringToFront(); await L.reachCell(B, ME, dd(14)); await L.openCellR(B, ME, dd(14))
    if ((await H.sheetOf(B.page)) !== 'bid-picker') throw new Error('tab B opened ' + await H.sheetOf(B.page))
    await L.press(B, T('bid-clear')); await sleep(B, 400)
    if (await L.vis(B.page, T('bid-clear')) && (await H.sheetOf(B.page)) === 'bid-picker') { await L.press(B, T('bid-clear')); await sleep(B, 600) }
    const goneB = (await inputsOn(P, ME, dd(14))).length === 0
    await P.bringToFront(); await sleep(w, 500)
    await L.press(w, T('sel-cancel')); await sleep(w, 900)
    const after14 = (await inputsOn(P, ME, dd(14))).map(i => `${i.type} "${i.remarks}"`)
    const bid15 = (await warRecs(P, ME, dd(15))).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
    const toast = await L.txt(P, '#toastEl'), bands = await P.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.trim()))
    await snap('02-after-close')
    rec('S27', which, 'RECORD', `tab A's drag window over Ranger's approved 14 Dec LL ("Orig") and his pending 15 Dec bid, "Stale words" typed; tab B deleted the 14 Dec leave first (stored then: ${goneB ? 'gone' : 'still there'}); tab A closed its window with ✕: the leave on 14 Dec is now ${fmtS(after14)}, the 15 Dec bid ${fmtS(bid15)}; a message in tab A: ${toast ?? 'none'} ${fmtS(bands)} — ${after14.length ? 'the save was NOT refused: it wrote the deleted leave back, in silence' : 'nothing was written for the deleted leave'}`, [`${tag}-01-typed`, `${tag}-02-after-close`])
    if (B.errsB.length) rec('S27-errors-B', which, 'FAIL', B.errsB.slice(0, 5).join(' || '), [])
  })
}

if (part === '6' || part === '34') {
  // the closed-day fixture (as s31): December open, Ranger's bids (run 1–3 Dec, 8 Dec, 10 Dec), December closed
  const P0 = P
  await L.press(w, T('open-chip')); await P0.waitForSelector(T('open-dates'))
  if ((await P0.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await sleep(w, 500) }
  await L.press(w, T('open-dates-close')); await sleep(w, 300)
}

if (part === '6') {
  await sc('B6', async () => {
    const M = await newTab('member')
    await place(M, ME, dd(1), 'LL', { range: [dd(1), dd(3)] })
    await place(M, ME, dd(10), 'LL', { remarks: 'ten old' })
    await place(M, ME, dd(12), 'LL', {})
    // the admin closes December (tab A)
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) === 'true') { await L.press(w, T('od-month-2026-12')); await sleep(w, 500) }
    await L.press(w, T('open-dates-close')); await sleep(w, 300)
    await M.page.reload(); await sleep(M, 1500)
    if (await L.vis(M.page, '#luser')) { await M.page.fill('#luser', 'us'); await M.page.fill('#lpass', 'us'); await M.page.click('#loginForm button[type=submit]'); await M.page.waitForSelector('#vWeek .day') }
    await M.page.evaluate(() => window.go('leavewar')); await M.page.waitForSelector('[data-testid="row-bane"]'); await sleep(M, 1000)
    const bidsOn = async iso => (await warRecs(M.page, ME, iso)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
    // (a) words typed, then Delete
    await L.openCellR(M, ME, dd(10)); if ((await H.sheetOf(M.page)) !== 'closed-note') throw new Error('10 Dec opened ' + await H.sheetOf(M.page))
    await L.press(M, T('closed-remarks')); await M.page.keyboard.press('Control+A'); await M.page.keyboard.type('six-a words'); await sleep(M, 200)
    await snap('01-typed-then-delete', M)
    await L.press(M, T('closed-delete')); await sleep(M, 600)
    const a1 = await bidsOn(dd(10)), strayA = await anywhere('six-a words')
    rec('B6a', which, a1.length === 0 && strayA.length === 0 ? 'PASS' : 'FAIL', `10 Dec ("ten old") on a closed day: typed "six-a words" (no Enter), Delete: bids left ${fmtS(a1)}; records anywhere holding "six-a words": ${strayA.length} ${fmtS(strayA)}`, [`${tag}-01-typed-then-delete`])
    // (b) words typed, then OD
    await L.openCellR(M, ME, dd(12)); if ((await H.sheetOf(M.page)) !== 'closed-note') throw new Error('12 Dec opened ' + await H.sheetOf(M.page))
    await L.press(M, T('closed-remarks')); await M.page.keyboard.press('Control+A'); await M.page.keyboard.type('six-b words'); await sleep(M, 200)
    await snap('02-typed-then-od', M)
    await L.press(M, T('closed-file-OD')); await sleep(M, 800)
    const b1 = await bidsOn(dd(12)), od = (await inputsOn(M.page, ME, dd(12))).map(i => `${i.type} "${i.remarks}"`), strayB = await anywhere('six-b words')
    const cell = await L.boxes(M, ME, dd(12))
    const sheetNow = await H.sheetOf(M.page)
    await snap('03-after-od', M)
    const odWin = await M.page.evaluate(() => { const b = document.querySelector('#inpEditCancel'); if (!b || b.getBoundingClientRect().height === 0) return null; let p = b; for (let i = 0; i < 8 && p; i++) { if (p.innerText && p.innerText.length > 80) return p.innerText.replace(/\s+/g, ' ').slice(0, 320); p = p.parentElement } return 'a window' })
    if (odWin) await snap('03b-od-input-window', M)
    const oilq = await M.page.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e && e.getBoundingClientRect().height > 0 ? { text: e.innerText.replace(/\s+/g, ' ').slice(0, 320), buttons: [...e.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean) } : null })
    if (oilq) { await snap('03c-oil-question', M) }
    const closedBy = []
    for (let i = 0; i < 4 && (await L.vis(M.page, T('oilconf')) || await L.vis(M.page, '#inpEditCancel')); i++) {
      if (await L.vis(M.page, T('oilconf'))) { const bs = await M.page.locator('[data-testid="oilconf"] button').allInnerTexts(); const pick = bs.find(t => /cancel|later|skip|not now|close/i.test(t)); if (pick) { await M.page.locator('[data-testid="oilconf"] button', { hasText: pick }).first().click(); closedBy.push(pick) } else { await M.page.keyboard.press('Escape'); closedBy.push('Escape') } }
      else { await M.page.click('#inpEditCancel'); closedBy.push('Cancel') }
      await sleep(M, 500)
    }
    rec('B6b', which, 'RECORD', `12 Dec (a pending LL, closed day): typed "six-b words" (no Enter), then OD: the closed-day window ${sheetNow === 'nothing' ? 'closed' : 'is ' + sheetNow}; the OD's own input window then came up: ${odWin ? `"${odWin}" (then: ${closedBy.join(', ')}); the OIL question on top of it: ${oilq ? JSON.stringify(oilq) : 'none'}` : 'no'}; the bid now ${fmtS(b1)}; Inputs entries on that day ${fmtS(od)}; the cell ${fmtS(cell)}; records holding "six-b words": ${strayB.length} ${fmtS(strayB)} — the OD filed ${od.some(x => /six-b/.test(x)) ? 'WITH' : 'without'} the words${b1.some(x => /six-b words/.test(x)) ? ', the words are on the bid' : (b1.length ? ', the words are NOT on the bid' : ', and the bid is gone (the OD replaced it)')}`, [`${tag}-02-typed-then-od`, `${tag}-03-after-od`])
    // (c) the admin reopens December while his window is open
    await L.openCellR(M, ME, dd(2)); for (let i = 0; i < 8 && (await H.sheetOf(M.page)) === 'nothing'; i++) await sleep(M, 300); if ((await H.sheetOf(M.page)) !== 'closed-note') { await snap('error-2dec', M); throw new Error('2 Dec opened ' + await H.sheetOf(M.page)) }
    const textBefore = await M.page.evaluate(() => document.querySelector('[data-testid="closed-note"]')?.innerText.replace(/\s+/g, ' ').trim())
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await sleep(w, 800) }
    await L.press(w, T('open-dates-close')); await sleep(w, 800)
    const textAfter = await M.page.evaluate(() => document.querySelector('[data-testid="closed-note"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null)
    await snap('04-window-after-reopen', M)
    await L.press(M, T('closed-remarks')); await M.page.keyboard.press('Control+A'); await M.page.keyboard.type('six-c words'); await M.page.keyboard.press('Enter'); await sleep(M, 700)
    const c1 = await bidsOn(dd(2)); const winLater = await M.page.evaluate(() => document.querySelector('[data-testid="closed-note"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null)
    await closeSheet(M)
    await M.page.reload(); await sleep(M, 1500)
    if (await L.vis(M.page, '#luser')) { await M.page.fill('#luser', 'us'); await M.page.fill('#lpass', 'us'); await M.page.click('#loginForm button[type=submit]'); await M.page.waitForSelector('#vWeek .day') }
    await M.page.evaluate(() => window.go('leavewar')); await M.page.waitForSelector('[data-testid="row-bane"]'); await sleep(M, 1000)
    await L.openCellR(M, ME, dd(2)); const sheetAfterReload = await H.sheetOf(M.page); await snap('05-after-reload', M); await closeSheet(M)
    rec('B6c', which, 'RECORD', `his closed-day window on 2 Dec was open (reads "${textBefore}"); the admin reopened December in tab A; the window then reads ${textBefore === textAfter ? 'THE SAME (it did not change)' : '"' + textAfter + '"'}; he typed "six-c words" + Enter: the bid saved ${fmtS(c1)}, the window then reads "${winLater}"; after a reload his tap on 2 Dec opens ${sheetAfterReload} (the day is open for bidding now)`, [`${tag}-04-window-after-reopen`, `${tag}-05-after-reload`])
    if (M.errsB.length) rec('B6-errors-B', which, 'FAIL', M.errsB.slice(0, 5).join(' || '), [])
  })
}

if (part === '34') {
  await sc('S34', async () => {
    const D = ids.Drifter, R = ids.Ridge
    // F1: a day at the red edge — Tue 15 Dec's Required P typed to its Available P figure
    const d = dd(15)
    const a0 = await (async () => { await L.reachCell(w, ME, d); const sel = `[data-testid="avail-p-${d}"]`; if (!(await L.vis(P, sel))) { await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, T('counts-toggle')); await sleep(w, 600); await L.reachCell(w, ME, d) } return (await P.locator(sel).first().innerText()).trim() })()
    const req = await L.setRequired(w, 'p', d, Number(a0))
    console.log('F1: Available P', a0, 'Required P set', req)
    await P.evaluate(() => window.scrollTo(0, 0))
    const B = await newTab('admin')
    // tab B places a bid that turns the row red
    await L.reachCell(B, R, d)
    await place(B, D, d, 'LL', { approve: false })
    const bubB = (await L.vis(B.page, T('manning-bubble'))) ? await L.txt(B.page, T('manning-bubble')) : ((await L.vis(B.page, T('manning-bubble-foot'))) ? await L.txt(B.page, T('manning-bubble-text')) : null)
    const availB = await (async () => { await B.page.evaluate(() => window.scrollTo(0, 0)); const sel = `[data-testid="avail-p-${d}"]`; return (await B.page.locator(sel).count()) ? (await B.page.locator(sel).first().innerText()).trim() : null })()
    console.log('tab B: bubble', bubB, 'Available P', availB)
    await snap('01-tab-B-bid', B)
    // does tab A carry the change?
    await P.bringToFront(); await sleep(w, 1200)
    await L.reachCell(w, D, d)
    const cellA = await L.boxes(w, D, d)
    const availA = (await P.locator(`[data-testid="avail-p-${d}"]`).count()) ? (await P.locator(`[data-testid="avail-p-${d}"]`).first().innerText()).trim() : null
    await snap('02-tab-A-after-B')
    // tab A opens and closes a window without placing anything
    await L.openCellR(w, R, d); await sleep(w, 500)
    const sheetA = await H.sheetOf(P)
    await closeSheet(w); await sleep(w, 600)
    const bubA = (await L.vis(P, T('manning-bubble'))) ? await L.txt(P, T('manning-bubble')) : ((await L.vis(P, T('manning-bubble-foot'))) ? await L.txt(P, T('manning-bubble-text')) : null)
    await snap('03-tab-A-after-open-close')
    const carried = !!cellA && cellA.boxes.length > 0
    rec('S34', which, carried ? (bubA ? 'FAIL' : 'PASS') : 'NOT DONE', carried
      ? `tab B (admin) placed Drifter's LL on 15 Dec at Available P ${a0} (bubble in tab B: "${bubB}", Available P now ${availB}); tab A carried it (its cell ${fmtS(cellA)}, Available P ${availA}); tab A opened Ridge's 15 Dec window (${sheetA}) and closed it: bubble in tab A "${bubA}" — ${bubA ? 'a bubble appeared: WRONG' : 'none, right'}`
      : `NOT WALKED as asked: the war does not carry tab B's bid across to tab A (tab A's cell for Drifter on 15 Dec: ${fmtS(cellA)}, Available P ${availA}; tab B reads ${availB}). Tab A then opened Ridge's 15 Dec window (${sheetA}) and closed it: bubble in tab A "${bubA}"`, [`${tag}-01-tab-B-bid`, `${tag}-02-tab-A-after-B`, `${tag}-03-tab-A-after-open-close`])
    // what a later write in tab A does to tab B's bid (RECORD)
    await place(w, R, dd(16), 'LL', { approve: false })
    const keep = (await warRecs(P, D, d)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}`)
    rec('S34b', which, 'RECORD', `then tab A placed an LL for Ridge on 16 Dec: tab B's bid on 15 Dec is ${keep.length ? 'still stored ' + fmtS(keep) : 'GONE from storage'}`, [])
    if (B.errsB.length) rec('S34-errors-B', which, 'FAIL', B.errsB.slice(0, 5).join(' || '), [])
  })
}

rec(`${part}-errors`, which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx in tab A)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
