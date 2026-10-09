// S16 — re-asking respects the existing answer rules (admin, desktop). Pencil changes of hours, date, person.
import { world, closeAll, toInputs, fileInput, listAll, listSearch, pencil, pic, T, oilAnswer, PE, PSAVE, readInputs, sleep, issue, lwMap, crowdCount, observe, closeRowEdit } from './aa-A-lib.mjs'
const out = []
async function edit(page, rm, fn, label, ans) {
  await listSearch(page, rm)
  await pencil(page, rm)
  await fn()
  await page.locator(PSAVE).click(); await sleep(600)
  const asked = await page.locator(T('oilconf')).isVisible().catch(() => false)
  const q = asked ? (await page.locator(T('oilconf')).innerText()).replace(/\s+/g, ' ').slice(0, 200) : ''
  if (asked) await oilAnswer(page, ans || 'yes')
  const stillEditing = await page.locator(PE).isVisible().catch(() => false)
  const toast = (await observe(page)).msgs.filter(m => /ALL|filed|OIL|day/i.test(m)).join(' | ').slice(0, 200)
  if (stillEditing) { await pic(page, `s16-${label.replace(/\W+/g, '')}-stuck`); await closeRowEdit(page) }
  const r = (await readInputs(page, rm))[0]
  return { label, asked, q, oil: r.oil, s: r.s, e: r.e, person: r.name, date: r.d || r.date || r.from, stillEditing, toast }
}
const setTimesRow = async (a, b) => { const t = page_.locator('tr.ined input[type=time]'); await t.nth(0).fill(a); await t.nth(1).fill(b) }
let page_
for (const ph of ['allavail', 'all']) {
  const w = await world({ who: 'ad', size: 'd' })
  const { page } = w; page_ = page
  await toInputs(page)
  const cases = [{ k: 'No', person: ph, ans: 'no' }, { k: 'Yes', person: ph, ans: 'yes' }, { k: 'Named', person: 'dj', ans: 'yes' }]
  for (const c of cases) {
    const rm = `walkS16 ${ph} ${c.k}`
    await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: c.person, remarks: rm, start: '09:00', end: '12:00', oil: c.ans })
    c.rm = rm
  }
  await listAll(page)
  for (const c of cases) {
    const rm = c.rm
    const res = []
    res.push(await edit(page, rm, () => setTimesRow('10:00', '13:00'), '10-13 (same 3h)', c.ans))
    res.push(await edit(page, rm, () => setTimesRow('09:00', '16:00'), '09-16 (7h, amount changes)', c.ans))
    await pic(page, `s16-${ph}-${c.k}-after-hours`)
    res.push(await edit(page, rm, async () => { const d = page.locator('tr.ined #inedCal [data-cal="2026-07-19"]'); await d.click(); await sleep(200); await d.click(); await sleep(200) }, 'moved Sat -> Sun', c.ans))
    await pic(page, `s16-${ph}-${c.k}-after-move`)
    res.push(await edit(page, rm, async () => { await page.selectOption(PE, c.k === 'Named' ? ph : 'dj') }, 'person changed', c.ans))
    for (const r of res) console.log(ph, c.k, JSON.stringify(r))
    out.push({ ph, k: c.k, res })
  }
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
