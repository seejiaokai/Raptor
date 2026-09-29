/* D9 — [AMEND-SMALL-SEEN] 9: "Sort" on a ground programme whose rows are STORED out of time order (they are always
   SHOWN in time order) changes nothing he can see — so the four sign-offs must hold (D103: only a change that shows
   takes them down). Walked on a never-published day (Fri) and a published one with a change waiting (Tue).
   Usage: node sf-d9-sort.mjs [outdir-suffix] */
const OUT = 'd9-sort' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, editWeek, board, tap, type, signDay, head, screen, check, note, summary, SF_STATE, DESK } = L

for (const [di, label] of [[4, 'Fri (never published)'], [1, 'Tue (published, a change waiting)']]) {
  const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
  await editWeek(page); await board(page, di)
  /* two ground rows added in the WRONG time order: the later one first, then the earlier — stored 10:00, 08:00, shown
     08:00, 10:00 */
  const n0 = await page.evaluate(i => (window.DAYS[i].ground || []).length, di)
  await tap(page, `[data-gradd="${di}"]`); await type(page, `[data-bfld="gr:${di}.${n0}.prog"]`, 'SF LATE ROW'); await type(page, `[data-bfld="gr:${di}.${n0}.str"]`, '1000')
  await tap(page, `[data-gradd="${di}"]`); await type(page, `[data-bfld="gr:${di}.${n0 + 1}.prog"]`, 'SF EARLY ROW'); await type(page, `[data-bfld="gr:${di}.${n0 + 1}.str"]`, '0800')
  const stored = await page.evaluate(i => (window.DAYS[i].ground || []).map(r => r.str + ' ' + r.prog).join(' | '), di)
  note(`${label} stored order after the two adds`, stored)
  const signs = await signDay(page, di)
  const before = await head(page, di)
  note(`${label} signed`, JSON.stringify({ signs, state: before.signState, pending: before.pending }))
  const shownBefore = await page.evaluate(i => [...document.querySelectorAll('#schedBoard .sb-panel.grnd [data-bfld$=".prog"]')].map(e => e.value || e.textContent).join(' | '), di)
  await screen(page, `d9-${di}-a-signed-before-sort`)
  await tap(page, `[data-sortsec="g.${di}"]`)
  await page.waitForTimeout(500)
  const after = await head(page, di)
  const shownAfter = await page.evaluate(i => [...document.querySelectorAll('#schedBoard .sb-panel.grnd [data-bfld$=".prog"]')].map(e => e.value || e.textContent).join(' | '), di)
  const storedAfter = await page.evaluate(i => (window.DAYS[i].ground || []).map(r => r.str + ' ' + r.prog).join(' | '), di)
  await screen(page, `d9-${di}-b-after-sort`)
  note(`${label} after Sort`, JSON.stringify({ stored: storedAfter, state: after.signState, signs: after.signs, pending: after.pending }))
  check(`${label}: Sort changed nothing that is shown`, shownBefore === shownAfter, `${shownBefore} → ${shownAfter}`)
  check(`${label}: the four sign-offs HOLD after Sort (nothing shown changed — D103)`, JSON.stringify(after.signs) === JSON.stringify(before.signs) && !after.signs.some(s => /name/.test(s)), `before ${before.signs} · after ${after.signs}`)
  check(`${label}: the pending count did not move`, after.pending === before.pending, `${before.pending} → ${after.pending}`)
  check(`${label}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('sf-d9-sort') ? 1 : 0
