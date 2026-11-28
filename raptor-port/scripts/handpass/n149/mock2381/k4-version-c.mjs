// D2381's mock-up, VERSION C of the ☰ menu (his idea after his look, 23 Nov 26): the menu opens with the TALON mark (the
// top bar's own), then B's squadron chips and grey line with no "SQUADRON" label, then MENU and ACCOUNT as today. One
// squadron: the mark alone. NO RINGS — he took B's cyan rings for part of the design, so every picture here is clean, as
// the built app would look. Phone (WebKit, iPhone 402 × 874, ×2, touch): c1 Ranger with 149 picked, c2 Ranger on 142,
// c3 Saber with eight squadrons (150–155 made by "+ New squadron"), c4 Ranger with one squadron, c5 B's b1 unringed.
import { serve, stop, signIn, pick, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn } from '../walk/w1-view.mjs'
import { step, as, press, vis, drawerOpen, drawerCloseOutside, drawerItems } from '../rewalk/rlib.mjs'
import { newPage } from '../morning/mlib.mjs'
import { shot, saveManifest, drawerViewOnly, schedRows, addSquadronChips, rowsToChips, addTalonMark, resetMock } from './klib.mjs'

const P = 'phone 402 × 874'
const clip = ['#drawer .drawer-panel > :first-child', '#drawerLogout']

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
}
/* C: the mark, then (two squadrons or more) the chips and the line, no label */
async function drawC(s, key, { viewOnly = false, one = false } = {}) {
  const chips = one ? null : rowsToChips(await schedRows(s))
  facts[`${key}-chips`] = chips && chips.map(c => `${c.num}${c.on ? '*' : ''} ${c.label}`)
  await drawerOpen(s)
  facts[`${key}-mark`] = await addTalonMark(s)
  if (chips) facts[`${key}-sizes`] = await addSquadronChips(s, chips, { head: false, top: '14px' })
  if (viewOnly) await drawerViewOnly(s)
  facts[`${key}-menu`] = await drawerItems(s)
}

await serve()
try {
  const s = await newPage('p')
  await signIn(s, 'us', 'us')
  await step('c4 one squadron', async () => {
    facts['c4-menuBtn'] = await vis(s, '#sqnMenuBtn')
    await drawC(s, 'c4', { one: true })
    await shot(s, 'c4-menu-one-squadron-proposed.png', { clip, when: 'proposed (C)', size: P,
      what: 'Version C, Ranger before he had View, one squadron: the menu opens with the TALON mark alone ("142" above TALON), no chips and no grey line; MENU and ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('saber gives Ranger View of 149', () => giveRangerView(s))
  await as(s, 'us', 'us')
  await step('c2 on 142', async () => {
    await drawC(s, 'c2')
    await shot(s, 'c2-menu-home-142-proposed.png', { clip, when: 'proposed (C)', size: P,
      what: 'Version C, Ranger on 142: the TALON mark ("142"), the chips 142 "on" and 149 off, the grey line "142 · Your squadron"; the full MENU and ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await step('c1 and c5, 149 picked', async () => {
    await pick(s, '149'); await navTo(s, 'View-only Sched')
    await drawC(s, 'c1', { viewOnly: true })
    await shot(s, 'c1-menu-149-proposed.png', { clip, when: 'proposed (C)', size: P,
      what: 'Version C, Ranger with 149 picked: the TALON mark ("149"), the chips 142 off and 149 "on", the grey line "149 · View only"; MENU with only View-only Sched and Help; ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
    const chips = rowsToChips(await schedRows(s))
    await drawerOpen(s); await addSquadronChips(s, chips); await drawerViewOnly(s)
    await shot(s, 'c5-menu-149-version-b-unringed.png', { clip, when: 'proposed (B, for comparison)', size: P,
      what: 'Version B\'s b1 again with no rings, to set beside c1: SQUADRON, the chips 142 off and 149 "on", the grey line "149 · View only"; MENU with only View-only Sched and Help; ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await as(s, 'ad', 'a')
  await step('c3 Saber eight', async () => {
    await adminCat(s, 'Squadrons')
    for (let n = 150; n <= 155; n++) await makeSquadron(s, n)
    facts['c3-sqlist'] = (await s.page.evaluate(() => document.querySelectorAll('#sqList [data-unit]').length))
    await navTo(s, 'View-only Sched')
    await drawC(s, 'c3')
    facts['c3-row'] = await s.page.evaluate(() => { const r = document.querySelector('.mk-sqchips'); return { client: r.clientWidth, scroll: r.scrollWidth, h: r.getBoundingClientRect().height } })
    await shot(s, 'c3-menu-saber-eight-proposed.png', { clip, when: 'proposed (C)', size: P,
      what: 'Version C for Saber, a master admin, with eight squadrons (142, 149, 150 to 155): the TALON mark ("142"), the chips in one row cut off at the menu\'s edge, sliding sideways, never wrapping; 142 "on", the line "142 · Your squadron"; MENU and ACCOUNT as today.' })
    await resetMock(s); await drawerCloseOutside(s)
  })
  await s.ctx.close()
} finally { saveManifest('k4'); save('k4'); await stop() }
console.log(JSON.stringify(Object.fromEntries(Object.entries(facts).filter(([k]) => !k.endsWith('.png'))), null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
