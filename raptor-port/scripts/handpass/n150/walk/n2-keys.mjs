// n2 — narrow desktop (Chromium 820 × 864), the keyboard alone: Astra's scenarios 15 (Hunter, View of 149), 16 and 22
// (Ranger, View of 149). n1's keyboard route started Tab from inside the page and never reached ☰; here every route
// starts from a press on an empty spot of the top bar, then real Tab / Shift+Tab / Enter / Space / arrows / Escape.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
console.log('n2-keys v1')
picsFor('n2')
const focusNow = s => s.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body' }; const b = a.getBoundingClientRect(); const mk = a.querySelector && a.querySelector('.mark'); const cs = getComputedStyle(mk || a); return { el: `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset.page ? '[' + a.dataset.page + ']' : ''}${a.dataset.unit ? '[' + a.dataset.unit + ']' : ''}`, ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, fv: a.matches(':focus-visible'), top: Math.round(b.top) } })
const key = async (s, k) => { await s.page.keyboard.press(k); await s.page.waitForTimeout(250) }
async function fromTop(s) {
  // an empty spot of the top bar: a point whose element is the bar itself
  const pt = await s.page.evaluate(() => { const bar = document.querySelector('.topbar'); const r = bar.getBoundingClientRect(); for (let x = r.left + 200; x < r.right - 200; x += 10) { const e = document.elementFromPoint(x, r.top + r.height / 2); if (e === bar || (e && e.classList.contains('topbar'))) return { x, y: r.top + r.height / 2 } } return null })
  if (!pt) { note('no empty spot on the top bar'); return false }
  await s.page.mouse.click(pt.x, pt.y); await s.page.waitForTimeout(150)
  return true
}
async function tabTo(s, target, max = 20) {
  const seq = []
  for (let i = 0; i < max; i++) { await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(40); const f = (await focusNow(s)).el; seq.push(f); if (f === target) return { ok: true, seq } }
  return { ok: false, seq }
}
async function tabSeq(s, n) { const seq = []; for (let i = 0; i < n; i++) { await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(40); seq.push((await focusNow(s)).el) } return seq }
await serve()
try {
  const s = await newPage('n')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'bane', '149', 'view'); await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('S15 keyboard opening and selection (Hunter)', async () => {
    await fromTop(s)
    facts['s15-a-to-burger'] = await tabTo(s, 'button#burger'); note('to ☰:', JSON.stringify(facts['s15-a-to-burger']))
    await key(s, 'Enter'); facts['s15-b-after-open'] = { open: (await state(s)).drawerOpen, focus: await focusNow(s) }
    note('opened:', JSON.stringify(facts['s15-b-after-open']))
    await key(s, 'Shift+Tab'); facts['s15-c-on-mark'] = await focusNow(s); note('mark:', JSON.stringify(facts['s15-c-on-mark']))
    await pic(s, 's15-01-focus-on-mark', ['#drawer .drawer-sqn', '#drawer .drawer-panel > h4'])
    for (const k of ['Enter', 'Space', 'ArrowDown']) {
      await key(s, k)
      const st = await state(s); facts[`s15-d-${k}`] = { list: st.dList, at: st.dListAt, focus: await focusNow(s) }
      note(`${k}:`, JSON.stringify(facts[`s15-d-${k}`]))
      await pic(s, `s15-02-after-${k}`)
      if (st.dList) { await key(s, 'Escape'); facts[`s15-e-esc-after-${k}`] = { list: (await state(s)).dList, open: (await state(s)).drawerOpen, focus: await focusNow(s) }; note('esc:', JSON.stringify(facts[`s15-e-esc-after-${k}`])) }
    }
    await key(s, 'Enter')
    await key(s, 'ArrowDown'); const mv = await state(s)
    facts['s15-f-moved'] = { focus: await focusNow(s), mark: mv.dMark, line: mv.dLine, bar: mv.barMark }; note('moved:', JSON.stringify(facts['s15-f-moved']))
    await pic(s, 's15-03-focus-moved-to-149')
    await key(s, 'Enter'); await page.waitForTimeout(400)
    await rec(s, 's15-g-after-select'); facts['s15-g-focus'] = await focusNow(s); note('after select focus:', JSON.stringify(facts['s15-g-focus']))
    await pic(s, 's15-04-after-select')
    await key(s, 'Escape')
    await barPick(s, '142')
  })
  await as(s, 'us', 'us')
  await step('S16 Escape closes one layer (Ranger, 149)', async () => {
    await barPick(s, '149'); const before = await state(s)
    await fromTop(s); facts['s16-a-to-burger'] = await tabTo(s, 'button#burger')
    await key(s, 'Enter'); await key(s, 'Shift+Tab'); await key(s, 'Enter')
    await rec(s, 's16-b-list-open'); facts['s16-b-focus'] = await focusNow(s); await pic(s, 's16-01-list-open-by-keys')
    await key(s, 'Escape')
    await rec(s, 's16-c-esc1'); facts['s16-c-focus'] = await focusNow(s); await pic(s, 's16-02-after-esc1')
    await key(s, 'Escape')
    await rec(s, 's16-d-esc2'); facts['s16-d-focus'] = await focusNow(s); await pic(s, 's16-03-after-esc2')
    facts['s16-e-before'] = { mark: before.barMark, page: before.page }
    note(JSON.stringify({ b: facts['s16-b-focus'], c: facts['s16-c-focus'], d: facts['s16-d-focus'] }))
  })
  await step('S22 narrow keyboard route (Ranger)', async () => {
    await fromTop(s); facts['s22n-a-bar-149'] = await tabSeq(s, 10)
    await fromTop(s); await tabTo(s, 'button#burger'); await key(s, 'Enter')
    await key(s, 'Shift+Tab'); facts['s22n-b-menu-149'] = await tabSeq(s, 8)
    note('bar 149:', JSON.stringify(facts['s22n-a-bar-149'])); note('menu 149:', JSON.stringify(facts['s22n-b-menu-149']))
    await pic(s, 's22n-01-menu-149-keys')
    // to Help by Tab from the mark, then Enter
    await key(s, 'Escape'); await fromTop(s); await tabTo(s, 'button#burger'); await key(s, 'Enter')
    const h = await tabTo(s, 'a[help]', 6); facts['s22n-c-to-help'] = h
    if (h.ok) { await key(s, 'Enter'); await rec(s, 's22n-c-help-by-enter') }
    // home again by keys: ☰, Shift+Tab to the mark, Enter, Up to 142, Enter
    await fromTop(s); await tabTo(s, 'button#burger'); await key(s, 'Enter'); await key(s, 'Shift+Tab'); await key(s, 'Enter'); await key(s, 'Home'); await key(s, 'Enter')
    await rec(s, 's22n-d-home-by-keys')
    facts['s22n-e-menu-142'] = await tabSeq(s, 10); note('menu 142:', JSON.stringify(facts['s22n-e-menu-142']))
    await key(s, 'Escape'); await fromTop(s); facts['s22n-f-bar-142'] = await tabSeq(s, 10); note('bar 142:', JSON.stringify(facts['s22n-f-bar-142']))
    await fromTop(s); await tabTo(s, 'button#burger'); await key(s, 'Enter')
    const i = await tabTo(s, 'a[inputs]', 6); if (i.ok) { await key(s, 'Enter'); await rec(s, 's22n-g-inputs-by-enter') }
  })
  await s.ctx.close()
} finally { finish('n2'); await stop() }
