// Walker 2 — scenario 24: the drag window's typed words on MOVE. usage: node lw-night-w2-s24.mjs admin   (desktop, admin)  |  member   (phone, Ranger's own drag)
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, kinds, place, dayWindow, closeSheet, warRecs, dayWords, dragCells, typeInto, sleep, undoPress } = H
const part = process.argv[2] || 'admin'
const size = part === 'member' ? 'phone' : 'desk'
const tag = `s24-${part === 'member' ? 'ph-member' : 'dk-admin'}`
console.log('lw-night-w2-s24 v1', part, size, tag)
H.clearPics(tag)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const reqs = async (who, days) => { const o = {}; for (const n of days) o[n] = (await warRecs(P, who, dd(n))).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`).join(';') || '-'; return o }
const fmt = o => Object.entries(o).map(([d, t]) => `${d} Dec: ${t}`).join(' ; ')
async function moveTo(who, toIso, name) {
  await P.waitForSelector(T('move-banner'), { timeout: 5000 })
  const banner = await L.txt(P, T('move-banner'))
  await sleep(w, 400)
  const b = await P.locator(T(L.cellId(who, toIso))).first().boundingBox()
  if (w.phone) await L.tapAt(w, b.x + b.width / 2, b.y + b.height / 2, `${tag}-${name}-q`); else { await P.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(w, 700)
  let confirm = null
  if (await L.vis(P, T('move-confirm'))) { confirm = await L.txt(P, T('move-confirm')); await snap(`${name}-confirm`); if (w.phone) await L.step(w, `${tag}-${name}-confirm-tap`, T('move-confirm')); else await L.press(w, T('move-confirm')); await sleep(w, 700) }
  return { banner, confirm }
}
try {
  if (part === 'admin') {
    const A = ids.Drifter
    // ---- (a) two pending bids with different words and codes, words typed, Move a week later
    await place(w, A, dd(7), 'LL', { approve: false, remarks: 'A' })
    await place(w, A, dd(8), 'OL', { approve: false, remarks: 'B' })
    const fx = await reqs(A, [7, 8, 14, 15]); console.log('fixture', fmt(fx))
    if (!/LL\/pending\/"A"/.test(fx[7]) || !/OL\/pending\/"B"/.test(fx[8]) || fx[14] !== '-' || fx[15] !== '-') throw new Error('fixture: ' + fmt(fx))
    if (!(await dragCells(w, [A, dd(7)], [A, dd(8)]))) throw new Error('no drag window over 7–8 Dec')
    await typeInto(w, T('sel-remarks'), 'Moved together')
    await snap('01-typed')
    await L.press(w, T('sel-move')); await sleep(w, 600)
    const bannerUp = await L.vis(P, T('move-banner')); await snap('02-banner')
    const st = await moveTo(A, dd(14), '03-land')
    await snap('04-landed')
    const aft = await reqs(A, [7, 8, 14, 15]); console.log('after', fmt(aft))
    const ok = /LL\/pending\/"Moved together"/.test(aft[14]) && /OL\/pending\/"Moved together"/.test(aft[15]) && aft[7] === '-' && aft[8] === '-'
    rec('24a', size, ok ? 'PASS' : 'FAIL', `drag 7–8 Dec ("A" on an LL, "B" on an OL), typed "Moved together", Move (banner ${bannerUp ? 'shown: ' + st.banner : 'NOT shown'}), landed on 14 Dec. After: ${fmt(aft)}`, [`${tag}-01-typed`, `${tag}-02-banner`, `${tag}-04-landed`])
    // one Undo: what does it take back?
    const u1 = await undoPress(w, `${tag}-05-undo1`)
    const a1 = await reqs(A, [7, 8, 14, 15])
    const u2 = await undoPress(w, `${tag}-05-undo2`)
    const a2 = await reqs(A, [7, 8, 14, 15])
    const u3 = await undoPress(w, `${tag}-05-undo3`)
    const a3 = await reqs(A, [7, 8, 14, 15])
    rec('24a-undo', size, 'RECORD', `Undo after the Move with words, press by press: #1 "${u1.before}" → ${fmt(a1)} | #2 "${u2.before}" → ${fmt(a2)} | #3 "${u3.before}" → ${fmt(a3)}`, [`${tag}-05-undo1`, `${tag}-05-undo2`, `${tag}-05-undo3`])
    // put the world back for the next case: redo until the three are gone
    await H.redoWalk(w, 3)
    // ---- (b) type, Move, Escape (no landing)
    const R = ids.Ridge
    await place(w, R, dd(7), 'LL', { approve: false, remarks: 'C' })
    await place(w, R, dd(8), 'LL', { approve: false, remarks: 'D' })
    const fxb = await reqs(R, [7, 8]); console.log('fixture b', fmt(fxb))
    if (!(await dragCells(w, [R, dd(7)], [R, dd(8)]))) throw new Error('no drag window over Ridge 7–8 Dec')
    await typeInto(w, T('sel-remarks'), 'Escaped')
    await L.press(w, T('sel-move')); await sleep(w, 600)
    const up = await L.vis(P, T('move-banner')); await snap('06-banner-b')
    await P.keyboard.press('Escape'); await sleep(w, 600)
    const gone = !(await L.vis(P, T('move-banner')))
    await snap('07-after-escape')
    const eb = await reqs(R, [7, 8])
    const sheetNow = await H.sheetOf(P)
    const uE = await undoPress(w, `${tag}-08-undo-escape`)
    const eb2 = await reqs(R, [7, 8])
    const uE2 = await undoPress(w, `${tag}-08-undo-escape2`)
    const eb3 = await reqs(R, [7, 8])
    rec('24b', size, 'RECORD', `type "Escaped", Move (banner ${up ? 'up' : 'NOT up'}), Escape (banner ${gone ? 'gone' : 'STILL up'}; window open now: ${sheetNow}). The bids hold: ${fmt(eb)}${/Escaped/.test(fmt(eb)) ? ' — the words stayed (D1339 "whatever is pressed")' : ' — the words did NOT stay'}. One Undo: "${uE.before}" → ${fmt(eb2)}; a second: "${uE2.before}" → ${fmt(eb3)}`, [`${tag}-06-banner-b`, `${tag}-07-after-escape`, `${tag}-08-undo-escape`, `${tag}-08-undo-escape2`])
  } else {
    // ---- the member's own drag: admin opens December, the member bids and drags on his phone
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await sleep(w, 500) }
    await L.press(w, T('open-dates-close')); await sleep(w, 300)
    await H.signOut(P); await H.signInAs(w, 'member')
    const me = ids.Ranger
    await place(w, me, dd(8), 'LL', { remarks: 'x1' })
    await place(w, me, dd(9), 'LL', { remarks: 'x2' })
    const fx = await reqs(me, [8, 9, 15, 16]); console.log('fixture', fmt(fx))
    if (!/LL\/pending\/"x1"/.test(fx[8]) || !/LL\/pending\/"x2"/.test(fx[9]) || fx[15] !== '-' || fx[16] !== '-') throw new Error('fixture: ' + fmt(fx))
    if (!(await dragCells(w, [me, dd(8)], [me, dd(9)]))) throw new Error('no drag window over his 8–9 Dec')
    await typeInto(w, T('sel-remarks'), 'Kept words')
    await snap('01-typed')
    const rmkRow = await L.vis(P, T('sel-rmk-row'))
    await L.step(w, `${tag}-02-move`, T('sel-move')); await sleep(w, 500)
    const up = await L.vis(P, T('move-banner')); await snap('03-banner')
    const st = await moveTo(me, dd(15), '04-land')
    await snap('05-landed')
    const aft = await reqs(me, [8, 9, 15, 16]); console.log('after', fmt(aft))
    const ok = /LL\/pending\/"Kept words"/.test(aft[15]) && /LL\/pending\/"Kept words"/.test(aft[16]) && aft[8] === '-' && aft[9] === '-'
    rec('24c', size, ok ? 'PASS' : 'FAIL', `Ranger on his phone: his drag over 8–9 Dec (Remarks row ${rmkRow ? 'present' : 'ABSENT'}), typed "Kept words", Move (banner ${up ? 'up: ' + st.banner : 'NOT up'}${st.confirm ? '; confirm: ' + st.confirm : ''}), landed on 15 Dec. After: ${fmt(aft)}`, [`${tag}-01-typed`, `${tag}-02-move-q`, `${tag}-03-banner`, `${tag}-05-landed`])
  }
} catch (e) {
  rec('24!', size, 'NOT DONE', String(e).slice(0, 500), shots)
  await snap('99-error').catch(() => {})
}
rec('24-errors-' + part, size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
