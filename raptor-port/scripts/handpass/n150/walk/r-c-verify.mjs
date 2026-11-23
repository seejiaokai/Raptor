// r-c-verify (chat 151, the re-walk) — two reads r-inputs (SZ=d) left open, desktop 1536:
//  1. c: Hunter (Plan of 149), 149's input window open, switches to the member view: the window stayed, its band "This
//     change could not be saved.", its Remarks took typing and Save took the press. Did that Save write the remarks into
//     149's input? Read back by opening the same input again in the admin view.
//  2. c2: Ranger's held window on View-only Sched — what lies over the top bar's Schedules button (can 142 be picked
//     again with it open)? And after its Close, 142 picked, the input opened again: live?
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, over, T } from './r-lib.mjs'
console.log('r-c-verify v1')
picsFor('r-c-verify')
const rmkNow = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditRmk')].find(x => x.getBoundingClientRect().width > 0); return e ? e.value : null })
const band = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('.moveband')].find(x => x.getBoundingClientRect().width > 0); return b ? b.textContent.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : null })
async function openRow(s, who) {
  const { page } = s
  await go(s, 'inputs'); await page.waitForTimeout(900)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await page.waitForTimeout(400)
  const r = page.locator('#inBody tr[data-iid]').filter({ visible: true }).filter({ hasText: who }).first()
  if (!(await r.count())) return false
  await r.scrollIntoViewIfNeeded(); await press(s, r.locator(T('in-open')).first()); await page.waitForTimeout(600)
  return true
}
await serve()
try {
  const s = await newPage('d')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'prowler', '149', 'plan'); await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('1: c — does the member view\'s Save write?', async () => {
    await barPick(s, '149')
    const ok = await openRow(s, 'Hunter'); check('premise: 149\'s "Hunter · 9 Jan" input open', ok, ok)
    facts['c-rmk-before'] = await rmkNow(s); await pic(s, 'c-01-open')
    await press(s, '#roleBadge'); await page.waitForTimeout(600)
    const st = await rec(s, 'c-a-member'); facts['c-band'] = await band(s)
    const rb = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditRmk')].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.mouse.click(rb.x, rb.y); await page.keyboard.type('verify member typed', { delay: 10 })
    await pic(s, 'c-02-typed-in-member-view')
    const sv = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditSave')].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.mouse.click(sv.x, sv.y); await page.waitForTimeout(800)
    facts['c-after-save'] = { band: await band(s), rmk: await rmkNow(s), toast: await page.evaluate(() => document.querySelector('#toastEl')?.textContent.trim()), page: (await state(s)).page }
    note('after Save in the member view:', JSON.stringify(facts['c-after-save'])); await pic(s, 'c-03-after-save')
    if (await rmkNow(s) !== null) { await press(s, '#inpEditCancel'); await page.waitForTimeout(400) }
    if (await page.locator('[data-testid="inped-escask-go"]').filter({ visible: true }).count()) { await pic(s, 'c-03b-discard-question'); await press(s, '[data-testid="inped-escask-go"]') }
    await press(s, '#roleBadge'); await page.waitForTimeout(500)
    const ok2 = await openRow(s, 'Hunter')
    const back = await rmkNow(s); facts['c-rmk-after'] = back
    await pic(s, 'c-04-reopened-admin-view')
    note('149\'s input remarks read back in the admin view:', JSON.stringify(back))
    check('c: the member view\'s Save did not write the typed remarks into 149\'s input', ok2 && !(back || '').includes('verify member typed'), { reopened: ok2, remarks: back })
    if (back !== null) await press(s, '#inpEditCancel')
    await go(s, 'viewsched'); await barPick(s, '142')
  })
  await as(s, 'us', 'us')
  await step('2: c2 — the held window on View-only Sched: the Schedules button', async () => {
    const ok = await openRow(s, 'Ranger'); check('premise: Ranger\'s input open', ok, ok)
    await barPick(s, '149'); await page.waitForTimeout(500)
    const st = await rec(s, 'c2-a-held'); const o = await over(s, '#sqnMenuBtn'); facts['c2-over-bar'] = o
    facts['c2-over-help'] = await over(s, '#topnav a[data-page="help"]')
    note('over the Schedules button:', o, '| over Help:', facts['c2-over-help'])
    await pic(s, 'c2-01-held-on-viewsched')
    check('c2: with the held window on View-only Sched, the Schedules button can be pressed (to pick 142 again)', o === 'self', o)
    /* the band's Close, then 142, then the input again: live */
    await press(s, '[data-testid="inped-moveband"] button, .moveband button'); await page.waitForTimeout(500)
    facts['c2-after-close'] = { win: await rmkNow(s), page: (await state(s)).page, mark: (await state(s)).barMark }
    await barPick(s, '142'); const ok2 = await openRow(s, 'Ranger')
    facts['c2-reopened'] = { band: await band(s), ok: ok2 }
    check('c2: after Close, 142, the input opens again live (no band)', ok2 && !(await band(s)), facts['c2-reopened'])
    await pic(s, 'c2-02-reopened-142')
  })
  await s.ctx.close()
} finally { finish('r-c-verify'); await stop() }
