// r-shade (chat 151, the re-walk) — fix 1 (the ☰ list opens under the TALON mark, inside the menu, pushing the grey line,
// MENU and the pages down) and fix 4 (with the list open, the first press outside the menu closes only the list — a quick
// tap and a press held about a second alike — and a second press closes the menu), with scenarios 17 and 18 walked again
// on the new flow. Ranger with View of 149 (given by Saber on Admin → Users, presses only).
// SZ=p: WebKit 402 × 874 touch ×2 (quick taps by finger; the held press by the mouse, which WebKit's test browser can hold
// and its finger cannot). SZ=c: Chromium 402 × 874 touch ×2 — the held press by a real finger over Chromium's own touch
// input. SZ=n: Chromium 820 × 864, mouse.
import { chromium } from '@playwright/test'
import { SIZES } from '../../n149/walk/lib.mjs'
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, menuGeo, quick, hold } from './r-lib.mjs'
const SZ = process.env.SZ || 'p'
SIZES.c = { engine: chromium, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
console.log('r-shade v1', SZ)
picsFor('r-shade-' + SZ)
const P = (n, w) => `${SZ}-${n}-${w}`
/* a quick press on the shade beside the panel, as closeMenuOutside makes it, with its just-after picture */
const shade = (s, name) => closeMenuOutside(s, name)
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  const cdp = SZ === 'c' ? await s.ctx.newCDPSession(page) : null
  const W = page.viewportSize().width
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'us', 'us')
  await step('fix 1: the list at rest, closed then open', async () => {
    await menuPick(s, '149'); await shutMenu(s)
    await openMenu(s, P('01', 'menu'))
    const a = await menuGeo(s); facts['geo-closed'] = a; note('closed:', JSON.stringify(a)); await pic(s, P('01', 'menu-closed-list'))
    await press(s, '#drawerSqnBtn', P('02', 'mark'))
    const b = await menuGeo(s); facts['geo-open'] = b; note('open:', JSON.stringify(b)); await pic(s, P('02', 'list-open'))
    check('list drawn', !!b.list && !!b.row1, { list: b.list, row1: b.row1 })
    if (b.list) {
      check('list starts under the mark', b.list.y >= a.mark.bottom && b.list.y - a.mark.bottom <= 20, { markBottom: a.mark.bottom, listTop: b.list.y })
      check('list inside the screen (its first row seen without scrolling)', b.row1.y + b.row1.h / 2 < b.vh && b.panelScroll === 0, { row1: b.row1, vh: b.vh, panelScroll: b.panelScroll })
      check('grey line pushed below the list', b.line.y >= b.list.bottom, { listBottom: b.list.bottom, lineTop: b.line.y })
      const d = b.line.y - a.line.y
      check('grey line, MENU and the first page each moved down by the same amount', d > 0 && Math.abs((b.menuH.y - a.menuH.y) - d) <= 1 && Math.abs((b.page1.y - a.page1.y) - d) <= 1,
        { line: [a.line.y, b.line.y], menu: [a.menuH.y, b.menuH.y], page1: [a.page1.y, b.page1.y] })
      check('list at the menu\'s inset (left 16 on the phone, as the drawing)', SZ === 'n' || b.list.x === 16, { x: b.list.x, w: b.list.w })
    }
  })
  await step('fix 4: a quick press on the shade closes only the list; a second closes the menu (S17 new flow)', async () => {
    const st0 = await state(s); check('premise: list open, menu open', !!st0.dList && st0.drawerOpen, { list: st0.dList, open: st0.drawerOpen })
    await shade(s, P('03', 'shade1')); const a = await state(s); await pic(s, P('03', 'after-shade1'))
    check('first quick press outside: list closed', !a.dList && a.dBtnExpanded === 'false', { list: a.dList, expanded: a.dBtnExpanded })
    check('first quick press outside: menu still open', a.drawerOpen, { open: a.drawerOpen })
    check('149 and View only unchanged', a.dMark?.startsWith('149') && a.dLine === '149 · View only' && a.page === 'page-viewsched', { mark: a.dMark, line: a.dLine, page: a.page })
    await shade(s, P('04', 'shade2')); const b = await state(s); await pic(s, P('04', 'after-shade2'))
    check('second quick press outside: menu closed', !b.drawerOpen, { open: b.drawerOpen })
    check('after it, 149 and the page unchanged', b.barMark?.startsWith('149') && b.page === 'page-viewsched', { mark: b.barMark, page: b.page })
  })
  await step('S17 new flow: a press on blank space inside the menu closes only the list', async () => {
    await openMenu(s); await press(s, '#drawerSqnBtn')
    const pt = await page.evaluate(() => { const p = document.querySelector('#drawer .drawer-panel').getBoundingClientRect(); for (let y = p.bottom - 20; y > p.top + 300; y -= 10) { const x = p.left + p.width / 2; const e = document.elementFromPoint(x, y); if (e && (e.classList.contains('drawer-panel') || e.id === 'drawer')) return { x, y, el: e.className } } return null })
    facts['s17-blank-point'] = pt; note('blank point:', JSON.stringify(pt))
    if (!pt) { check('a blank point inside the menu found', false, pt); return }
    if (s.desk) await page.mouse.click(pt.x, pt.y); else await page.touchscreen.tap(pt.x, pt.y)
    if (!s.desk) await quick(s, P('05', 'blank'))
    await page.waitForTimeout(450)
    const a = await state(s); await pic(s, P('05', 'after-blank'))
    check('blank press inside: list closed, menu open', !a.dList && a.drawerOpen, { list: a.dList, open: a.drawerOpen })
    await press(s, '#drawerSqnBtn', P('06', 'mark-again'))
    const b = await state(s); check('mark again: list open', !!b.dList, b.dList)
    await shade(s, P('07', 'shade')); const c = await state(s)
    check('then outside: list closed, menu open', !c.dList && c.drawerOpen, { list: c.dList, open: c.drawerOpen })
    await shade(s, P('08', 'shade')); const d = await state(s); await pic(s, P('08', 'after-second-outside'))
    check('then outside again: menu closed, 149 kept', !d.drawerOpen && d.barMark?.startsWith('149'), { open: d.drawerOpen, mark: d.barMark })
  })
  await step('fix 4: a press held about a second on the shade closes only the list; a second held press closes the menu', async () => {
    await openMenu(s); await press(s, '#drawerSqnBtn')
    const st0 = await state(s); check('premise (held): list open', !!st0.dList, st0.dList)
    await hold(s, W - 8, 500, 1000, P('09', 'hold1'), cdp)
    const a = await state(s); await pic(s, P('09', 'after-hold1'))
    check('first held press: list closed', !a.dList, { list: a.dList })
    check('first held press: menu still open', a.drawerOpen, { open: a.drawerOpen })
    await hold(s, W - 8, 500, 1000, P('10', 'hold2'), cdp)
    const b = await state(s); await pic(s, P('10', 'after-hold2'))
    check('second held press: menu closed', !b.drawerOpen, { open: b.drawerOpen })
  })
  await step('fix 4: a quick press after a held one is not spared (the list closed by a held press, then one quick press closes the menu)', async () => {
    await openMenu(s); await press(s, '#drawerSqnBtn')
    await hold(s, W - 8, 500, 1000, null, cdp)
    const a = await state(s); check('held press: list closed, menu open', !a.dList && a.drawerOpen, { list: a.dList, open: a.drawerOpen })
    await shade(s, P('11', 'quick-after-hold')); const b = await state(s)
    check('quick press after: menu closed', !b.drawerOpen, { open: b.drawerOpen })
  })
  await step('S18 new flow: closed and reopened, the list starts closed, 149 kept', async () => {
    await openMenu(s); await press(s, '#drawerSqnBtn'); await shade(s); await shade(s)
    const a = await state(s); check('menu closed after two presses outside', !a.drawerOpen, { open: a.drawerOpen })
    await openMenu(s, P('12', 'reopen')); const b = await state(s); await pic(s, P('12', 'reopened'))
    check('reopened: list closed, 149 · View only, two pages', !b.dList && b.dLine === '149 · View only' && b.items.length === 2, { list: b.dList, line: b.dLine, items: b.items })
    await shutMenu(s)
  })
  await s.ctx.close()
} finally { finish('r-shade-' + SZ); await stop() }
