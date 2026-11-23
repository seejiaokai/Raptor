// D2381's mock-up, VERSION B of the ☰ menu's SQUADRON section (the owner asked for a better design, 23 Nov 26): a row of
// the bell's Show-row chips, the one in view "on", and one grey line naming the access in view. One tap picks; the menu
// stays open and its MENU list follows at once. Phone (WebKit, iPhone 402 × 874, ×2, touch): Ranger with 149 picked (b1),
// just after tapping 142 (b2), at home on 142 (b3), Saber with eight squadrons made by "+ New squadron" (b4); desktop
// (Chromium 1536, ×2): Ranger's top bar with 149 picked, B's the same as A's (b5).
// b2 is drawn as the app stands after the pick: 142 picked by the Schedules menu with the side menu shut, the side menu
// opened again and B's row drawn with 142 "on" — the injected chips cannot pick by themselves.
import { serve, stop, signIn, pick, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis, drawerOpen, drawerCloseOutside, drawerItems } from '../rewalk/rlib.mjs'
import { newPage } from '../morning/mlib.mjs'
import { shot, saveManifest, barViewOnly, drawerViewOnly, schedRows, addSquadronChips, rowsToChips, resetMock } from './klib.mjs'

const P = 'phone 402 × 874'
const drawerClip = ['#drawer .drawer-panel > h4', '#drawerLogout']
const B = [['.mk-sqh', '.mk-sqchips', '.mk-sqline']]

async function giveRangerView(s) {
  await adminCat(s, 'Users'); await openRow(s, 'bane')
  if ((await s.page.locator(lineBtn('149', 'view')).getAttribute('aria-pressed')) !== 'true') await press(s, lineBtn('149', 'view'))
  await press(s, '#accEdSave'); await s.page.waitForTimeout(500)
}
async function makeSquadron(s, num) {
  const { page } = s
  if (!(await vis(s, '#sqNew'))) await adminCat(s, 'Squadrons')
  await press(s, '#sqNew')
  await page.fill('#sqNewNum', String(num))
  await page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' }).catch(() => {})
  await press(s, '#sqNewSave'); await page.waitForTimeout(500)
  return page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? t.textContent.trim() : null })
}
/* the side menu with B's row, the chips read from the Schedules menu as it stands */
async function drawB(s, key, viewOnly) {
  const chips = rowsToChips(await schedRows(s))
  facts[`${key}-chips`] = chips
  await drawerOpen(s)
  facts[`${key}-sizes`] = await addSquadronChips(s, chips)
  if (viewOnly) await drawerViewOnly(s)
  facts[`${key}-menu`] = await drawerItems(s)
}

await serve()
try {
  const s = await newPage('p')
  await signIn(s, 'ad', 'a')
  await step('saber gives Ranger View of 149', () => giveRangerView(s))
  await as(s, 'us', 'us')
  await step('b3 home 142', async () => {
    await drawB(s, 'b3', false)
    await shot(s, 'b3-menu-home-142-chips-proposed.png', { rings: B, clip: drawerClip, when: 'proposed (B)', size: P,
      what: 'Version B, Ranger at home on 142: SQUADRON with two chips, 142 "on" and 149 off, and the grey line "142 · Your squadron" (ringed); the full MENU as today. Beside A\'s 3b.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await step('b1 149 picked', async () => {
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    await drawB(s, 'b1', true)
    await shot(s, 'b1-menu-149-chips-proposed.png', { rings: [...B, ['#drawerNav']], clip: drawerClip, when: 'proposed (B)', size: P,
      what: 'Version B, Ranger with 149 picked: chips 142 off and 149 "on", the grey line "149 · View only" (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today. Beside A\'s 2b.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await step('b2 just after tapping 142', async () => {
    await pick(s, '142')
    await drawB(s, 'b2', false)
    await shot(s, 'b2-menu-after-tapping-142-proposed.png', { rings: [...B, ['#drawerNav']], clip: drawerClip, when: 'proposed (B)', size: P,
      what: 'Version B, just after one tap on the 142 chip: the menu stays open, 142 now "on", the line "142 · Your squadron", and every page back in MENU at once (ringed). In A this took two taps and closed the menu.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('b4 Saber eight squadrons', async () => {
    await adminCat(s, 'Squadrons')
    for (let n = 150; n <= 155; n++) facts[`made-${n}`] = await makeSquadron(s, n)
    facts['b4-sqlist'] = await s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.getAttribute('data-unit')))
    await navTo(s, 'View-only Sched')
    await drawB(s, 'b4', false)
    facts['b4-row'] = await s.page.evaluate(() => { const r = document.querySelector('.mk-sqchips'); return { client: r.clientWidth, scroll: r.scrollWidth, wraps: r.getBoundingClientRect().height } })
    await shot(s, 'b4-menu-saber-eight-chips-proposed.png', { rings: B, clip: drawerClip, when: 'proposed (B)', size: P,
      what: 'Version B for Saber, a master admin, with eight squadrons (142, 149 and 150–155, made by "+ New squadron"): the chips stay one row, cut off at the menu\'s edge and sliding sideways, never wrapping; 142 "on", the line "142 · Your squadron" (ringed).' })
    await s.page.evaluate(() => { document.querySelector('.mk-sqchips').scrollLeft = 1000 }); await s.page.waitForTimeout(200)
    await shot(s, 'b4b-menu-saber-eight-chips-slid-proposed.png', { rings: B, clip: drawerClip, when: 'proposed (B)', size: P,
      what: 'The same row slid to its end: 152 to 155 come into view; the line still names the squadron in view.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await s.ctx.close()

  const d = await newPage('d')
  await signIn(d, 'ad', 'a')
  await step('desktop: saber gives Ranger View of 149', () => giveRangerView(d))
  await as(d, 'us', 'us')
  await step('b5 desktop bar', async () => {
    await pick(d, '149'); await navTo(d, 'View-only Sched')
    await barViewOnly(d); await d.page.waitForTimeout(400)
    await shot(d, 'b5-ranger-149-topbar-proposed.png', { rings: [['#topnav']], clip: ['.topbar'], pad: 0, when: 'proposed (B, the same as A)', size: 'desktop 1536 × 864',
      what: 'Version B on a desktop, Ranger with 149 picked: the same top bar as A (1b) — "149 ▾" at the top left still picks the squadron; only View-only Sched and Help (ringed).' })
  })
  await d.ctx.close()
} finally { saveManifest('k3'); save('k3'); await stop() }
console.log(JSON.stringify(Object.fromEntries(Object.entries(facts).filter(([k]) => !k.endsWith('.png'))), null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
