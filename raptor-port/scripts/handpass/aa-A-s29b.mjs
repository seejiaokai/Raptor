// S29 remainder: the member's List pencil, the member's ALL subset, and the one-press correction ("File it for me only").
import { closeWins, world, closeAll, toInputs, openNew, fileInput, setTimes, pic, T, sleep, readInputs, observe, listAll, listSearch, listRow, pencil, closeRowEdit, PSAVE, setPerson } from './aa-A-lib.mjs'
const KINDS = ['OD', 'CSE', 'Fly with', 'Personal', 'LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL', 'HL', 'OML', 'ATT C', 'ATT B', 'Upchit']
const out = []
for (const ph of ['allavail', 'all']) {
  const w = await world({ who: 'us', size: 'd' })
  const page = w.page; page.setDefaultTimeout(8000)
  const rm = `walkS29b us ${ph}`
  await toInputs(page)
  // the one-press correction in the calendar's new editor
  await openNew(page, '2026-07-16')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ph)
  await page.selectOption('#inpEditType', 'LL'); await sleep(250)
  console.log(ph, 'member picked', ph, '+ LL -> line:', await page.locator(T('pp-why')).first().innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => null))
  await pic(page, `s29b-${ph}-1-member-line`)
  const fix = page.locator('#inpEditPop ' + T('pp-fix')).first()
  console.log(ph, 'fix button:', await fix.innerText().catch(() => null))
  await fix.click(); await sleep(400)
  console.log(ph, 'after "File it for me only": person box =', await page.evaluate(() => document.querySelector('#inpEditPersonFixed')?.textContent || document.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent), '| type =', await page.locator('#inpEditType').inputValue())
  await pic(page, `s29b-${ph}-2-after-fix`)
  await closeWins(page)
  // the member's List pencil on a placeholder he filed
  await fileInput(page, { iso: '2026-07-16', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00' })
  await closeWins(page)
  await listAll(page); await setPerson(page, 'all'); await listSearch(page, rm)
  await page.locator('#intbl').scrollIntoViewIfNeeded()
  const row = listRow(page, rm)
  console.log(ph, 'member List row:', (await row.innerText().catch(() => 'NO ROW')).replace(/\s+/g, ' ').slice(0, 140))
  const subset = ph === 'all' ? ['LL', 'HL', 'Personal', 'Upchit'] : KINDS
  for (const k of subset) {
    await listSearch(page, rm)
    await row.locator('[data-edit]').click(); await sleep(400)
    const hasPerson = await page.locator('tr.ined [data-ed="person"]').count()
    const n0 = await page.evaluate(() => window.INPUTS.length)
    await page.selectOption('tr.ined [data-ed="type"]', k).catch(e => out.push({ ph, k, note: 'type not offered' }))
    await page.locator(PSAVE).click(); await sleep(450)
    const ob = await observe(page)
    const n1 = await page.evaluate(() => window.INPUTS.length)
    const recNow = (await readInputs(page, rm))[0]
    const r = { door: 'list-pencil', role: 'us', ph, kind: k, personSelectShown: hasPerson, savedNew: n1 > n0, recordKind: recNow?.type, recordPerson: recNow?.name, toast: ob.msgs.filter(m => /filed only|ALL/i.test(m)).join(' | ') }
    out.push(r); console.log(JSON.stringify(r))
    await closeRowEdit(page)
  }
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
