/* W3 part A — the Leave War, desktop 1440×900, one fresh demo world, the admin (Saber) unless said.
     A0  the first boot: ONE change-log batch, of type boot
     1   a bid on a man's day → Approve → ⇄ Move to another day → Delete   (each: its rec row, a move ONE put)
     2   a day holding two records: two halves (AM + PM), and a bid beside an OIL award — their order on the day's list
         before and after a reload; delete the first → the second keeps its place (its row untouched)
     3   an OIL award by hand (+OIL on the grid) and one credited from the OIL tracker → a row each; the award on its date
     4   stage moves open → closed → published → the war's row
     10  at published, the member (Ranger) edits his approved leave's remarks → the request row, not the war
   Every step: L.step (the rows it wrote, named by its batch) + a reload (the app's state, the war's boxes, "the reload
   wrote nothing"). Run from scripts/handpass:  node dbrA-W3-a.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-a.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, cells, recsAt, lwOnly, stageNow, stageGo, lwReload, pic, row, rowsSummary, banner, at } = W
const WAR = 'y2026'
const EL = /^settings\/elog:/
const REC = /^leavewar\/rec:y2026:/

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const tableNote = {}

async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `A-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeSheets(page).catch(() => {})
  }
}
const focusCell = async (pid, iso) => { await lwOpen(page, iso); const c = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first(); if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300) } }
const passNow = (from) => L.results.slice(from).every(r => r.ok)

/* ============ A0 the first boot ============ */
await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const byCol = {}
  for (const k of Object.keys(r0)) { const c = k.split('/')[0]; byCol[c] = (byCol[c] || 0) + 1 }
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('A0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', { byCol, batches: b.map(x => ({ type: x.type, n: (x.items || []).length })) })
  row({ step: 'A0 first boot', width: 'desktop', did: 'fresh world, signed in as Saber', screen: '—', rows: `by collection ${JSON.stringify(byCol)}; batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}

/* ============ 1 bid → Approve → Move → Delete ============ */
const X = 'dice', D1 = '2026-01-13', D2 = '2026-01-15'   // Reaper, Tue 13 Jan → Thu 15 Jan
let recKey1 = null, iid1 = null
await run('1a bid', async () => {
  const k0 = L.results.length
  await lwOpen(page, D1)
  const a = await L.step(page, '1a a bid (LL) on Reaper, Tue 13 Jan', async () => bidOn(page, X, D1, 'LL'), { put: [REC], also: [EL], only: true })
  const recs = a.put.filter(k => REC.test(k))
  recKey1 = recs[0]
  L.check('1a — exactly ONE record row written', recs.length === 1 && a.del.length === 0, recs)
  L.check('1a — the bid was placed through the sheet', a.ret && a.ret.placed, a.ret)
  await focusCell(X, D1); await pic(page, 'A-1a-bid-placed')
  const rr = await lwReload(page, '1a bid', 'a', [[X, D1]])
  await focusCell(X, D1); await pic(page, 'A-1a-after-reload')
  row({ step: '1a bid', width: 'desktop', did: 'tapped Reaper 13 Jan, LL (Whole day)', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})
await run('1b approve', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '1b Approve Reaper\'s bid', async () => {
    const t = await tapCell(page, X, D1)
    const p = await sheetPress(page, 'decide-approve')
    const s = await sheetNow(page)
    if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, buttons: t.buttons, after: s.open }
  }, { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  /* by design (design §5.2 lw.approve; the one absence record): approving turns the war's bid into ONE request on the
     Inputs page — the bid's row goes, the request's row comes, in ONE saved action with its history line */
  const inp = a.put.filter(k => k.startsWith('inputs/'))
  iid1 = inp[0] ? inp[0].slice(7) : null
  L.check('1b — the bid\'s own row removed and ONE request row put (D418), in ONE change-log batch', a.del.length === 1 && a.del[0] === recKey1 && inp.length === 1 && a.batches.length === 1, { del: a.del, inp, batches: a.batches })
  const r = await L.rows(page)
  const req = iid1 && r['inputs/' + iid1] ? JSON.parse(r['inputs/' + iid1]) : null
  L.check('1b — the stored request is Reaper\'s LL on 13 Jan, filed from the war', req && req.person === X && req.date === 'Jan 13' && req.yr === 2026 && req.lw === WAR, req)
  await focusCell(X, D1); await pic(page, 'A-1b-approved')
  const rr = await lwReload(page, '1b approve', 'a', [[X, D1]])
  await focusCell(X, D1); await pic(page, 'A-1b-after-reload')
  row({ step: '1b approve', width: 'desktop', did: 'tapped the bid, Approve', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})
await run('1c move', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '1c ⇄ Move the approved leave from 13 Jan to 15 Jan', async () => {
    const t = await tapCell(page, X, D1)
    const p = await sheetPress(page, 'decide-shift')
    const b1 = await banner(page)
    const c = page.locator(`[data-testid="cell-${X}-${D2}"]`).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
    const pt = await at(page, `cell-${X}-${D2}`)
    await page.mouse.click(pt.x, pt.y); await L.sleep(700)
    const b2 = await banner(page)
    if (b2 && await page.locator('[data-testid="move-confirm"]:visible').count()) { await page.locator('[data-testid="move-confirm"]:visible').click(); await L.sleep(700) }
    return { opened: t.open, buttons: t.buttons, pressed: p.pressed, banner: b1, bannerAfterClick: b2, bannerEnd: await banner(page) }
  }, { put: [/^inputs\//], del: [/^inputs\//], also: [EL], only: true })
  /* by design (design §5.2 lw.moveApproved): an APPROVED leave lives on the Inputs page, and moving it cuts the moved
     days from its request and re-files them as a new request — so it is the request's rows that change, never the war's */
  const newReq = a.put.filter(k => k.startsWith('inputs/'))
  L.check('1c — the approved leave\'s request cut and re-filed on 15 Jan, no war row touched, ONE batch', a.del.length === 1 && a.del[0] === 'inputs/' + iid1 && newReq.length === 1 && !a.put.some(k => k.startsWith('leavewar/')) && a.batches.length === 1, { put: a.put, del: a.del, batches: a.batches, ret: a.ret })
  const r = await L.rows(page)
  const req = newReq[0] && r[newReq[0]] ? JSON.parse(r[newReq[0]]) : null
  L.check('1c — the stored request now names 15 Jan', req && req.date === 'Jan 15' && req.yr === 2026 && req.person === X, req)
  tableNote.moveInput = { from: 'inputs/' + iid1, to: newReq[0] }
  iid1 = newReq[0] ? newReq[0].slice(7) : null
  await focusCell(X, D2); await pic(page, 'A-1c-moved')
  const rr = await lwReload(page, '1c move', 'a', [[X, D1], [X, D2]])
  await focusCell(X, D2); await pic(page, 'A-1c-after-reload')
  row({ step: '1c move', width: 'desktop', did: 'tapped the leave, ⇄ Move, clicked Thu 15 Jan', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})
const X2 = 'nact', E1 = '2026-01-27', E2 = '2026-01-29'   // Warden, a pending bid, Tue 27 → Thu 29 Jan
await run('1c2 move a pending bid', async () => {
  const k0 = L.results.length
  const b = await L.step(page, '1c2 a bid (LL) on Warden, Tue 27 Jan', async () => bidOn(page, X2, E1, 'LL'), { put: [REC], also: [EL], only: true })
  const key = b.put.find(k => REC.test(k))
  const r0 = await L.rows(page)
  const a = await L.step(page, '1c2 ⇄ Move Warden\'s (pending) bid from 27 Jan to 29 Jan', async () => {
    const t = await tapCell(page, X2, E1)
    const p = await sheetPress(page, 'decide-shift')
    const b1 = await banner(page)
    const c = page.locator(`[data-testid="cell-${X2}-${E2}"]`).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
    const pt = await at(page, `cell-${X2}-${E2}`)
    await page.mouse.click(pt.x, pt.y); await L.sleep(700)
    if (await banner(page) && await page.locator('[data-testid="move-confirm"]:visible').count()) { await page.locator('[data-testid="move-confirm"]:visible').click(); await L.sleep(700) }
    return { opened: t.open, pressed: p.pressed, banner: b1, bannerEnd: await banner(page) }
  }, { put: [REC], also: [EL], only: true })
  const recs = a.put.filter(k => REC.test(k))
  L.check('1c2 — a move of the war\'s own record is ONE put of the SAME row, never a delete and a put; ONE batch', recs.length === 1 && recs[0] === key && a.del.length === 0 && a.batches.length === 1, { put: a.put, del: a.del, batches: a.batches })
  const r1 = await L.rows(page)
  const rec = key && r1[key] ? JSON.parse(r1[key]) : null
  L.check('1c2 — the stored record now names 29 Jan, still a pending bid, no moved-from mark (bidding is open)', rec && rec.date === E2 && rec.pid === X2 && rec.state === 'pending' && !rec.shiftedFrom, { was: key && r0[key], now: rec })
  await focusCell(X2, E2); await pic(page, 'A-1c2-moved')
  const rr = await lwReload(page, '1c2 move a pending bid', 'a', [[X2, E1], [X2, E2]])
  await focusCell(X2, E2); await pic(page, 'A-1c2-after-reload')
  row({ step: '1c2 move a pending bid', width: 'desktop', did: 'Warden 27 Jan LL; tapped it, ⇄ Move, clicked Thu 29 Jan', screen: JSON.stringify(rr.after), rows: rowsSummary(b) + ' || ' + rowsSummary(a), ok: passNow(k0) })
})
await run('1d delete', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '1d Delete the leave on 15 Jan', async () => {
    const t = await tapCell(page, X, D2)
    let p = await sheetPress(page, 'bid-clear')
    let s = await sheetNow(page)
    let asked = null
    if (s.open !== 'nothing' && s.buttons.some(b => /bid-clear:Delete — sure/.test(b))) { asked = s.text; p = await sheetPress(page, 'bid-clear'); s = await sheetNow(page) }
    if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, buttons: t.buttons, asked, after: s.open }
  }, { del: [/^inputs\//], also: [EL], only: true })
  L.check('1d — exactly the approved leave\'s request row removed, ONE batch', a.del.length === 1 && a.del[0] === 'inputs/' + iid1 && !a.put.some(k => k.startsWith('leavewar/')) && a.batches.length === 1, { put: a.put, del: a.del, batches: a.batches, ret: a.ret })
  await focusCell(X, D2); await pic(page, 'A-1d-deleted')
  const rr = await lwReload(page, '1d delete', 'a', [[X, D1], [X, D2]])
  await focusCell(X, D2); await pic(page, 'A-1d-after-reload')
  row({ step: '1d delete', width: 'desktop', did: 'tapped the leave, Delete', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

/* ============ 2 a day holding two records ============ */
const Y = 'shaft', DY = '2026-01-20'   // Anvil, Tue 20 Jan: a morning and an afternoon
await run('2a two halves', async () => {
  const k0 = L.results.length
  const a1 = await L.step(page, '2a a morning of LL on Anvil, 20 Jan', async () => bidOn(page, Y, DY, 'LL', { portion: 'am' }), { put: [REC], also: [EL], only: true })
  const a2 = await L.step(page, '2a an afternoon of LL beside it', async () => {
    const t = await tapCell(page, Y, DY)
    let r = null
    if (t.open === 'bid-picker') {
      await sheetPress(page, 'portion-pm')
      r = await sheetPress(page, 'bid-LL')
      let s = await sheetNow(page)
      if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
      if (s.open !== 'nothing') await closeSheets(page)
    } else if (t.open === 'daylist-sheet') await closeSheets(page)
    return { opened: t.open, buttons: t.buttons, text: t.text }
  }, { put: [REC], also: [EL], only: true })
  L.check('2a — each half its own record row (two rows at one person and date)', a1.put.filter(k => REC.test(k)).length === 1 && a2.put.filter(k => REC.test(k)).length === 1 && a1.put.find(k => REC.test(k)) !== a2.put.find(k => REC.test(k)), { first: a1.put, second: a2.put, ret: a2.ret })
  const r = await L.rows(page)
  const here = recsAt(r, Y, DY)
  tableNote.halves = here.map(x => ({ key: x.key, portion: x.portion, code: x.code, ord: x.ord }))
  const t = await tapCell(page, Y, DY)
  await pic(page, 'A-2a-daylist-before-reload')
  const before = t.lines
  await closeSheets(page)
  const rr = await lwReload(page, '2a two halves', 'a', [[Y, DY]])
  const t2 = await tapCell(page, Y, DY)
  await pic(page, 'A-2a-daylist-after-reload')
  await closeSheets(page)
  L.check('2a — the day\'s list: two lines, in the same order after the reload', t.open === 'daylist-sheet' && before.length === 2 && JSON.stringify(before) === JSON.stringify(t2.lines), { open: t.open, before, after: t2.lines, stored: tableNote.halves })
  row({ step: '2a two halves', width: 'desktop', did: 'Anvil 20 Jan: Morning LL, then Afternoon LL; opened the day\'s list', screen: `list after reload: ${JSON.stringify(t2.lines)}`, rows: rowsSummary(a1) + ' || ' + rowsSummary(a2), ok: passNow(k0) })
})
await run('2b delete the first', async () => {
  const k0 = L.results.length
  const r0 = await L.rows(page)
  const here = recsAt(r0, Y, DY)
  const first = here[0], second = here[1]
  const a = await L.step(page, '2b on the day\'s list, Delete the first line', async () => {
    const t = await tapCell(page, Y, DY)
    const ids = t.buttons.filter(b => /^dl-(clear|remove)-/.test(b))
    const firstBtn = ids[0] ? ids[0].split(':')[0] : null
    let p = firstBtn ? await sheetPress(page, firstBtn) : { pressed: false }
    let s = await sheetNow(page)
    if (s.open !== 'nothing' && firstBtn && s.buttons.some(b => b.startsWith(firstBtn) && /sure/i.test(b))) { p = await sheetPress(page, firstBtn); s = await sheetNow(page) }
    const lines = s.lines
    await pic(page, 'A-2b-daylist-after-delete')
    if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, lines0: t.lines, buttons: t.buttons, pressed: firstBtn, lines }
  }, { del: [REC], also: [EL], only: true })
  const r1 = await L.rows(page)
  L.check('2b — the first record\'s row removed, the second\'s row not rewritten (same bytes, same place)', first && second && a.del.includes(first.key) && !a.put.includes(second.key) && r1[second.key] === r0[second.key], { first: first && first.key, second: second && second.key, put: a.put, del: a.del, ret: a.ret })
  const rr = await lwReload(page, '2b delete the first', 'a', [[Y, DY]])
  const t2 = await tapCell(page, Y, DY)
  await pic(page, 'A-2b-after-reload')
  await closeSheets(page)
  row({ step: '2b delete first of two', width: 'desktop', did: 'the day\'s list, Delete on the first line', screen: `cell ${JSON.stringify(rr.after)}; tap opens ${t2.open} ${JSON.stringify(t2.lines || [])}`, rows: rowsSummary(a), ok: passNow(k0) })
})
const Z = 'snap', DZ = '2026-01-22'   // Cinch, Thu 22 Jan: an OIL award, then a bid beside it
await run('2c bid beside an award', async () => {
  const k0 = L.results.length
  const a1 = await L.step(page, '2c an OIL award by hand on Cinch, 22 Jan (+OIL, 1 day)', async () => {
    const t = await tapCell(page, Z, DZ)
    await sheetPress(page, 'bid-oil')
    await page.fill('[data-testid="oil-why"]', 'W3 two-record day')
    const dd = page.locator('[data-testid="oil-days"]'); if (await dd.count()) await dd.fill('1')
    const g = await sheetPress(page, 'oil-give')
    const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, gave: g.pressed, err: await page.locator('[data-testid="oil-err"]').allInnerTexts().catch(() => []) }
  }, { put: [/^leavewar\/ledger:/], also: [EL], only: true })
  const a2 = await L.step(page, '2c an LL bid beside the award', async () => bidOn(page, Z, DZ, 'LL'), { put: [REC], also: [EL], only: true })
  const t = await tapCell(page, Z, DZ)
  await pic(page, 'A-2c-list-before-reload')
  await closeSheets(page)
  const rr = await lwReload(page, '2c bid beside award', 'a', [[Z, DZ]])
  const t2 = await tapCell(page, Z, DZ)
  await pic(page, 'A-2c-list-after-reload')
  await closeSheets(page)
  L.check('2c — the day\'s list: the award and the bid, same order after the reload', t.open === 'daylist-sheet' && t.lines.length >= 2 && JSON.stringify(t.lines) === JSON.stringify(t2.lines), { open: t.open, before: t.lines, after: t2.lines })
  tableNote.awardRows = a1.put
  row({ step: '2c bid beside an award', width: 'desktop', did: 'Cinch 22 Jan: +OIL 1 day, then LL', screen: `list after reload ${JSON.stringify(t2.lines)}`, rows: rowsSummary(a1) + ' || ' + rowsSummary(a2), ok: passNow(k0) })
})
await run('2d delete the award (the first)', async () => {
  const k0 = L.results.length
  const r0 = await L.rows(page)
  const a = await L.step(page, '2d on the day\'s list, Delete the first line (the award)', async () => {
    const t = await tapCell(page, Z, DZ)
    const ids = t.buttons.filter(b => /^dl-(clear|remove)-/.test(b))
    const firstBtn = ids[0] ? ids[0].split(':')[0] : null
    let p = firstBtn ? await sheetPress(page, firstBtn) : { pressed: false }
    let s = await sheetNow(page)
    if (s.open !== 'nothing' && firstBtn && s.buttons.some(b => b.startsWith(firstBtn) && /sure/i.test(b))) { p = await sheetPress(page, firstBtn); s = await sheetNow(page) }
    await pic(page, 'A-2d-after-delete')
    const lines = s.lines
    if (s.open !== 'nothing') await closeSheets(page)
    return { lines0: t.lines, buttons: t.buttons, pressed: firstBtn, lines, after: s.open }
  }, { del: [/^leavewar\/ledger:/], also: [EL], only: true })
  const r1 = await L.rows(page)
  const bidRow = recsAt(r0, Z, DZ).find(x => x.kind === 'request')
  L.check('2d — the bid\'s row untouched (same bytes)', bidRow && r1[bidRow.key] === r0[bidRow.key], { bid: bidRow && bidRow.key, put: a.put, del: a.del, ret: a.ret })
  const rr = await lwReload(page, '2d delete award', 'a', [[Z, DZ]])
  await W.lwOpen(page, DZ); await focusCell(Z, DZ); await pic(page, 'A-2d-after-reload')
  row({ step: '2d delete the first (award)', width: 'desktop', did: 'the day\'s list, Delete on its first line', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

/* ============ 3 OIL: by hand on the grid, and from the tracker ============ */
const P = 'pump', DP = '2026-02-05'   // Piston, Thu 5 Feb
await run('3a +OIL by hand', async () => {
  const k0 = L.results.length
  const a = await L.step(page, '3a +OIL by hand on Piston, 5 Feb (1 day)', async () => {
    const t = await tapCell(page, P, DP)
    await sheetPress(page, 'bid-oil')
    await page.fill('[data-testid="oil-why"]', 'W3 grid award')
    const dd = page.locator('[data-testid="oil-days"]'); if (await dd.count()) await dd.fill('1')
    const g = await sheetPress(page, 'oil-give')
    const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, gave: g.pressed, after: s.open }
  }, { put: [/^leavewar\/ledger:/], also: [EL], only: true })
  L.check('3a — the award is ONE row (plus its history line)', a.put.filter(k => k.startsWith('leavewar/')).length === 1 && !a.del.length, { put: a.put, del: a.del })
  await focusCell(P, DP); await pic(page, 'A-3a-award')
  const rr = await lwReload(page, '3a +OIL by hand', 'a', [[P, DP]])
  await focusCell(P, DP); await pic(page, 'A-3a-after-reload')
  L.check('3a — the award shows on its date after the reload (D402)', /FO|HO/.test(JSON.stringify(rr.after)), rr.after)
  row({ step: '3a +OIL by hand', width: 'desktop', did: 'Piston 5 Feb: +OIL, 1 day, a reason, Give', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})
const M = 'mamba'   // Sidewinder — credited from the tracker, dated today (30 Sep 26)
const TODAY = '2026-09-30'
await run('3b tracker credit', async () => {
  const k0 = L.results.length
  await lwOpen(page, TODAY)
  const a = await L.step(page, '3b the OIL tracker: credit Sidewinder 1 day (today)', async () => {
    await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await L.sleep(1300)
    const nm = page.locator(`[data-testid="oil-name-${M}"]`).first()
    await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(500)
    await page.fill('[data-testid="oil-amt"]', '1')
    const rs = page.locator('[data-testid="oil-reason"]'); if (await rs.count()) await rs.fill('W3 tracker credit')
    await pic(page, 'A-3b-tracker-form')
    await page.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
    const err = await page.locator('[data-testid="oil-credit-err"]').allInnerTexts()
    const bal = await page.locator(`[data-testid="oil-bal-${M}"]`).first().innerText().catch(() => '?')
    await pic(page, 'A-3b-tracker-after-save')
    const x = page.locator('[data-testid="oil-close"]:visible').first(); if (await x.count()) { await x.click(); await L.sleep(500) }
    return { err, bal }
  }, { put: [/^leavewar\/ledger:/], also: [EL], only: true })
  L.check('3b — the credit is ONE ledger row', a.put.filter(k => /^leavewar\/ledger:/.test(k)).length === 1 && !a.del.length, { put: a.put, ret: a.ret })
  await focusCell(M, TODAY); await pic(page, 'A-3b-grid-today')
  const rr = await lwReload(page, '3b tracker credit', 'a', [[M, TODAY]])
  await focusCell(M, TODAY); await pic(page, 'A-3b-after-reload')
  L.check('3b — the tracker\'s award shows on its date on the grid after the reload (D402)', /FO|HO/.test(JSON.stringify(rr.after)), rr.after)
  row({ step: '3b OIL tracker credit', width: 'desktop', did: 'OIL tracker, tapped Sidewinder, 1 day, reason, Save', screen: JSON.stringify(rr.after), rows: rowsSummary(a), ok: passNow(k0) })
})

/* ============ Ranger's approved leave (for 10), then 4 the stage moves ============ */
const R = 'bane', DR = '2026-02-10'   // Ranger, Tue 10 Feb
await run('10-prep Ranger approved leave', async () => {
  const k0 = L.results.length
  const a1 = await L.step(page, '10-prep a bid for Ranger, 10 Feb (by the admin)', async () => bidOn(page, R, DR, 'LL'), { put: [REC], also: [EL], only: true })
  const a2 = await L.step(page, '10-prep Approve it', async () => {
    await tapCell(page, R, DR); await sheetPress(page, 'decide-approve')
    const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
  }, { put: [/^inputs\//], del: [REC], also: [EL], only: true })
  tableNote.rangerIid = a2.put.find(k => k.startsWith('inputs/'))
  row({ step: '10-prep', width: 'desktop', did: 'bid for Ranger 10 Feb, Approve', screen: '(reload in step 4)', rows: rowsSummary(a1) + ' || ' + rowsSummary(a2), ok: passNow(k0), pics: [] })
})
for (const [i, want] of [[0, /CLOSED/i], [1, /PUBLISHED/i]]) {
  await run(`4${'ab'[i]} stage`, async () => {
    const k0 = L.results.length
    await lwOpen(page, DR)
    const s0 = await stageNow(page)
    const a = await L.step(page, `4${'ab'[i]} stage move ${s0} → next`, async () => stageGo(page, 'advance'), { put: [/^leavewar\/war:y2026$/], also: [EL, /^inputs\//, REC, /^leavewar\/current$/], only: true })
    L.check(`4${'ab'[i]} — the stage shows ${want}`, want.test(a.ret && a.ret.now || ''), a.ret)
    const warPut = a.put.filter(k => k.startsWith('leavewar/war:'))
    L.check(`4${'ab'[i]} — the war's own row written, and only it among the wars`, warPut.length === 1 && warPut[0] === 'leavewar/war:y2026', { put: a.put, del: a.del })
    tableNote['stage' + i] = { put: a.put, del: a.del }
    await pic(page, `A-4${'ab'[i]}-stage`)
    const rr = await lwReload(page, `4${'ab'[i]} stage`, 'a', [[R, DR], [X, D1]])
    const s2 = await stageNow(page)
    await pic(page, `A-4${'ab'[i]}-after-reload`)
    L.check(`4${'ab'[i]} — after the reload the stage still ${want}`, want.test(s2), s2)
    row({ step: `4${'ab'[i]} stage move`, width: 'desktop', did: `${s0} → ${a.ret && a.ret.now}`, screen: `stage ${s2}; ${JSON.stringify(rr.after)}`, rows: rowsSummary(a), ok: passNow(k0) })
  })
}

