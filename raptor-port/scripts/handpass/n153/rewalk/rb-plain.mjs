// rb-plain v1 - the plain-user round: Hunter (Plan of 149) on the Leave War of each squadron: a person, a day, a bid opened and
// closed by each way the window has; the bell opened, a line pressed, closed; the member view there and back. SZ=d|p
import { finish, closeAll, picsFor, step, go, mk, signIn, grant, logout } from './rlib.mjs'
import { where, roleSwitch, wait, note, check, pic, pickSq, shut } from './rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `rb-plain-${SZ}`
console.log('rb-plain v3', SZ, process.env.MQ_PORT)
picsFor(tag)
const q = t => `[data-testid="${t}"]`
const DAY = '2026-12-15'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(350) }
const warAll = s => s.page.evaluate(() => { const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + ':' + t.length }; const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('raptor:leavewar/')) o[k] = hash(localStorage.getItem(k) || '') } return o })
const same = (a, b) => { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); return [...ks].filter(k => a[k] !== b[k]) }
/* the Leave War windows drawn now, by name */
const sheets = s => s.page.evaluate(() => [...document.querySelectorAll('#page-leavewar [role="dialog"][data-testid], body > [role="dialog"][data-testid], [role="dialog"][data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 }).map(e => e.dataset.testid))
async function toDec(s) {
  await go(s, 'leavewar'); await shut(s); await s.page.waitForSelector(q('month-strip'), { timeout: 15000 }); await wait(s, 600)
  const w = s.page.locator(q('war-picker')).filter({ visible: true })
  if (await w.count()) { const v = await w.first().inputValue(); if (v !== 'y2026') { await s.page.selectOption(q('war-picker'), 'y2026'); await wait(s, 600) } }
  await tapIt(s, q('month-DEC')); await wait(s, 600)
}
const into = (s, sel) => s.page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'center' }), sel)
/* a press outside the window: a point on the shade, measured */
async function outside(s, name) {
  const p = await s.page.evaluate(n => {
    const el = document.querySelector(`[data-testid="${n}"]`); if (!el) return null; const r = el.getBoundingClientRect()
    /* the "VIEW" label first: it does nothing when pressed, where a name in the grid would open that person's window */
    const v = [...document.querySelectorAll('#page-leavewar *')].find(e => !e.children.length && e.textContent.trim().toUpperCase() === 'VIEW' && e.getBoundingClientRect().width > 0)?.getBoundingClientRect()
    const tries = [...(v ? [[v.left + v.width / 2, v.top + v.height / 2]] : []), [20, innerHeight - 20], [innerWidth - 20, innerHeight - 20], [innerWidth / 2, Math.max(70, r.top - 24)], [20, 90]]
    for (const [x, y] of tries) { const t = document.elementFromPoint(x, y); if (t && !el.contains(t)) return { x, y, at: `${t.tagName}.${String(t.className).slice(0, 30)}` } }
    return null
  }, name)
  if (!p) return false
  if (s.desk) await s.page.mouse.click(p.x, p.y); else await s.page.touchscreen.tap(p.x, p.y)
  await wait(s, 400); return p
}
const CLOSERS = {
  'x': async (s, n) => { const l = s.page.locator(`[data-testid="${n}"] button[aria-label^="Close"], [data-testid="${n}"] button:has-text("✕")`).filter({ visible: true }).first(); if (!(await l.count())) return false; await tapIt(s, l); return true },
  'Close': async (s, n) => { const l = s.page.locator(`[data-testid="${n}"] button`, { hasText: /^Close$/ }).filter({ visible: true }).first(); if (!(await l.count())) return false; await tapIt(s, l); return true },
  'Escape': async s => { await s.page.keyboard.press('Escape'); await wait(s, 350); return true },
  'outside': async (s, n) => !!(await outside(s, n)),
}
async function round(s, unit, label, open) {
  for (const how of Object.keys(CLOSERS)) {
    const before = await warAll(s), bw = await where(s)
    await open(); await wait(s, 350); const up = await sheets(s)
    if (!up.length) { note(`${unit} ${label}: nothing opened (${how})`); check(`${unit} ${label} opens a window`, false, up); return }
    const n = up[up.length - 1]; if (how === 'x') await pic(s, `${unit}-${label}-open`)
    const did = await CLOSERS[how](s, n, label)
    if (!did) { note(`${unit} ${label} (${n}): no ${how} control drawn`); await s.page.keyboard.press('Escape'); await wait(s, 300); if ((await sheets(s)).length) await tapIt(s, s.page.locator(`[data-testid="${n}"] button[aria-label^="Close"]`).first()).catch(() => {}); continue }
    await wait(s, 200); const left = await sheets(s), aw = await where(s), diff = same(before, await warAll(s))
    if (left.includes(n)) await pic(s, `${unit}-${label}-${how}-stays`)
    /* a window that keeps itself open on a press outside by design is told apart in the note, not hidden */
    /* the person window does not block the page by ruling (D641, D642; Sheet modal={false}): a press outside leaves it up */
    if (n === 'person-window' && how === 'outside') check(`${unit} ${label} (${n}) stays up on a press outside, as ruled`, left.includes(n), left)
    else check(`${unit} ${label} (${n}) closes by ${how}`, !left.includes(n), left)
    check(`${unit} ${label} by ${how}: page, squadron and the war unchanged`, aw.page === 'page-leavewar' && aw.sq === bw.sq && diff.length === 0, { sq: aw.sq, page: aw.page, diff })
    if (left.includes(n)) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  }
}
try {
  await step('the round', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a'); check('set-up: Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler'); await logout(s); await signIn(s, 'ad2', 'a2')
    for (const [unit, who] of [['142', 'bane'], ['149', 'osp9']]) {
      await pickSq(s, unit); await shut(s); await wait(s, 900)
      await toDec(s); const w = await where(s); await pic(s, `${unit}-war`)
      check(`${unit}: the Leave War is that squadron's`, w.sq.startsWith(unit) && (await page.locator(q(`cell-${who}-${DAY}`)).count()) > 0, w)
      const person = q(`person-${who}`), cell = q(`cell-${who}-${DAY}`)
      /* (the name stands in a pinned column: brought into view up and down only, or the grid slides back to January) */
      await round(s, unit, 'person', async () => { await page.evaluate(c => document.querySelector(c)?.scrollIntoView({ block: 'center', inline: 'nearest' }), person); await wait(s, 150); await tapIt(s, person) })
      if (!(await page.locator(cell).count())) { await tapIt(s, q('month-DEC')); await wait(s, 600) }
      await round(s, unit, 'bid', async () => { await into(s, cell); await wait(s, 150); await tapIt(s, cell) })
      /* a day: the Event row's + on that day, the app's own control for a day */
      const dayBtn = page.locator(`[data-testid^="ev-"][data-testid*="${DAY}"], [data-testid^="event-"][data-testid*="${DAY}"]`).first()
      if (await dayBtn.count()) await round(s, unit, 'day', async () => { await dayBtn.scrollIntoViewIfNeeded().catch(() => {}); await tapIt(s, dayBtn) })
      else note(`${unit}: no day control found by name`)
    }
    /* the bell */
    const bb = () => page.locator('#notifyBell').filter({ visible: true }).first()
    for (let i = 0; i < 4 && !(await bell.isOpen(s)); i++) { await tapIt(s, bb()); await wait(s, 200) }
    check('the bell opens', await bell.isOpen(s), await bell.lines(s).then(l => l.slice(0, 2))); await pic(s, 'bell-open')
    await tapIt(s, bb()); check('the bell closes by its button', !(await bell.isOpen(s)), 'closed')
    await tapIt(s, bb()); await page.keyboard.press('Escape'); await wait(s, 300); check('the bell closes by Escape', !(await bell.isOpen(s)), 'closed')
    await tapIt(s, bb()); const W = page.viewportSize(); if (s.desk) await page.mouse.click(12, W.height - 60); else await page.touchscreen.tap(8, W.height - 40); await wait(s, 350)
    check('the bell closes by a press outside', !(await bell.isOpen(s)), 'closed')
    await tapIt(s, bb()); const line = page.locator('[data-testid="bell-list"] .bl-line').first(); const lw = await line.textContent(); const b4 = await where(s)
    await tapIt(s, line); await wait(s, 500); const aft = await where(s); note('line pressed', lw, JSON.stringify(aft)); await pic(s, 'bell-line-pressed')
    check('a line of his own account is only read: same page and squadron', aft.page === b4.page && aft.sq === b4.sq, { b4, aft })
    if (await bell.isOpen(s)) await bell.close(s)
    /* the member view there and back from the Leave War of 149 */
    const w0 = await warAll(s), a0 = await where(s)
    await roleSwitch(s, 'mv-there'); await wait(s, 600); const m = await where(s); await pic(s, 'member-view')
    await roleSwitch(s, 'mv-back'); await wait(s, 700); const b = await where(s); await pic(s, 'member-view-back')
    check('member view there and back: same squadron, the war unchanged', m.sq === a0.sq && b.sq === a0.sq && same(w0, await warAll(s)).length === 0, { a0, m, b })
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
