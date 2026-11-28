// Re-walk F1 — the ☰ menu's "Edit Schedule" follows the schedule in view. Saber gives Hunter View of 149 on Admin → Users
// (the row's View button, Save); Hunter signs in, picks 149 in the Schedules menu and opens ☰: no Edit Schedule, View-only
// Sched there; the desktop top bar the same; on a desktop narrow enough that the page names fold into ☰ (900 wide), ☰ the
// same. Then Hunter back on 142 (his own: Edit Schedule), Kestrel (admin of 149) and Saber with 149 picked: offered.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { adminCat, openRow, lineBtn, toastText } from '../walk/w1-view.mjs'
import { step, as, press, drawerOpen, drawerItems, drawerCloseOutside, barTabs, pageOn, shot, vis } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
async function look(s, P, tag) {
  if (s.desk) {
    facts[`${P}-${tag}-bar`] = await barTabs(s)
    await shot(s, `${P}-${tag}-bar.png`, ['#topnav', '#sqnMenuBtn'])
    // the same page on a narrower desktop window, where the page names fold into ☰ (the first of these widths that folds)
    for (const w of [900, 860, 820, 790, 770]) {
      await s.page.setViewportSize({ width: w, height: 864 }); await s.page.waitForTimeout(500)
      if (await vis(s, '#burger')) { facts[`${P}-${tag}-fold-width`] = w; break }
    }
    facts[`${P}-${tag}-900-burger`] = await vis(s, '#burger')
    if (facts[`${P}-${tag}-900-burger`]) {
      await drawerOpen(s); facts[`${P}-${tag}-900-drawer`] = await drawerItems(s)
      await shot(s, `${P}-${tag}-900-drawer.png`)
      facts[`${P}-${tag}-900-closed-by-shade`] = await drawerCloseOutside(s)
    }
    await s.page.setViewportSize({ width: 1536, height: 864 }); await s.page.waitForTimeout(500)
  } else {
    await drawerOpen(s, `${process.env.MQ_OUT ? '' : ''}${P}-${tag}-drawer`)
    facts[`${P}-${tag}-drawer`] = await drawerItems(s)
    await shot(s, `${P}-${tag}-drawer.png`)
  }
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r1-${sz}`
    await signIn(s, 'ad', 'a')
    await step('saber gives hunter View of 149', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(800)
      facts[`${P}-save-toast`] = await toastText(s)
    })
    await as(s, 'ad2', 'a2')
    await step('hunter, 149 picked (View only)', async () => {
      await pick(s, '149'); facts[`${P}-hunter149-mark`] = await s.page.evaluate(() => document.querySelector('#sqnMenuBtn:not([hidden])')?.textContent.trim() || null)
      await look(s, P, 'hunter149')
      if (!s.desk) {
        // the entry that is there: View-only Sched, pressed; the menu closes on the page
        const a = s.page.locator('#drawerNav a', { hasText: 'View-only Sched' })
        if (await a.count()) { await a.first().tap(); await s.page.waitForTimeout(60); await shot(s, `${P}-hunter149-viewonly-justtapped.png`); await s.page.waitForTimeout(500) }
        facts[`${P}-hunter149-after-tap-page`] = await pageOn(s); facts[`${P}-hunter149-drawer-open-after`] = await vis(s, '#drawer.open')
        await shot(s, `${P}-hunter149-viewonly.png`)
        // open again and close by the shade
        await drawerOpen(s); facts[`${P}-hunter149-closed-by-shade`] = await drawerCloseOutside(s)
      }
    })
    await step('hunter, 142 picked (his own)', async () => {
      await pick(s, '142'); await look(s, P, 'hunter142')
      if (!s.desk) facts[`${P}-hunter142-closed-by-shade`] = await drawerCloseOutside(s)
    })
    await as(s, 'ad9', 'a9')
    await step('kestrel (admin of 149)', async () => {
      await look(s, P, 'kestrel')
      if (!s.desk) {
        const a = s.page.locator('#drawerNav a', { hasText: 'Edit Schedule' })
        if (await a.count()) { await a.first().tap(); await s.page.waitForTimeout(60); await shot(s, `${P}-kestrel-edit-justtapped.png`); await s.page.waitForTimeout(600) }
        facts[`${P}-kestrel-after-tap-page`] = await pageOn(s)
        await shot(s, `${P}-kestrel-editsched.png`)
      }
    })
    await as(s, 'ad', 'a')
    await step('saber, 149 picked', async () => {
      await pick(s, '149'); await look(s, P, 'saber149')
      if (!s.desk) facts[`${P}-saber149-closed-by-shade`] = await drawerCloseOutside(s)
      await pick(s, '142')
    })
    await s.ctx.close()
  }
} finally { save('r1'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
