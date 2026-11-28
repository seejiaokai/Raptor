// n1 — narrow desktop (Chromium 820 × 864, where the page names fold into ☰): Astra's scenarios 12, 15, 21 (Hunter, View
// of 149), 16 and 22 (Ranger, View of 149). Keyboard steps press real keys. World: fresh demo data; Saber gives the rights.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
console.log('n1-narrow v1')
picsFor('n1')
const focusNow = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); const b = a.getBoundingClientRect(); return { el: `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.dataset.page ? '[' + a.dataset.page + ']' : ''}${a.dataset.unit ? '[' + a.dataset.unit + ']' : ''}`, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, shadow: cs.boxShadow.slice(0, 60), visible: a.matches(':focus-visible'), top: Math.round(b.top) } })
async function tabSeq(s, n, shift = false) {
  const seq = []
  for (let i = 0; i < n; i++) { await s.page.keyboard.press(shift ? 'Shift+Tab' : 'Tab'); await s.page.waitForTimeout(40); seq.push((await focusNow(s))?.el) }
  return seq
}
async function toBurgerByKeys(s) {
  await s.page.evaluate(() => { document.activeElement && document.activeElement.blur() })
  for (let i = 0; i < 12; i++) { await s.page.keyboard.press('Tab'); await s.page.waitForTimeout(30); if ((await focusNow(s))?.el === 'button#burger') return true }
  return false
}
await serve()
try {
  const s = await newPage('n')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'bane', '149', 'view'); await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('S12 View holder cannot promote himself', async () => {
    await barPick(s, '149'); await openMenu(s); await rec(s, 's12-a-admin-view'); await pic(s, 's12-01-admin-view-menu')
    await closeMenuOutside(s)
    const badge = page.locator('#roleBadge').filter({ visible: true })
    facts['s12-route'] = (await badge.count()) ? 'badge' : 'menu'
    if (await badge.count()) await press(s, badge.first()); else { await openMenu(s); await press(s, '#drawerRole') }
    await openMenu(s); await rec(s, 's12-b-member-view'); await pic(s, 's12-02-member-view-menu'); await closeMenuOutside(s)
    if (await page.locator('#roleBadge').filter({ visible: true }).count()) await press(s, '#roleBadge'); else { await openMenu(s); await press(s, '#drawerRole') }
    await openMenu(s); await rec(s, 's12-c-admin-again'); await pic(s, 's12-03-admin-again-menu'); await closeMenuOutside(s)
    await barPick(s, '142')
  })
  await step('S15 keyboard opening and selection', async () => {
    facts['s15-a-burger-reached'] = await toBurgerByKeys(s)
    await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    facts['s15-b-focus-after-open'] = await focusNow(s)
    facts['s15-c-shift-tab'] = await tabSeq(s, 1, true)
    facts['s15-c-focus-on-mark'] = await focusNow(s); await pic(s, 's15-01-focus-on-mark')
    for (const k of ['Enter', 'Space', 'ArrowDown']) {
      await page.keyboard.press(k); await page.waitForTimeout(350)
      facts[`s15-d-${k}`] = { list: (await state(s)).dList, focus: await focusNow(s) }
      note(`s15 ${k}:`, JSON.stringify(facts[`s15-d-${k}`]))
      if (k === 'Enter') await pic(s, 's15-02-list-by-enter')
      if ((await state(s)).dList) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
      if (!(await state(s)).drawerOpen) { await openMenu(s); await page.locator('#drawerSqnBtn').focus() }
      facts[`s15-e-after-esc-${k}`] = (await focusNow(s))?.el
    }
    await page.locator('#drawerSqnBtn').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(350)
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200)
    facts['s15-f-moved'] = { focus: await focusNow(s), mark: (await state(s)).dMark, line: (await state(s)).dLine }
    await pic(s, 's15-03-focus-moved-149')
    await page.keyboard.press('Enter'); await page.waitForTimeout(600)
    await rec(s, 's15-g-after-enter'); facts['s15-g-focus'] = await focusNow(s); await pic(s, 's15-04-after-enter')
    await closeMenuOutside(s); await barPick(s, '142')
  })
  await step('S21 fold and unfold', async () => {
    await page.setViewportSize({ width: 1536, height: 864 }); await page.waitForTimeout(500)
    await barPick(s, '149'); await rec(s, 's21-a-1536-149'); await pic(s, 's21-01-1536-149', ['.topbar'])
    await page.setViewportSize({ width: 820, height: 864 }); await page.waitForTimeout(500)
    await rec(s, 's21-b-820-149'); await openMenu(s); await rec(s, 's21-c-820-menu'); await pic(s, 's21-02-820-menu-149')
    await menuPick(s, '142'); await rec(s, 's21-d-820-home'); await closeMenuOutside(s)
    await page.setViewportSize({ width: 1536, height: 864 }); await page.waitForTimeout(500)
    await rec(s, 's21-e-1536-home'); await pic(s, 's21-03-1536-home', ['.topbar'])
    await page.setViewportSize({ width: 820, height: 864 }); await page.waitForTimeout(500)
    await menuPick(s, '149'); await rec(s, 's21-f-820-pick149'); await closeMenuOutside(s)
    await page.setViewportSize({ width: 1536, height: 864 }); await page.waitForTimeout(500)
    await rec(s, 's21-g-1536-after-narrow-pick'); await pic(s, 's21-04-1536-after-narrow-pick', ['.topbar'])
    await barPick(s, '142')
    await page.setViewportSize({ width: 820, height: 864 }); await page.waitForTimeout(500)
  })
  await as(s, 'us', 'us')
  await step('S16 Escape closes one layer', async () => {
    await barPick(s, '149'); const before = await state(s)
    facts['s16-a-burger'] = await toBurgerByKeys(s)
    await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(100)
    await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    await rec(s, 's16-b-list-open'); facts['s16-b-focus'] = await focusNow(s); await pic(s, 's16-01-list-open-by-keys')
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    await rec(s, 's16-c-esc1'); facts['s16-c-focus'] = await focusNow(s); await pic(s, 's16-02-after-esc1')
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    await rec(s, 's16-d-esc2'); facts['s16-d-focus'] = await focusNow(s); await pic(s, 's16-03-after-esc2')
    facts['s16-e-before'] = { mark: before.barMark, page: before.page }
  })
  await step('S22 narrow keyboard route', async () => {
    await page.evaluate(() => document.activeElement && document.activeElement.blur())
    facts['s22n-a-bar-149'] = await tabSeq(s, 14)
    await toBurgerByKeys(s); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    facts['s22n-b-menu-149'] = await tabSeq(s, 8)
    note(JSON.stringify(facts['s22n-a-bar-149']), JSON.stringify(facts['s22n-b-menu-149']))
    await pic(s, 's22n-01-menu-149-keys')
    const help = page.locator('#drawerNav a[data-page="help"]'); await help.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
    await rec(s, 's22n-c-help-by-enter')
    await openMenu(s); await menuPick(s, '142'); await closeMenuOutside(s)
    await page.evaluate(() => document.activeElement && document.activeElement.blur())
    await toBurgerByKeys(s); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    facts['s22n-d-menu-142'] = await tabSeq(s, 10)
    note(JSON.stringify(facts['s22n-d-menu-142']))
    const inp = page.locator('#drawerNav a[data-page="inputs"]'); await inp.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
    await rec(s, 's22n-e-inputs-by-enter')
  })
  await s.ctx.close()
} finally { finish('n1'); await stop() }
