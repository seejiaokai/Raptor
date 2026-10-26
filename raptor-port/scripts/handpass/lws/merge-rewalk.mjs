// The Leave War small fixes (pull request 556), re-walked after main was merged in (26 Oct 26, his D1402) — the doors as
// the overhaul (M1–M3) draws them now. Assertions of the right behaviour: a PASS means correct. VERSION 2
//   (M1 is carried by settingssheet.test.tsx — the demo roster is in its default order, so Reset order is greyed; see the sheet)
//   M1 ⚙ → "↺ Reset order" armed ("Really reset?"), then another page and back → taken back ([LW-SETTINGS-SMALL])
//   M2 a day's bid window → ⋯ → Post out → Delete → "Tap again to delete …", then another page and back → taken back
//   M3 the Legend never shows the stored half-day codes "*LL" / "LL*" (the blind read's L3, kept at the merge)
//   M4 a Delete posting's date moved to today asks twice before it is saved (D1102 — [PO-MOVE-DATE-DELETE-ASK])
// Run: node merge-rewalk.mjs desktop|phone   (HP_URL = the served build)
import { openWorld, tools } from './w2lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`lws/merge-rewalk.mjs VERSION 2 — ${WHICH}`)
const all = []
const rec = (id, ok, seen, pic = '') => { all.push({ id, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}-${WHICH}  ${seen}${pic ? '  [' + pic + ']' : ''}`) }
const text = (page, sel) => page.locator(sel).first().textContent().then(t => (t || '').trim()).catch(() => '')
async function scenario(id, fn) {
  const w = await openWorld(WHICH)
  const t = tools(w, 'mr-' + id.toLowerCase())
  try { await fn(w, t) } catch (e) { rec(id, false, 'threw: ' + String(e.message).split('\n')[0]) }
  if (w.errors.length) rec(id + '-errors', false, w.errors.slice(0, 3).join(' | '))
  await w.browser.close()
}
/* a man's empty future day on the grid: Hex (rocky) in December */
const HEX = 'rocky', DAY = '2026-12-14', MONTH = 'DEC'

if (process.env.WALK_M1) await scenario('M1', async ({ page }, t) => {
  await t.lw()
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400)
  const btn = '[data-testid="roster-reset-order"]'
  if (!(await page.locator(btn).count())) { rec('M1', false, 'no Reset order line in ⚙'); return }
  const before = await text(page, btn)
  const disabled = await page.locator(btn).first().isDisabled()
  if (disabled) { rec('M1', false, `Reset order is greyed ("${before}") — the demo roster is in its default order, nothing to arm`); return }
  await t.press(btn)
  const armed = await text(page, btn)
  const p1 = await t.shot('armed')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  const open = await page.locator(btn).count()
  const after = open ? await text(page, btn) : '(⚙ closed)'
  const p2 = await t.shot('back')
  rec('M1', /Really reset\?/.test(armed) && !/Really reset\?/.test(after), `"${before}" → armed "${armed}" → another page and back: "${after}"`, p1 + ', ' + p2)
})

await scenario('M2', async ({ page }, t) => {
  await t.lw(MONTH)
  const cell = `[data-testid="cell-${HEX}-${DAY}"]`
  if (!(await page.locator(cell).count())) { rec('M2', false, `no cell ${HEX} ${DAY}`); return }
  await page.locator(cell).first().scrollIntoViewIfNeeded(); await t.press(cell); await page.waitForTimeout(500)
  await t.press('[data-testid="bid-more"]'); await page.waitForTimeout(300)
  await t.press('[data-testid="bid-postout"]'); await page.waitForTimeout(400)
  await t.press('[data-testid="po-delete"]')
  await t.press('[data-testid="po-confirm"]')
  const armed = await text(page, '[data-testid="po-confirm"]')
  const p1 = await t.shot('armed')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  const after = (await page.locator('[data-testid="po-confirm"]').count()) ? await text(page, '[data-testid="po-confirm"]') : '(the window closed)'
  const gone = await page.evaluate(id => !!window.PEOPLE?.[id]?.deleted, HEX)
  const p2 = await t.shot('back')
  rec('M2', /^Tap again to delete/.test(armed) && !/^Tap again/.test(after) && !gone, `armed "${armed}" → another page and back: "${after}"; deleted ${gone}`, p1 + ', ' + p2)
})

await scenario('M3', async ({ page }, t) => {
  await t.lw()
  await t.press('[data-testid="legend-open"]'); await page.waitForTimeout(500)
  const leg = await page.locator('[data-testid="legend"]').first().innerText().catch(() => '')
  const p = await t.shot('legend')
  rec('M3', leg.length > 50 && !/\*LL|LL\*/.test(leg), `the Legend opened (${leg.length} letters), "*LL" / "LL*" ${/\*LL|LL\*/.test(leg) ? 'SHOWN' : 'nowhere'}; half-day lines: ${JSON.stringify((leg.match(/The size[^]*?Afternoon \(PM\)/) || [''])[0].replace(/\s+/g, ' ').slice(0, 120))}`, p)
})

await scenario('M4', async ({ page }, t) => {
  await t.lw(MONTH)
  /* SETUP by the real controls: Hex posted out on a December day, the outcome Delete — a date still to come, so nothing runs */
  const cell = `[data-testid="cell-${HEX}-${DAY}"]`
  await page.locator(cell).first().scrollIntoViewIfNeeded(); await t.press(cell); await page.waitForTimeout(500)
  await t.press('[data-testid="bid-more"]'); await t.press('[data-testid="bid-postout"]'); await page.waitForTimeout(400)
  await t.press('[data-testid="po-delete"]'); await t.press('[data-testid="po-confirm"]'); await t.press('[data-testid="po-confirm"]')
  await page.waitForTimeout(800)
  const posted = await page.evaluate(id => window.PEOPLE?.[id], HEX)
  if (posted?.deleted) { rec('M4', false, 'the setup deleted him (the December date ran?)'); return }
  /* the posting door: a tap on his struck day after the posting */
  const struck = `[data-testid="cell-${HEX}-2026-12-16"]`
  await page.locator(struck).first().scrollIntoViewIfNeeded(); await t.press(struck); await page.waitForTimeout(600)
  if (!(await page.locator('[data-testid="postout-sheet"]').count())) { const p = await t.shot('no-sheet'); rec('M4', false, 'the posting window did not open from his struck day', p); return }
  /* the war's today is the real date (DateCal's Today, daysfmt isoToday) */
  const today = new Date().toLocaleDateString('en-CA')
  /* move the date to the war's today through the date box's own calendar */
  await t.press('[data-testid="postout-date"]'); await page.waitForTimeout(400)
  if (await page.locator('[data-testid="dcal-today"]').count()) await t.press('[data-testid="dcal-today"]')
  for (let i = 0; i < 12 && !(await page.locator(`[data-testid="dcal-day-${today}"]`).count()); i++) await t.press('[data-testid="dcal-prev"]')
  if (!today || !(await page.locator(`[data-testid="dcal-day-${today}"]`).count())) { const p = await t.shot('no-today'); rec('M4', false, `could not reach today (${today}) in the calendar`, p); return }
  await t.press(`[data-testid="dcal-day-${today}"]`); await page.waitForTimeout(500)
  const ask = (await page.locator('[data-testid="postout-delete-go"]').count()) ? await text(page, '[data-testid="postout-delete-go"]') : ''
  const still = await page.evaluate(id => !!window.PEOPLE?.[id]?.deleted, HEX)
  const p1 = await t.shot('asked')
  if (ask) { await t.press('[data-testid="postout-delete-go"]'); await page.waitForTimeout(800) }
  const after = await page.evaluate(id => !!window.PEOPLE?.[id]?.deleted, HEX)
  const p2 = await t.shot('after-second-tap')
  rec('M4', /^Tap again to delete/.test(ask) && !still && after, `today ${today}: first pick asked "${ask}", deleted after it ${still}; after the second tap deleted ${after}`, p1 + ', ' + p2)
})

const fail = all.filter(r => !r.ok).length
console.log(`lws/merge-rewalk ${WHICH}: ${all.length - fail} PASS, ${fail} FAIL`)
process.exit(fail ? 1 : 0)
