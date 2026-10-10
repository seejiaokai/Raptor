const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, pidOf } = C
const w = await world(); const { page } = w
const p = await pidOf(page, 'Ranger')
await go(page, 'admin'); await sleep(600)
if (!(await page.locator('#accList:visible').count())) { const u = page.getByText('Sign-in and roster'); if (await u.count()) { await u.first().click(); await sleep(600) } }
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent).map(e => e.dataset.testid).filter(t => /acc|user|person|new/i.test(t)).slice(0, 40)))
const row = page.locator(`#accList [data-person="${p}"]`).first()
console.log('row', await row.count())
await row.click(); await sleep(600)
await shot(page, 'probe15-row')
await page.getByRole('button', { name: 'Archive', exact: true }).first().click(); await sleep(700)
await shot(page, 'probe15-archive')
console.log(await page.evaluate(() => [...document.querySelectorAll('input, button, select, [data-testid]')].filter(b => b.offsetParent).map(b => (b.dataset.testid || b.id) + '|' + (b.type || '') + '|' + (b.value || b.innerText || '').trim().slice(0, 24)).filter(t => t.length > 4).slice(-30)))
await w.browser.close()
