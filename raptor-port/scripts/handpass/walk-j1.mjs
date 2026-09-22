/* JOB 1, THE LAST MILE (22 Sep 26) — hand a landed request to a DIFFERENT man
   through the REAL dialog and watch the OIL question come up for the new man.
   The step the 21 Sep session could not reach. Door: openInputs (data-pitog). */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const oild = () => page.evaluate(() =>
  JSON.parse(JSON.stringify(((window.DAYS[window.SBDAY] || {}).oild) || {})))
const rec = (i) => page.evaluate(x => { const r = (window.INPUTS || []).find(y => y.iid === x); return r && { person: r.person, type: r.type, oil: r.oil, acc: r.acc } }, i)

await board(page, 5)
await openInputs(page, 5)
const iid = await page.evaluate(() => ([...document.querySelectorAll('#schedBoard [data-inpedit]')]
  .find(e => /Training/i.test(e.innerText || '')) || {}).getAttribute?.('data-inpedit'))
S('the request', { iid, ...(await rec(iid)) })

/* ---- 1. the mode, and a real answer for the man who holds it now -------- */
await tap(page, '#sbOil'); await page.waitForTimeout(800)
await tap(page, `[data-oilitem="i:${iid}"]`)
await page.waitForTimeout(700)
await shot(page, 'j1-01-holder-answered')
S('decisions after tapping the holder off', await oild())

/* ---- 2. mode OFF, hand the request to a DIFFERENT man ------------------ */
await tap(page, '#sbOil'); await page.waitForTimeout(700)
await openInputs(page, 5)
await tap(page, `[data-inpedit="${iid}"]`)
await page.waitForTimeout(700)
const pop = page.locator('#inpEditPop')
S('dialog open', await pop.isVisible())
await shot(page, 'j1-02-dialog-before')
await pop.locator('select').nth(0).selectOption('dj')          /* Ace */
await page.waitForTimeout(300)
await shot(page, 'j1-03-dialog-new-holder')
await page.locator('#inpEditSave').click()
await page.waitForTimeout(1000)

/* ---- 3. THE QUESTION MUST COME UP, FOR THE NEW MAN --------------------- */
const oil = page.locator('[data-testid="oilconf"]')
const asked = await oil.count() > 0 && await oil.isVisible()
S('THE QUESTION CAME UP', asked)
if (asked) {
  S('what it says', (await oil.innerText()).replace(/\s+/g, ' ').trim())
  S('its buttons', await oil.locator('button').evaluateAll(bs => bs.map(b => (b.innerText || '').trim())))
  await shot(page, 'j1-04-question-for-the-new-man')
  /* answer it the way a scheduler would: credit the new man, then Save */
  await oil.getByRole('button', { name: /Yes — credit/ }).click()
  await page.waitForTimeout(400)
  await oil.getByRole('button', { name: /^Save$/ }).click()
  await page.waitForTimeout(1100)
}
S('the request now', await rec(iid))
S('decisions after the hand-over', await oild())
await shot(page, 'j1-05-after')
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
