// D2381's mock-up — phone pictures (WebKit, iPhone 402 × 874, ×2, touch): Ranger with one squadron (item 5), Saber giving
// Ranger View of 149 by presses, Ranger's ☰ menu at home with 142 (item 3), with 149 picked (item 2), and with the
// SQUADRON row opened (item 4) — each today beside proposed where today exists.
import { serve, stop, signIn, pick, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis, drawerOpen, drawerCloseOutside, drawerItems } from '../rewalk/rlib.mjs'
import { newPage } from '../morning/mlib.mjs'
import { shot, saveManifest, drawerViewOnly, schedRows, addSquadronSection, resetMock } from './klib.mjs'

const P = 'phone 402 × 874'
const drawerClip = ['#drawer .drawer-panel > h4', '#drawerLogout']
const rowText = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

await serve()
try {
  const s = await newPage('p')
  await signIn(s, 'us', 'us')
  await step('item 5 one squadron, phone', async () => {
    facts['5-p-menuBtn'] = await vis(s, '#sqnMenuBtn')
    await shot(s, '5b-one-squadron-topbar-phone.png', { clip: ['#burger', '.topbar .mark'], pad: 10, when: 'today (proposed the same)', size: P,
      what: 'Ranger with one squadron on his phone: ☰ and "142" with no ▾ — no Schedules menu.' })
    await drawerOpen(s)
    facts['5-p-drawer'] = await drawerItems(s)
    await shot(s, '5c-one-squadron-menu-phone.png', { clip: drawerClip, when: 'today (proposed the same)', size: P,
      what: 'His ☰ menu: MENU then ACCOUNT, no SQUADRON section — with one squadron he gets no SQUADRON row, as the top bar gets no ▾.' })
    await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('saber gives Ranger View of 149', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'bane')
    if ((await s.page.locator(lineBtn('149', 'view')).getAttribute('aria-pressed')) !== 'true') await press(s, lineBtn('149', 'view'))
    await press(s, '#accEdSave'); await s.page.waitForTimeout(500)
    facts['grant-toast'] = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? t.textContent.trim() : null })
  })
  await as(s, 'us', 'us')
  await step('item 3 home 142', async () => {
    facts['3-mark'] = await s.page.evaluate(() => document.querySelector('#sqnMenuBtn')?.textContent.trim())
    facts['3-rows'] = (await schedRows(s)).map(rowText)
    await drawerOpen(s)
    facts['3-drawer-today'] = await drawerItems(s)
    await shot(s, '3a-menu-home-142-today.png', { clip: drawerClip, when: 'today', size: P,
      what: 'Ranger at home (142 picked, View of 149 too), his ☰ menu today: MENU with every page he has, then ACCOUNT.' })
    await addSquadronSection(s, { num: '142', label: 'Your squadron' })
    await shot(s, '3b-menu-home-142-proposed.png', { rings: [['.mk-sqh', '.mk-sqrow']], clip: drawerClip, when: 'proposed', size: P,
      what: 'The same, proposed: a new first section SQUADRON — "142", grey "Your squadron", ▾ (ringed); the full MENU as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await step('item 2 and 4, 149 picked', async () => {
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    facts['2-mark'] = await s.page.evaluate(() => document.querySelector('#sqnMenuBtn')?.textContent.trim())
    const rows = await schedRows(s)
    facts['2-rows'] = rows.map(rowText)
    await drawerOpen(s)
    facts['2-drawer-today'] = await drawerItems(s)
    await shot(s, '2a-menu-149-today.png', { clip: drawerClip, when: 'today', size: P,
      what: 'Ranger with 149 picked (View only), his ☰ menu today: MENU lists View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help; nothing says which squadron is in view.' })
    await addSquadronSection(s, { num: '149', label: 'View only' }); await drawerViewOnly(s)
    await shot(s, '2b-menu-149-proposed.png', { rings: [['.mk-sqh', '.mk-sqrow'], ['#drawerNav']], clip: drawerClip, when: 'proposed', size: P,
      what: 'The same, proposed: SQUADRON first — "149", grey "View only", ▾ (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today.' })
    await resetMock(s)
    await addSquadronSection(s, { num: '149', label: 'View only', open: true, rows }); await drawerViewOnly(s)
    await shot(s, '4a-menu-squadron-row-opened-proposed.png', { rings: [['.mk-sqh', '.mk-sqrow', '.mk-sqlist']], clip: drawerClip, when: 'proposed', size: P,
      what: 'The SQUADRON row pressed, proposed: it opens in place, inside the menu, its ▾ now ▴, and lists each squadron as the Schedules menu does — 142 "Your squadron", 149 ticked "View only" (ringed). Picking one closes the menu, as picking a page does.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await s.ctx.close()
} finally { saveManifest('k2'); save('k2'); await stop() }
console.log(JSON.stringify(Object.fromEntries(Object.entries(facts).filter(([k]) => !k.endsWith('.png'))), null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
