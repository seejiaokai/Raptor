// q1 — two of the question cases d1 could not finish (a click there timed out): (a) Hunter (View of 149) with 142's OIL
// list open in the Leave War picks 149 — what lies over the Schedules button first, then the pick, then a card if the
// list still shows; (b) Undo: Hunter makes a change on 142 (an access line for Ranger on Admin → Users, Save), picks
// view-only 149, and the Undo control is looked for and, if offered, pressed. Desktop 1536.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, barPick, go, grant, admCat, openRow, lineBtn, finish, note, facts, state } from './vlib.mjs'
console.log('q1-oil-undo v1')
picsFor('q1')
const T = id => `[data-testid="${id}"]`
const over = (s, sel) => s.page.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return 'none'; const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t ? (b.contains(t) ? 'self' : `${t.tagName}#${t.id}.${String(t.className).slice(0, 40)}`) : 'nothing' }, sel)
const undoInfo = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('#undoBtn')].find(e => e.getBoundingClientRect().width > 0); return b ? { disabled: b.disabled, title: b.title || b.getAttribute('aria-label') || '' } : 'not shown' })
await serve()
try {
  const s = await newPage('d')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('a: OIL list open, then 149', async () => {
    await go(s, 'leavewar'); await page.waitForTimeout(1500)
    facts['a-oil-tab'] = await over(s, T('oil-tracker')); note('OIL tab:', facts['a-oil-tab'])
    if (facts['a-oil-tab'] === 'none') { facts.a = 'NOT WALKED: no OIL tab'; return }
    await press(s, T('oil-tracker')); await page.waitForTimeout(900)
    facts['a-rows'] = await page.evaluate(() => document.querySelectorAll('[data-testid^="oil-row-"]').length)
    facts['a-btn-cover'] = await over(s, '#sqnMenuBtn'); note('Schedules button:', facts['a-btn-cover'], 'rows', facts['a-rows'])
    await pic(s, 'a-01-oil-142')
    if (facts['a-btn-cover'] !== 'self') { facts.a = `NOT WALKED: the Schedules button is covered (${facts['a-btn-cover']})`; return }
    await barPick(s, '149'); await page.waitForTimeout(800)
    await rec(s, 'a-after-pick'); facts['a-rows-after'] = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-row-"]')].filter(e => e.getBoundingClientRect().width > 0).length)
    await pic(s, 'a-02-after-pick-149')
    await barPick(s, '142'); await go(s, 'viewsched')
  })
  await step('b: Undo after a change on 142, then 149', async () => {
    await admCat(s, 'Users'); await openRow(s, 'bane')
    await page.locator(lineBtn('149', 'view')).click(); await page.waitForTimeout(200)
    await page.locator('#accEdSave').click(); await page.waitForTimeout(800)
    facts['b-undo-on-142'] = await undoInfo(s); note('undo on 142 admin:', JSON.stringify(facts['b-undo-on-142']))
    await go(s, 'viewsched'); await barPick(s, '149')
    facts['b-undo-on-149'] = await undoInfo(s); await rec(s, 'b-149'); await pic(s, 'b-01-149-topbar', ['.topbar'])
    note('undo on 149:', JSON.stringify(facts['b-undo-on-149']))
    if (facts['b-undo-on-149'] !== 'not shown' && !facts['b-undo-on-149'].disabled) {
      await press(s, '#undoBtn'); await page.waitForTimeout(900)
      await rec(s, 'b-after-undo'); facts['b-toast'] = await page.evaluate(() => document.querySelector('#toastEl')?.textContent.replace(/\s+/g, ' ').trim())
      await pic(s, 'b-02-after-undo')
    }
  })
  await s.ctx.close()
} finally { finish('q1'); await stop() }
