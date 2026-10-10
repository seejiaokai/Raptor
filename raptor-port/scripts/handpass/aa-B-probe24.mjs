import { world, fileInput, pic, sleep, go, listAll, tid } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p24'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-17', kind: 'Duty', person: 'allavail', rmk: 'P24', s: '09:00', e: '12:00', oil: null })
await listAll(page)
const tr = page.locator(`tr[data-iid="${f.rec.iid}"]`).first()
await tr.locator('[data-edit]').first().click(); await sleep(600)
await pic(w, 'pencil')
const row = page.locator('tr', { has: page.locator('input[value="P24"]') }).first()
await row.locator('.rc-d', { hasText: /^18$/ }).first().click(); await sleep(400)
console.log('rowtext', (await row.innerText()).replace(/s+/g, ' ').slice(0, 120))
await row.locator('.rc-d', { hasText: /^18$/ }).first().click(); await sleep(300)
console.log('after 2nd tap', (await row.locator('.rc-d.on, .rc-d.sel, .rc-d[aria-pressed=true]').allInnerTexts()).join(','))
await row.getByRole('button', { name: '✓' }).click(); await sleep(600)
console.log('question?', await tid(page, 'oilconf').count(), 'why', await page.evaluate(() => document.body.innerText.split(String.fromCharCode(10)).filter(l => /one day|day at a time/i.test(l)).slice(0, 3)))
if (await tid(page, 'oilconf').count()) { await page.locator('[data-testid="oilconf"] .abtn.ghost').click(); await sleep(500) }
console.log('record', JSON.stringify(await page.evaluate(i => { const x = window.INPUTS.find(v => v.iid === i); return x && { date: x.date, oil: x.oil } }, f.rec.iid)))
await pic(w, 'after')
await w.browser.close()
