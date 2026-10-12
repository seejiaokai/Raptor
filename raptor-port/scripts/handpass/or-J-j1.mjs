import { open, fileInput, shot, toWeek, toWeekDay, inputsDump, errs, browser, unavRows, rosterPuck, reveal, mouseDrag, centre, toastMark, toastsSince, undoOnce, redoOnce, judge, savePart, results, PID } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const out = {}
const { ctx, page } = await open({ fresh: true })
const LL = () => page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && r.date === 'Jul 15' && r.people).map(r => ({ iid: r.iid, people: r.people.map(e => window.PEOPLE[e.p]?.cs), to: r.to, rmk: r.remarks || r.rmk || '' })))
const lwCells = async (cs) => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
  const m = page.locator('[data-testid="month-jul"], [data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await page.waitForTimeout(900) }
  return page.evaluate((id0) => [id0].map(id => ['2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'].map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return id + ' ' + d.slice(5) + ': ' + (c ? ('"' + c.innerText.trim() + '"') : 'no cell') }).join(' ; ')).join('\n'), cs)
}
const calRead = async () => {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').click(); await page.waitForTimeout(300) }
  const bars = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => ['2026-07-15','2026-07-16'].includes(e.dataset.icday)).length)
  const barText = await page.evaluate(() => [...document.querySelectorAll('#inpCal *')].filter(e => !e.children.length && /· LL$|LL$/.test(e.textContent.trim()) && e.textContent.length < 40).map(e => e.textContent.trim()).join(' | '))
  await page.locator('[data-icday="2026-07-15"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
  const card = await page.evaluate(() => (document.querySelector('[data-testid="win-inputsday"]')?.innerText || '').replace(/\s+/g, ' '))
  return { barText, card }
}

/* J1 — file */
const filed = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hex', 'Tally'], from: '2026-07-15', to: '2026-07-16' })
console.log('filed', JSON.stringify(filed))
await toWeekDay(page, 2)
const r1 = await unavRows(page, 2)
const wedLL = r1.filter(r => /^LL/.test(r.text) && ['Drifter', 'Hex', 'Tally'].some(n => r.people.includes(n)))
console.log('Wed LL rows', JSON.stringify(wedLL))
const sec = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').first()
await reveal(sec); await sec.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/j1-a-wed-unavail.png' }); console.log('saved j1-a')
const thu = await unavRows(page, 3)
out.a = { wedLL, thuLL: thu.filter(r => /^LL/.test(r.text)).map(r => r.people.join('+')), inputs: await LL() }
const c1 = await calRead(); out.a.cal = c1
await shot(page, 'j1-b-cal-day')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
await shot(page, 'j1-b-cal-month')
const lw1 = await lwCells('slipway'), lw2 = await lwCells('rocky')
out.a.lw = lw1 + '\n' + lw2
await shot(page, 'j1-c-leavewar')
console.log(JSON.stringify(out.a, null, 1))

/* J1 — drag Grit onto Hex's row */
await toWeekDay(page, 2)
const hexRow = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav .pl-row').filter({ hasText: /^LL\s*Hex|Hex/ }).filter({ has: page.locator('.puck', { hasText: 'Hex' }) }).first()
const hexPuck = hexRow.locator('.puck').first()
const grit = rosterPuck(page, 'Anvil')
const hb = await reveal(hexPuck)
const gb = await grit.boundingBox()
console.log('boxes', JSON.stringify(hb), JSON.stringify(gb))
let m = await toastMark(page)
await mouseDrag(page, centre(gb), centre(hb))
out.b = { toast: await toastsSince(page, m), unav: (await unavRows(page, 2)).filter(r => /^LL/.test(r.text)), thu: (await unavRows(page, 3)).filter(r => /^LL/.test(r.text)).map(r => r.people.join('+')), inputs: await LL(), allLL: await page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL').map(r => (r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs) : [window.PEOPLE[r.person]?.cs]).join('+') + ' ' + r.date + ' ' + (r.remarks || ''))) }
await shot(page, 'j1-d-after-drag')
const s2 = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').first(); await reveal(s2); await s2.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/j1-d-wed-unavail-after.png' })
console.log(JSON.stringify(out.b, null, 1))
const c2 = await calRead(); out.b.cal = c2; await shot(page, 'j1-e-cal-after')
await page.keyboard.press('Escape')
out.b.lw = (await lwCells('slipway')) + '\n' + (await lwCells('rocky')) + '\n' + (await lwCells('shaft'))
await shot(page, 'j1-f-lw-after')
console.log(out.b.cal.card); console.log(out.b.lw)
/* U / R */
await toWeekDay(page, 2)
out.undo = await undoOnce(page); out.afterUndo = { unav: (await unavRows(page, 2)).filter(r => /^LL/.test(r.text)).map(r => r.people.join('+')), inputs: await LL() }
await shot(page, 'j1-g-undo')
out.redo = await redoOnce(page); out.afterRedo = { unav: (await unavRows(page, 2)).filter(r => /^LL/.test(r.text)).map(r => r.people.join('+')), inputs: await LL() }
await shot(page, 'j1-h-redo')
console.log(JSON.stringify({ undo: out.undo, afterUndo: out.afterUndo, redo: out.redo, afterRedo: out.afterRedo }, null, 1))
writeFileSync('docs/handpass/parts/or-J-j1-raw.json', JSON.stringify(out, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
