// rb-probe1 v1 - why the phone's plain round stopped: the person window pressed outside, Escape, then a press on a day cell
import { finish, closeAll, picsFor, step, go, mk, signIn, grant, logout } from './rlib.mjs'
import { wait, note, pic, pickSq, shut } from './rb-lib.mjs'
const SZ = process.env.SZ || 'p'
const tag = `rb-probe1-${SZ}`
console.log('rb-probe1 v1', SZ)
picsFor(tag)
const q = t => `[data-testid="${t}"]`
const cell = q('cell-bane-2026-12-15'), person = q('person-bane')
const sheets = s => s.page.evaluate(() => [...document.querySelectorAll('[role="dialog"][data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 }).map(e => e.dataset.testid))
const at = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'none'; e.scrollIntoView({ block: 'center', inline: 'center' }); const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { box: [r.left, r.top, r.width, r.height].map(Math.round), top: t ? `${t.tagName}#${t.id}.${String(t.className).slice(0, 40)} ${t.dataset?.testid || ''}` : null, self: t === e || e.contains(t) } }, sel)
try {
  await step('probe', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a'); await grant(s, 'prowler', '149', 'plan'); await logout(s); await signIn(s, 'ad2', 'a2')
    await go(s, 'leavewar'); await shut(s); await page.waitForSelector(q('month-strip')); await wait(s, 600)
    const w = page.locator(q('war-picker')).filter({ visible: true }); if (await w.count() && (await w.first().inputValue()) !== 'y2026') { await page.selectOption(q('war-picker'), 'y2026'); await wait(s, 600) }
    await page.locator(q('month-DEC')).filter({ visible: true }).first().tap(); await wait(s, 800)
    note('cell at first', JSON.stringify(await at(s, cell))); await pic(s, '01-grid')
    await page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'center' }), person); await wait(s, 200)
    await page.locator(person).first().tap(); await wait(s, 500); note('after person', JSON.stringify(await sheets(s))); await pic(s, '02-person')
    await page.touchscreen.tap(20, 874 - 20); await wait(s, 500); note('after outside', JSON.stringify(await sheets(s))); await pic(s, '03-outside')
    await page.keyboard.press('Escape'); await wait(s, 400); note('after Escape', JSON.stringify(await sheets(s))); await pic(s, '04-escape')
    note('cell then', JSON.stringify(await at(s, cell))); await wait(s, 300); await pic(s, '05-cell-in-view')
    try { await page.locator(cell).first().tap({ timeout: 4000 }); await wait(s, 500); note('tap landed; windows', JSON.stringify(await sheets(s))) } catch (e) { note('tap failed: ' + String(e).split('\n').slice(0, 12).join(' | ').slice(0, 900)) }
    await pic(s, '06-after-tap')
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
