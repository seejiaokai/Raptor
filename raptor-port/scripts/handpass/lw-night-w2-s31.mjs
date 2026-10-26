// Walker 2 — scenarios 31, 32 (undo), 33 (the other doors): the member's closed day holding his pending bid, round 3's one row (D1354). usage: node lw-night-w2-s31.mjs <desk|phone|webkit> [31,32,33]
// The fixture: admin opens December and files Ranger's approved LL (14 Dec) and a Dec-14 neighbour; Ranger bids (run 1–3 Dec by Pick a range, 8 Dec a morning LL and an afternoon OL, 10 Dec one LL "Old words");
// admin then CLOSES December. Built once on a desktop context, walked from its saved storage at the size asked.
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOf, inputsOn, warRecs } = H
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone'
const engine = which === 'webkit' ? 'webkit' : 'chromium'
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const tag = `s31-${which === 'desk' ? 'dk' : which === 'webkit' ? 'wk' : 'ph'}`
console.log('lw-night-w2-s31 v1', which, tag, ONLY ? [...ONLY].join(',') : 'all')
if (!ONLY) H.clearPics(tag)
H.KEEP.toasts = true
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const ME = 'bane'
const fmtS = a => JSON.stringify(a)

// ---------------- the fixture, once, on a desktop chromium context
const fx = await L.newCtx('desk')
await H.signInAs(fx, 'admin')
const ids = await H.people(fx.page)
if (ids.Ranger !== ME) throw new Error('Ranger is not bane')
{
  const P = fx.page
  await L.press(fx, T('open-chip')); await P.waitForSelector(T('open-dates'))
  if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(fx, T('od-month-2026-12')); await sleep(fx, 500) }
  await L.press(fx, T('open-dates-close')); await sleep(fx, 300)
  await place(fx, ME, dd(14), 'LL', { approve: true, remarks: 'Approved words' })
  await H.signOut(P); await H.signInAs(fx, 'member')
  await place(fx, ME, dd(1), 'LL', { range: [dd(1), dd(3)] })
  await place(fx, ME, dd(8), 'LL', { portion: 'am' })
  await L.openCellR(fx, ME, dd(8)); await P.waitForSelector(T('bid-picker'))
  if (!(await L.vis(P, T('portion-pm')))) throw new Error('8 Dec offered no PM')
  await L.press(fx, T('portion-pm'))
  if (!(await L.placeLeave(fx, 'OL'))) throw new Error('PM OL not placed')
  await place(fx, ME, dd(10), 'LL', { remarks: 'Old words' })
  await H.signOut(P); await H.signInAs(fx, 'admin')
  await L.press(fx, T('open-chip')); await P.waitForSelector(T('open-dates'))
  if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) === 'true') { await L.press(fx, T('od-month-2026-12')); await sleep(fx, 500) }
  const closedNow = await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')
  await L.press(fx, T('open-dates-close')); await sleep(fx, 300)
  console.log('December pressed after closing:', closedNow, 'chip:', await L.txt(P, T('open-chip')))
  const bids = []
  for (const n of [1, 2, 3, 8, 10]) for (const r of (await warRecs(P, ME, dd(n))).filter(r => r.kind === 'request')) bids.push(`${n}:${r.code}/${r.state}/"${r.remarks ?? ''}"`)
  console.log('fixture bids', bids.join(' ; '))
  if (bids.length !== 6) throw new Error('fixture bids: ' + bids.join(' ; '))
}
const STATE = await fx.ctx.storageState()
await fx.ctx.close()

