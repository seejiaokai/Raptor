import { open, fileInput, shot, toWeekDay, errs, browser, unavRows, calDay, PID, openBoard, lwOpen } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
const T = 'Course wk'
res.filed = await fileInput(page, { type: 'Training', people: ['Hex', 'Hunter', 'Ranger'], from: '2026-07-13', to: '2026-07-17', timed: ['09:00', '10:00'], title: T })
console.log('filed', JSON.stringify(res.filed))
const iid = res.filed[0].iid
const days = async (label) => {
  const o = { label }
  o.inputs = await page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? { people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), date: r.date, to: r.to } : 'GONE' }, iid)
  await toWeekDay(page, 0)
  o.week = await page.evaluate(t => [0, 1, 2, 3, 4].map(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return di + ':' + [...d.querySelectorAll('.sec-grnd .pl-row')].filter(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === t).map(r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()).join(',')).join('|') }), T.toLowerCase())
  return o
}
res.before = await days('before'); console.log(JSON.stringify(res.before))
/* Leave War: Hex's Wed 15 Jul cell -> Post out */
await lwOpen(page, 'jul')
const c = page.locator('[data-testid="cell-rocky-2026-07-15"]'); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(600)
await shot(page, 'j6p-1-cellsheet')
await page.locator('[data-testid="bid-postout"]').click(); await page.waitForTimeout(500)
res.poLine = await page.evaluate(() => document.querySelector('[data-testid="po-line"]')?.innerText || '')
console.log('PO LINE', res.poLine)
await shot(page, 'j6p-2-po-sheet')
await page.locator('[data-testid="po-confirm"]').click(); await page.waitForTimeout(1200)
res.afterConfirmBtn = await page.evaluate(() => document.querySelector('[data-testid="po-confirm"]')?.innerText || '(sheet gone)')
await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(500)
res.hex = await page.evaluate(() => { const p = window.PEOPLE.rocky; return { archived: !!p.archived, san: !!p.san, deleted: !!p.deleted, po: p.po || p.posting || null } })
console.log('HEX', JSON.stringify(res.hex), res.afterConfirmBtn)
res.after = await days('after'); console.log(JSON.stringify(res.after))
await shot(page, 'j6p-3-after')
writeFileSync('docs/handpass/parts/or-J-j6b-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
