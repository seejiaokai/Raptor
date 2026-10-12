import { open, fileInput, shot, toWeek, errs, browser, PID } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
res.f1 = await fileInput(page, { type: 'ATT C', person: 'Tally', from: '2026-07-13', to: '2026-07-14' })
res.f2 = await fileInput(page, { type: 'ATT C', person: 'Ranger', from: '2026-07-13', to: '2026-07-14' })
console.log('filed', JSON.stringify([res.f1, res.f2]).slice(0, 400))
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
await page.locator('#inMedBtn').click(); await page.waitForTimeout(800)
await shot(page, 'j8-a-medical')
res.cards = await page.evaluate(() => [...document.querySelectorAll('#page-inputs [data-testid="medcard-placed"]')].map(e => { const c = e.closest('button, .medcard, [class*=card]') || e.parentElement; return c.innerText.replace(/\s+/g, ' ').slice(0, 120) }))
console.log(res.cards.join('\n'))
res.text = await page.evaluate(() => /undefined|NaN|null/.test(document.querySelector('#page-inputs').innerText))
console.log('has undefined/NaN/null in page text:', res.text)
res.groups = await page.evaluate(() => [...document.querySelectorAll('#page-inputs h3, #page-inputs [class*=head]')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 50)).slice(0, 12))
/* the crew list's own order (Edit Schedule roster) */
await toWeek(page)
res.crewOrder = await page.evaluate(() => [...document.querySelectorAll('#eRoster .rpuck')].map(e => window.PEOPLE[e.dataset.person]?.cs))
res.crewIdx = { Ranger: res.crewOrder.indexOf('Ranger'), Tally: res.crewOrder.indexOf('Tally'), Grit: res.crewOrder.indexOf('Grit'), Vector: res.crewOrder.indexOf('Vector') }
console.log('crew idx', JSON.stringify(res.crewIdx), 'first 30:', res.crewOrder.slice(0, 30).join(','))
console.log('crew has', res.crewOrder.length)
writeFileSync('docs/handpass/parts/or-J-j8-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
