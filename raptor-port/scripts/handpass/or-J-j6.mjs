import { open, fileInput, shot, toWeekDay, toBoard, errs, browser, unavRows, reveal, undoOnce, redoOnce, calDay, PID, inputsDump, openBoard } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
const T = 'Fri brief'
res.filed = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally', 'Hex', 'Drifter'], from: '2026-07-17', to: '2026-07-17', timed: ['09:00', '10:00'], title: T })
console.log('filed', JSON.stringify(res.filed))
const iid = res.filed[0].iid
const surfaces = async (label) => {
  const o = { label }
  o.inputs = await page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p) : 'GONE' }, iid)
  await toWeekDay(page, 4)
  o.week = await page.evaluate(t => [...document.querySelectorAll('#eWeek .day:not(.peek)')][4] && [...[...document.querySelectorAll('#eWeek .day:not(.peek)')][4].querySelectorAll('.sec-grnd .pl-row')].filter(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === t).map(r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()).join(',')), T.toLowerCase())
  o.weekPers = await page.evaluate(t => [...[...document.querySelectorAll('#eWeek .day:not(.peek)')][4].querySelectorAll('.sec-inp .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 80)), 0)
  await openBoard(page, 4)
  o.board = await page.evaluate(t => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => (r.querySelector('textarea.ain, input.ain')?.value || '').trim().toLowerCase() === t).map(r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()).join(',')), T.toLowerCase())
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
  await calDay(page, '2026-07-17')
  await page.locator('[data-icday="2026-07-17"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
  o.card = await page.evaluate(() => (document.querySelector('[data-testid="win-inputsday"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 420))
  await shot(page, `j6-${label}-card`); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await shot(page, `j6-${label}-month`)
  await page.locator('#inListBtn').click(); await page.waitForTimeout(500)
  o.list = await page.evaluate(() => [...document.querySelectorAll('#page-inputs [data-iid], #page-inputs .irow, #page-inputs .icard')].filter(e => /Fri brief/i.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 160)))
  await shot(page, `j6-${label}-list`)
  await page.locator('#inCalBtn').click().catch(() => {})
  return o
}
res.before = await surfaces('1-before')
console.log(JSON.stringify(res.before))
/* Admin -> Users: delete Drifter */
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
const t = page.locator('[data-admcat="users"]'); if (await t.count()) { await t.first().click(); await page.waitForTimeout(500) }
const row = page.locator('.acc-row[data-person="slipway"]').first()
await row.scrollIntoViewIfNeeded(); await row.locator('.acc-tap').click(); await page.waitForTimeout(600)
await shot(page, 'j6-2-admin-drifter')
const del = page.locator('.acc-row[data-person="slipway"] button', { hasText: /^Delete$/ })
await del.click(); await page.waitForTimeout(700)
await shot(page, 'j6-3-delete-asks')
res.deleteAsks = await page.evaluate(() => { const r = document.querySelector('.acc-row[data-person="slipway"]'); return r ? r.innerText.replace(/\s+/g, ' ') : 'no row' })
console.log('ASKS', res.deleteAsks)
console.log(await page.evaluate(() => [...document.querySelectorAll('.acc-row[data-person="slipway"] button, [role=dialog] button')].map(b => b.innerText.trim()).join(' | ')))
const m0 = await (await import('./or-J-lib.mjs')).toastMark(page)
await page.locator('.acc-row[data-person="slipway"] button', { hasText: /Tap again to delete/ }).click(); await page.waitForTimeout(1200)
res.deleteToast = await (await import('./or-J-lib.mjs')).toastsSince(page, m0)
console.log('DELETE TOAST', res.deleteToast)
res.afterDeleteText = await page.evaluate(() => [...document.querySelectorAll('.adm-note, .toast, #toastEl, [role=status], .acc-list')].map(e => e.innerText.replace(/s+/g, ' ').slice(0, 200)).join(' || '))
await shot(page, 'j6-4-after-delete')
res.drifterRow = await page.evaluate(() => document.querySelectorAll('.acc-row[data-person="slipway"]').length)
res.after = await surfaces('2-after')
console.log(JSON.stringify(res.after))
res.deletedGroup = await page.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Training' && r.title === 'Fri brief').map(r => ({ p: (r.people||[]).map(e => window.PEOPLE[e.p]?.cs || e.p) })))
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
if (!(await page.locator('#inFPerson').isVisible().catch(() => false))) { await page.locator('#inFiltersBtn').click().catch(() => {}); await page.waitForTimeout(400) }
res.personFilter = await page.evaluate(() => { const s = document.querySelector('#inFPerson'); if (!s) return 'no filter'; return { groups: [...s.querySelectorAll('optgroup')].map(g => g.label + ': ' + [...g.children].map(o => o.textContent).join(',')), hasDrifter: [...s.options].some(o => /Drifter/.test(o.textContent)) } })
console.log('FILTER', JSON.stringify(res.personFilter)); await shot(page, 'j6-5-person-filter')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.locator('#histBtn').click(); await page.waitForTimeout(800)
await page.locator('.chgwin button', { hasText: /All changes/ }).first().click(); await page.waitForTimeout(800)
res.changes = await page.evaluate(() => document.querySelector('.chgwin').innerText.replace(/s+/g, ' ').slice(0, 900))
console.log('CHANGES', res.changes); await shot(page, 'j6-6-changes')
writeFileSync('docs/handpass/parts/or-J-j6a-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
