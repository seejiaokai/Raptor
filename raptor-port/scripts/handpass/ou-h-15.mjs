/* helper walk S29: orders around the load (desk).
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-15.mjs desk */
import { L, J, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, redo, loadVersion, rowOut, part, FRI, FRI_ISO } from './ou-h-0.mjs'
const T = 'desk', S = `S29 ${T}`
const w = await L.world('desk'), p = w.page
console.log('ou-h-15 S29 version 1')
const wins = () => p.evaluate(() => document.querySelectorAll('[data-testid="win-oilday"]').length)
const onProg = id => p.evaluate(id => window.DAYS[4].ground.some(g => String(g.src) === id), id)
try {
  let X, Y, W
  await part(w, S, 'S29 set-up', 'X, Y live and W cancelled on a Friday; published; made a holiday; X and Y taken off; W un-cancel asked and left (the bar)', async () => {
    X = await file(w, FRI_ISO, 'bane', 'Range brief'); Y = await file(w, FRI_ISO, 'pike', 'Hangar brief', { start: '11:00', end: '12:00' }); W = await file(w, FRI_ISO, 'dj', 'Engine brief', { start: '13:00', end: '14:00' })
    await mark(w, FRI, W.id, 'cx')
    await board(w, FRI); const pub = await publish(p, FRI); await L.sleep(600); await closeBoard(w)
    const h = await makeHoliday(w, FRI_ISO)
    if (h.list) await w.press('[data-testid="odl-later"]'); await L.sleep(300); await closeWindows(w)
    await board(w, FRI)
    for (const k of [X, Y]) { await rowBtn(w, FRI, k.id, 'grdel'); await L.sleep(300) }
    rowOut(S, 'S29 set-up', 'published; holiday; X and Y off the programme; W cancelled', `publish ${J(pub)}; on programme ${J([await onProg(X.id), await onProg(Y.id)])}; W ${J(await rec(p, W.id))}`, pub.published && !(await onProg(X.id)) && (await rec(p, W.id)).cx)
  })
  await part(w, S, 'S29d the load while a "not answered" bar is up', 'asks afresh or says it changed; never acts on a stale state', async () => {
    await uncx(w, FRI, W.id)
    await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
    const b0 = await bar(p)
    await closeBoard(w); await L.sleep(300)
    const b0b = await bar(p)
    const r = await loadVersion(w, FRI, 'week')
    const b1 = await bar(p), wr = await rec(p, W.id)
    await L.pic(w, 'S29d-after-load-desk')
    let a = null
    if (b1) { await w.press('[data-testid="oilbar-answer"]'); await L.sleep(500); a = { q: await sheet(p), note: await noteNow(p), r: await rec(p, W.id) }; if (a.q) { await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(300) } }
    rowOut(S, 'S29d load with the bar up', 'RECORD: the bar after the load and "Answer OIL"', `bar before ${J(b0)}; after Done ${J(b0b)}; load note "${r.note}"; list ${J(r.list)}; bar after the load ${J(b1)}; W ${J(wr)}; Answer OIL ${J(a)}`, true)
    await closeWindows(w)
  })
  await part(w, S, 'S29a Undo straight after the load, then Yes on a line', 'one Undo takes the load back — RECORD what the open list then shows', async () => {
    await L.go(w, 'editsched')
    /* put X and Y back off, load again so the list opens */
    await board(w, FRI)
    for (const k of [X, Y]) { if (await onProg(k.id)) { await rowBtn(w, FRI, k.id, 'grdel'); await L.sleep(300) } }
    await closeBoard(w)
    const r = await loadVersion(w, FRI, 'week')
    const l0 = await list(p), onX = await onProg(X.id)
    await undo(p)
    const l1 = await list(p), onX1 = await onProg(X.id), n1 = await noteNow(p)
    await L.pic(w, 'S29a-after-undo-desk')
    let res = null
    if (l1 && l1.ids.length) { const id = l1.ids.find(i => i === X.id || i === Y.id) || l1.ids[0]; await w.press(`[data-testid="odl-yes-${id}"]`).catch(() => {}); await L.sleep(150); await w.press('[data-testid="odl-save"]').catch(() => {}); await L.sleep(600); res = { id, rec: await rec(p, id), note: await noteNow(p) } }
    rowOut(S, 'S29a Undo after the load', 'RECORD', `load note "${r.note}"; list ${J(l0 && l0.ids)}; X on the programme ${onX}; after one Undo: X on the programme ${onX1}, list ${J(l1)}, note "${n1}"; Yes on a line then Save: ${J(res)}`, true)
    await closeWindows(w)
  })
  await part(w, S, 'S29c the load twice running', 'no second tail, no second list window', async () => {
    const r1 = await loadVersion(w, FRI, 'week'); const c1 = await wins()
    const r2 = await loadVersion(w, FRI, 'week'); const c2 = await wins()
    await L.pic(w, 'S29c-twice-desk')
    rowOut(S, 'S29c load twice', 'the second load adds no second list window and no second OIL tail', `first: note "${r1.note}", list windows ${c1}; second: note "${r2.note}", list windows ${c2}`, c2 <= 1 && !/needs? an OIL answer · .*needs? an OIL answer/.test(r2.note))
    await closeWindows(w)
  })
  await part(w, S, 'S29b load, answer in the list, Save, then Undo twice', 'RECORD', async () => {
    await board(w, FRI)
    for (const k of [X, Y]) { if (await onProg(k.id)) { await rowBtn(w, FRI, k.id, 'grdel'); await L.sleep(300) } }
    await closeBoard(w)
    const r = await loadVersion(w, FRI, 'week'); const l0 = await list(p)
    let saved = null
    if (l0) { await w.press('[data-testid="odl-yesall"]'); await L.sleep(250); await w.press('[data-testid="odl-save"]'); await L.sleep(700); saved = { note: await noteNow(p), x: await rec(p, X.id), y: await rec(p, Y.id) } }
    await undo(p); const u1 = { x: await rec(p, X.id), y: await rec(p, Y.id), onX: await onProg(X.id) }
    await undo(p); const u2 = { x: await rec(p, X.id), y: await rec(p, Y.id), onX: await onProg(X.id), l: await list(p) }
    await L.pic(w, 'S29b-after-undos-desk')
    rowOut(S, 'S29b answer then Undo twice', 'RECORD', `load note "${r.note}"; list ${J(l0 && l0.ids)}; saved ${J(saved)}; after Undo 1 ${J(u1)}; after Undo 2 ${J(u2)}`, true)
    await closeWindows(w)
  })
  L.row(S, 'S29e "Switch to this plan" on a saved plan holding taken-off inputs', 'RECORD (Q5)', 'NOT WALKED: not reached in the time (a saved plan with taken-off inputs needs its own set-up)', 'NOT WALKED')
  L.row(S, 'S29f a day template on an unpublished holiday', 'RECORD', 'NOT WALKED: not reached in the time', 'NOT WALKED')
} finally { await L.close(w) }
