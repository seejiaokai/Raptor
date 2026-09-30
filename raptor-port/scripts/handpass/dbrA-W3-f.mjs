/* W3 part F — the Leave War, more TWO-TAB cases (the promise: two people changing DIFFERENT things never overwrite each
   other), desktop 1440×900, one fresh demo world. Each case: tab A and tab B in ONE browser (one storage), B opened
   BEFORE A's change and not reloaded until the end; then both reloaded — both changes must be there.
     F1  one tab: a day's event typed on the grid's EVENT 1 row → what it writes; reload
     F2  A types an event on 7 Jan; B (stale) types an event on 21 Jan                      → both events
     F3  A moves the stage open → closed; B (stale) types an event on 22 Jan                → closed AND the event
     F4  A (admin) bids a MORNING for Ranger on 3 Mar; B = Ranger (stale) bids his AFTERNOON  → both halves
     F5  A gives an OIL award by hand (+OIL) to Cinch; B (stale) credits Piston from the OIL tracker → both awards
     F6  A: ⚙ Show SANS; B (stale): ⚙ + Counter                                             → both settings
     F7  A: + New war; B (stale): a bid on the open war                                     → the new war AND the bid
   Run from scripts/handpass:  node dbrA-W3-f.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-f.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, cells, recsAt, lwReload, stageNow, stageGo, warPick, pic, row, rowsSummary } = W
const REC = /^leavewar\/rec:y2026:/
const EL = /^settings\/elog:/

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, pg, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(pg, `F-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(pg).catch(() => {})
  }
}
/** type an event on a day of the grid's EVENT row `line`, through its own sheet */
async function typeEvent(pg, line, iso, text) {
  await lwOpen(pg, iso)
  const c = pg.locator(`[data-testid="event-${line}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
  await c.click(); await L.sleep(500)
  const s = await sheetNow(pg)
  await pg.fill('[data-testid="event-text"]', text)
  await pg.locator('[data-testid="event-apply"]').click(); await L.sleep(600)
  const after = await sheetNow(pg)
  if (after.open !== 'nothing') await closeSheets(pg)
  return { opened: s.open, after: after.open }
}
const evText = (pg, line, iso) => pg.evaluate(([l, d]) => { const c = document.querySelector(`[data-testid="event-${l}-${d}"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL' }, [line, iso])
async function openB(who, iso) { const B = await W.newPage(ctx, errors, 'B'); await L.signIn(B, who); await lwOpen(B, iso); return B }

await L.signIn(A, 'a')
await L.settle(A)
{
  const r0 = await L.rows(A)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('F0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'F0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}

/* F1 one tab: an event */
await run('F1 event', A, async () => {
  const k0 = L.results.length
  const a = await L.step(A, 'F1 EVENT 1 on Mon 5 Jan: "W3 EXERCISE"', async () => typeEvent(A, 0, '2026-01-05', 'W3 EXERCISE'), { put: [/^leavewar\/war:y2026$/], also: [EL], only: true })
  await pic(A, 'F1-event')
  await lwReload(A, 'F1 event', 'a', [])
  await lwOpen(A, '2026-01-05')
  const t = await evText(A, 0, '2026-01-05')
  await A.locator('[data-testid="event-0-2026-01-05"]').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pic(A, 'F1-after-reload')
  L.check('F1 — after the reload the event reads W3 EXERCISE on 5 Jan', /W3 EXERCISE/.test(t), t)
  row({ step: 'F1 an event on the grid', width: 'desktop', did: 'tapped EVENT 1 on 5 Jan, typed W3 EXERCISE, Apply', screen: `EVENT 1, 5 Jan: ${t}`, rows: rowsSummary(a), ok: passNow(k0) })
})

/* F2 two tabs, two events on two days */
await run('F2 two events', A, async () => {
  const k0 = L.results.length
  const B = await openB('a', '2026-01-21')
  const a = await L.step(A, 'F2 (A) EVENT 1 on Wed 7 Jan: "A-EVENT"', async () => typeEvent(A, 0, '2026-01-07', 'A-EVENT'), { put: [/^leavewar\/war:y2026$/], also: [EL], only: true })
  await A.locator('[data-testid="event-0-2026-01-07"]').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pic(A, 'F2-A-typed-A-EVENT')
  const b = await L.step(B, 'F2 (B, not reloaded) EVENT 1 on Wed 21 Jan: "B-EVENT"', async () => typeEvent(B, 0, '2026-01-21', 'B-EVENT'), { put: [/^leavewar\/war:y2026$/], also: [EL], only: true })
  await B.locator('[data-testid="event-0-2026-01-21"]').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pic(B, 'F2-B-typed-B-EVENT')
  /* what B's save put in the war's row for 7 Jan (A's event) */
  { const w = JSON.parse((await L.rows(B))['leavewar/war:y2026']); L.check('F2 — B\'s save kept A\'s 7 Jan event in the war\'s row', /A-EVENT/.test(JSON.stringify((w.days || []).find(d => d.date === '2026-01-07'))), (w.days || []).find(d => d.date === '2026-01-07')) }
  const rr = await W.reloadBoth(A, 'a', B, 'a', 'F2 two events', [])
  await lwOpen(A, '2026-01-07')
  const eA = [await evText(A, 0, '2026-01-07'), await evText(A, 0, '2026-01-21')]
  await lwOpen(B, '2026-01-07')
  const eB = [await evText(B, 0, '2026-01-07'), await evText(B, 0, '2026-01-21')]
  await A.locator('[data-testid="event-0-2026-01-07"]').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pic(A, 'F2-A-after-both-reloaded')
  const stored = JSON.parse(rr.rows['leavewar/war:y2026'] || '{}')
  const sd = d => ((stored.days || []).find(x => x.date === d) || {}).events || []
  L.check('F2 — after reloading both: A\'s event on 7 Jan AND B\'s event on 21 Jan, in both tabs', /A-EVENT/.test(eA[0]) && /B-EVENT/.test(eA[1]) && /A-EVENT/.test(eB[0]) && /B-EVENT/.test(eB[1]), { tabA: eA, tabB: eB, storedWarRow: { '2026-01-07': sd('2026-01-07'), '2026-01-21': sd('2026-01-21') } })
  row({ step: 'F2 two tabs: two events, two days', width: 'desktop', did: 'B opened; A: EVENT 1 7 Jan "A-EVENT"; B (stale): EVENT 1 21 Jan "B-EVENT"; reload both', screen: `A tab: 7 Jan "${eA[0]}", 21 Jan "${eA[1]}"; B tab: "${eB[0]}", "${eB[1]}"`, rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  await B.close()
})

/* F3 two tabs: A stage move, B event */
await run('F3 stage + event', A, async () => {
  const k0 = L.results.length
  const B = await openB('a', '2026-01-22')
  await lwOpen(A, '2026-01-05')
  const s0 = await stageNow(A)
  const a = await L.step(A, 'F3 (A) stage → BIDDING CLOSED', async () => stageGo(A, 'advance'), { put: [/^leavewar\/war:y2026$/], only: true })
  await pic(A, 'F3-A-closed')
  const b = await L.step(B, 'F3 (B, not reloaded, still sees OPEN) EVENT 1 on Thu 22 Jan: "B-EV2"', async () => typeEvent(B, 0, '2026-01-22', 'B-EV2'), { put: [/^leavewar\/war:y2026$/], also: [EL], only: true })
  await pic(B, 'F3-B-event-while-A-closed')
  { const w = JSON.parse((await L.rows(B))['leavewar/war:y2026']); L.check('F3 — B\'s save kept A\'s stage (closed) in the war\'s row', w.stage === 'closed', { storedStage: w.stage }) }
  const rr = await W.reloadBoth(A, 'a', B, 'a', 'F3 stage + event', [])
  const stA = await stageNow(A), stB = await stageNow(B)
  await lwOpen(A, '2026-01-22')
  const ev = await evText(A, 0, '2026-01-22')
  await pic(A, 'F3-A-after-both-reloaded')
  const stored = JSON.parse(rr.rows['leavewar/war:y2026'] || '{}')
  L.check('F3 — after reloading both: the war is BIDDING CLOSED (A\'s stage move kept) AND B\'s event is there', /CLOSED/i.test(stA) && /CLOSED/i.test(stB) && /B-EV2/.test(ev), { was: s0, stageA: stA, stageB: stB, event: ev, storedStage: stored.stage })
  row({ step: 'F3 two tabs: stage move + event', width: 'desktop', did: `B opened; A: ${s0} → BIDDING CLOSED; B (stale): EVENT 1 22 Jan "B-EV2"; reload both`, screen: `stage A "${stA}" B "${stB}"; 22 Jan event "${ev}"`, rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  /* put the stage back for the cases that follow (the app's own ← control) */
  await lwOpen(A, '2026-01-05')
  if (/CLOSED/i.test(await stageNow(A))) await stageGo(A, 'back')
  await B.close()
})

/* F4 two tabs, one man one day, two halves */
const ME = 'bane', D4 = '2026-03-03'   // Ranger, Tue 3 Mar
let F4AM = null, F4PM = null
await run('F4 two halves two tabs', A, async () => {
  const k0 = L.results.length
  await A.reload(); await L.signIn(A, 'a', { goto: false })
  const st = await (async () => { await lwOpen(A, D4); return stageNow(A) })()
  const B = await openB('m', D4)
  const a = await L.step(A, 'F4 (A, admin) a MORNING of LL for Ranger, 3 Mar', async () => bidOn(A, ME, D4, 'LL', { portion: 'am' }), { put: [REC], only: true })
  const b = await L.step(B, 'F4 (B = Ranger, not reloaded) his AFTERNOON of LL, 3 Mar', async () => bidOn(B, ME, D4, 'LL', { portion: 'pm' }), { put: [REC], only: true })
  F4AM = a.put.find(k => REC.test(k)); F4PM = b.put.find(k => REC.test(k))
  const rr = await W.reloadBoth(A, 'a', B, 'm', 'F4 two halves two tabs', [[ME, D4]])
  const here = recsAt(rr.rows, ME, D4)
  const t = await tapCell(A, ME, D4)
  await pic(A, 'F4-A-daylist-after-both-reloaded'); await closeSheets(A)
  L.check('F4 — after reloading both: BOTH halves stored and BOTH on the day\'s list', here.length === 2 && t.open === 'daylist-sheet' && t.lines.length === 2 && t.lines.some(l => /morning/i.test(l)) && t.lines.some(l => /afternoon/i.test(l)), { stage: st, stored: here.map(x => `${x.portion || 'full'}#${x.ord}`), opened: t.open, lines: t.lines, bRet: b.ret })
  row({ step: 'F4 two tabs: two halves, one man, one day', width: 'desktop', did: 'B (Ranger) opened; A: Ranger 3 Mar Morning LL; B (stale): his Afternoon LL; reload both', screen: `A's day list: ${JSON.stringify(t.lines)}`, rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  await B.close()
})

/* F8–F11 (the scenario designer's no. 10): on that two-record day, the admin works on ONE record — Ack it, ⇄ Move it,
   Delete it — and the other (Ranger's afternoon) keeps its row byte for byte, its place and its state throughout; then a
   STALE tab (Ranger, opened after the move, before the delete) bids the free half where the deleted record was — the
   deleted record must not come back. */
await run('F8-F11 one record of two', A, async () => {
  const k0 = L.results.length
  const D5 = '2026-03-05'
  const r0 = await L.rows(A)
  const amKey = F4AM, pmKey = F4PM
  const amId = amKey && JSON.parse(r0[amKey] || '{}').id
  /* the afternoon's row as it stands before each step (refreshed after F8, so a later step is judged on its own) */
  let base = r0
  const unchangedPm = (r, name) => L.check(`${name} — Ranger's afternoon row untouched (same bytes)`, pmKey && r[pmKey] === base[pmKey], { pmKey, was: pmKey && base[pmKey], now: pmKey && r[pmKey] })
  /* F8 Ack the morning from the day's list */
  const a8 = await L.step(A, 'F8 (A) the day\'s list: Ack the morning', async () => {
    const t = await tapCell(A, ME, D4)
    const p = await sheetPress(A, `dl-ack-${amId}`)
    const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A)
    return { opened: t.open, lines: t.lines, pressed: p.pressed, why: p.why }
  }, { put: [REC], also: [EL], only: true })
  L.check('F8 — ONE put, the morning\'s own row (same key), now acknowledged', a8.put.filter(k => REC.test(k)).join() === amKey && !a8.del.length && JSON.parse((await L.rows(A))[amKey] || '{}').state === 'acknowledged', { put: a8.put, ret: a8.ret })
  unchangedPm(await L.rows(A), 'F8')
  await lwReload(A, 'F8 ack one of two', 'a', [[ME, D4]])
  const t8 = await tapCell(A, ME, D4); await pic(A, 'F8-daylist-after-reload'); await closeSheets(A)
  L.check('F8 — after the reload the day\'s list reads the morning acked, the afternoon still a bid, in that order', t8.lines.length === 2 && /morning.*acked/i.test(t8.lines[0]) && /afternoon.*not decided/i.test(t8.lines[1]), t8.lines)
  base = await L.rows(A)
  /* F9 Move the morning to 5 Mar */
  const a9 = await L.step(A, 'F9 (A) the day\'s list: ⇄ Move the morning to Thu 5 Mar', async () => {
    const t = await tapCell(A, ME, D4)
    const p = await sheetPress(A, `dl-move-${amId}`)
    const c = A.locator(`[data-testid="cell-${ME}-${D5}"]`).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
    const pt = await W.at(A, `cell-${ME}-${D5}`)
    await A.mouse.click(pt.x, pt.y); await L.sleep(700)
    if (await W.banner(A) && await A.locator('[data-testid="move-confirm"]:visible').count()) { await A.locator('[data-testid="move-confirm"]:visible').click(); await L.sleep(700) }
    return { opened: t.open, pressed: p.pressed, why: p.why, bannerEnd: await W.banner(A) }
  }, { put: [REC], also: [EL], only: true })
  const r9 = await L.rows(A)
  const mv = JSON.parse(r9[amKey] || '{}')
  /* a moved request is undecided again (store.ts moveRecords: `state: 'pending'` — a decision was about the old day) */
  L.check('F9 — the move is ONE put at the SAME record key, now naming 5 Mar (a bid again, by design); no delete', a9.put.filter(k => REC.test(k)).join() === amKey && !a9.del.length && mv.date === D5 && mv.state === 'pending', { put: a9.put, del: a9.del, rec: mv, ret: a9.ret })
  unchangedPm(r9, 'F9')
  await lwReload(A, 'F9 move one of two', 'a', [[ME, D4], [ME, D5]])
  await W.lwOpen(A, D4); await A.locator(`[data-testid="cell-${ME}-${D4}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pic(A, 'F9-after-reload')
  /* the stale tab opens NOW: it sees the morning on 5 Mar */
  const B = await openB('m', D5)
  const bSees = await cells(B, [[ME, D5]])
  /* F10 Delete the moved morning */
  const a10 = await L.step(A, 'F10 (A) Delete the morning on 5 Mar', async () => {
    const t = await tapCell(A, ME, D5)
    let p = await sheetPress(A, 'bid-clear')
    let s = await sheetNow(A)
    if (s.open !== 'nothing' && s.buttons.some(b => /bid-clear:Delete — sure/.test(b))) { p = await sheetPress(A, 'bid-clear'); s = await sheetNow(A) }
    if (s.open !== 'nothing') await closeSheets(A)
    return { opened: t.open, buttons: t.buttons }
  }, { del: [REC], also: [EL], only: true })
  L.check('F10 — exactly the morning\'s row removed', a10.del.join() === amKey && !a10.put.some(k => REC.test(k)), { del: a10.del, put: a10.put })
  unchangedPm(await L.rows(A), 'F10')
  /* F11 the stale tab bids the free afternoon on 5 Mar, where it still sees the morning */
  const b11 = await L.step(B, 'F11 (B = Ranger, stale: still sees the morning on 5 Mar) bids his AFTERNOON there', async () => bidOn(B, ME, D5, 'LL', { portion: 'pm' }), { put: [REC], only: true })
  L.check('F11 — the stale tab wrote ONLY its new record; the deleted morning was NOT written back', b11.put.length === 1 && b11.put[0] !== amKey && !(amKey in (await L.rows(B))), { put: b11.put, bSawBefore: bSees, amBack: amKey in (await L.rows(B)) })
  const rr = await W.reloadBoth(A, 'a', B, 'm', 'F11 no resurrection', [[ME, D4], [ME, D5]])
  const t11 = await tapCell(A, ME, D5); await pic(A, 'F11-A-after-both-reloaded'); await closeSheets(A)
  L.check('F11 — after reloading both: 5 Mar holds only Ranger\'s afternoon; 3 Mar his afternoon, untouched', !(amKey in rr.rows) && rr.rows[pmKey] === base[pmKey] && recsAt(rr.rows, ME, D5).length === 1 && /afternoon|>/i.test(t11.text || ''), { d5: recsAt(rr.rows, ME, D5).map(x => `${x.portion || ''}/${x.state}`), cells: rr.cA, sheet: (t11.text || '').slice(0, 120) })
  row({ step: 'F8–F11 one record of two (+ stale tab)', width: 'desktop', did: 'Ranger 3 Mar (AM admin, PM Ranger): Ack AM; Move AM → 5 Mar; stale Ranger tab opened; Delete AM; stale tab bids PM on 5 Mar; reload both', screen: `3 Mar list after F8 reload: ${JSON.stringify(t8.lines)}; after both reloads ${JSON.stringify(rr.cA)}`, rows: `ack: ${rowsSummary(a8)} || move: ${rowsSummary(a9)} || delete: ${rowsSummary(a10)} || stale bid: ${rowsSummary(b11)}`, ok: passNow(k0) })
  await B.close()
})

/* F5 two tabs, two awards */
await run('F5 two awards', A, async () => {
  const k0 = L.results.length
  const B = await openB('a', '2026-09-30')
  const a = await L.step(A, 'F5 (A) +OIL by hand to Cinch, 10 Mar', async () => {
    await tapCell(A, 'snap', '2026-03-10'); await sheetPress(A, 'bid-oil')
    await A.fill('[data-testid="oil-why"]', 'F5 grid award')
    const dd = A.locator('[data-testid="oil-days"]'); if (await dd.count()) await dd.fill('1')
    await sheetPress(A, 'oil-give'); const s = await sheetNow(A); if (s.open !== 'nothing') await closeSheets(A)
  }, { put: [/^leavewar\/ledger:/], also: [EL], only: true })
  const b = await L.step(B, 'F5 (B, not reloaded) OIL tracker: credit Piston 1 day', async () => {
    await B.locator('[data-testid="oil-tracker"]:visible').first().click(); await L.sleep(1300)
    const nm = B.locator('[data-testid="oil-name-pump"]').first(); await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(500)
    await B.fill('[data-testid="oil-amt"]', '1'); const rs = B.locator('[data-testid="oil-reason"]'); if (await rs.count()) await rs.fill('F5 tracker credit')
    await B.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
    const x = B.locator('[data-testid="oil-close"]:visible').first(); if (await x.count()) { await x.click(); await L.sleep(500) }
  }, { put: [/^leavewar\/ledger:/], also: [EL], only: true })
  const rr = await W.reloadBoth(A, 'a', B, 'a', 'F5 two awards', [['snap', '2026-03-10'], ['pump', '2026-09-30']])
  const led = Object.entries(rr.rows).filter(([k]) => k.startsWith('leavewar/ledger:')).map(([, v]) => JSON.parse(v)).filter(e => /F5/.test(e.reason || ''))
  await lwOpen(A, '2026-03-10'); await A.locator('[data-testid="cell-snap-2026-03-10"]').first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pic(A, 'F5-A-after-both-reloaded')
  L.check('F5 — after reloading both: both awards stored, and each shows on its date (FO)', led.length === 2 && /FO/.test(rr.cA['snap@2026-03-10'].text) && /FO/.test(rr.cA['pump@2026-09-30'].text), { ledger: led.map(e => `${e.personId} ${e.date} ${e.amount}`), cells: rr.cA })
  row({ step: 'F5 two tabs: two OIL awards', width: 'desktop', did: 'B opened; A: +OIL Cinch 10 Mar; B (stale): tracker credit Piston today; reload both', screen: JSON.stringify(rr.cA), rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  await B.close()
})

/* F6 two tabs, two settings */
await run('F6 two settings', A, async () => {
  const k0 = L.results.length
  const B = await openB('a', '2026-01-05')
  const a = await L.step(A, 'F6 (A) ⚙ → Show SANS', async () => {
    await A.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(600)
    await A.locator('[data-testid="sans-toggle"]:visible').click(); await L.sleep(600); await closeSheets(A)
  })
  const b = await L.step(B, 'F6 (B, not reloaded) ⚙ → + Counter "F6 CTR"', async () => {
    await B.locator('[data-testid="settings-open"]:visible').first().click(); await L.sleep(600)
    await B.locator('[data-testid="counter-add"]:visible').click(); await L.sleep(600)
    await B.fill('[data-testid="cform-name"]', 'F6 CTR'); await B.locator('[data-testid="cform-save"]:visible').click(); await L.sleep(700); await closeSheets(B)
  })
  const rr = await W.reloadBoth(A, 'a', B, 'a', 'F6 two settings', [])
  await lwOpen(A, '2026-01-05')
  const sans = await A.evaluate(() => [...document.querySelectorAll('[data-testid^="group-"]')].some(e => /SANS/.test(e.innerText || '')))
  const ctr = await A.evaluate(() => [...document.querySelectorAll('[data-testid^="count-"]')].some(e => /f6/i.test(e.getAttribute('data-testid'))) || /F6 CTR/.test(document.body.innerText))
  await pic(A, 'F6-A-after-both-reloaded')
  L.check('F6 — after reloading both: SANS shown (A) AND the F6 CTR counter (B)', sans && ctr && rr.rows['leavewar/showsans'] === 'true', { sans, ctr, showsans: rr.rows['leavewar/showsans'], aPut: a.put, bPut: b.put })
  row({ step: 'F6 two tabs: two ⚙ settings', width: 'desktop', did: 'B opened; A: Show SANS; B (stale): + Counter F6 CTR; reload both', screen: `SANS group shown: ${sans}; counter shown: ${ctr}`, rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  await B.close()
})

/* F7 two tabs, a new war and a bid */
await run('F7 new war + bid', A, async () => {
  const k0 = L.results.length
  const B = await openB('a', '2026-03-17')
  const a = await L.step(A, 'F7 (A) + New war "F7 FEB 28" (1–29 Feb 2028)', async () => {
    await A.locator('[data-testid="war-new"]:visible').first().click(); await L.sleep(500)
    await A.fill('[data-testid="war-name"]', 'F7 FEB 28')
    const day = async (iso) => { for (let i = 0; i < 30 && !(await A.locator(`[data-testid="war-day-${iso}"]`).count()); i++) { await A.locator('[data-testid="war-next-month"]').click(); await L.sleep(80) } await A.locator(`[data-testid="war-day-${iso}"]`).first().click(); await L.sleep(150) }
    await day('2028-02-01'); await day('2028-02-29')
    await A.locator('[data-testid="war-create"]').click(); await L.sleep(1500)
  })
  const b = await L.step(B, 'F7 (B, not reloaded) a bid for Echo, 17 Mar', async () => bidOn(B, 'freak', '2026-03-17', 'LL'), { put: [REC], only: true })
  const rr = await W.reloadBoth(A, 'a', B, 'a', 'F7 new war + bid', [['freak', '2026-03-17']])
  const pA = await warPick(A), pB = await warPick(B)
  await pic(A, 'F7-A-after-both-reloaded')
  L.check('F7 — after reloading both: the picker lists F7 FEB 28 in both tabs AND Echo\'s bid is there', pA.opts.some(o => o.t === 'F7 FEB 28') && pB.opts.some(o => o.t === 'F7 FEB 28') && /LL/.test(rr.cA['freak@2026-03-17'].text), { pA: pA.opts.map(o => o.t), pB: pB.opts.map(o => o.t), cell: rr.cA, aPut: a.put })
  row({ step: 'F7 two tabs: a new war + a bid', width: 'desktop', did: 'B opened; A: + New war F7 FEB 28; B (stale): Echo 17 Mar LL; reload both', screen: `picker: ${pA.opts.map(o => o.t).join(' / ')}; ${JSON.stringify(rr.cA)}`, rows: `A: ${rowsSummary(a)} || B: ${rowsSummary(b)}`, ok: passNow(k0) })
  await B.close()
})

L.check('part F — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
