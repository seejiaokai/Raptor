// Walker 2 — scenario 32 (a leave on a PUBLISHED day) and scenario 27 (a save that cannot be made — what a published day does). desktop.
// Tue 14 Jul 26 is published on Edit Schedule (the four sign-offs, then Publish day); Ranger's approved LL on 14 Jul is placed by the admin;
// 32: the member types words (no Enter), adds a document, closes — how many changes the day's list shows after; 27: the admin's drag window over that day with typed words.
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOf, inputsOn, dragCells, typeInto } = H
const which = 'desk'
const tag = 's32pub-dk'
console.log('lw-night-w2-s32pub v1', tag)
H.clearPics(tag)
H.KEEP.toasts = true
const ME = 'bane'
const D = '2026-07-14'
const fmtS = a => JSON.stringify(a)
const w = await L.newCtx('desk')
const P = w.page
await H.signInAs(w, 'admin')
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const sc = async (id, fn) => { console.log(`-- ${id}`); try { await fn() } catch (e) { rec(id, which, 'NOT DONE', String(e).slice(0, 500), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }
async function chg(label, day = 'Tue') {
  await P.evaluate(() => window.go('editsched')); await sleep(w, 1300)
  if (!(await P.locator('.chgwin:not([hidden])').count())) { await P.locator('#histBtn:visible').first().click(); await sleep(w, 800) }
  await P.locator('.chgwin .win-tab', { hasText: 'All changes' }).first().click().catch(() => {}); await sleep(w, 400)
  await P.locator('.chgwin .cw-day', { hasText: new RegExp('^' + day + '$') }).first().click().catch(() => {}); await sleep(w, 500)
  const r = await P.evaluate(() => { const c = document.querySelector('.chgwin:not([hidden])'); if (!c) return null; const t = e => e.textContent.replace(/\s+/g, ' ').trim(); return { tabs: [...c.querySelectorAll('.win-tab')].map(t), lines: [...c.querySelectorAll('.cw-l')].map(t), groups: [...c.querySelectorAll('.cw-g')].length, head: t(c.querySelector('.win-ttl') || c).slice(0, 100) } })
  await snap(`chg-${label}`)
  return r
}
const closeChg = async () => { if (await P.locator('.chgwin:not([hidden]) .win-x').count()) { await P.locator('.chgwin .win-x').first().click().catch(() => {}); await sleep(w, 300) } }
const lwSaved = async () => (await inputsOn(P, ME, D)).filter(i => /^(LL|OL)$/.test(i.type)).map(i => ({ remarks: i.remarks, docs: i.docs.length, lw: !!i.lw }))

let base = null
await sc('32p-setup', async () => {
  await P.evaluate(() => window.go('editsched')); await sleep(w, 1500)
  const DI = 1, day = `#eWeek .day[data-day="${DI}"]`
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = P.locator(`${day} select[data-sign="${role}"][data-signday="${DI}"]`).first()
    await sel.scrollIntoViewIfNeeded()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(w, 200)
  }
  const pub = P.locator(`${day} [data-beak="${DI}"]`).first()
  await pub.evaluate(e => e.scrollIntoView({ block: 'center' })); await pub.click(); await sleep(w, 1500)
  const ver = await P.evaluate(d => (document.querySelector(d)?.querySelector('.verchip')?.innerText || '').trim(), day)
  if (!/ORIG/.test(ver)) throw new Error('Tue 14 Jul is not published: ' + ver)
  const c0 = await chg('0-after-publish'); await closeChg()
  console.log('after publish:', fmtS(c0))
  await H.toWar(w, 'admin')
  await place(w, ME, D, 'LL', { approve: true })
  const saved = await lwSaved(); console.log('Ranger 14 Jul:', fmtS(saved))
  if (saved.length !== 1) throw new Error('Ranger 14 Jul not approved: ' + fmtS(saved))
  base = await chg('1-after-leave'); await closeChg()
  rec('32p-setup', which, 'RECORD', `Tue 14 Jul published (version ${ver}); the Changes window (All changes, Tue): after the publish ${fmtS(c0.tabs)} lines ${c0.lines.length}; after the admin placed Ranger's approved LL on that day ${fmtS(base.tabs)} lines ${base.lines.length}: ${fmtS(base.lines)}`, [`${tag}-chg-0-after-publish`, `${tag}-chg-1-after-leave`])
})
if (!base) { rec('32p', which, 'NOT DONE', 'the published-day fixture was not built', []); H.saveResults(tag); await w.ctx.close(); await H.finish(); process.exit(0) }

await sc('27p', async () => {
  // the admin's drag window over the published day: words typed over Ranger's approved leave, closed with ✕
  await H.toWar(w, 'admin'); await L.gotoMonth(w, 'JUL')
  if (!(await dragCells(w, [ME, '2026-07-13'], [ME, '2026-07-15']))) throw new Error('no drag window over 13–15 Jul')
  await typeInto(w, T('sel-remarks'), 'Drag on published')
  await snap('27p-typed')
  const note0 = await L.txt(P, T('sel-note'))
  await L.press(w, T('sel-cancel')); await sleep(w, 800)
  const saved = await lwSaved()
  const toast = await L.txt(P, '#toastEl')
  const rows = await H.inputsPageRows(w, 'Ranger', `${tag}-27p-inputs`)
  const after = await chg('2-after-drag'); await closeChg()
  rec('27p', which, 'RECORD', `an approved leave on a PUBLISHED day (Tue 14 Jul) inside a drag 13–15 Jul: typed "Drag on published", closed with ✕ (no Approve is offered over an approved leave alone): Ranger's entry now ${fmtS(saved)}; a note in the window: ${note0 ?? 'none'}; toast: ${toast ?? 'none'}; the Inputs page row: ${fmtS(rows.filter(r => /14 Jul/.test(r)).map(r => r.slice(0, 140)))}; the day's changes list before ${base.lines.length} line(s), after ${after.lines.length}: ${fmtS(after.lines)}; All changes tab: ${fmtS(after.tabs)}`, [`${tag}-27p-typed`, `${tag}-27p-inputs`, `${tag}-chg-2-after-drag`])
})

await sc('32p', async () => {
  await H.signOut(P); await H.signInAs(w, 'member')
  await L.gotoMonth(w, 'JUL'); await L.reachCell(w, ME, D)
  await L.openCellR(w, ME, D); if ((await H.sheetOf(P)) !== 'remarks-sheet') throw new Error('14 Jul opened ' + await H.sheetOf(P))
  await L.press(w, T('remarks-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Member on published'); await sleep(w, 200)   // no Enter
  await P.locator('[data-testid="remarks-doc-row"] input[type=file]').first().setInputFiles(L.pdfPath('w2-pub.pdf')); await sleep(w, 900)   // saved at once
  const mid = await lwSaved(); await snap('32p-typed-and-doc')
  await closeSheet(w); await sleep(w, 600)   // the typed words are saved as the window closes
  const end = await lwSaved()
  await H.signOut(P); await H.signInAs(w, 'admin')
  const c2 = await chg('3-after-member')
  rec('32p', which, 'RECORD', `Ranger, on his approved leave on the published Tue 14 Jul: typed "Member on published" (no Enter), added a document (saved at once: ${fmtS(mid)}), closed the window (${fmtS(end)}). The day's changes list (All changes, Tue) before his saves: ${base.lines.length} line(s) ${fmtS(base.lines)}; after: ${c2.lines.length} line(s) ${fmtS(c2.lines)}; tabs ${fmtS(c2.tabs)} — so ${c2.lines.length - base.lines.length} new line(s) for his two saves (one for the document, one for the words)`, [`${tag}-32p-typed-and-doc`, `${tag}-chg-3-after-member`])
  await closeChg()
})
rec('32pub-errors', which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
