// h3 - the check lead's look at walker C's lead L1: a typed draft in an opened Admin -> Users row, the row then hidden by the
// search and shown again. Run on the build of fcca051f0 and on the build from before tonight (MQ_PORT, RUN).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, admCat, openRow, note, facts } from './jlib.mjs'
const SEARCH = '#page-admin input[placeholder^="Find a callsign"]'
const RUN = process.env.RUN || 'now'
console.log('h3-rowdraft v1', RUN, process.env.MQ_PORT)
picsFor('h3-' + RUN)
try {
  const s = await newPage('d'); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('draft, hide, show', async () => {
    await admCat(s, 'Users'); await openRow(s, 'prowler')
    const saved = await page.inputValue('#accEdName')
    await page.fill('#accEdName', 'h3draft'); await page.waitForTimeout(150)
    await pic(s, '01-typed', ['#accEdName'], 60)
    await page.fill(SEARCH, 'Forge'); await page.waitForTimeout(350)
    facts.hidden = await page.locator('#accEdName').count()
    await page.fill(SEARCH, ''); await page.waitForTimeout(350)
    const open = await page.locator('#accEdName').count()
    const after = open ? await page.inputValue('#accEdName') : null
    facts.result = { saved, typed: 'h3draft', editorWhileHidden: facts.hidden, openAfter: open, boxAfter: after }
    note(JSON.stringify(facts.result))
    await pic(s, '02-after-shown', ['#accEdName'], 60)
  })
  await s.ctx.close()
} finally { finish('h3-' + RUN); await closeAll() }
