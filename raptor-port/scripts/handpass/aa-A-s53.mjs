// S53 — placeholder inputs never become SANS offers or personal absence records (admin, desktop).
import { closeWins, world, closeAll, toInputs, openNew, openDay, fileInput, setTimes, pic, T, oilAnswer, sleep, readInputs, observe } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const ISO = '2026-07-21'
async function build(withPh) {
  const w = await world({ who: 'ad', size: 'd' })
  const page = w.page
  await toInputs(page)
  if (withPh) {
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'allavail', remarks: 'walkS53 duty', start: '09:00', end: '12:00' })
    await fileInput(page, { iso: ISO, type: 'Event', person: 'all', remarks: 'walkS53 event', start: '13:00', end: '15:00' })
  }
  // a real named leave: Ace (dj), LL all day
  await openNew(page, ISO)
  await page.selectOption('#inpEditType', 'LL'); await page.selectOption('#inpEditPerson', 'dj')
  await page.fill('#inpEditRmk', 'walkS53 leave')
  await page.locator('#inpEditSave').click(); await sleep(600)
  await oilAnswer(page, 'yes')
  await closeWins(page)
  return w
}
const lw = async (page) => {
  await L.go(page, 'leavewar'); await sleep(1000)
  const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(1200) }
  return page.evaluate(d => {
    const P = window.PEOPLE; const cells = {}
    for (const c of document.querySelectorAll('[data-testid^="cell-"]')) { if (!c.dataset.testid.endsWith(d)) continue; const t = (c.innerText || '').trim(); if (!t) continue; const id = c.dataset.testid.slice(5, -(d.length + 1)); cells[(P[id] && P[id].cs) || id] = t }
    const names = [...document.querySelectorAll('[data-testid^="cell-"]')].map(c => c.dataset.testid.slice(5).replace(/-\d{4}-\d{2}-\d{2}$/, '')).filter((v, i, a) => a.indexOf(v) === i).map(id => (P[id] && P[id].cs) || id)
    const avail = [...document.querySelectorAll('[data-testid^="count-availp"], [data-testid^="count-availw"], [data-testid^="cnt-"]')].map(c => c.dataset.testid + '=' + c.innerText.trim()).filter(x => x.includes(d.slice(5) ) || x.includes(d)).slice(0, 8)
    return { cells, rowNames: names.filter(n => /ALL/i.test(n)), nRows: names.length, avail }
  }, ISO)
}
const out = {}
for (const withPh of [true, false]) {
  const w = await build(withPh)
  const page = w.page
  const tag = withPh ? 'with' : 'without'
  // SANS calendar
  await page.locator('#inSansMode').click(); await sleep(700)
  console.log(tag, 'SANS tab: calendar present', await page.locator('#sansCal, [data-testid="sans-cal"], .sanscal').count())
  await pic(page, `s53-${tag}-1-sans`)
  const dayCell = page.locator(`[data-sday="${ISO}"], [data-testid="sans-day-${ISO}"], [data-icday="${ISO}"]`).first()
  console.log(tag, 'day cell handle count', await dayCell.count())
  if (await dayCell.count()) { await dayCell.click({ position: { x: 8, y: 8 } }); await sleep(700) }
  const dayTxt = await page.locator('[data-testid="win-sansday"], [data-testid^="win-sans"]').first().innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 400)).catch(() => '')
  console.log(tag, 'SANS day window:', dayTxt)
  await pic(page, `s53-${tag}-2-sans-day`)
  // + Commitment picker
  const addC = page.getByRole('button', { name: /\+ Commitment/ }).first()
  if (await addC.count()) {
    await addC.click(); await sleep(700)
    const opts = await page.evaluate(() => { const p = [...document.querySelectorAll('select, [role=listbox], .pp-body')].filter(e => e.offsetParent); return p.map(e => e.tagName + ':' + (e.id || e.className) + ':' + (e.tagName === 'SELECT' ? [...e.options].map(o => o.textContent).join(',') : e.innerText.replace(/\s+/g, ' ').slice(0, 300))) })
    console.log(tag, 'Commitment picker lists:', JSON.stringify(opts).slice(0, 700), '| has ALL entry:', /\bALL\b/.test(JSON.stringify(opts)))
    await pic(page, `s53-${tag}-3-commitment-picker`)
    await page.keyboard.press('Escape')
  } else console.log(tag, 'no + Commitment button found')
  // Leave War
  const L1 = await lw(page)
  out[tag] = L1
  console.log(tag, 'LEAVE WAR 21 Jul cells:', JSON.stringify(L1.cells), '| rows named like ALL:', JSON.stringify(L1.rowNames), '| rows', L1.nRows, '| count cells', JSON.stringify(L1.avail))
  await pic(page, `s53-${tag}-4-leavewar`)
  // Insights
  await page.locator('#insightBtn').click(); await sleep(900)
  const ins = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-testid^="win-"], .insights, [role=dialog]')].filter(e => e.offsetParent); return w.map(e => e.innerText.replace(/\s+/g, ' ')).join(' | ') })
  console.log(tag, 'INSIGHTS mentions ALL / ALL AVAIL:', /ALL AVAIL|\bALL\b/.test(ins), '| length', ins.length)
  await pic(page, `s53-${tag}-5-insights`)
  console.log(tag, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
console.log('Leave War cells identical with/without the placeholders:', JSON.stringify(out.with.cells) === JSON.stringify(out.without.cells), '| row counts', out.with.nRows, out.without.nRows)
await closeAll()
