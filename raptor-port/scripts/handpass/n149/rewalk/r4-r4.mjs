// Re-walk R4 — Admin → Users' one Save is one change, as Saber on Hunter's row:
//  (a) 149 → Plan and his sign-in changed to "us" (Ranger's, taken), Save: refused, nothing saved — Cancel, the row opened
//      again: no Plan of 149, his sign-in as it was.
//  (b) 149 → Plan and a free new sign-in, Save: both saved. One Undo takes back both; one Redo puts both back.
import { serve, stop, newPage, signIn, menuRows, note, save, errs, facts } from '../walk/lib.mjs'
import { adminCat, openRow, lineBtn, toastText } from '../walk/w1-view.mjs'
import { step, press, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const NEWNAME = 'hunter.r4@mail'
const row = s => s.page.evaluate(() => ({
  name: document.querySelector('#accEdName')?.value ?? null,
  role: document.querySelector('#accEdRole')?.value ?? null,
  l149: [...document.querySelectorAll('[aria-label="Access to 149"] button')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()),
  held: document.querySelector('[data-testid="acc-held-acad2"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
  notes: [...document.querySelectorAll('.acc-edit .adm-note, .acc-edit .od-err, .acc-edit [role=alert]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()),
}))
const listLine = s => s.page.evaluate(() => { const r = document.querySelector('[data-person="prowler"]'); return r ? r.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) : null })
async function reopen(s) { if (await vis(s, '#accEdCancel')) await press(s, '#accEdCancel'); await openRow(s, 'prowler'); return row(s) }

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r4-${sz}`
    await signIn(s, 'ad', 'a')
    await step('a: Plan + a taken sign-in', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      facts[`${P}-a0`] = await row(s)
      await press(s, lineBtn('149', 'plan'), `${P}-a1-plan`)
      await s.page.fill('#accEdName', 'us'); await s.page.waitForTimeout(200)
      facts[`${P}-a1-before-save`] = await row(s)
      await shot(s, `${P}-a1-plan-and-us.png`, ['.acc-edit'])
      await press(s, '#accEdSave', `${P}-a2-save`); await s.page.waitForTimeout(300)
      facts[`${P}-a2-toast`] = await toastText(s); facts[`${P}-a2-after-press`] = await row(s)
      facts[`${P}-a2-undo-title`] = await s.page.evaluate(() => document.querySelector('#undoBtn')?.title || null)
      await shot(s, `${P}-a2-refused.png`, ['.acc-edit', '#toastEl'])
      facts[`${P}-a3-reopened`] = await reopen(s)
      await shot(s, `${P}-a3-reopened.png`, ['.acc-edit'])
      facts[`${P}-a3-list-line`] = await listLine(s)
    })
    await step('b: Plan + a free sign-in', async () => {
      await press(s, lineBtn('149', 'plan'))
      await s.page.fill('#accEdName', NEWNAME); await s.page.waitForTimeout(200)
      facts[`${P}-b1-before-save`] = await row(s)
      await shot(s, `${P}-b1-plan-and-free.png`, ['.acc-edit'])
      await press(s, '#accEdSave', `${P}-b2-save`); await s.page.waitForTimeout(300)
      facts[`${P}-b2-toast`] = await toastText(s)
      facts[`${P}-b2-undo-title`] = await s.page.evaluate(() => document.querySelector('#undoBtn')?.title || null)
      facts[`${P}-b2-list-line`] = await listLine(s)
      facts[`${P}-b2-reopened`] = await reopen(s)
      await shot(s, `${P}-b2-saved-both.png`, ['.acc-edit'])
      await press(s, '#accEdCancel')
    })
    await step('b: one Undo, one Redo', async () => {
      await press(s, '#undoBtn:visible', `${P}-b3-undo`); await s.page.waitForTimeout(300)
      facts[`${P}-b3-undo-toast`] = await toastText(s)
      facts[`${P}-b3-redo-title`] = await s.page.evaluate(() => document.querySelector('#redoBtn')?.title || null)
      facts[`${P}-b3-undo-title-next`] = await s.page.evaluate(() => document.querySelector('#undoBtn')?.title || null)
      facts[`${P}-b3-list-line`] = await listLine(s)
      facts[`${P}-b3-after-undo`] = await reopen(s)
      await shot(s, `${P}-b3-after-one-undo.png`, ['.acc-edit'])
      await press(s, '#accEdCancel')
      await press(s, '#redoBtn:visible', `${P}-b4-redo`); await s.page.waitForTimeout(300)
      facts[`${P}-b4-redo-toast`] = await toastText(s)
      facts[`${P}-b4-list-line`] = await listLine(s)
      facts[`${P}-b4-after-redo`] = await reopen(s)
      await shot(s, `${P}-b4-after-one-redo.png`, ['.acc-edit'])
      await press(s, '#accEdCancel')
    })
    await step('b: the new sign-in works', async () => {
      await s.page.keyboard.press('Escape').catch(() => {})
      if (await s.page.locator('#logout:visible').count()) await s.page.click('#logout'); else { await s.page.click('#burger'); await s.page.waitForTimeout(300); await s.page.click('#drawerLogout') }
      await s.page.waitForSelector('#luser'); await s.page.waitForTimeout(400)
      await signIn(s, NEWNAME, 'a2')
      facts[`${P}-b5-hunter-in-as`] = await text(s, '#roleBadge')
      facts[`${P}-b5-menu`] = await menuRows(s)
      await shot(s, `${P}-b5-hunter-new-signin.png`)
    })
    await s.ctx.close()
  }
} finally { save('r4'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
