// W2: S12 (F1) each field alone must still save; changed back must not. S26 on a published day. Desktop 1440, Inputs page window.
import { L, pubDay, face, editWeek, showDay, closeBoard, sleep, undoTitle, signIn } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-f1 v1')
const ISO = '2026-07-15', DI = 2
const snap = (page, id) => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r && { type: r.type, person: r.person, title: r.title, s: r.s, e: r.e, allday: r.allday, remarks: r.remarks, mod: r.mod, modBy: r.modBy, modAt: r.modAt, till: r.till, noTill: r.noTill } }, id)
async function openIn(page, id) {
  if (!(await page.locator('[data-testid="win-inputsday"]').count())) { await L.toInputsCal(page, false); await L.incalMonth(page, false, 2026, 7); await L.openDay(page, ISO) }
  await page.locator(`[data-testid="idy-row-${id}"] .icard-open`).first().click(); await page.locator('#inpEditPop #inpEditSave').waitFor(); await sleep(350)
}
const winOpen = page => page.locator('#inpEditPop:visible').count().then(n => n > 0)
async function answerQs(page) { if (await L.tid(page, 'oilconf').count()) { await page.locator((await L.tid(page, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]').click(); await page.locator('[data-testid="oilconf-save"]').click(); await sleep(400) } if (await L.tid(page, 'docconf-nodoc').count()) { await page.locator('[data-testid="docconf-nodoc"]').click(); await sleep(300) } }
async function trial(page, id, label, fn, expectSaved) {
  const s0 = await snap(page, id), u0 = (await undoTitle(page)).undo
  await openIn(page, id)
  await fn(page)
  await page.locator('#inpEditSave').click(); await sleep(700)
  const q = await L.tid(page, 'oilconf').count()
  await answerQs(page)
  const open = await winOpen(page), s1 = await snap(page, id), u1 = (await undoTitle(page)).undo
  const changed = JSON.stringify({ ...s0, mod: 0, modAt: 0, modBy: 0 }) !== JSON.stringify({ ...s1, mod: 0, modAt: 0, modBy: 0 })
  const stamped = s0.modAt !== s1.modAt || s0.mod !== s1.mod
  const ok = expectSaved ? (changed && stamped && !open) : (!changed && !stamped && !open)
  check('S12', `${label} — ${expectSaved ? 'saves' : 'closes with nothing stamped'}`, ok, { changed, stamped, windowStillOpen: open, question: q, undoLabel: u1, undoBefore: u0, before: s0, after: s1 })
  if (open) { await page.keyboard.press('Escape'); await sleep(300); if (await winOpen(page)) await page.locator('#inpEditCancel').click().catch(() => {}); await sleep(300) }
  return s1
}
{
  const { page, tap } = await L.session('desktop')
  const men = await L.freeMen(page, 3, [2])
  const id = await L.fileOn(page, tap, ISO, { type: 'Appointment', people: [men[0]], title: 'Dental', from: '10:00', to: '11:00', remarks: 'base' }, true)
  note('S12', `fixture: iid ${id} ${JSON.stringify(await snap(page, id))}; free men ${JSON.stringify(men)}`)
  if (!id) L.notWalked('S12', 'premise: fixture not filed')
  else {
    await trial(page, id, 'nothing changed', async () => {}, false)
    await trial(page, id, 'remarks alone', async p => p.fill('#inpEditRmk', 'changed remarks'), true)
    await trial(page, id, 'remarks changed and changed back', async p => { await p.fill('#inpEditRmk', 'x'); await p.fill('#inpEditRmk', 'changed remarks') }, false)
    await trial(page, id, 'title alone', async p => p.fill('#inpEditOwnTitle', 'Dentist'), true)
    await trial(page, id, 'start time alone', async p => p.fill('#inpEditStart', '10:30'), true)
    await trial(page, id, 'end time alone', async p => p.fill('#inpEditEnd', '11:30'), true)
    await trial(page, id, 'start changed and changed back', async p => { await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditStart', '10:30') }, false)
    await trial(page, id, 'person alone', async p => p.selectOption('#inpEditPerson', men[1]), true)
    const opts = await (async () => { await openIn(page, id); const o = await page.locator('#inpEditType option').evaluateAll(os => os.map(x => x.value)); await page.locator('#inpEditCancel').click(); await sleep(300); return o })()
    note('S12', `type options: ${JSON.stringify(opts)}`)
    const other = opts.find(o => o !== 'Appointment' && /Meeting|Training|Other/i.test(o)) || opts.find(o => o !== 'Appointment')
    await trial(page, id, `type alone (→ ${other})`, async p => p.selectOption('#inpEditType', other), true)
    await trial(page, id, 'all-day tick alone', async p => { const a = p.locator('#inpEditAllday'); if (await a.count()) await a.click() }, true)
    const tl = page.locator('#inpEditTill')
    await openIn(page, id); const tillThere = await page.locator('#inpEditTill').count(); await page.locator('#inpEditCancel').click(); await sleep(300)
    if (tillThere) await trial(page, id, 'till tick alone', async p => p.locator('#inpEditTill').click(), true)
    else L.notWalked('S12', 'till tick: no #inpEditTill in this window for this kind')
    await trial(page, id, 'second person (picker)', async p => { await p.locator('[data-testid="pp-several"]').click(); await sleep(250); await p.locator(`#inpEditPop [data-pp="${men[2]}"]`).click(); await sleep(200) }, true)
    note('S12', `final record ${JSON.stringify(await snap(page, id))}`)
  }
  await page.context().close()
}
/* S26: a published day */
{
  const { page, tap } = await L.session('desktop')
  const men = await L.freeMen(page, 2, [2])
  const id = await L.fileOn(page, tap, ISO, { type: 'Appointment', people: [men[0]], title: 'Dental', from: '10:00', to: '11:00', remarks: 'base' }, true)
  if (!id) L.notWalked('S26', 'premise: fixture not filed')
  else {
    await L.go(page, 'inputs')
    await pubDay(page, false, DI)
    const f0 = await face(page, DI)
    check('S26', 'premise: ORIG, nothing pending, signed', f0.tag === 'ORIG' && !f0.pend.length && !/Not yet/.test(f0.nys), f0)
    await trial(page, id, 'S26 save with nothing changed on the published day', async () => {}, false)
    const f1 = await face(page, DI)
    check('S26', 'EXPECTED nothing pending, no sign-off lost', !f1.pend.length && !/Not yet/.test(f1.nys), f1)
    await trial(page, id, 'S26 remarks changed on the published day', async p => p.fill('#inpEditRmk', 'changed on published day'), true)
    const f2 = await face(page, DI)
    check('S26', 'EXPECTED 1 pending, sign-offs fall', f2.pend.join(' ').includes('1 pending') && /Not yet signed/.test(f2.nys), f2)
    await shot(page, 'S26', 'desktop', 'after-change')
  }
  await page.context().close()
}
await L.finish('f1')
