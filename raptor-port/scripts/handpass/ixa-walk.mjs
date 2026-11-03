// [INPUT-WIN-X-ASKS] (D1622, 3 Nov 26): an input's window asks before its ✕ throws away typed words; Cancel does not.
//   WALK_DIR=<folder> ISR_OUT=<pictures> LOOK_URL=http://localhost:4396/ node scripts/handpass/ixa-walk.mjs
// X1 typed words, ✕: the question; Keep editing keeps the words; ✕ again, Discard and close: closed, nothing saved.
// X2 nothing typed, ✕: closes at once, no question.
// X3 typed words, Cancel: closes at once, no question, nothing saved.
// X4 typed words, Escape: the same question (unchanged), then Escape again is Keep editing.
// X5 typed words, Save: saved as before (the save path untouched).
// X6 a new input ("+ Input"), its type changed, ✕: the question; Discard and close: nothing filed.
// Each on a desktop (mouse) and his iPhone's size (taps); X4 on the desktop only (a keyboard). The plain-user round (D1557):
// open, type, close by each door, then the day's card read back for what was or was not saved.
import * as L from './isr-A-lib.mjs'
const { check, note, shot, tid } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-07-15'
const rmk = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => String(x.iid) === String(iid)); return r ? String(r.remarks || '') : null }, iid)
const up = async (page, t) => (await tid(page, t).count()) > 0

for (const size of ['desktop', 'phone']) {
  const { page, tap } = await L.session(size, 'ad')
  const men = await L.freeMen(page, 1, [2])
  const iid = await L.fileOn(page, tap, ISO, { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  check('X0', `${size}: premise — a meeting filed, its day open`, !!iid && await up(page, 'win-inputsday'), { iid, men })
  const open = async () => {
    await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await sleep(300)
    await tid(page, 'win-inputedit').waitFor()
  }
  const type = async v => { await page.fill('#inpEditPop #inpEditRmk', v); await sleep(150) }
  const X = '[data-testid="win-inputedit-x"]'

  /* X1 */
  await open(); await type('typed, not saved')
  await L.press(page, tap, X); await sleep(300)
  check('X1', `${size}: ✕ with typed words asks "Close it and lose them?"`, await up(page, 'inped-escask') && await up(page, 'win-inputedit'), await L.text(page, '[data-testid="inped-escask"]'))
  await L.mark(page, '[data-testid="inped-escask"]'); await L.mark(page, X); await shot(page, 'X1', size, '1-x-asks'); await L.unmark(page, '[data-testid="inped-escask"]'); await L.unmark(page, X)
  await L.press(page, tap, '[data-testid="inped-escask-stay"]'); await sleep(200)
  const kept = await page.inputValue('#inpEditPop #inpEditRmk')
  check('X1', `${size}: Keep editing — the question goes, the words stay`, !(await up(page, 'inped-escask')) && kept === 'typed, not saved', kept)
  await L.press(page, tap, X); await sleep(200)
  await L.press(page, tap, '[data-testid="inped-escask-go"]'); await sleep(300)
  check('X1', `${size}: ✕ again, Discard and close — closed, nothing saved`, !(await up(page, 'win-inputedit')) && await rmk(page, iid) === 'as filed', await rmk(page, iid))
  await shot(page, 'X1', size, '2-discarded-card-unchanged')

  /* X2 */
  await open()
  await L.press(page, tap, X); await sleep(300)
  check('X2', `${size}: ✕ with nothing typed closes at once, no question`, !(await up(page, 'win-inputedit')) && !(await up(page, 'inped-escask')), null)

  /* X3 */
  await open(); await type('typed then Cancel')
  await L.press(page, tap, '#inpEditCancel'); await sleep(300)
  check('X3', `${size}: Cancel with typed words closes at once, no question, nothing saved`, !(await up(page, 'win-inputedit')) && !(await up(page, 'inped-escask')) && await rmk(page, iid) === 'as filed', await rmk(page, iid))

  /* X4 */
  if (!tap) {
    await open(); await type('typed then Escape')
    await page.locator('#inpEditPop #inpEditRmk').press('Escape'); await sleep(300)
    check('X4', `${size}: Escape with typed words asks the same question`, await up(page, 'inped-escask') && await up(page, 'win-inputedit'), null)
    await page.keyboard.press('Escape'); await sleep(200)
    check('X4', `${size}: Escape again is Keep editing — the words stay`, !(await up(page, 'inped-escask')) && await page.inputValue('#inpEditPop #inpEditRmk') === 'typed then Escape', null)
    await L.press(page, tap, X); await L.press(page, tap, '[data-testid="inped-escask-go"]'); await sleep(300)
  } else L.notWalked('X4', `${size}: a phone has no Escape key`)

  /* X5 */
  await open(); await type('changed and saved')
  await L.press(page, tap, '#inpEditSave'); await sleep(400)
  if (await up(page, 'oilconf')) { await L.press(page, tap, (await up(page, 'oil-all')) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]'); await L.press(page, tap, '[data-testid="oilconf-save"]'); await sleep(300) }
  check('X5', `${size}: Save still saves, no question`, !(await up(page, 'win-inputedit')) && await rmk(page, iid) === 'changed and saved', await rmk(page, iid))
  await shot(page, 'X5', size, 'saved-card')

  /* X6 */
  const before = await page.evaluate(() => window.INPUTS.length)
  await L.press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor()
  await page.selectOption('#inpEditPop #inpEditType', 'Meeting'); await sleep(200)
  await L.press(page, tap, X); await sleep(300)
  check('X6', `${size}: a new input with its type changed — ✕ asks`, await up(page, 'inped-escask'), null)
  await L.mark(page, '[data-testid="inped-escask"]'); await shot(page, 'X6', size, 'new-input-x-asks'); await L.unmark(page, '[data-testid="inped-escask"]')
  await L.press(page, tap, '[data-testid="inped-escask-go"]'); await sleep(300)
  check('X6', `${size}: Discard and close — nothing filed`, !(await up(page, 'win-inputedit')) && await page.evaluate(() => window.INPUTS.length) === before, null)

  note('X', `${size}: walked`)
  await page.context().close()
}
await L.finish('ixa')
