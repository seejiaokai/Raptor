// h4 - the check lead's reproduction of walker C's F1: Saber makes Hunter (who holds Plan of 149) a Member by the Role box
// alone; what does the Undo say, and what does it put back? Run on fcca051f0 and on the build from before tonight.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, admCat, openRow, lineBtn, grant, note, facts } from './jlib.mjs'
const RUN = process.env.RUN || 'now'
const SZ = process.env.SZ || 'd'
console.log('h4-undoplan v1', RUN, SZ, process.env.MQ_PORT)
picsFor(`h4-${RUN}-${SZ}`)
const tap = (s, l) => s.desk ? l.click() : l.tap()
const bubble = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && t.getBoundingClientRect().height > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : null })
const planLine = async s => s.page.locator(lineBtn('149', 'plan')).getAttribute('aria-pressed')
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('Plan given, then the Role box alone', async () => {
    await grant(s, 'prowler', '149', 'plan')
    await admCat(s, 'Users'); await openRow(s, 'prowler')
    facts.before = { role: await page.inputValue('#accEdRole'), plan: await planLine(s) }
    await page.selectOption('#accEdRole', 'main'); await page.waitForTimeout(150)
    await tap(s, page.locator('#accEdSave')); await page.waitForTimeout(500)
    if (await page.locator('#dlgOk').filter({ visible: true }).count()) { note('a question:', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(500) }
    await page.waitForTimeout(2600)
    const undo = page.locator('#undoBtn').filter({ visible: true }).first()
    facts.hover = await undo.getAttribute('title')
    await tap(s, undo); await page.waitForTimeout(250)
    facts.bubble = await bubble(s)
    await pic(s, '01-undid')
    await page.waitForTimeout(700)
    await openRow(s, 'prowler')
    facts.after = { role: await page.inputValue('#accEdRole'), plan: await planLine(s) }
    await pic(s, '02-row-after-undo', ['[data-testid="acc-sq"]', '#accEdRole'], 16)
    note(JSON.stringify({ before: facts.before, hover: facts.hover, bubble: facts.bubble, after: facts.after }))
  })
  await s.ctx.close()
} finally { finish(`h4-${RUN}-${SZ}`); await closeAll() }
