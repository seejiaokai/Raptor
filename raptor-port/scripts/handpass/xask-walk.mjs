// [INPUT-ASK-LOOK] built (D1626, 3 Nov 26 — design C): the input window's "Close it and lose them?" is a card hanging
// from its ✕. Walked on a frozen build, a desktop and his iPhone's size.
//   WALK_DIR=<frozen dist> ISR_OUT=<pictures> LOOK_URL=http://localhost:4398/ node scripts/handpass/xask-walk.mjs
// K1 typed words, ✕: the card is up, its pointer under the ✕ (centres within 3px), the card inside the window, the form
//    not moved (the first field where it stood), the answers' words inside their buttons, Keep editing holds the keys.
// K2 the form scrolled down, ✕: the card still hangs under the ✕ (it sticks to the body's top).
// K3 Escape (desktop): the same card; Keep editing — the card goes, the words stay.
// K4 Discard and close: the window closes, nothing saved.
import * as L from './isr-A-lib.mjs'
const { check, note, shot, tid } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const geo = page => page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]'), x = w.querySelector('[data-testid="win-inputedit-x"]').getBoundingClientRect()
  const c = w.querySelector('[data-testid="inped-escask"]'); if (!c) return null
  const cr = c.getBoundingClientRect(), wr = w.getBoundingClientRect(), pt = getComputedStyle(c, '::before')
  const ptRight = parseFloat(pt.right), ptW = parseFloat(pt.width)
  const ptCx = cr.right - ptRight - ptW / 2
  const f = w.querySelector('#inpEditType').getBoundingClientRect()
  const btns = [...c.querySelectorAll('.abtn')].map(b => ({ t: b.textContent, h: Math.round(b.getBoundingClientRect().height), inside: b.scrollWidth <= b.clientWidth + 1 }))
  return { xCx: Math.round(x.left + x.width / 2), ptCx: Math.round(ptCx), cardTopBelowX: Math.round(cr.top - x.bottom), inWin: cr.left >= wr.left - 0.5 && cr.right <= wr.right + 0.5, fieldTop: Math.round(f.top - wr.top), btns, focus: document.activeElement && document.activeElement.getAttribute('data-testid') }
})
const typeRmk = (page, v) => page.evaluate(v => { const r = document.querySelector('#inpEditPop #inpEditRmk'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, v); r.dispatchEvent(new Event('input', { bubbles: true })) }, v)

for (const size of ['desktop', 'phone']) {
  const { page, tap } = await L.session(size, 'ad')
  const men = await L.freeMen(page, 1, [2])
  const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief', remarks: 'as filed' }, true)
  const open = async () => { await L.press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor(); await sleep(200) }
  await open()
  const field0 = await page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return Math.round(w.querySelector('#inpEditType').getBoundingClientRect().top - w.getBoundingClientRect().top) })
  await typeRmk(page, 'flights changed, back at 10:30')
  await L.press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
  if (!tap) await page.mouse.move(5, 5)
  const g1 = await geo(page)
  note('K1', `${size}: ${JSON.stringify({ field0, ...g1 })}`)
  check('K1', `${size}: ✕ puts up the card, its pointer under the ✕`, g1 && Math.abs(g1.ptCx - g1.xCx) <= 3 && g1.cardTopBelowX >= 0 && g1.cardTopBelowX <= 16, g1)
  check('K1', `${size}: the card inside the window, the form not moved`, g1 && g1.inWin && g1.fieldTop === field0, { field0, fieldTop: g1 && g1.fieldTop })
  check('K1', `${size}: the answers' words inside their buttons, Keep editing holds the keys`, g1 && g1.btns.every(b => b.inside) && g1.focus === 'inped-escask-stay', g1 && { btns: g1.btns, focus: g1.focus })
  await shot(page, 'K1', size, 'card-from-x')
  await L.press(page, tap, '[data-testid="inped-escask-stay"]'); await sleep(200)
  /* K2 */
  await page.evaluate(() => { const b = document.querySelector('[data-testid="win-inputedit"] .win-body'); b.scrollTop = b.scrollHeight })
  await sleep(200)
  await L.press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
  if (!tap) await page.mouse.move(5, 5)
  const g2 = await geo(page)
  check('K2', `${size}: the form scrolled to its foot — the card still hangs under the ✕`, g2 && Math.abs(g2.ptCx - g2.xCx) <= 3 && g2.cardTopBelowX >= 0 && g2.cardTopBelowX <= 16, g2)
  await shot(page, 'K2', size, 'scrolled-card-from-x')
  await L.press(page, tap, '[data-testid="inped-escask-stay"]'); await sleep(200)
  /* K3 */
  if (!tap) {
    await page.locator('#inpEditPop #inpEditRmk').press('Escape'); await sleep(300)
    const g3 = await geo(page)
    check('K3', `${size}: Escape puts up the same card`, g3 && Math.abs(g3.ptCx - g3.xCx) <= 3, g3)
    await page.keyboard.press('Escape'); await sleep(200)
    check('K3', `${size}: Escape again — the card goes, the words stay`, !(await tid(page, 'inped-escask').count()) && await page.inputValue('#inpEditPop #inpEditRmk') === 'flights changed, back at 10:30', null)
  } else L.notWalked('K3', `${size}: a phone has no Escape key`)
  /* K4 */
  await L.press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(250)
  await L.press(page, tap, '[data-testid="inped-escask-go"]'); await sleep(300)
  const saved = await page.evaluate(id => (window.INPUTS.find(r => String(r.iid) === String(id)) || {}).remarks, iid)
  check('K4', `${size}: Discard and close — closed, nothing saved`, !(await tid(page, 'win-inputedit').count()) && saved === 'as filed', saved)
  await page.context().close()
}
await L.finish('xask-walk')
