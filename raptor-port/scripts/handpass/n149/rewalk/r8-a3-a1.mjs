// Re-walk round 2 — A3 and A1, as Saber, by presses.
//  A3: "+ New squadron" 150; Admin → Data; Undo: Admin → Squadrons, 150 gone; Redo: still Squadrons, 150 back. Edit
//      Schedule; Undo: Admin → Squadrons, 150 gone. An account change (Ranger View of 149): its Undo from Squadrons, and
//      from Edit Schedule, lands on Users.
//  A1 (no one-browser screen path for the fault itself — two master admins in turn): an ordinary Undo / Redo of giving
//      Plan of 149 to Hunter, and of taking it away, still works.
import { serve, stop, newPage, signIn, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText } from '../walk/w1-view.mjs'
import { step, press, pageOn, adminPanel, sqRows, shot, vis } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const where = async s => ({ page: await pageOn(s), panel: await adminPanel(s), squadronsInSight: await vis(s, '#sqList'), usersInSight: await vis(s, '#accFind'), dataInSight: await vis(s, '#page-admin .adm-data, #page-admin [data-panel="data"]'), rows: await sqRows(s) })
const l149 = s => s.page.evaluate(() => [...document.querySelectorAll('[aria-label="Access to 149"] button')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()))
async function hunter149(s) { await adminCat(s, 'Users'); await openRow(s, 'prowler'); const v = await l149(s); await press(s, '#accEdCancel'); return v }
async function undoRedo(s, which, P, tag) {
  await press(s, which === 'undo' ? '#undoBtn:visible' : '#redoBtn:visible', `${P}-${tag}`); await s.page.waitForTimeout(300)
  facts[`${P}-${tag}`] = { toast: await toastText(s), ...(await where(s)) }
  await shot(s, `${P}-${tag}.png`)
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r8-${sz}`
    await signIn(s, 'ad', 'a')
    await step('A3 make 150', async () => {
      await adminCat(s, 'Squadrons'); await press(s, '#sqNew')
      await s.page.fill('#sqNewNum', '150'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      await press(s, '#sqNewSave'); facts[`${P}-made`] = await where(s)
    })
    await step('A3 from Admin → Data', async () => {
      await adminCat(s, 'Data'); facts[`${P}-on-data`] = await where(s); await shot(s, `${P}-a3-0-on-data.png`)
      await undoRedo(s, 'undo', P, 'a3-1-undo-from-data')
      await undoRedo(s, 'redo', P, 'a3-2-redo')
    })
    await step('A3 from Edit Schedule', async () => {
      await navTo(s, 'Edit Schedule'); facts[`${P}-on-editsched`] = await pageOn(s)
      await undoRedo(s, 'undo', P, 'a3-3-undo-from-editsched')
      await undoRedo(s, 'redo', P, 'a3-4-redo-after')
    })
    await step('A3 an account Undo', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane'); await s.page.click(lineBtn('149', 'view')); await press(s, '#accEdSave')
      await adminCat(s, 'Squadrons')
      await undoRedo(s, 'undo', P, 'a3-5-acct-undo-from-squadrons')
      await undoRedo(s, 'redo', P, 'a3-6-acct-redo')
      await navTo(s, 'Edit Schedule')
      await undoRedo(s, 'undo', P, 'a3-7-acct-undo-from-editsched')
    })
    await step('A1 give Plan, Undo, Redo', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler'); await press(s, lineBtn('149', 'plan')); await press(s, '#accEdSave')
      facts[`${P}-a1-given`] = { toast: await toastText(s), l149: await hunter149(s) }
      await press(s, '#undoBtn:visible'); facts[`${P}-a1-undo`] = { toast: await toastText(s), l149: await hunter149(s) }
      await shot(s, `${P}-a1-1-after-undo-give.png`)
      await press(s, '#redoBtn:visible'); facts[`${P}-a1-redo`] = { toast: await toastText(s), l149: await hunter149(s) }
    })
    await step('A1 take Plan away, Undo, Redo', async () => {
      await openRow(s, 'prowler'); await press(s, lineBtn('149', 'none')); await press(s, '#accEdSave')
      facts[`${P}-a1-taken`] = { toast: await toastText(s), l149: await hunter149(s) }
      await press(s, '#undoBtn:visible'); facts[`${P}-a1-undo-take`] = { toast: await toastText(s), l149: await hunter149(s) }
      await openRow(s, 'prowler'); await shot(s, `${P}-a1-2-after-undo-take.png`, ['.acc-edit', '#toastEl']); await press(s, '#accEdCancel')
      await press(s, '#redoBtn:visible'); facts[`${P}-a1-redo-take`] = { toast: await toastText(s), l149: await hunter149(s) }
    })
    await s.ctx.close()
  }
} finally { save('r8'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
