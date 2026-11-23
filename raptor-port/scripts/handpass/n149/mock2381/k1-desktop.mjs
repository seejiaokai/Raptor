// D2381's mock-up — desktop pictures (Chromium, ×2): Ranger with one squadron (item 5), Saber giving Ranger and Hunter
// View of 149 by presses (Admin → Users), Ranger's and Hunter's top bar with 149 picked, today and proposed (item 1), the
// ☰ menu at 820 wide (item 6), the roles table's View column, today and proposed (item 7).
import { serve, stop, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis } from '../rewalk/rlib.mjs'
import { newPage } from '../morning/mlib.mjs'
import { shot, saveManifest, barViewOnly, drawerViewOnly, schedRows, addSquadronSection, rolesCell, resetMock } from './klib.mjs'

const BAR = '.topbar'
const D = 'desktop 1536 × 864'
const ROLES = ['[data-testid="acc-roles"] summary', '[data-testid="acc-roles"] .acc-rt-notes']
const drawerClip = ['#drawer .drawer-panel > h4', '#drawerLogout']
const tabsNow = s => s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page]')].filter(a => a.getBoundingClientRect().width > 0).map(a => a.textContent.trim()))

await serve()
try {
  const s = await newPage('d')
  await signIn(s, 'us', 'us')
  await step('item 5 one squadron', async () => {
    facts['5-d-menuBtn'] = await vis(s, '#sqnMenuBtn')
    facts['5-d-mark'] = await s.page.evaluate(() => { const m = document.querySelector('.topbar .mark'); return m ? m.textContent.replace(/\s+/g, ' ').trim() : null })
    await shot(s, '5a-one-squadron-topbar-desktop.png', { clip: ['.topbar .mark', '#topnav'], pad: 10, when: 'today (proposed the same)', size: D,
      what: 'Ranger, a member of 142 with no other squadron: the top bar shows "142" with no ▾, so there is no Schedules menu for him.' })
  })
  await as(s, 'ad', 'a')
  await step('saber gives View of 149', async () => {
    await adminCat(s, 'Users')
    for (const pid of ['bane', 'prowler']) {
      await openRow(s, pid)
      facts[`grant-${pid}-before`] = await s.page.evaluate(() => [...document.querySelectorAll('[aria-label="Access to 149"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed')}`))
      if ((await s.page.locator(lineBtn('149', 'view')).getAttribute('aria-pressed')) !== 'true') await press(s, lineBtn('149', 'view'))
      await press(s, '#accEdSave'); await s.page.waitForTimeout(500)
      facts[`grant-${pid}-toast`] = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? t.textContent.trim() : null })
    }
  })
  await as(s, 'us', 'us')
  await step('item 1 Ranger 149', async () => {
    facts['1-ranger-home-tabs'] = await tabsNow(s)
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    facts['1-ranger-149-tabs-today'] = await tabsNow(s)
    facts['1-ranger-149-mark'] = await s.page.evaluate(() => document.querySelector('#sqnMenuBtn')?.textContent.trim())
    await shot(s, '1a-ranger-149-topbar-today.png', { clip: [BAR], pad: 0, when: 'today', size: D,
      what: 'Ranger (member of 142, View of 149) with 149 picked: the top bar today offers View-only Sched, Inputs, Quals, Logic, Leave War, Tracker and Help.' })
    await barViewOnly(s); await s.page.waitForTimeout(400)
    facts['1-ranger-149-tabs-proposed'] = await tabsNow(s)
    await shot(s, '1b-ranger-149-topbar-proposed.png', { rings: [['#topnav']], clip: [BAR], pad: 0, when: 'proposed', size: D,
      what: 'The same, proposed: only View-only Sched and Help (ringed); "149 ▾" and the right side (bell, Insights, Logout, name badge) as today.' })
  })
  await step('item 6 at 820', async () => {
    await s.page.evaluate(() => document.querySelectorAll('#topnav a[data-page]').forEach(a => { a.style.display = '' }))   // today's bar back
    facts['6-mark'] = await s.page.evaluate(() => document.querySelector('#sqnMenuBtn')?.textContent.trim())
    await s.page.setViewportSize({ width: 820, height: 864 }); await s.page.waitForTimeout(700)
    facts['6-burger'] = await vis(s, '#burger')
    await press(s, '#burger'); await s.page.waitForTimeout(400)
    facts['6-drawer-today'] = await s.page.evaluate(() => [...document.querySelectorAll('#drawerNav a')].filter(a => a.getBoundingClientRect().height > 0).map(a => a.textContent.trim()))
    await shot(s, '6a-820-menu-149-today.png', { clip: drawerClip, when: 'today', size: 'desktop 820 × 864',
      what: 'A desktop 820 wide, where the page names fold into ☰: Ranger\'s ☰ menu with 149 picked, today — MENU lists View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help; then ACCOUNT.' })
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
    const rows = await schedRows(s)
    facts['6-sched-rows'] = rows.length
    await press(s, '#burger'); await s.page.waitForTimeout(400)
    await addSquadronSection(s, { num: '149', label: 'View only' }); await drawerViewOnly(s)
    await shot(s, '6b-820-menu-149-proposed.png', { rings: [['.mk-sqh', '.mk-sqrow'], ['#drawerNav']], clip: drawerClip, when: 'proposed', size: 'desktop 820 × 864',
      what: 'The same at 820, proposed: a new first section SQUADRON — "149", grey "View only", ▾ (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today.' })
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); await resetMock(s)
    await s.page.setViewportSize({ width: 1536, height: 864 }); await s.page.waitForTimeout(600)
  })
  await as(s, 'ad2', 'a2')
  await step('item 1 Hunter 149', async () => {
    facts['1-hunter-home-tabs'] = await tabsNow(s)
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    facts['1-hunter-149-tabs-today'] = await tabsNow(s)
    await shot(s, '1c-hunter-149-topbar-today.png', { clip: [BAR], pad: 0, when: 'today', size: D,
      what: 'Hunter (admin of 142, View of 149) with 149 picked: the top bar today offers View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help and Admin.' })
    await barViewOnly(s); await s.page.waitForTimeout(400)
    facts['1-hunter-149-tabs-proposed'] = await tabsNow(s)
    await shot(s, '1d-hunter-149-topbar-proposed.png', { rings: [['#topnav']], clip: [BAR], pad: 0, when: 'proposed', size: D,
      what: 'The same, proposed: only View-only Sched and Help (ringed), his Admin tab gone too; the right side as today.' })
  })
  await as(s, 'ad', 'a')
  await step('item 7 roles table', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'bane')
    await s.page.locator('[data-testid="acc-roles"] summary').click(); await s.page.waitForTimeout(400)
    await s.page.evaluate(() => document.querySelector('[data-testid="acc-roles"]').scrollIntoView({ block: 'center' })); await s.page.waitForTimeout(300)
    facts['7-rows'] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-roles"] tbody tr')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
    await shot(s, '7a-roles-table-today.png', { clip: ROLES, pad: 8, when: 'today', size: D,
      what: 'Admin → Users, Ranger\'s opened row, "What each role allows" (as Saber), today: the View column reads "read" for View-only Sched and Logic, "—" for every other page.' })
    facts['7-changed'] = await rolesCell(s, 'logic', 'view', '—')
    await shot(s, '7b-roles-table-proposed.png', { rings: [['[data-testid="acc-roles"] tr[data-page="logic"] td[data-role="view"]']], clip: ROLES, pad: 8, when: 'proposed', size: D,
      what: 'The same, proposed: Logic\'s View cell becomes "—" (ringed); View-only Sched stays "read", every other page "—". Help is not a row of the table, so nothing else changes.' })
  })
  await s.ctx.close()
} finally { saveManifest('k1'); save('k1'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
