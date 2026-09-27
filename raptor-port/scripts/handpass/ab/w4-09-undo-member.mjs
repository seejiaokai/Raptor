/* W4 — the figures through UNDO, REDO and a RELOAD, and the MEMBER's own multi-record day (26 Sep 26).
   (a) admin, desktop: a three-day LL fill by drag on the war → the war's Undo → Redo → a reload; after each, every
       figure reader for the man must agree and move at once (the fill's −3, back to 0, −3 again, still −3).
   (b) member (us = Ranger, person bane), at the given width: he files his own four records on Wed 22 Jul on the Inputs
       page (LL 08:00–10:00, OL 10:30–11:30, a course, ATT C 13:00–17:00) and reads his own day: one code, a grey +3,
       the list of four in ladder order with no clash sentence; his own figures agree (the LL pays the morning).
       Then a reload: nothing lost or doubled.
   Usage: node scripts/handpass/ab/w4-09-undo-member.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const { openW4, fileInput, lwOpen, tapDay, closeSheets, sheetPress, sheetNow, shot, resultBook, ROOT, readAll, top, cellOf, rowRun, login } = L
const PHONE = W === 'phone'
const R = resultBook(`W4-undo-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w4-undo-${W}.txt`)
let page
const P = n => `w4-undo-${W}-${n}`
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}) } }
async function reload(pg, who) {
  await pg.reload(); await pg.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  const card = await pg.waitForSelector('#luser, #vWeek .day', { timeout: 15000 }).then(e => e.evaluate(x => x.id === 'luser')).catch(() => true)
  if (card) await login(pg, who); else await pg.waitForTimeout(600)
  return card ? 'signed in again' : 'still signed in'
}
const warBtn = async (pg, t) => { const b = pg.locator(`[data-testid="${t}"]:visible`).first(); const off = await b.isDisabled(); if (!off) { await b.click(); await pg.waitForTimeout(700) } return !off }

/* (a) admin: fill → undo → redo → reload */
if (!PHONE) {
  const o = await openW4({ phone: false, who: 'a' })
  page = o.page
  await step('undo-redo-reload', async () => {
    const id = 'freak', D = ['2026-09-07', '2026-09-08', '2026-09-09']   // Echo (a WSO), Mon–Wed
    await lwOpen(page, D[0])
    const r0 = await readAll(page, id, D[1], { bd: ['lve'] })
    await lwOpen(page, D[0])
    await page.locator(`[data-testid="cell-${id}-${D[1]}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await page.waitForTimeout(400)
    const a = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, `[data-testid="cell-${id}-${D[0]}"]`)
    const b = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, `[data-testid="cell-${id}-${D[2]}"]`)
    await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(600)
    const s = await sheetNow(page)
    await sheetPress(page, 'sel-LL'); await closeSheets(page)
    const r1 = await readAll(page, id, D[1], { bd: ['lve'] })
    const cells1 = await rowRun(page, id, D)
    R.note('fill-sheet', { open: s.open, text: (s.text || '').slice(0, 80), a, b })
    R.ck('fill', s.open === 'select-sheet' && cells1.every(c => /LL/.test(c)) && top(r1.sheet.lve) === top(r0.sheet.lve) - 3 && r1.agree, 'a mouse drag fills three LL bids; LVE −3 at once, every reader agreeing', { cells1, lve: [r0.sheet.lve, r1.sheet.lve], disagree: r1.disagree })
    await lwOpen(page, D[0])
    const u = await warBtn(page, 'lw-undo')
    const r2 = await readAll(page, id, D[1], { bd: ['lve'] })
    const cells2 = await rowRun(page, id, D)
    await shot(page, P('after-undo'))
    R.ck('undo', u && cells2.every(c => !/LL/.test(c)) && top(r2.sheet.lve) === top(r0.sheet.lve) && r2.agree, "the war's Undo takes the three bids back and the figures return at once", { cells2, lve: r2.sheet.lve, disagree: r2.disagree })
    await lwOpen(page, D[0])
    const rd = await warBtn(page, 'lw-redo')
    const r3 = await readAll(page, id, D[1], { bd: ['lve'] })
    const cells3 = await rowRun(page, id, D)
    R.ck('redo', rd && cells3.every(c => /LL/.test(c)) && top(r3.sheet.lve) === top(r1.sheet.lve) && r3.agree, 'Redo brings them back, figures with them', { cells3, lve: r3.sheet.lve, disagree: r3.disagree })
    const how = await reload(page, 'a')
    await lwOpen(page, D[0])
    const r4 = await readAll(page, id, D[1], { bd: ['lve'] })
    const cells4 = await rowRun(page, id, D)
    const btns = await page.evaluate(() => ['lw-undo', 'lw-redo'].map(t => { const b = document.querySelector(`[data-testid="${t}"]`); return `${t}:${b ? (b.disabled ? 'off' : 'on') : 'absent'}` }))
    await shot(page, P('after-reload'))
    R.ck('reload', cells4.every(c => /LL/.test(c)) && top(r4.sheet.lve) === top(r1.sheet.lve) && r4.agree, 'after a reload the three bids and the −3 are still there, nothing doubled, readers agreeing', { how, cells4, lve: r4.sheet.lve, btns, disagree: r4.disagree })
  })
  R.note('admin-errors', o.errors.slice(0, 10))
  await o.browser.close()
}

/* (b) the member's own four records */
{
  const o = await openW4({ phone: PHONE, who: 'm' })
  page = o.page
  await step('member-four', async () => {
    const me = 'bane', d = '2026-07-22'
    await lwOpen(page, d)
    const r0 = await readAll(page, me, d, { bd: ['lve', 'medtot'] })
    const got = []
    for (const x of [
      { type: 'LL', span: 'custom', start: '08:00', end: '10:00', remarks: 'W4 member LL 2h' },
      { type: 'OL', span: 'custom', start: '10:30', end: '11:30', remarks: 'W4 member OL 1h' },
      { type: 'CSE', remarks: 'W4 member course' },
      { type: 'ATT C', span: 'custom', start: '13:00', end: '17:00', remarks: 'W4 member medical 4h' },
    ]) got.push(await fileInput(page, { from: d, ...x }))
    await lwOpen(page, d)
    const r1 = await readAll(page, me, d, { bd: ['lve', 'medtot'] })
    const t = await tapDay(page, PHONE, me, d)
    await shot(page, P('member-list'))
    await closeSheets(page)
    R.ck('member-filed', got.every(g => g.added === 1), 'the member files all four for himself on the Inputs page', got.map(g => [g.added, g.toast, g.asked]))
    R.ck('member-box', /LL/.test(r1.cell.box) && r1.cell.mark === '+3' && !r1.cell.amber, 'his box: the LL morning, a grey +3', r1.cell)
    R.ck('member-list', t.open === 'daylist-sheet' && (t.lines || []).length === 4 && /LL/.test(t.lines[0]) && /OL/.test(t.lines[1]) && /ATT C/.test(t.lines[2]) && /CSE/.test(t.lines[3]) && !/cover the same time|can’t both stand/.test(t.text || ''), 'his list: four lines in ladder order, no clash sentence', { open: t.open, lines: (t.lines || []).map(x => x.slice(0, 70)) })
    R.ck('member-figures', top(r1.sheet.lve) === top(r0.sheet.lve) - 0.5 && top(r1.sheet.medtot) === top(r0.sheet.medtot) + 0.5 && r1.agree, 'his own figures: LVE −0.5 (the LL pays the morning), MED TOT +0.5, every reader agreeing', { lve: [r0.sheet.lve, r1.sheet.lve], medtot: [r0.sheet.medtot, r1.sheet.medtot], bd: r1.breakdown, disagree: r1.disagree })
    const how = await reload(page, 'm')
    await lwOpen(page, d)
    const r2 = await readAll(page, me, d, { bd: ['lve'] })
    R.ck('member-reload', r2.cell.mark === '+3' && r2.sheet.lve === r1.sheet.lve && r2.agree, 'after a reload: the same box and the same figures (nothing lost or doubled)', { how, cell: r2.cell, lve: r2.sheet.lve })
  })
  R.note('member-errors', o.errors.slice(0, 10))
  await o.browser.close()
}
R.save()
