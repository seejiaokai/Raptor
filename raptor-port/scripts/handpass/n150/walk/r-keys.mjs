// r-keys (chat 151, the re-walk) — fix 5: on the mark (☰'s TALON mark at 820 wide, the top bar's "149 ▾" at 1536),
// Arrow Down and Arrow Up each OPEN the list with the focus on the squadron in view; Tab out of the list closes it; the
// focus goes on to the next control. Ranger with View of 149. Keys only after a press on an empty spot of the top bar.
// The boxes read are those the code names (ui/Drawer.tsx DrawerSquadron: #drawerSqnBtn, #drawerSqnList;
// ui/SquadronMenu.tsx: #sqnMenuBtn, #sqnMenu).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu } from './r-lib.mjs'
const SZ = process.env.SZ || 'n'
console.log('r-keys v1', SZ)
picsFor('r-keys-' + SZ)
const focusNow = s => s.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset.page ? '[' + a.dataset.page + ']' : ''}${a.getAttribute('aria-checked') === 'true' ? '[ticked]' : ''}${a.querySelector?.('.sqm-num') ? '{' + a.querySelector('.sqm-num').textContent.trim() + '}' : ''}` })
const key = async (s, k) => { await s.page.keyboard.press(k); await s.page.waitForTimeout(250) }
async function fromTop(s) {
  const pt = await s.page.evaluate(() => { const bar = document.querySelector('.topbar'); const r = bar.getBoundingClientRect(); for (let x = r.left + 200; x < r.right - 200; x += 10) { const e = document.elementFromPoint(x, r.top + r.height / 2); if (e === bar || (e && e.classList.contains('topbar'))) return { x, y: r.top + r.height / 2 } } return null })
  if (!pt) { note('no empty spot on the top bar'); return false }
  await s.page.mouse.click(pt.x, pt.y); await s.page.waitForTimeout(150); return true
}
async function tabTo(s, target, max = 25) { for (let i = 0; i < max; i++) { await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(40); if ((await focusNow(s)) === target) return true } return false }
async function shiftTo(s, target, max = 12) { for (let i = 0; i < max; i++) { await s.page.keyboard.press('Shift+Tab'); await s.page.waitForTimeout(60); if ((await focusNow(s)) === target) return true } return false }
const N = SZ === 'n'
const BTN = N ? 'button#drawerSqnBtn' : 'button#sqnMenuBtn'
const list = async s => { const st = await state(s); return N ? st.dList : st.topList }
async function toMark(s) {
  await fromTop(s)
  if (N) { if (!(await tabTo(s, 'button#burger'))) return false; await key(s, 'Enter'); return shiftTo(s, BTN) }
  return tabTo(s, BTN)
}
await serve()
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'us', 'us')
  await step('149 picked', async () => { await barPick(s, '149'); await shutMenu(s); const st = await state(s); check('premise: 149 in view', st.barMark?.startsWith('149'), st.barMark) })
  for (const arrow of ['ArrowDown', 'ArrowUp']) {
    await step(`${arrow} on the mark opens the list`, async () => {
      const ok = await toMark(s); check(`premise (${arrow}): the focus on the mark by keys`, ok, await focusNow(s))
      if (!ok) return
      check(`premise (${arrow}): list closed before the key`, !(await list(s)), await list(s))
      await key(s, arrow)
      const l = await list(s), f = await focusNow(s)
      await pic(s, `${arrow}-01-after`)
      check(`${arrow} opens the list`, !!l && l.length === 2, l)
      check(`${arrow}: the focus on the squadron in view (149, ticked)`, f.includes('[ticked]') && f.includes('{149}'), f)
      await key(s, 'Escape')
      check(`${arrow}: Escape closes the list, the focus back on the mark`, !(await list(s)) && (await focusNow(s)) === BTN, { list: await list(s), focus: await focusNow(s) })
    })
  }
  await step('Tab out of the list closes it', async () => {
    check('premise (Tab): focus on the mark', (await focusNow(s)) === BTN, await focusNow(s))
    await key(s, 'ArrowDown'); const l0 = await list(s); const f0 = await focusNow(s)
    check('premise (Tab): list open, focus on its last row (149)', !!l0 && f0.includes('{149}'), { l0, f0 })
    await key(s, 'Tab')
    const l = await list(s), f = await focusNow(s), st = await state(s)
    await pic(s, 'tab-01-after-tab-out')
    check('Tab out of the list: list closed', !l, l)
    check('Tab out: the focus on a control outside the list', !f.includes('sqm') && !f.includes('{1'), f)
    check('Tab out: nothing picked (149 still in view)', st.barMark?.startsWith('149'), st.barMark)
    if (N) check('Tab out: the ☰ menu still open', st.drawerOpen, st.drawerOpen)
    facts['tab-out-focus'] = f
  })
  await step('Shift+Tab out of the list: from the first row back to the mark keeps it (the mark is the list\'s own), then on out', async () => {
    if (N) { await shutMenu(s) }
    const ok = await toMark(s); if (!ok) { check('premise (Shift+Tab): focus on the mark', false, await focusNow(s)); return }
    await key(s, 'ArrowUp'); await key(s, 'Home')
    const f0 = await focusNow(s); check('premise (Shift+Tab): focus on the first row (142)', f0.includes('{142}'), f0)
    await key(s, 'Shift+Tab'); const a = { list: await list(s), focus: await focusNow(s) }
    facts['shift-tab-1'] = a; note('Shift+Tab from the first row:', JSON.stringify(a))
    await pic(s, 'shifttab-01')
    await key(s, 'Shift+Tab'); const b = { list: await list(s), focus: await focusNow(s) }
    facts['shift-tab-2'] = b; note('Shift+Tab again:', JSON.stringify(b))
    check('once the focus has left the mark and its list, the list is closed', !b.list || b.focus === BTN, b)
    await pic(s, 'shifttab-02')
  })
  await s.ctx.close()
} finally { finish('r-keys-' + SZ); await stop() }
