import { open, fileInput, shot, toWeekDay, errs, browser, unavRows, calDay, PID, lwOpen, toastMark, toastsSince, toast, undoOnce, redoOnce } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
/* the browser's clock stands at Wed 15 Jul 2026, so a posting "from today" is dated a day inside the Mon-Fri input */
const { ctx, page } = await open({ fresh: true, clock: '2026-07-15T09:00:00' })
const res = {}
const rows = async (label) => {
  await toWeekDay(page, 0)
  const o = { label }
  o.inputs = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && r.date === 'Jul 13').map(r => ({ people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs), end: r.endDate })))
  o.days = []
  for (let di = 0; di < 5; di++) o.days.push(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][di] + ':' + (await unavRows(page, di)).filter(r => /^LL/.test(r.text) && r.people.some(n => ['Hex', 'Hunter'].includes(n))).map(r => r.people.join('+')).join(','))
  o.hex = await page.evaluate(() => { const x = window.PEOPLE.rocky; return { archived: !!x.archived, deleted: !!x.deleted, san: !!x.san, archivedBy: x.archivedBy || '' } })
  return o
}
res.filed = await fileInput(page, { type: 'LL', people: ['Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
console.log('filed', JSON.stringify(res.filed))
res.before = await rows('before'); console.log(JSON.stringify(res.before)); await shot(page, 'j6q-1-before')
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
const t = page.locator('[data-admcat="users"]'); if (await t.count()) { await t.first().click(); await page.waitForTimeout(500) }
const row = page.locator('.acc-row[data-person="rocky"]').first()
await row.scrollIntoViewIfNeeded(); await row.locator('.acc-tap').click(); await page.waitForTimeout(600)
const m = await toastMark(page)
await page.locator('.acc-row[data-person="rocky"] button', { hasText: /^Archive$/ }).click(); await page.waitForTimeout(800)
res.archiveToast = await toastsSince(page, m); console.log('TOAST', res.archiveToast)
res.after = await rows('after archive (Wed 15 Jul)'); console.log(JSON.stringify(res.after)); await shot(page, 'j6q-3-after')
const sec = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').first(); await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/j6q-3b-wed-unavail.png' })
await page.evaluate(() => window.go('quals')); await page.waitForTimeout(600)
res.hexAfter = await page.evaluate(() => ({ onRoster: !!document.querySelector('#qtbl td.qname[data-person="rocky"]'), archBtn: !!document.querySelector('#qArchToggle') }))
await lwOpen(page, 'jul')
res.lw = await page.evaluate(() => ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'].map(d => { const c = document.querySelector('[data-testid="cell-rocky-' + d + '"]'); return d.slice(5) + '=' + (c ? '"' + c.innerText.trim() + '" ' + c.className.slice(0, 40) : 'no cell') }).join(' '))
console.log('LW', res.lw); await shot(page, 'j6q-4-lw')
writeFileSync('docs/handpass/parts/or-J-j6c-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
