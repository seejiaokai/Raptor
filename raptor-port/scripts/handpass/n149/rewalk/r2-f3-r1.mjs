// Re-walk F3 and R1 — Admin → Squadrons and the bell's Show row, as Saber.
//  F3: "+ New squadron" 150 (first admin Hunter) → Save; Undo: still on Squadrons, 150 gone; Redo: still on Squadrons, 150
//      back. Then an account change (Ranger given View of 149 on Users), Squadrons opened, Undo: lands on Users.
//  R1: with 150 standing, the bell's Show row: 150 pressed on; the new squadron undone; 149 pressed: it switches, and back;
//      a reload: the choice holds.
import { serve, stop, newPage, signIn, note, save, errs, facts } from '../walk/lib.mjs'
import { adminCat, openRow, lineBtn, toastText, undo, redo, bellOpen, bellClose } from '../walk/w1-view.mjs'
import { step, press, adminPanel, sqRows, bellChips, pageOn, shot, vis } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const where = async s => ({ page: await pageOn(s), panel: await adminPanel(s), squadronsInSight: await vis(s, '#sqList'), usersInSight: await vis(s, '[data-person]'), rows: await sqRows(s) })

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r2-${sz}`
    await signIn(s, 'ad', 'a')
    await step('F3 make 150', async () => {
      await adminCat(s, 'Squadrons')
      await press(s, '#sqNew', `${P}-01-new`)
      await s.page.fill('#sqNewNum', '150'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      await shot(s, `${P}-01-new150-form.png`, ['[data-new-sqn]', '#sqNewSave'])
      await press(s, '#sqNewSave', `${P}-02-save`); await s.page.waitForTimeout(400)
      facts[`${P}-made-toast`] = await toastText(s); facts[`${P}-made`] = await where(s)
      await shot(s, `${P}-02-made-150.png`)
    })
    await step('F3 undo', async () => {
      facts[`${P}-undo-title`] = await s.page.evaluate(() => document.querySelector('#undoBtn')?.title || null)
      await press(s, '#undoBtn:visible', `${P}-03-undo`); await s.page.waitForTimeout(300)
      facts[`${P}-undo-toast`] = await toastText(s); facts[`${P}-after-undo`] = await where(s)
      await shot(s, `${P}-03-after-undo.png`)
    })
    await step('F3 redo', async () => {
      await press(s, '#redoBtn:visible', `${P}-04-redo`); await s.page.waitForTimeout(300)
      facts[`${P}-redo-toast`] = await toastText(s); facts[`${P}-after-redo`] = await where(s)
      await shot(s, `${P}-04-after-redo.png`)
    })
    await step('R1 bell: 150 on', async () => {
      await bellOpen(s); facts[`${P}-chips0`] = await bellChips(s)
      await shot(s, `${P}-05-bell-before.png`, ['[data-testid="bell-list"]'])
      await press(s, '[data-testid="bell-show"] .fchip:text-is("150")', `${P}-06-bell-150`)
      facts[`${P}-chips-150on`] = await bellChips(s)
      await shot(s, `${P}-06-bell-150-on.png`, ['[data-testid="bell-list"]'])
      await bellClose(s)
    })
    await step('R1 undo the new squadron', async () => {
      facts[`${P}-r1-undo-title`] = await s.page.evaluate(() => document.querySelector('#undoBtn')?.title || null)
      await press(s, '#undoBtn:visible'); await s.page.waitForTimeout(300)
      facts[`${P}-r1-undo-toast`] = await toastText(s); facts[`${P}-r1-after-undo`] = await where(s)
      await shot(s, `${P}-07-after-undo-150.png`)
    })
    await step('R1 bell: 149 switches and back', async () => {
      await bellOpen(s); facts[`${P}-chips-after-undo`] = await bellChips(s)
      await press(s, '[data-testid="bell-show"] .fchip:text-is("149")', `${P}-08-bell-149`)
      facts[`${P}-chips-149-1`] = await bellChips(s); facts[`${P}-toast-149-1`] = await toastText(s)
      await shot(s, `${P}-08-bell-149-pressed.png`, ['[data-testid="bell-list"]'])
      await press(s, '[data-testid="bell-show"] .fchip:text-is("149")', `${P}-09-bell-149-back`)
      facts[`${P}-chips-149-2`] = await bellChips(s)
      await shot(s, `${P}-09-bell-149-back.png`, ['[data-testid="bell-list"]'])
      await press(s, '[data-testid="bell-show"] .fchip:text-is("149")')   // on, to see it held after the reload
      facts[`${P}-chips-149-3`] = await bellChips(s)
      await bellClose(s)
    })
    await step('R1 reload holds', async () => {
      await s.page.reload(); await s.page.waitForTimeout(2500)
      facts[`${P}-after-reload-signin-card`] = await vis(s, '#luser')
      if (facts[`${P}-after-reload-signin-card`]) await signIn(s, 'ad', 'a')   // a reload asks for the sign-in again
      await bellOpen(s); facts[`${P}-chips-after-reload`] = await bellChips(s)
      await shot(s, `${P}-10-bell-after-reload.png`, ['[data-testid="bell-list"]'])
      await press(s, '[data-testid="bell-show"] .fchip:text-is("149")'); facts[`${P}-chips-149-off-again`] = await bellChips(s)
      await bellClose(s)
    })
    await step('F3 an account Undo lands on Users', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane')
      await s.page.click(lineBtn('149', 'view')); await press(s, '#accEdSave'); facts[`${P}-acct-toast`] = await toastText(s)
      await adminCat(s, 'Squadrons'); facts[`${P}-acct-before-undo`] = await where(s)
      await press(s, '#undoBtn:visible', `${P}-11-acct-undo`); await s.page.waitForTimeout(300)
      facts[`${P}-acct-undo-toast`] = await toastText(s); facts[`${P}-acct-after-undo`] = await where(s)
      await shot(s, `${P}-11-acct-undo-lands-users.png`)
    })
    await s.ctx.close()
  }
} finally { save('r2'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
