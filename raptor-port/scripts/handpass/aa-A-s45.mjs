// S45 — Event is present in every kind list with consistent defaults and explanation (admin, desktop; member for the lists).
import { closeWins, world, closeAll, toInputs, openNew, openDay, fileInput, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, listAll, listSearch, listRow, pencil, closeRowEdit, PE, PSAVE, issue, lwMap, crowdCount, switchUser, setPerson, ensureFilters } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const kindsOf = (page, sel) => page.evaluate(q => { const s = document.querySelector(q); if (!s) return null; return [...s.children].map(c => c.tagName === 'OPTGROUP' ? '[' + c.label + ': ' + [...c.children].map(o => o.textContent).join(', ') + ']' : c.textContent).join(' ') }, sel)
for (const role of ['ad', 'us']) {
  const w = await world({ who: role, size: 'd' })
  const page = w.page
  await toInputs(page)
  // calendar editor
  await openNew(page, '2026-07-16')
  console.log(role, 'CALENDAR editor kinds:', await kindsOf(page, '#inpEditType'))
  await page.selectOption('#inpEditType', 'Event'); await sleep(250)
  console.log(role, 'CALENDAR editor, Event selected: all day checked =', await page.locator('#inpEditAllday').isChecked().catch(() => 'n/a'), '| start/end inputs shown =', await page.locator('#inpEditStart').count(), '| AM/PM/Custom choice shown =', await page.locator('#inpEditPop :text-matches("^(AM|PM)$")').count(), '| times:', await page.locator('#inpEditStart').inputValue().catch(() => null), await page.locator('#inpEditEnd').inputValue().catch(() => null))
  await pic(page, `s45-${role}-1-calendar-editor-event`)
  await closeWins(page)
  // List Add
  await listAll(page)
  console.log(role, 'LIST ADD kinds:', await kindsOf(page, '#inType'))
  await page.selectOption('#inType', 'Event'); await sleep(250)
  console.log(role, 'LIST ADD, Event selected: seg buttons =', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /^(ALL DAY|AM|PM|CUSTOM)$/.test(b.innerText.trim())).map(b => b.innerText.trim()).join(',')), '| start field value:', await page.locator('input[type=time]:visible').first().inputValue().catch(() => null))
  await pic(page, `s45-${role}-2-listadd-event`)
  await page.selectOption('#inType', 'Duty'); await sleep(200)
  console.log(role, 'LIST ADD, Duty selected: seg buttons =', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /^(ALL DAY|AM|PM|CUSTOM)$/.test(b.innerText.trim())).map(b => b.innerText.trim()).join(',')))
  // type help ("?")
  await page.locator('#inTypeHelp').click().catch(() => {}); await sleep(500)
  await page.selectOption('#inType', 'Event').catch(() => {})
  const help = await page.evaluate(() => { const p = [...document.querySelectorAll('.airpop, [role=dialog], .tip, .pop, [data-testid^="win-"]')].filter(e => e.offsetParent && /Event/.test(e.innerText)); return p.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 700)).join(' || ') })
  console.log(role, 'LEGEND/help mentioning Event:', help || '(none open)')
  await pic(page, `s45-${role}-3-legend`)
  await page.keyboard.press('Escape')
  // type filter
  await ensureFilters(page)
  console.log(role, 'TYPE FILTER options:', await page.evaluate(() => [...document.querySelectorAll('#inFType option')].map(o => o.textContent).join(', ')))
  if (role === 'ad') {
    // List pencil: needs a saved Event input
    await page.locator('#inCalBtn').click(); await sleep(400)
    await fileInput(page, { iso: '2026-07-16', type: 'Event', person: 'dj', remarks: 'walkS45 named', start: '09:00', end: '12:00' })
    await closeWins(page)
    await listAll(page); await listSearch(page, 'walkS45 named')
    await pencil(page, 'walkS45 named')
    console.log(role, 'PENCIL kinds:', await kindsOf(page, 'tr.ined [data-ed="type"]'), '| shows', await page.evaluate(q => document.querySelector(q).selectedOptions[0].textContent, 'tr.ined [data-ed="type"]'))
    await pic(page, `s45-${role}-4-pencil-event`)
    await closeRowEdit(page)
    // placeholder Event on the weekend, short Yes
    await page.locator('#inCalBtn').click(); await sleep(400)
    await fileInput(page, { iso: '2026-07-18', type: 'Event', person: 'allavail', remarks: 'walkS45 ph', start: '09:00', end: '12:00', oil: 'yes' })
    const rec = (await readInputs(page, 'walkS45 ph'))[0]
    console.log(role, 'weekend placeholder Event saved with OIL', JSON.stringify(rec.oil), 'acc =', rec.acc)
    // the Ground programme on the week: both Events
    await L.go(page, 'editsched'); await sleep(500)
    const ground = await page.evaluate(() => [...document.querySelectorAll('#eWeek [value*="walkS45"], #eWeek input')].filter(e => /walkS45/.test(e.value || '')).map(e => e.value))
    console.log(role, 'week inputs with walkS45 remarks:', JSON.stringify(ground))
    await L.board(page, 3)
    const g = await page.evaluate(() => [...document.querySelectorAll('#schedBoard input, #schedBoard textarea')].filter(e => /walkS45/.test(e.value || '')).map(e => e.value))
    console.log(role, 'board (Thu 16) Ground rows carrying the named Event:', JSON.stringify(g))
    await pic(page, `s45-${role}-5-board-thu`)
    await L.closeBoard(page)
    console.log(role, 'ORIG', JSON.stringify(await issue(page, 5)))
    const m = await lwMap(page); console.log(role, 'credits Sat 18 Jul after issuing the short Yes Event:', crowdCount(m), 'Ace=', m['Ace'])
    // Logic page explanation
    await L.go(page, 'logic'); await sleep(800)
    const lg = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('Event'); return [...t.matchAll(/Event[^\n]{0,260}/g)].map(m => m[0]).slice(0, 6) })
    console.log(role, 'LOGIC page lines mentioning Event:', JSON.stringify(lg))
    await pic(page, `s45-${role}-6-logic`)
  }
  console.log(role, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
