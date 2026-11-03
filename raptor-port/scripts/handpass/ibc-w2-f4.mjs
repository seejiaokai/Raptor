// W2: S11 (F4) — "To go out" words for a request taken off, retitled, put back, in several orders on a published day.
import { L, pubDay, face, editWeek, showDay, closeBoard, toGoOut, closeChg, sleep, undoTitle } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-f4 v1')
const DI = 3, ISO = '2026-07-16'
async function openBoard(page) { await closeBoard(page); await L.go(page, 'editsched'); await page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(700) }
const accOf = (page, id) => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r && { acc: r.acc, title: r.title, s: r.s, e: r.e } }, id)
async function takeOff(page, word) { await openBoard(page); await page.locator('#schedBoard .sb-arow', { hasText: word }).first().locator('[data-grdel]').click(); await sleep(700) }
async function putBack(page, id, dest = 'g') { await openBoard(page); if (!(await page.locator(`#schedBoard [data-inpedit="${id}"]`).count())) { await page.locator('#schedBoard').getByText(/on programme/).first().click(); await sleep(600) } const ok = await page.evaluate(([id, dest]) => { let e = document.querySelector('#schedBoard [data-inpedit="' + id + '"]'); while (e && !e.querySelector('[data-acc="' + dest + '"]')) e = e.parentElement; const b = e && e.querySelector('[data-acc="' + dest + '"]'); if (b) b.click(); return b ? (b.textContent + '|' + b.title) : null }, [id, dest]); if (!ok) throw new Error('put-back control not found'); note('S11', 'put-back control pressed: ' + ok); await sleep(700) }
async function retitle(page, id, title, hours) {
  await closeBoard(page)
  await L.toInputsCal(page, false); await L.incalMonth(page, false, 2026, 7); await L.openDay(page, ISO)
  await page.locator(`[data-testid="idy-row-${id}"] .icard-open`).first().click(); await page.locator('#inpEditPop #inpEditOwnTitle').waitFor(); await sleep(300)
  await page.fill('#inpEditPop #inpEditOwnTitle', title)
  if (hours) { const ad = page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click(); await page.fill('#inpEditPop #inpEditStart', hours[0]); await page.fill('#inpEditPop #inpEditEnd', hours[1]) }
  await page.locator('#inpEditSave').click(); await sleep(700)
  if (await L.tid(page, 'oilconf').count()) { await page.locator((await L.tid(page, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]').click(); await page.locator('[data-testid="oilconf-save"]').click(); await sleep(400) }
  if (await L.tid(page, 'win-inputsday-x').count()) await page.locator('[data-testid="win-inputsday-x"]').click().catch(() => {})
  await sleep(300)
}
async function setup(tag) {
  const { page, tap } = await L.session('desktop')
  const id = await L.fileOn(page, tap, ISO, { type: 'Event', people: ['stiff'], title: 'Sports day', remarks: 'w2' })
  return { page, tap, id }
}
const words = async (page, pic) => { const t = await toGoOut(page, DI, pic); await closeChg(page); return t.text }
const sum = async (page, id) => `${JSON.stringify(await accOf(page, id))} face ${JSON.stringify(await face(page, DI))}`
const cases = {
  async a(page, id) { await takeOff(page, 'SPORTS'); await pubDay(page, false, DI); note('S11a', `premise: ${await sum(page, id)}`); await retitle(page, id, 'Games afternoon'); note('S11a', `after retitle (still off): ${await sum(page, id)}; To go out: ${await words(page, ['S11a', 'desktop', 'after-retitle'])}`); await putBack(page, id); note('S11a', `after put back: ${await sum(page, id)}`) },
  async b(page, id) { await takeOff(page, 'SPORTS'); await pubDay(page, false, DI); await putBack(page, id); await retitle(page, id, 'Games afternoon') },
  async c(page, id) { await takeOff(page, 'SPORTS'); await pubDay(page, false, DI); await retitle(page, id, 'Games afternoon') },
  async e(page, id) { await pubDay(page, false, DI); await takeOff(page, 'SPORTS'); await retitle(page, id, 'Games afternoon'); await putBack(page, id) },
  async g(page, id) { await takeOff(page, 'SPORTS'); await pubDay(page, false, DI); await retitle(page, id, 'Games afternoon', ['09:00', '11:00']); await putBack(page, id) },
}
const EXP = { a: '"<new title> · … → on the programme"', b: 'same as a', c: 'nothing listed (RECORD)', e: 'a change of title "Sports day → Games afternoon"', g: '"on the programme", no "→" detail' }
for (const c of ['a', 'b', 'c', 'e', 'g']) {
  const { page, id } = await setup(c)
  if (!id) { L.notWalked('S11' + c, 'premise: the Event was not filed'); await page.context().close(); continue }
  await cases[c](page, id)
  const f = await face(page, DI)
  const w = await words(page, ['S11' + c, 'desktop', 'to-go-out'])
  note('S11' + c, `EXPECTED ${EXP[c]} | SAW: pending ${JSON.stringify(f.pend)} nys "${f.nys}" | To go out: ${JSON.stringify(w)} | record ${JSON.stringify(await accOf(page, id))}`)
  if (c === 'a') {
    for (let i = 0; i < 3; i++) { await editWeek(page); await page.locator('#undoBtn').click(); await sleep(600); note('S11a', `Undo ${i + 1}: ${JSON.stringify((await L.notes(page)).slice(-1))}; To go out: ${JSON.stringify(await words(page, null))}`) }
  }
  await page.context().close()
}
await L.finish('f4')
