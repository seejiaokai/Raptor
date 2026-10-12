import { open, fileInput, toBoard, toWeek, browser, errs, csId, sleep, shot, signAndPublish, rosterPuckOf, weekRow, dragLocToLoc } from './or-G-lib.mjs'
for (const clock of ['2026-06-22T09:00:00', null]) {
  const { ctx, page } = await open('ad', 'a', undefined, { clock })
  await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
  await signAndPublish(page, 5)
  const H = await csId(page, 'Hex')
  await toWeek(page)
  await dragLocToLoc(page, rosterPuckOf(page, H), weekRow(page, 5, 'Range brief').locator('.addz'))
  await toBoard(page, 5)
  await page.locator('#sbOil').click(); await sleep(900)
  const grnd = page.locator('#schedBoard .sb-panel.grnd').first()
  console.log('clock', clock, 'chip', await page.locator('#schedBoard').evaluate(b => (b.querySelector('.oil-chip, .sb-oilsum, [class*=oilsum]')?.innerText || '') + ' || ' + [...b.querySelectorAll('*')].filter(e => /earns|Nothing today/i.test(e.textContent) && e.children.length === 0).map(e => e.textContent.trim()).slice(0, 5).join(' / ')))
  console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .puck')].map(e => e.textContent.trim().replace(/\s+/g, ' ') + ' :: ' + e.className + ' :: ' + (e.title || '')).join('\n')))
  await grnd.scrollIntoViewIfNeeded(); await sleep(300)
  await shot(page, 'x5-' + (clock ? 'clock' : 'noclock'))
  await ctx.close()
}
console.log(errs)
await browser.close()
