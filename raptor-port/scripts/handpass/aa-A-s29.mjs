// S29 — every forbidden kind is refused through every reachable editor of the Inputs page (desktop).
// Doors walked here: calendar new editor, calendar existing editor, List Add, List pencil. (The Board's own dialog is not in this share.)
import { closeWins, world, closeAll, toInputs, openNew, openDay, fileInput, setTimes, pic, T, sleep, readInputs, observe, switchUser, listAll, listSearch, listRow, pencil, closeRowEdit, PE, PSAVE, setPerson } from './aa-A-lib.mjs'
const KINDS = ['OD', 'CSE', 'Fly with', 'Personal', 'LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL', 'HL', 'OML', 'ATT C', 'ATT B', 'Upchit', 'SANS Availability']
const results = []
const count = page => page.evaluate(() => window.INPUTS.length)
const state = async (page, sel) => page.evaluate(q => { const s = document.querySelector(q); return s ? s.selectedOptions[0]?.textContent : null }, sel)
async function tryKind(page, door, role, ph, kind, { typeSel, personSel, saveSel }) {
  const opts = await page.evaluate(q => [...document.querySelectorAll(q + ' option')].map(o => o.value), typeSel)
  if (!opts.includes(kind)) { results.push({ door, role, ph, kind, result: 'ABSENT from the list (stays absent)' }); return }
  const n0 = await count(page)
  await page.selectOption(typeSel, kind); await sleep(250)
  const whyTxt = await page.locator(T('pp-why')).first().innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => null)
  const fixTxt = await page.locator(T('pp-fix')).first().innerText().catch(() => null)
  await page.locator(saveSel).first().click(); await sleep(450)
  const ob = await observe(page)
  const q = await page.locator(`${T('oilconf')}, [data-testid^="doc"], [data-testid^="down"], [data-testid^="upchit"], [data-testid^="medconf"]`).first().isVisible().catch(() => false)
  const n1 = await count(page)
  const personNow = await state(page, personSel)
  const msg = ob.msgs.filter(m => /can be filed only|one day|ALL/i.test(m)).join(' | ')
  results.push({ door, role, ph, kind, saved: n1 > n0, auxQuestionOpened: q, personStillShown: personNow, pickerLine: whyTxt, fix: fixTxt, toast: msg })
  if (n1 > n0) console.log('!! SAVED', door, role, ph, kind)
  if (q) { await page.keyboard.press('Escape'); await sleep(200) }
}
for (const role of ['ad', 'us']) {
  const phs = ['allavail', 'all']
  for (const ph of phs) {
    const subset = ph === 'all' ? ['LL', 'HL', 'Personal', 'Upchit'] : KINDS
    const w = await world({ who: role, size: 'd' })
    const page = w.page
    const rm = `walkS29 ${role} ${ph}`
    await toInputs(page)
    // door 1: calendar NEW editor
    await openNew(page, '2026-07-16')
    await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ph)
    for (const k of subset) { await page.selectOption('#inpEditType', 'Duty'); await sleep(120); await tryKind(page, 'calendar-new', role, ph, k, { typeSel: '#inpEditType', personSel: '#inpEditPerson', saveSel: '#inpEditSave' }) }
    await pic(page, `s29-${role}-${ph}-1-new-last`)
    await closeWins(page)
    // door 2: calendar EXISTING editor (a valid placeholder Duty first)
    await fileInput(page, { iso: '2026-07-16', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00' })
    await openDay(page, '2026-07-16')
    const bar = page.locator('[data-testid="win-inputsday"] [data-iid]').filter({ hasText: rm }).first()
    await bar.click({ timeout: 4000 }).catch(() => console.log('existing bar not clickable', role, ph)); await sleep(600)
    if (await page.locator('#inpEditSave').count()) {
      for (const k of subset) { await page.selectOption('#inpEditType', 'Duty').catch(() => {}); await sleep(120); await tryKind(page, 'calendar-existing', role, ph, k, { typeSel: '#inpEditType', personSel: '#inpEditPerson', saveSel: '#inpEditSave' }) }
      await pic(page, `s29-${role}-${ph}-2-existing-last`)
    } else results.push({ door: 'calendar-existing', role, ph, result: 'editor not reachable (no Save): ' + (await observe(page)).wins.join(' ; ').slice(0, 200) })
    await closeWins(page)
    // door 3: List Add form
    await listAll(page)
    await page.selectOption('#inType', 'Duty').catch(() => {})
    const addPersonSel = await page.evaluate(() => (document.querySelector('#inPerson') ? '#inPerson' : '#inPersonSel'))
    await page.selectOption(addPersonSel, ph).catch(e => console.log('list add person select failed', String(e).slice(0, 80)))
    await page.locator('#inCal [data-cal="2026-07-16"]').click(); await sleep(150); await page.locator('#inCal [data-cal="2026-07-16"]').click(); await sleep(150)
    for (const k of subset) { await page.selectOption('#inType', 'Duty').catch(() => {}); await sleep(100); await tryKind(page, 'list-add', role, ph, k, { typeSel: '#inType', personSel: addPersonSel, saveSel: '#inAdd' }) }
    await pic(page, `s29-${role}-${ph}-3-listadd-last`)
    // door 4: List pencil
    await listSearch(page, rm)
    for (const k of subset) {
      await listSearch(page, rm)
      if (!(await listRow(page, rm).count())) { results.push({ door: 'list-pencil', role, ph, kind: k, result: 'row not found' }); continue }
      await pencil(page, rm)
      await tryKind(page, 'list-pencil', role, ph, k, { typeSel: 'tr.ined [data-ed="type"]', personSel: PE, saveSel: PSAVE })
      await closeRowEdit(page)
    }
    console.log(role, ph, 'errs', JSON.stringify(w.errs))
    await w.ctx.close()
  }
}
await closeAll()
const bad = results.filter(r => r.saved || r.auxQuestionOpened || (r.personStillShown && !/ALL/.test(r.personStillShown) && r.result == null))
console.log('TOTAL rows', results.length, 'saved/aux/person-lost:', bad.length)
console.log(JSON.stringify(bad.slice(0, 40)))
import { writeFileSync } from 'node:fs'
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/aa-A-s29-rows.json', JSON.stringify(results, null, 1))
