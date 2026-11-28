// jb-s26c v1 - follow-ups of the midnight walk. A: Hunter's own move with an unsaved chart draft: the bar reads 149, the chart is
// still 142's: a MARK and Undo pressed there, where do they land; then the draft discarded by the chart's own door, where the Tracker
// lands. B: the Leave War's "today" signs across midnight, read inside the Leave War only.
// ONE allowed storage write: the SETUP of the dated move (msq-rs-lib), as in jb-s26.
import { world, clockTo, signIn as rsIn, signOut as rsOut, U142, U149 } from '../../msq/msq-rs-lib.mjs'
import { note, pic, picsFor, pickSq, shut, step, check, press, facts, go, state, ask, addEvent, hasEv, finish } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, mark } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s26c-${SZ}`
console.log('jb-s26c v1', SZ)
picsFor(tag)
const ORIGIN = `http://localhost:${process.env.MQ_PORT}`
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const NOW = '2026-07-15T23:30:00', PAST = '2026-07-16T00:01:00'
const css = '*{transition:none !important;animation:none !important}'
async function build(move) {
  const w = await world({ origin: ORIGIN, size: SZ === 'p' ? 'p' : 'd', now: NOW, moves: move ? [{ pid: 'prowler', from: U142, to: U149, day: '2026-07-16' }] : [] })
  const s = { page: w.page, ctx: w.ctx, sz: SZ, desk: SZ !== 'p', w }
  await rsIn(w, 'ad'); await s.page.addStyleTag({ content: css }).catch(() => {})
  await dress(s, '142', ['ST-01', 'ACG-01']); await to(s, '149'); await dress(s, '149', ['ST-01'])
  await rsOut(w); await rsIn(w, 'ad2'); await s.page.addStyleTag({ content: css }).catch(() => {})
  return s
}
const toastNow = s => s.page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim() || '')
const dlgClear = async s => { for (let i = 0; i < 3; i++) { const q = await ask(s); if (!q.msg) return; note('box:', JSON.stringify(q.msg), JSON.stringify(q.btns)); await press(s, q.btns.some(b => /dlgCancel/.test(b)) ? '#dlgCancel' : '#dlgOk'); await wait(s, 300) } }
const saberReads = async (s, label) => {
  const { page, w } = s
  await dlgClear(s)
  await page.keyboard.press('Escape').catch(() => {})
  if (await page.locator('#burger:visible').count()) { await page.locator('#burger').tap(); await wait(s, 400) }
  const out = page.getByRole('button', { name: /sign out|log ?out/i }).first(); await (s.desk ? out.click() : out.tap()); await wait(s, 700)
  const q = await ask(s); if (q.msg) { note('sign-out asks:', JSON.stringify(q.msg)); await press(s, '#dlgAlt'); await wait(s, 900) }
  await page.waitForSelector('#luser', { timeout: 10000 }); await rsIn(w, 'ad')
  const a = await onSeed(s); await to(s, '149'); const b = await onSeed(s)
  note(`${label}: Saber reads 142 ${short(a)} / 149 ${short(b)}`); await pic(s, `${label}-saber-149`)
  return { a, b }
}
try {
  await step('A a mark and Undo on the old chart after his own move', async () => {
    const s = await build(true); const { page, w } = s
    await go(s, 'tracker'); await wait(s, 1200); await onSeed(s)
    check('A: draft made on 142', await addEvent(s, 'JB-MIDC'), 'JB-MIDC')
    await clockTo(w, PAST); await wait(s, 1000)
    const f0 = await fp(s); note('after midnight', short(f0)); await pic(s, 'a1-after-midnight')
    const ok = await mark(s, 'ST-02', 'dco'); await wait(s, 700)
    const f1 = await fp(s); const t1 = await toastNow(s); const q1 = await ask(s); await pic(s, 'a2-after-mark')
    note(`a mark pressed (${ok}): ${short(f1)}; note "${t1}"; box ${JSON.stringify(q1.msg)}`)
    await dlgClear(s)
    const ub = page.locator('#trUndoBtn').filter({ visible: true })
    if (await ub.count()) { const off = await ub.first().isDisabled(); note('Undo', off, await ub.first().getAttribute('title')); if (!off) { await press(s, '#trUndoBtn', 'a3-undo'); await wait(s, 600); note('after Undo', short(await fp(s)), JSON.stringify((await ask(s)).msg)); await dlgClear(s) } }
    await pic(s, 'a3-after-undo')
    const r = await saberReads(s, 'a4')
    check('A: 142 holds only its own two marks', r.a.done === 2 && !(await hasEv(s, 'JB-MIDC')), short(r.a))
    check('A: nothing of it landed on 149', r.b.done === 1 && !(r.b.courses || []).includes('JB142'), short(r.b))
    await w.browser.close().catch(() => {})
  })
  await step('A2 the draft discarded by the chart door after his own move', async () => {
    const s = await build(true); const { page, w } = s
    await go(s, 'tracker'); await wait(s, 1200); await onSeed(s)
    check('A2: draft made', await addEvent(s, 'JB-MIDD'), 'JB-MIDD')
    await clockTo(w, PAST); await wait(s, 1000)
    const v = await page.evaluate(() => { const e = document.getElementById('sylSel'); return [...e.options].find(o => !o.selected)?.value })
    await page.selectOption('#sylSel', v); await wait(s, 500)
    const q = await ask(s); note('the door asks', JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, 'b1-asked')
    if (q.msg) { await press(s, '#dlgOk', 'b2-discard'); await wait(s, 1500) }
    await dlgClear(s)
    const f = await fp(s); note('after Discard', short(f)); await pic(s, 'b2-after')
    check('A2: after the Discard the Tracker shows 149, his squadron now', f.sq === '149' && (f.courses || []).includes('JB149') && !(f.courses || []).includes('JB142') && !f.dirty, short(f))
    const r = await saberReads(s, 'b3')
    check('A2: 142 and 149 both unchanged', r.a.done === 2 && r.b.done === 1, { a: short(r.a), b: short(r.b) })
    await w.browser.close().catch(() => {})
  })
  await step('B the Leave War today signs across midnight', async () => {
    const s = await build(false); const { page, w } = s
    await go(s, 'leavewar'); await wait(s, 1600); await shut(s)
    const t = page.locator('#page-leavewar button', { hasText: /^\s*Today\s*$/ }).filter({ visible: true }).first()
    if (await t.count()) { await (s.desk ? t.click() : t.tap()); await wait(s, 600); note('pressed the Leave War Today button') } else note('no Today button drawn')
    const read = () => page.evaluate(() => {
      const r = document.querySelector('#page-leavewar'); if (!r) return null
      const els = [...r.querySelectorAll('[class*="today" i], [data-today="true"], [aria-current="date"]')].filter(e => e.getBoundingClientRect().width > 0)
      const cls = {}; const dates = new Set()
      for (const e of els) { const c = [...e.classList].find(x => /today/i.test(x)) || e.tagName; cls[c] = (cls[c] || 0) + 1; const id = e.dataset.testid || e.dataset.date || e.dataset.iso || ''; const m = id.match(/\d{4}-\d{2}-\d{2}/); if (m) dates.add(m[0]) }
      return { n: els.length, cls, dates: [...dates], words: els.slice(0, 2).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 18)) }
    })
    const a = await read(); note('before midnight', JSON.stringify(a)); await pic(s, 'c1-before')
    await clockTo(w, PAST); await wait(s, 1200)
    const b = await read(); note('after midnight', JSON.stringify(b)); await pic(s, 'c2-after'); facts.lwToday = { a, b }
    if (a && a.dates.length && b) check('B: every today sign moved to 16 Jul together', b.dates.length === 1 && b.dates[0] === '2026-07-16', { before: a.dates, after: b.dates })
    else note('NOT WALKED B: no dated today sign could be read on the Leave War at this date')
    /* in this world Hunter holds 142 alone, so there is no other squadron for him to pick */
    await go(s, 'tracker'); await wait(s, 900); const g = await onSeed(s); check('B: his 142 Tracker its own afterwards', g.sq === '142' && g.done === 2, short(g))
    await w.browser.close().catch(() => {})
  })
} finally { finish(tag) }
