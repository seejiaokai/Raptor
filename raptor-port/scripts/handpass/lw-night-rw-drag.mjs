// RE-WALK of the drag window (admin): W4, R1, R2, R4.
//  W4: a drag over a day holding a leave FILED ON THE INPUTS PAGE, words typed, ✕ → that leave's words unchanged; a war-approved leave in the same drag takes them.
//  R1: drag over two pending bids (one with words "Wedding"), type "Exercise", Approve (and Refuse) → ONE press of the top bar's Undo takes it all back.
//  R2: drag over pending bids, add a document (and/or untick the till), no words, ✕ (and Refuse) → each bid carries the document (its own kept) / the till off.
//  R4: one man's drag over bids, type "Exercise", then drag a DIFFERENT block → the first block's bids now read "Exercise".
// usage (from raptor-port/): node scripts/handpass/lw-night-rw-drag.mjs <desk|phone|webkit> [w4,r1,r2,r4]
const R = await import('./lw-night-rw-lib.mjs')
const { H1, H2: H, L, T, rec, judge, sleep } = R
const which = process.argv[2] || 'desk'
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const size = which === 'desk' ? 'desk' : 'phone', engine = which === 'webkit' ? 'webkit' : 'chromium'
const phone = size === 'phone'
const label = which === 'desk' ? 'desktop/Chromium' : which === 'webkit' ? 'phone/WebKit' : 'phone/Chromium'
const tag = which === 'desk' ? 'dk' : which === 'webkit' ? 'phw' : 'ph'
console.log('lw-night-rw-drag v1', which, tag, ONLY ? [...ONLY].join(',') : 'all')
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const w = await L.newCtx(size, engine)
await H.signInAs(w, 'admin')
const P = w.page
const ids = await H.people(P)
const run = id => !ONLY || ONLY.has(id)
const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- ${id} [${which}]`); try { await fn() } catch (e) { rec(id.toUpperCase(), label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 600), []); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w).catch(() => {}); await H.toWar(w, 'admin').catch(() => {}) } }
const snap = async n => { await L.shot(w, `${tag}-${n}`); return `${tag}-${n}.png` }
/* the war's request records of a day (words, state, documents, till) */
const reqs = async (who, n) => (await H.warRecs(P, who, dd(n))).filter(r => r.kind === 'request').map(r => ({ code: r.code, state: r.state, remarks: r.remarks ?? '', docs: (r.docIds ?? []).length, till: r.till }))
const fmtReq = a => a.length ? a.map(r => `${r.code}/${r.state}/"${r.remarks}"${r.docs ? '+' + r.docs + 'doc' : ''}${r.till === false ? ' till-off' : ''}`).join(' + ') : '-'
const days = async (who, ns) => { const o = {}; for (const n of ns) o[n] = fmtReq(await reqs(who, n)); return o }
const fmtDays = o => Object.entries(o).map(([d, t]) => `${d} Dec: ${t}`).join(' ; ')
const drag = (a, b) => H1.dragCells(w, a, b)
/* a press with its picture: a finger with a quick picture on a phone, a click and a settled picture on a desktop */
const press = async (sel, name) => { if (phone) { await L.step(w, `${tag}-${name}`, sel); return [`${tag}-${name}-q.png`, `${tag}-${name}.png`] } await L.press(w, sel); await sleep(w, 500); return [await snap(name)] }
const winOpen = () => L.vis(P, T('select-sheet'))
const undoOnce = async name => { const before = await R.undoTitle(P); const pics = await press('#undoBtn', name); await sleep(w, 400); return { before: before?.title, after: (await R.undoTitle(P))?.title, pics } }
const wordsLine = async (who, ns) => { const o = {}; for (const n of ns) o[n] = (await H.dayWords(P, who, dd(n))).text; return o }

/* the Inputs page as a person reads it: a desktop's list rows, a phone's cards (the date is the heading above the card) */
async function inputsView(callsign, pic) {
  if (!phone) return H.inputsPageRows(w, callsign, pic)
  await P.evaluate(() => window.go('inputs')); await sleep(w, 1000)
  await P.locator('#inRangeBtn').click(); await sleep(w, 500); await P.getByText('All dates', { exact: true }).first().click(); await sleep(w, 800)
  if (await P.locator('#inListBtn[aria-pressed="false"]').count()) { await L.press(w, '#inListBtn'); await sleep(w, 500) }
  const out = await P.evaluate(cs => {
    const dayHead = /^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+\d+\s+[A-Z]{3}/i
    const head = c => { let e = c; while (e && e !== document.body) { let p = e.previousElementSibling; while (p) { if (dayHead.test((p.innerText || '').trim())) return p.innerText.trim().split('\n')[0]; p = p.previousElementSibling } e = e.parentElement } return '' }
    return [...document.querySelectorAll('#page-inputs [data-testid^="inl-row-"]')].filter(c => new RegExp(cs + '\\s*[A-Z]{2,4}', 'i').test(c.innerText)).map(c => head(c) + ' :: ' + c.innerText.replace(/\s+/g, ' '))
  }, callsign)
  const first = P.locator('#page-inputs [data-testid^="inl-row-"]').filter({ hasText: new RegExp(callsign, 'i') }).first()
  await first.scrollIntoViewIfNeeded().catch(() => {})
  if (pic) await L.shot(w, pic)
  return out
}
// ====================== W4: an Inputs-page leave is not rewritten ======================
await sc('w4', async () => {
  const who = ids.Basher
  await H.fileInputLeave(w, 'Basher', 'LL', dd(4), null, { remarks: 'From inputs' })
  await H.toWar(w, 'admin')
  await H.place(w, who, dd(7), 'LL', { approve: true, remarks: 'Mine' })
  await L.reachCell(w, who, dd(4))
  const f = await wordsLine(who, [4, 7]); console.log('fixture', fmtDays(f))
  if (!/LL\[inputs\][^;]*"From inputs"/.test(f[4]) || !/input: LL 12-07\/"Mine"/.test(f[7]) || /\[inputs\]/.test(f[7])) throw new Error('fixture: ' + fmtDays(f))
  if (!(await drag([who, dd(4)], [who, dd(7)]))) throw new Error('no drag window over 4–7 Dec')
  await H.typeInto(w, T('sel-remarks'), 'Typed')
  const typed = await P.locator(T('sel-remarks')).inputValue()
  const pT = await snap('w4-1-typed')
  const pics = await press(T('sel-cancel'), 'w4-2-x')
  const stillOpen = await winOpen()
  const x = await wordsLine(who, [4, 7])
  // the Inputs page, as its own list reads
  const rows = await inputsView('Basher', `${tag}-w4-3-inputs-page`)
  const r4 = rows.filter(r => /4 Dec/i.test(r)).map(r => r.slice(0, 140)), r7 = rows.filter(r => /7 Dec/i.test(r)).map(r => r.slice(0, 140))
  await H.toWar(w, 'admin')
  judge('W4 ✕ over an Inputs-page leave and a war-approved leave', label, [
    ['the drag window closed on ✕', !stillOpen, `open=${stillOpen}`],
    ['the Inputs-filed leave (4 Dec) keeps its own words', /LL\[inputs\][^;]*"From inputs"/.test(x[4]) && !/Typed/.test(x[4]), x[4]],
    ['the war-approved leave (7 Dec) takes the typed words', /input: LL 12-07\/"Typed"/.test(x[7]), x[7]],
    ['the Inputs page row of 4 Dec still reads "From inputs", not "Typed"', r4.some(r => /From inputs/.test(r)) && !r4.some(r => /Typed/.test(r)), JSON.stringify(r4)],
    ['the Inputs page row of 7 Dec reads "Typed"', r7.some(r => /Typed/.test(r)), JSON.stringify(r7)],
  ], `Basher: an LL filed on the Inputs page for 4 Dec ("From inputs") and a war-approved LL on 7 Dec ("Mine"); dragged 4–7 Dec, typed "${typed}", ✕. After: 4 Dec ${x[4]}; 7 Dec ${x[7]}. Inputs page rows — 4 Dec ${JSON.stringify(r4)}; 7 Dec ${JSON.stringify(r7)}`, [pT, ...pics, `${tag}-w4-3-inputs-page.png`])
})

// ====================== R1: Approve / Refuse with words is ONE Undo step ======================
const r1case = async (id, name, who, how, extra = false) => {
  // 10 Dec pending LL "Wedding"; 11 Dec pending LL (no words); optionally 12 Dec a war-approved LL "Mine"
  await H.place(w, who, dd(10), 'LL', { approve: false, remarks: 'Wedding' })
  await H.place(w, who, dd(11), 'LL', { approve: false })
  if (extra) await H.place(w, who, dd(12), 'LL', { approve: true, remarks: 'Mine' })
  const ns = extra ? [10, 11, 12] : [10, 11]
  const before = await wordsLine(who, ns)
  console.log(id, 'fixture', fmtDays(before))
  if (!/LL\/pending\/"Wedding"/.test(before[10]) || !/LL\/pending\/""/.test(before[11])) throw new Error('fixture: ' + fmtDays(before))
  if (!(await drag([who, dd(10)], [who, dd(extra ? 12 : 11)]))) throw new Error('no drag window')
  await H.typeInto(w, T('sel-remarks'), 'Exercise')
  const pT = await snap(`${id}-1-typed`)
  const u0 = await R.undoTitle(P)
  const pics = await press(T(how === 'approve' ? 'sel-approve' : 'sel-refuse'), `${id}-2-${how}`)
  const open = await winOpen(), mid = await wordsLine(who, ns), midDays = await days(who, ns)
  const u1 = await R.undoTitle(P)
  const pMid = await snap(`${id}-3-after-${how}`)
  const un = await undoOnce(`${id}-4-undo1`)
  const after1 = await wordsLine(who, ns), afterDays = await days(who, ns)
  const pAfter = await snap(`${id}-5-after-one-undo`)
  const back = /LL\/pending\/"Wedding"/.test(after1[10]) && /LL\/pending\/""/.test(after1[11]) && /input: -/.test(after1[10]) && /input: -/.test(after1[11]) && (!extra || /input: LL 12-12\/"Mine"/.test(after1[12]))
  const decided = how === 'approve' ? [10, 11].every(n => /input: LL/.test(mid[n])) : [10, 11].every(n => /LL\/refused\/"Exercise"/.test(mid[n]))
  judge(`${id.toUpperCase()} ${how === 'approve' ? 'Approve' : 'Refuse'} with words typed${extra ? ' over a war-approved leave too' : ''}, then ONE Undo`, label, [
    ['the press took: the bids were decided with the typed words', decided, fmtDays(mid)],
    ...(extra ? [] : [['the drag window closed', !open, `open=${open}`]]),
    ['ONE press of Undo: both bids pending again', /LL\/pending/.test(after1[10]) && /LL\/pending/.test(after1[11]), fmtDays(after1)],
    ['"Wedding" is back on the first bid, the second has none', back, fmtDays(after1)],
  ], `before ${fmtDays(before)}; typed "Exercise" over ${extra ? '10–12' : '10–11'} Dec, ${how}: ${fmtDays(mid)} (window ${open ? 'still open' : 'closed'}) (Undo button read "${u0?.title}" → "${u1?.title}"); ONE Undo press ("${un.before}") → ${fmtDays(after1)}; the Undo button then reads "${un.after}"`, [pT, ...pics, pMid, ...un.pics, pAfter])
}
await sc('r1', async () => {
  await r1case('r1a', 'approve', ids.Anvil, 'approve')
  await r1case('r1b', 'refuse', ids.Cinch, 'refuse')
  await r1case('r1c', 'approve+approved leave', ids.Piston, 'approve', true)
})

// ====================== R2: a document / the till tick added in the drag window is kept ======================
const putDoc = async (who, n, name) => { await L.openCellR(w, who, dd(n)); await P.waitForSelector(T('bid-picker'), { timeout: 5000 }); await H.setSwitch(w, false); await L.setDoc(w, T('bid-doc-row'), name); if (!(await L.placeLeave(w, 'LL'))) throw new Error('LL not placed') }
await sc('r2', async () => {
  // R2a: Reaper — 14 Dec a pending LL carrying its own document, 15 Dec a pending LL with none; add a document in the drag window, no words, ✕
  {
    const who = ids.Reaper
    await putDoc(who, 14, 'own-r2a.pdf'); await H.place(w, who, dd(15), 'LL', { approve: false })
    const before = await days(who, [14, 15]); console.log('r2a fixture', fmtDays(before))
    if (!/\+1doc/.test(before[14]) || /doc/.test(before[15])) throw new Error('r2a fixture: ' + fmtDays(before))
    if (!(await drag([who, dd(14)], [who, dd(15)]))) throw new Error('no drag window')
    await H.addDoc(w, T('sel-doc-row'), 'new-r2a.pdf')
    const chips = await P.locator(`${T('select-sheet')} .docchip`).count(), box = await P.locator(T('sel-remarks')).inputValue()
    const pT = await snap('r2a-1-doc-added')
    const pics = await press(T('sel-cancel'), 'r2a-2-x')
    const open = await winOpen(), after = await days(who, [14, 15])
    // the one-day window of 14 Dec: how many chips does it show
    await L.openCellR(w, who, dd(14)); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    const winChips = await P.locator(`${T('bid-picker')} .docchip`).count(); const pW = await snap('r2a-3-day14-window'); await H.closeSheet(w)
    const n14 = (await reqs(who, 14))[0]?.docs, n15 = (await reqs(who, 15))[0]?.docs
    judge('R2a a document added in the drag window, no words, ✕', label, [
      ['the drag window closed', !open, `open=${open}`],
      ['14 Dec carries its own document AND the new one (2)', n14 === 2, `docs ${n14}`],
      ['15 Dec carries the new document (1)', n15 === 1, `docs ${n15}`],
      ['the one-day window of 14 Dec shows two chips', winChips === 2, `chips ${winChips}`],
    ], `before ${fmtDays(before)}; drag 14–15 Dec, a document added (chips in the drag window ${chips}, box "${box}"), ✕: ${fmtDays(after)}; 14 Dec's one-day window shows ${winChips} chips`, [pT, ...pics, pW])
  }
  // R2b: Sidewinder — two pending bids, untick the till in the drag window, no words, ✕
  {
    const who = ids.Sidewinder
    await H.place(w, who, dd(14), 'LL', { approve: false }); await H.place(w, who, dd(15), 'LL', { approve: false })
    const before = await days(who, [14, 15]); console.log('r2b fixture', fmtDays(before))
    if (!(await drag([who, dd(14)], [who, dd(15)]))) throw new Error('no drag window')
    const t0 = await P.locator(T('sel-till')).isChecked()
    await L.press(w, T('sel-till')); await sleep(w, 400)
    const t1 = await P.locator(T('sel-till')).isChecked(), tTxt = await L.txt(P, T('sel-tilldate'))
    const pT = await snap('r2b-1-till-off')
    const pics = await press(T('sel-cancel'), 'r2b-2-x')
    const open = await winOpen(), after = await reqs(who, 14).then(async a => [a, await reqs(who, 15)])
    judge('R2b the till tick turned off in the drag window, no words, ✕', label, [
      ['the tick was on, then off', t0 === true && t1 === false, `${t0} → ${t1}`],
      ['the drag window closed', !open, `open=${open}`],
      ['both bids carry the till off', after[0][0]?.till === false && after[1][0]?.till === false, `${fmtReq(after[0])} ; ${fmtReq(after[1])}`],
    ], `before ${fmtDays(before)}; drag 14–15 Dec, till tick ${t0} → ${t1} ("${tTxt}"), ✕: 14 Dec ${fmtReq(after[0])}; 15 Dec ${fmtReq(after[1])}`, [pT, ...pics])
  }
  // R2c: Warden — two pending bids, a document and the till off, no words, REFUSE
  {
    const who = ids.Warden
    await H.place(w, who, dd(14), 'LL', { approve: false }); await H.place(w, who, dd(15), 'LL', { approve: false })
    if (!(await drag([who, dd(14)], [who, dd(15)]))) throw new Error('no drag window')
    await H.addDoc(w, T('sel-doc-row'), 'new-r2c.pdf')
    await L.press(w, T('sel-till')); await sleep(w, 400)
    const pT = await snap('r2c-1-doc-and-till')
    const pics = await press(T('sel-refuse'), 'r2c-2-refuse')
    const open = await winOpen(), a14 = await reqs(who, 14), a15 = await reqs(who, 15)
    judge('R2c a document and the till tick off in the drag window, no words, Refuse', label, [
      ['the drag window closed', !open, `open=${open}`],
      ['both bids refused', a14[0]?.state === 'refused' && a15[0]?.state === 'refused', `${fmtReq(a14)} ; ${fmtReq(a15)}`],
      ['each refused bid carries the document', a14[0]?.docs === 1 && a15[0]?.docs === 1, `${fmtReq(a14)} ; ${fmtReq(a15)}`],
      ['each refused bid carries the till off', a14[0]?.till === false && a15[0]?.till === false, `${fmtReq(a14)} ; ${fmtReq(a15)}`],
    ], `Warden's two pending bids 14–15 Dec; a document added and the till tick turned off, no words, Refuse: 14 Dec ${fmtReq(a14)}; 15 Dec ${fmtReq(a15)}`, [pT, ...pics])
  }
})

