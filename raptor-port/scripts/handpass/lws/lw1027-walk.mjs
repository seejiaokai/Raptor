// The night of 26–27 Oct 26, job 1 — the Leave War small fixes. Assertions of the right behaviour: a PASS means correct.
//   J1 a day's bid window → ⋯ → Post out → Delete: the line reads his D1105 words ("… the app deletes him automatically,
//      with his account. …" — Hex has a sign-in)
//   J2 that Delete saved on a December day (two taps): Admin → Users shows "posting out 14 Dec · auto delete" on his row
//   J3 the OIL tracker: a grant's Delete armed ("Really delete?"), another page and back → "Delete" again, nothing gone
//      ([LW-ARMS-PAGE-LEAVE-REST] — the same take-back as the posting doors', walked 26 Oct 26)
// Run: node lw1027-walk.mjs desktop|phone   (HP_URL = the served build). VERSION 4
import { openWorld, tools } from './w2lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`lws/lw1027-walk.mjs VERSION 4 — ${WHICH}`)
const all = []
const rec = (id, ok, seen, pic = '') => { all.push({ id, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}-${WHICH}  ${seen}${pic ? '  [' + pic + ']' : ''}`) }
const text = (page, sel) => page.locator(sel).first().textContent().then(t => (t || '').trim()).catch(() => '')
async function scenario(id, fn) {
  const w = await openWorld(WHICH)
  const t = tools(w, 'n27-' + id.toLowerCase())
  try { await fn(w, t) } catch (e) { rec(id, false, 'threw: ' + String(e.message).split('\n')[0]) }
  if (w.errors.length) rec(id + '-errors', false, w.errors.slice(0, 3).join(' | '))
  await w.browser.close()
}
const HEX = 'rocky', DAY = '2026-12-14', MONTH = 'DEC'
const openPo = async ({ page }, t) => {
  await t.lw(MONTH)
  const cell = `[data-testid="cell-${HEX}-${DAY}"]`
  await page.locator(cell).first().scrollIntoViewIfNeeded(); await t.press(cell); await page.waitForTimeout(500)
  await t.press('[data-testid="bid-more"]'); await t.press('[data-testid="bid-postout"]'); await page.waitForTimeout(400)
  await t.press('[data-testid="po-delete"]'); await page.waitForTimeout(200)
}

await scenario('J1', async (w, t) => {
  await openPo(w, t)
  const line = await text(w.page, '[data-testid="po-line"]')
  const p = await t.shot('delete-line')
  rec('J1', line === 'On 14 Dec the app deletes him automatically, with his account. Days he flew keep his puck.', `the line: "${line}"`, p)
})

await scenario('J2', async (w, t) => {
  const { page } = w
  await openPo(w, t)
  await t.press('[data-testid="po-confirm"]'); await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(800)
  const deleted = await page.evaluate(id => !!window.PEOPLE?.[id]?.deleted, HEX)
  await t.adminUsers(); await page.waitForTimeout(600)
  const row = await page.evaluate(() => {
    const els = [...document.querySelectorAll('#page-admin *')].filter(e => e.children.length === 0 && /posting out/.test(e.textContent || ''))
    return els.map(e => (e.textContent || '').trim()).join(' | ')
  })
  const p = await t.shot('users-row')
  rec('J2', !deleted && /posting out 14 Dec · auto delete/.test(row), `deleted now ${deleted}; Admin → Users: "${row}"`, p)
})

await scenario('J3', async (w, t) => {
  const { page } = w
  await t.lw()
  await t.press('[data-testid="oil-tracker"]'); await page.waitForTimeout(900)
  /* a hand grant (a ledger entry, id l…) — a credit the app worked out itself has no Delete */
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.getAttribute('data-testid').slice(10)))
  console.log('  entries', JSON.stringify(ids.slice(0, 12)))
  const lid = ids.find(i => /^l/.test(i))
  const entry = page.locator(lid ? `[data-testid="oil-entry-${lid}"]` : '[data-testid="none"]').first()
  if (!(await entry.count())) { const p = await t.shot('no-grant'); rec('J3', false, 'no grant box in the OIL tracker', p); return }
  const id = (await entry.getAttribute('data-testid')).slice('oil-entry-'.length)
  await entry.scrollIntoViewIfNeeded(); await t.press(`[data-testid="oil-entry-${id}"]`); await page.waitForTimeout(400)
  await t.press(`[data-testid="oil-del-${id}"]`)
  const armed = await text(page, `[data-testid="oil-del-${id}"]`)
  const p1 = await t.shot('armed')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  let after = (await page.locator(`[data-testid="oil-del-${id}"]`).count()) ? await text(page, `[data-testid="oil-del-${id}"]`) : '(the editor closed)'
  /* a phone comes back on the Grid tab: go to the OIL tab again by its own button, then open the same grant */
  if (!(await page.locator(`[data-testid="oil-entry-${id}"]`).count())) {
    await t.press('[data-testid="oil-tracker"]'); await page.waitForTimeout(900)
    if (await page.locator(`[data-testid="oil-entry-${id}"]`).count()) { await t.press(`[data-testid="oil-entry-${id}"]`); await page.waitForTimeout(400); after += ' → reopened: "' + await text(page, `[data-testid="oil-del-${id}"]`) + '"' }
  }
  const still = await page.evaluate(i => !!document.querySelector(`[data-testid="oil-entry-${i}"]`), id)
  const p2 = await t.shot('back')
  rec('J3', armed === 'Really delete?' && after !== 'Really delete?' && still, `grant ${id}: armed "${armed}" → another page and back: "${after}"; the grant still there ${still}`, p1 + ', ' + p2)
})

/* J4 (the code read's F1): the one-day window's own Delete over a day holding an OIL award — armed, another page and back,
   then Delete again: it asks again, the award kept */
await scenario('J4', async ({ page }, t) => {
  await t.lw()
  const cell = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].find(e => /^(FO|HO)/.test((e.textContent || '').trim()) && e.getClientRects().length); return c ? c.getAttribute('data-testid') : null })
  if (!cell) { rec('J4', false, 'no FO or HO day on screen'); return }
  await page.locator(`[data-testid="${cell}"]`).first().scrollIntoViewIfNeeded(); await t.press(`[data-testid="${cell}"]`); await page.waitForTimeout(500)
  await t.press('[data-testid="bid-clear"]')
  const asked = await text(page, '[data-testid="span-note"]')
  const p1 = await t.shot('armed')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  const open = await page.locator('[data-testid="bid-clear"]').count()
  const note = open ? await text(page, '[data-testid="span-note"]') : '(the window closed)'
  if (open) { await t.press('[data-testid="bid-clear"]'); await page.waitForTimeout(400) }
  const again = open ? await text(page, '[data-testid="span-note"]') : ''
  const kept = await page.evaluate(c => /^(FO|HO)/.test((document.querySelector(`[data-testid="${c}"]`)?.textContent || '').trim()), cell)
  const p2 = await t.shot('after')
  rec('J4', /OIL award/.test(asked) && !/OIL award/.test(note) && kept && (!open || /OIL award/.test(again)), `${cell}: armed "${asked.slice(0, 60)}" → back: note "${note.slice(0, 40)}"; Delete again: "${again.slice(0, 50)}"; award kept ${kept}`, p1 + ', ' + p2)
})

const fail = all.filter(r => !r.ok).length
console.log(`lws/lw1027-walk ${WHICH}: ${all.length - fail} PASS, ${fail} FAIL`)
process.exit(fail ? 1 : 0)
