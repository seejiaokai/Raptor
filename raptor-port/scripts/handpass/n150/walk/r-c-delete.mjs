// r-c-delete (chat 151, the re-walk) — a lead from r-c-verify: in scenario c (Hunter, Plan of 149, the member view switched
// with 149's input window open) the window is not greyed — Remarks takes typing (Save then refuses) and its Delete is
// drawn live. Does Delete, pressed there (and its question answered), remove 149's input? Desktop 1536. Read back by
// counting 149's inputs named Hunter in the admin view before and after.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, over, T } from './r-lib.mjs'
console.log('r-c-delete v1')
picsFor('r-c-delete')
async function listAll(s) {
  const { page } = s
  await go(s, 'inputs'); await page.waitForTimeout(900)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await page.waitForTimeout(400)
  return page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.dataset.iid + '|' + r.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)))
}
await serve()
try {
  const s = await newPage('d')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('Delete in the member view', async () => {
    await barPick(s, '149')
    const before = await listAll(s); facts.before = before; note('149 inputs before:', before.length, JSON.stringify(before.slice(0, 6)))
    const r = page.locator('#inBody tr[data-iid]').filter({ visible: true }).filter({ hasText: 'Hunter' }).first()
    const iid = await r.getAttribute('data-iid'); facts.iid = iid
    await press(s, r.locator(T('in-open')).first()); await page.waitForTimeout(600)
    await press(s, '#roleBadge'); await page.waitForTimeout(600)
    const st = await rec(s, 'a-member'); await pic(s, '01-member-view-window')
    const del = page.locator('[data-testid="win-inputedit"] .abtn.danger, .airpop-foot .abtn.danger').filter({ visible: true }).first()
    const ov = await page.evaluate(() => { const b = [...document.querySelectorAll('.abtn.danger')].find(e => e.getBoundingClientRect().width > 0 && /Delete/.test(e.textContent)); if (!b) return { found: false }; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { found: true, reached: !!t && (t === b || b.contains(t)), inert: !!b.closest('[inert]'), x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    facts.delete = ov; note('Delete:', JSON.stringify(ov))
    if (!ov.found) { check('Delete drawn', false, ov); return }
    await page.mouse.click(ov.x, ov.y); await page.waitForTimeout(600)
    await pic(s, '02-after-delete-press')
    const ask = page.locator('[data-testid="inped-delall-yes"]').filter({ visible: true })
    facts.ask = await ask.count(); note('a delete question shown:', facts.ask)
    if (await ask.count()) { await press(s, ask.first()); await page.waitForTimeout(600); await pic(s, '03-after-answer') }
    facts.toast = await page.evaluate(() => document.querySelector('#toastEl')?.textContent.trim())
    facts.afterPress = { page: (await state(s)).page, band: await page.evaluate(() => [...document.querySelectorAll('.moveband')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim())) }
    note('after:', JSON.stringify(facts.afterPress), facts.toast)
    if (await page.locator('#inpEditCancel').filter({ visible: true }).count()) await press(s, '#inpEditCancel')
    await press(s, '#roleBadge'); await page.waitForTimeout(500)
    const after = await listAll(s); facts.after = after
    note('149 inputs after:', after.length)
    check('the member view\'s Delete did not remove 149\'s input', after.some(x => x.startsWith(iid + '|')), { before: before.length, after: after.length, iid })
    await pic(s, '04-149-inputs-after')
  })
  await s.ctx.close()
} finally { finish('r-c-delete'); await stop() }
