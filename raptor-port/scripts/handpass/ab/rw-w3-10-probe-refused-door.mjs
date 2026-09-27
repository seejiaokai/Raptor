/* RW-W3-10 — a PROBE the re-walk added (26 Sep 26): FR1 closed the Undo / Redo road to "a refused bid made live again
   over a medical filed since". Is the DIRECT road closed too? A refused bid stays on the day when a medical is filed
   (it is history, not a live bid); the day's tap list still offers that line its answers. Press them:
     Ack      → would make the refused bid a LIVE (acknowledged) bid on the medical day
     Approve  → would write leave over the medical
     Back / Move … whatever the line offers — recorded
   The rule (register §12, B7 — the same rules at every door): a bid is never made live over a medical; leave never goes
   over a medical. Written as the right behaviour. Usage: node scripts/handpass/ab/rw-w3-10-probe-refused-door.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, lwCell } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-10-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-10-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `rw-w3-10-${W}-${n}`)
const rec = async (p, d) => (await recsOf(page, p, [d]))[d]
const inp = async (p, re) => (await inputsOf(page, p)).filter(x => re.test(x.date)).map(x => `${x.type} ${x.date} lw=${x.lw ? 'y' : 'n'}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
/* one man per answer, so each press meets the same fresh state */
const CASES = [['ack', 'mamba', '2026-12-02'], ['approve', 'shrek', '2026-12-03'], ['clear', 'bruise', '2026-12-04']]
for (const [ans, P, D] of CASES) {
  await step(ans, async () => {
    await lwOpen(page, '2026-12-01')
    const b = await bidOn(page, P, D, 'LL')
    await tapCell(page, P, D); await sheetPress(page, 'decide-refuse'); await closeSheets(page)
    const f = await fileInput(page, { person: P, type: 'ATT C', from: D, remarks: `RW probe ${ans}` })
    await lwOpen(page, '2026-12-01')
    const r0 = await rec(P, D), c0 = await lwCell(page, P, D)
    const s = await tapCell(page, P, D)
    await pic(`${ans}-a-taplist`)
    await toasts(page)
    /* the refused LL line's own button for this answer */
    const btn = page.locator(`.bidsheet[role="dialog"]:visible [data-testid^="dl-"][data-testid*="${ans === 'ack' ? 'ack' : ans === 'approve' ? 'approve' : 'clear'}"]`).first()
    const tid = (await btn.count()) ? await btn.getAttribute('data-testid') : null
    let pressed = false
    if (tid && !(await btn.isDisabled())) { await btn.click(); await page.waitForTimeout(700); pressed = true }
    const after = await sheetNow(page)
    await pic(`${ans}-b-after-press`)
    await closeSheets(page)
    const t = await toasts(page)
    const r1 = await rec(P, D), i1 = await inp(P, /Dec [2-4]$/), c1 = await lwCell(page, P, D)
    R.note(ans, { placed: b.placed, filed: f.added, before: r0, cellBefore: c0, opened: s.open, lines: s.lines, buttons: s.buttons, pressedTestid: tid, pressed, sheetAfter: { open: after.open, text: (after.text || '').slice(0, 300) }, toasts: t, after: r1, inputs: i1, cellAfter: c1 })
    if (ans === 'clear') R.ck('probe-clear', true, 'Clear on the refused line (recorded — removing history is allowed)', { pressed, after: r1 })
    else R.ck(`probe-${ans}`, !pressed || (/refused/.test(r1) && !i1.some(x => /^LL/.test(x))), `${ans === 'ack' ? 'Ack' : 'Approve'} on a refused bid over a medical filed since does not make it live — it is refused (said), or not offered; the bid stays refused and no leave is written over the ATT C`, { offered: !!tid, pressed, after: r1, inputs: i1, toasts: t, sheetText: (after.text || '').slice(0, 200) })
  })
}
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