// ---------------- the walk
const w = await H.ctxFrom(size, engine, STATE)
const P = w.page
await H.signInAs(w, 'member')
const shots = []
const snap = async (n, opts) => { await L.shot(w, `${tag}-${n}`, opts); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const run = id => !ONLY || ONLY.has(id.replace(/[a-z].*$/, ''))
const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- ${id} [${which}]`); try { await fn() } catch (e) { rec(id, which, 'NOT DONE', String(e).slice(0, 400), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }
const bidsOn = async iso => (await warRecs(P, ME, iso)).filter(r => r.kind === 'request').map(r => ({ id: r.id, code: r.code, state: r.state, remarks: r.remarks ?? '', docs: (r.docIds ?? []).length, till: r.till }))
const brief = async days => { const o = []; for (const n of days) o.push(`${n}: ` + ((await bidsOn(dd(n))).map(b => `${b.code}/${b.state}/"${b.remarks}"${b.docs ? '+' + b.docs + 'doc' : ''}${b.till === false ? ' till-off' : ''}`).join(' + ') || '-')); return o.join(' ; ') }
const openClosed = async (iso, q = null) => { await L.openCellR(w, ME, iso, q); let s = await H.sheetOf(P); for (let i = 0; i < 6 && s === 'nothing'; i++) { await sleep(w, 300); s = await H.sheetOf(P) } if (s !== 'closed-note') { await snap(`open-${iso.slice(5)}-failed`).catch(() => {}); throw new Error(`${iso} opened ${s}`) } return s }
const geom = () => P.evaluate(() => {
  const r = s => document.querySelector(s)
  const b = e => { if (!e) return null; const x = e.getBoundingClientRect(); return { l: Math.round(x.left * 10) / 10, t: Math.round(x.top * 10) / 10, r: Math.round(x.right * 10) / 10, b: Math.round(x.bottom * 10) / 10, w: Math.round(x.width), h: Math.round(x.height) } }
  const sheet = r('[data-testid="closed-note"]'); if (!sheet) return null
  const rows = [...sheet.querySelectorAll('[data-testid$="rmk-row"]')]
  const one = rows[0]
  const ta = one?.querySelector('textarea'), tl = one?.querySelector('[data-testid$="-tl"]'), docBtn = one?.querySelector('button.docbtn') || one?.querySelector('.bp-doc button')
  const cs = ta && getComputedStyle(ta)
  const lum = c => { const m = (c || '').match(/\d+(\.\d+)?/g); return m ? Math.round((0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2])) : null }
  return { sheet: b(sheet), nRows: rows.length, row: b(one), ta: b(ta), tl: b(tl), doc: b(docBtn), taBg: cs?.backgroundColor, taLum: lum(cs?.backgroundColor), rowLabels: one ? [...one.querySelectorAll('.lab')].map(e => e.innerText.trim()) : null, sheetLabels: [...sheet.querySelectorAll('.lab')].map(e => e.innerText.trim()), hasSave: [...sheet.querySelectorAll('button')].some(x => /^save$/i.test(x.innerText.trim())), tillText: r('[data-testid="closed-tilldate"]')?.innerText, tillChecked: r('[data-testid="closed-till"]')?.checked, buttons: [...sheet.querySelectorAll('button')].map(x => x.innerText.trim()).filter(Boolean), text: sheet.innerText.replace(/\s+/g, ' ').trim(), hasScroll: document.documentElement.scrollWidth > innerWidth + 1 }
})
const oneLine = g => g && g.ta && g.tl && g.doc && [g.tl, g.doc].every(e => (e.t + e.b) / 2 >= g.ta.t - 1 && (e.t + e.b) / 2 <= g.ta.b + 1) && g.row.h <= g.ta.h + 12
const boxes = () => P.locator('[data-testid="closed-note"] textarea')
const typeIn = async (i, text, { enter = true } = {}) => { const t = boxes().nth(i); await t.scrollIntoViewIfNeeded().catch(() => {}); const b = await t.boundingBox(); if (w.phone) await L.tapAt(w, b.x + 20, b.y + b.height / 2); else await t.click(); await P.keyboard.press('Control+A'); await P.keyboard.press('Delete'); await P.keyboard.type(text); await sleep(w, 150); if (enter) { await P.keyboard.press('Enter'); await sleep(w, 500) } }
const closeX = async (name = null) => { if (w.phone && name) await L.step(w, `${tag}-${name}`, T('closed-note-close')); else { await L.press(w, T('closed-note-close')); await sleep(w, 400) } }
let w0 = null   // the grid's scroll before the Undo walk

await sc('31a', async () => {
  const q = w.phone ? `${tag}-31a-tap-q` : null
  await openClosed(dd(2), q); await sleep(w, 400)
  const g = await geom(); await snap('31a-open')
  const dimmed = await P.evaluate(iso => { const td = document.querySelector(`[data-testid="cell-bane-${iso}"]`); return td ? { cls: td.className, op: getComputedStyle(td).opacity } : null }, dd(2))
  const ok = g.nRows === 1 && oneLine(g) && !g.hasSave && g.rowLabels.length === 0 && g.taLum < 120 && g.buttons.includes('Delete') && g.buttons.includes('CSE') && g.buttons.includes('OD') && g.tillChecked === true && /^till 3 Dec/.test(g.tillText)
  rec('31a', which, ok ? 'PASS' : 'FAIL', `his tap on 2 Dec (closed for him, holding his pending bid): window "${g.text}"; ONE words row: ${fmtS(g.row)} box ${fmtS(g.ta)} (${g.taBg}) tick ${fmtS(g.tl)} Document ${fmtS(g.doc)}; on one line: ${oneLine(g)}; labels inside the row: ${fmtS(g.rowLabels)}; the window's other labels: ${fmtS(g.sheetLabels)}; a Save button: ${g.hasSave}; till "${g.tillText}" ticked ${g.tillChecked}; buttons ${fmtS(g.buttons)}; the day's cell: ${fmtS(dimmed)}; page scrolls sideways: ${g.hasScroll}`, (w.phone ? [`${tag}-31a-tap-q`] : []).concat([`${tag}-31a-open`]))
  await closeX()
})
await sc('31b', async () => {
  await openClosed(dd(2)); await typeIn(0, 'Closed words')
  await snap('31b-after-enter')
  const day = await brief([1, 2, 3])
  const stays = await H.sheetOf(P)
  rec('31b', which, 'RECORD', `typed "Closed words" in 2 Dec's row, Enter: saved ${day}; the window ${stays === 'closed-note' ? 'stays open' : 'closed'} (a run of three pending days 1–3 Dec)`, [`${tag}-31b-after-enter`])
  await closeX()
  const r1 = [], vals = {}
  for (const n of [1, 3]) { await openClosed(dd(n)); vals[n] = await boxes().first().inputValue(); await snap(`31b-reopen-${n}`); await closeX() }
  rec('31b2', which, vals[1] === 'Closed words' && vals[3] === 'Closed words' ? 'PASS' : 'FAIL', `1 Dec's window reads "${vals[1]}", 3 Dec's reads "${vals[3]}"`, [`${tag}-31b-reopen-1`, `${tag}-31b-reopen-3`])
})
await sc('31c', async () => {
  await openClosed(dd(3)); await typeIn(0, 'x-close words', { enter: false }); await snap('31c-typed')
  const mid = await brief([1, 2, 3])
  await closeX('31c-x'); await sleep(w, 300)
  const day = await brief([1, 2, 3])
  rec('31c', which, /3: LL\/pending\/"x-close words"/.test(day) ? 'PASS' : 'FAIL', `typed "x-close words" on 3 Dec, no Enter (saved so far: ${mid}), then ✕: saved ${day}`, [`${tag}-31c-typed`].concat(w.phone ? [`${tag}-31c-x-q`] : []))
})
await sc('31d', async () => {
  await openClosed(dd(2))
  await P.locator('[data-testid="closed-doc-row"] input[type=file]').first().setInputFiles(L.pdfPath('w2-31.pdf')); await sleep(w, 900)
  const day = await brief([1, 2, 3]); const g = await geom(); await snap('31d-doc')
  const chips = await P.locator('[data-testid="closed-note"] .docchip').count()
  rec('31d', which, /2: LL\/pending\/"[^"]*"\+1doc/.test(day) && chips === 1 ? 'PASS' : 'FAIL', `a document added on 2 Dec's row: saved at once ${day}; chips on screen ${chips}; the row now ${fmtS(g.row)} (one line: ${oneLine(g)})`, [`${tag}-31d-doc`])
  await closeX()
})
await sc('31e', async () => {
  await H.reloadAs(w, 'member')
  const day = await brief([1, 2, 3])
  await openClosed(dd(2)); const v = await boxes().first().inputValue(); const chips = await P.locator('[data-testid="closed-note"] .docchip').count(); await snap('31e-reload'); await closeX()
  rec('31e', which, v === 'x-close words' && chips === 1 ? 'PASS' : ('FAIL'), `after a reload (signed in again): saved ${day}; 2 Dec's window reads "${v}" with ${chips} document chip(s)`, [`${tag}-31e-reload`])
})
await sc('31f', async () => {
  /* a closed day holding two pending bids (8 Dec: a morning LL, an afternoon OL): which window a member's tap opens, and its rows */
  await L.openCellR(w, ME, dd(8), w.phone ? `${tag}-31f-tap-q` : null); await sleep(w, 600)
  const which8 = await H.sheetOf(P)
  const before = await bidsOn(dd(8))
  await snap('31f-open')
  if (which8 === 'closed-note') {
    const g = await geom(); const n = await boxes().count()
    await typeIn(0, 'first row words'); await typeIn(1, 'second row words'); await snap('31f-typed')
    const after = await bidsOn(dd(8))
    rec('31f', which, n === 2 && after.length === 2 && after.every(b => /row words$/.test(b.remarks)) && after[0].remarks !== after[1].remarks ? 'PASS' : 'FAIL', `8 Dec holds two pending bids ${fmtS(before.map(b => b.code))}: the closed-day window has ${n} words rows; typed "first row words" and "second row words" (Enter each): saved ${fmtS(after.map(b => `${b.code}:"${b.remarks}"`))}`, [`${tag}-31f-open`, `${tag}-31f-typed`])
    await closeX()
  } else if (which8 === 'daylist-sheet') {
    const info = await P.evaluate(() => { const s = document.querySelector('[data-testid="daylist-sheet"]'); return { text: s.innerText.replace(/\s+/g, ' ').trim(), boxes: [...s.querySelectorAll('textarea')].length, buttons: [...s.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean), docRows: s.querySelectorAll('[data-testid$="doc-row"]').length } })
    let after = before
    if (info.boxes === 2) {
      const tb = P.locator('[data-testid="daylist-sheet"] textarea')
      for (const [i, t] of [[0, 'first row words'], [1, 'second row words']]) { const el = tb.nth(i); const b = await el.boundingBox(); if (w.phone) await L.tapAt(w, b.x + 20, b.y + b.height / 2); else await el.click(); await P.keyboard.press('Control+A'); await P.keyboard.type(t); await P.keyboard.press('Enter'); await sleep(w, 500) }
      await snap('31f-typed'); after = await bidsOn(dd(8))
    }
    rec('31f', which, 'RECORD', `a member's tap on 8 Dec (closed for him, two pending bids ${fmtS(before.map(b => b.code))}) opens ${which8}, NOT the closed-day window: "${info.text}"; words boxes ${info.boxes}, buttons ${fmtS(info.buttons)}; ${info.boxes === 2 ? `typed in each + Enter: saved ${fmtS(after.map(b => `${b.code}:"${b.remarks}"`))} — each to its own bid: ${after.length === 2 && after[0].remarks !== after[1].remarks}` : 'no two words boxes to type in'}`, [`${tag}-31f-open`].concat(info.boxes === 2 ? [`${tag}-31f-typed`] : []).concat(w.phone ? [`${tag}-31f-tap-q`] : []))
    await closeSheet(w)
  } else throw new Error('8 Dec opened ' + which8)
})
await sc('31g', async () => {
  await openClosed(dd(10)); const v0 = await boxes().first().inputValue()
  await typeIn(0, 'temp words', { enter: false }); await snap('31g-typed')
  const mid = await brief([10])
  if (w.phone) await L.step(w, `${tag}-31g-delete`, T('closed-delete')); else { await L.press(w, T('closed-delete')); await sleep(w, 500); await snap('31g-delete') }
  await sleep(w, 400)
  const gone = await brief([10]); const sheet = await H.sheetOf(P)
  const stray = await P.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && (k.startsWith('raptor:leavewar/rec:') || k.startsWith('raptor:inputs/')) && (localStorage.getItem(k) || '').includes('temp words')) o.push(k.slice(0, 40)) } return o })
  const u = await H.undoPress(w, `${tag}-31g-undo`)
  const back = await brief([10])
  const u2 = await H.undoPress(w, `${tag}-31g-undo2`)
  const back2 = await brief([10])
  rec('31g', which, /10: -/.test(gone) && /10: LL\/pending\/"Old words"/.test(back) && stray.length === 0 ? 'PASS' : 'FAIL', `10 Dec held "${v0}"; typed "temp words" (no Enter; saved so far: ${mid}), then Delete: ${gone} (window then: ${sheet}); records anywhere holding "temp words": ${stray.length}; one Undo ("${u.before}"): ${back}; a second Undo ("${u2.before}"): ${back2}`, [`${tag}-31g-typed`, `${tag}-31g-delete` + (w.phone ? '-q' : ''), `${tag}-31g-undo` + (w.phone ? '-q' : '')])
})
await sc('32a', async () => {
  /* Undo and Redo, once per save, in ONE session: three saves — his own approved leave (14 Dec: round 3's row), then two closed-day saves (10 Dec, 1 Dec's run) */
  const scrollState = () => P.evaluate(() => ({ win: [scrollX, scrollY], els: [...document.querySelectorAll('#page-leavewar *')].filter(e => e.scrollLeft > 0 || e.scrollTop > 0).slice(0, 6).map(e => `${(e.className || e.tagName).toString().slice(0, 24)}:${Math.round(e.scrollLeft)},${Math.round(e.scrollTop)}`) }))
  const wordsNow = async () => `14 Dec leave "${(await inputsOn(P, ME, dd(14)))[0]?.remarks}" ; ` + await brief([10, 1])
  await L.openCellR(w, ME, dd(14)); if ((await H.sheetOf(P)) !== 'remarks-sheet') throw new Error('14 Dec opened ' + await H.sheetOf(P))
  await L.press(w, T('remarks-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Undo A'); await P.keyboard.press('Enter'); await sleep(w, 500); await closeSheet(w)
  await openClosed(dd(10)); await typeIn(0, 'Undo B'); await closeX()
  await openClosed(dd(1)); await typeIn(0, 'Undo C'); await closeX()
  const s0 = await scrollState(); const w1 = await wordsNow()
  console.log('saved:', w1)
  /* where each press lands: the Undo takes back the last save first — 1 Dec's run, then 10 Dec, then 14 Dec's own leave */
  /* in view = both side edges of the cell are on the screen and the cell is what is drawn there (not the frozen names column or a window over it) */
  const inView1 = iso => P.evaluate(iso => { const td = document.querySelector(`[data-testid="cell-bane-${iso}"]`); if (!td) return 'not drawn'; const r = td.getBoundingClientRect(); const y = (r.top + r.bottom) / 2; if (y < 0 || y > innerHeight) return 'out of view'; const wrapR = document.querySelector('.mx-wrap')?.getBoundingClientRect().right ?? innerWidth; const ok = r.right <= Math.min(wrapR, innerWidth) + 0.5 && [r.left + 3, r.right - 3].every(x => x > 0 && x < innerWidth && td.contains(document.elementFromPoint(x, y))); return ok ? 'in view' : 'out of view' }, iso)
  const rectsOf = isos => P.evaluate(isos => { const names = document.querySelector('[data-testid="row-bane"]')?.firstElementChild?.getBoundingClientRect().right; const wrap = document.querySelector('.mx-wrap')?.getBoundingClientRect(); return `names ${Math.round(names)}, grid ${Math.round(wrap?.left)}..${Math.round(wrap?.right)}, ` + isos.map(i => { const t = document.querySelector(`[data-testid="cell-bane-${i}"]`); if (!t) return i.slice(8) + ' not drawn'; const r = t.getBoundingClientRect(); return `${i.slice(8)}: ${Math.round(r.left)}..${Math.round(r.right)}` }).join(', ') }, isos)
  const inViewNow = async isos => { const o = []; for (const i of isos) o.push(await inView1(i)); return o.every(x => x === 'in view') ? 'in view' : 'out of view (' + o.map((x, k) => isos[k].slice(8) + ':' + x.replace(' of view', '')).join(' ') + ')' }
  const targets = [[dd(1), dd(2), dd(3)], [dd(10)], [dd(14)]]
  const undos = []
  for (let i = 1; i <= 3; i++) {
    const before = await scrollState(); const tb = await inViewNow(targets[i - 1])
    const u = await H.undoPress(w, `${tag}-32a-undo${i}`)
    const after = await scrollState(); const st = await wordsNow(); const sh = await H.sheetOf(P); const ta = await inViewNow(targets[i - 1])
    undos.push({ i, title: u.before, st, moved: JSON.stringify(before) !== JSON.stringify(after), sheet: sh, scroll: after, target: targets[i - 1].map(d => d.slice(5)).join('/'), tb, ta, bf: JSON.stringify(before), af: JSON.stringify(after) })
  }
  const redos = []
  const rtargets = [[dd(14)], [dd(10)], [dd(1), dd(2), dd(3)]]
  for (let i = 1; i <= 3; i++) {
    const before = await scrollState(); const tb = await inViewNow(rtargets[i - 1]); const rb = await rectsOf(rtargets[i - 1])
    const r = await H.redoPress(w, `${tag}-32a-redo${i}`)
    const after = await scrollState(); const st = await wordsNow(); const ta = await inViewNow(rtargets[i - 1])
    redos.push({ i, title: r.before, st, moved: JSON.stringify(before) !== JSON.stringify(after), target: rtargets[i - 1].map(d => d.slice(5)).join('/'), tb, ta, bf: JSON.stringify(before), af: JSON.stringify(after), rb })
  }
  const per = undos.length === 3 && new Set(undos.map(u => u.st)).size === 3
  const rightMove = u => (u.tb === 'in view' && !u.moved) || (u.tb !== 'in view' && u.ta === 'in view')
  const rightMoveR = r => (r.tb === 'in view' && !r.moved) || (r.tb !== 'in view' && r.ta === 'in view')
  rec('32a', which, per && undos.every(rightMove) && redos.every(rightMoveR) ? 'PASS' : 'FAIL', `three saves in one session (${w1}). Undo x3, each: ${undos.map(u => `#${u.i} "${u.title}" → ${u.st}[the day it changes, ${u.target}, was ${u.tb} before and is ${u.ta} after; the screen ${u.moved ? 'moved: ' + u.bf + ' → ' + u.af : 'stayed'}]`).join(' | ')}. Redo x3: ${redos.map(r => `#${r.i} "${r.title}" → ${r.st}[the day it changes, ${r.target}, was ${r.tb} before and is ${r.ta} after; the screen ${r.moved ? 'moved: ' + r.bf + ' → ' + r.af + ' (cells before: ' + r.rb + ')' : 'stayed'}]`).join(' | ')}`, [1, 2, 3].map(i => `${tag}-32a-undo${i}` + (w.phone ? '-q' : '')))
})
rec('31-errors', which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag + (ONLY ? '-' + [...ONLY].join('') : ''))
await w.ctx.close()
await H.finish()