// ====================== R4: a new drag while the window is up keeps the typed words ======================
const r4case = async (id, who1, who2, label2, spec) => {
  // block 1: who1 3–4 Dec pending LL; block 2: who2 8–9 Dec pending LL "Other"
  await H.place(w, who1, dd(3), 'LL', { approve: false }); await H.place(w, who1, dd(4), 'LL', { approve: false })
  await H.place(w, who2, dd(8), 'LL', { approve: false, remarks: 'Other' }); await H.place(w, who2, dd(9), 'LL', { approve: false })
  const b1 = await days(who1, [3, 4]), b2 = await days(who2, [8, 9]); console.log(id, 'fixture', fmtDays(b1), '|', fmtDays(b2))
  if (!(await drag([who1, dd(3)], [who1, dd(4)]))) throw new Error('no drag window (block 1)')
  await H.typeInto(w, T('sel-remarks'), 'Exercise')
  const head1 = await L.txt(P, T('sel-span')), pT = await snap(`${id}-1-typed`)
  // the second drag, with the window still up
  if (phone) await P.evaluate(() => window.scrollBy(0, 0))
  const ok2 = await dragWhileOpen(who2, 8, 9)
  await sleep(w, 500)
  const head2 = await L.txt(P, T('sel-span')), box2 = await P.locator(T('sel-remarks')).inputValue().catch(() => null)
  const pics2 = [await snap(`${id}-2-after-second-drag`)]
  const a1 = await days(who1, [3, 4]), a2 = await days(who2, [8, 9])
  const pEnd = await press(T('sel-cancel'), `${id}-3-x-second-window`)
  const a2b = await days(who2, [8, 9])
  judge(`${id.toUpperCase()} ${spec}: typed words, then a new drag of a different block`, label, [
    ['the second drag took the window to the new block', ok2 && head2 !== head1, `"${head1}" → "${head2}"`],
    ['the first block’s bids now read "Exercise"', /"Exercise"/.test(a1[3]) && /"Exercise"/.test(a1[4]), fmtDays(a1)],
    ['the second block is untouched by those words', !/Exercise/.test(a2[8]) && !/Exercise/.test(a2[9]), fmtDays(a2)],
    ['the second window opened with its own words, not the typed ones', box2 !== 'Exercise', `box "${box2}"`],
    ['✕ on the second window changes nothing of the second block', fmtDays(a2b) === fmtDays(a2), `${fmtDays(a2)} → ${fmtDays(a2b)}`],
  ], `block 1 ${who1 === who2 ? 'and block 2 on the same row' : 'and block 2 on another man’s row (' + label2 + ')'}: fixture ${fmtDays(b1)} | ${fmtDays(b2)}; dragged 3–4 Dec ("${head1}"), typed "Exercise", then dragged 8–9 Dec (window "${head2}", its box "${box2}"). First block now: ${fmtDays(a1)}; second block: ${fmtDays(a2)}; after ✕ on the second window: ${fmtDays(a2b)}`, [pT, ...pics2, ...pEnd])
}
/* a drag over cells while the window is up: scrolls the row to the top third first (the phone's window covers the foot) */
async function dragWhileOpen(who, a, z) {
  const sel = d => T(L.cellId(who, dd(d)))
  await L.reachCell(w, who, dd(a))
  await P.locator(sel(a)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  if (phone) { const y = await P.locator(sel(a)).first().evaluate(e => e.getBoundingClientRect().top); const want = 300; await P.evaluate(d => window.scrollBy(0, d), y - want) }
  await sleep(w, 400)
  const bA = await P.locator(sel(a)).first().boundingBox(), bZ = await P.locator(sel(z)).first().boundingBox()
  if (!bA || !bZ) throw new Error('no box for the second drag')
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  const hit = await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-testid]')?.dataset.testid || e.tagName) : null }, [A.x, A.y])
  console.log('second drag from', Math.round(A.x), Math.round(A.y), 'hits', hit)
  if (phone) {
    if (!w.cdp) { await P.mouse.move(A.x, A.y); await P.mouse.down(); await sleep(w, 320); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
    else await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: (A.y + Z.y) / 2 }, Z], 320)
  } else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await sleep(w, 500)
  return winOpen()
}
await sc('r4', async () => {
  await r4case('r4a', ids.Trident, ids.Trident, 'same row', 'one man, a different block of his row')
  await r4case('r4b', ids.Hunter, ids.Blade, 'Blade', 'one man, then another man’s block')
})
rec('errors-drag', label, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
await w.ctx.close()
await L.closeBrowser()
R.saveResults(`drag-${which}${ONLY ? '-' + [...ONLY].join('') : ''}`)