/* ============ 10 at published, the member edits his approved leave's remarks ============ */
await run('10 member remarks', async () => {
  const k0 = L.results.length
  /* a reload brings the sign-in card; Ranger signs in */
  await page.reload(); await L.signIn(page, 'm', { goto: false })
  await lwOpen(page, DR)
  const st = await stageNow(page)
  const a = await L.step(page, '10 Ranger (member) taps his approved leave, edits its note, Save', async () => {
    const t = await tapCell(page, R, DR)
    let opened = t.open, s = t
    if (t.open !== 'remarks-sheet') {
      /* the war may offer the note from its own sheet — look for the door, press it */
      const door = t.buttons && t.buttons.find(b => /note|remark/i.test(b))
      if (door) { await sheetPress(page, door.split(':')[0]); s = await sheetNow(page); opened += ' → ' + s.open }
    }
    const f = page.locator('[data-testid="remarks-field"]:visible')
    if (!(await f.count())) { await pic(page, 'A-10-no-remarks-field'); await closeSheets(page); return { opened, buttons: t.buttons, text: t.text } }
    await f.fill('W3 member note after publish')
    await pic(page, 'A-10-remarks-sheet')
    await page.locator('[data-testid="remarks-save"]:visible').click(); await L.sleep(600)
    const s2 = await sheetNow(page); if (s2.open !== 'nothing') await closeSheets(page)
    return { opened, buttons: t.buttons }
  }, { put: [/^inputs\//], also: [EL], only: true })
  const r = await L.rows(page)
  const inp = tableNote.rangerIid && r[tableNote.rangerIid] ? JSON.parse(r[tableNote.rangerIid]) : null
  L.check('10 — the note is on the request row (inputs), and the war\'s rows were not written', inp && /W3 member note/.test(inp.remarks || '') && !a.put.some(k => k.startsWith('leavewar/')), { stage: st, put: a.put, remarks: inp && inp.remarks, ret: a.ret })
  const rr = await lwReload(page, '10 member remarks', 'm', [[R, DR]])
  const t2 = await tapCell(page, R, DR)
  await pic(page, 'A-10-after-reload')
  await closeSheets(page)
  row({ step: '10 member remarks (published)', width: 'desktop', did: `Ranger signed in; stage ${st}; tapped his leave 10 Feb, typed a note, Save`, screen: `${JSON.stringify(rr.after)}; tap opens ${t2.open} ${(t2.text || '').slice(0, 120)}`, rows: rowsSummary(a), ok: passNow(k0) })
})

L.check('part A — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, notes: tableNote, errors })
await browser.close()
