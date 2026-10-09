import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDayWin, press, isTouch, fileCommit, toMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const L = (...a) => console.log(size, ...a)
const { ctx, page, errors } = await world(browser, size)
await backToSans(page, size, 2026, 10)
const how = async tag => {
  if (!(await tid(page, 'sc-how-list').isVisible().catch(() => false))) await press(size, tid(page, 'sc-how'))
  await page.waitForTimeout(250)
  const lines = await tid(page, 'sc-how-list').locator('li').allInnerTexts().catch(() => [])
  L(tag, 'HOW lines', lines.length, '| last:', (await tid(page, 'sc-how-cut').innerText()).replace(/\s+/g, ' '))
  return lines
}
const logicRow = async tag => {
  await page.evaluate(() => window.go('logic')); await page.waitForTimeout(700)
  const t = await page.evaluate(() => { const e = [...document.querySelectorAll('.lgrule')].find(x => /SANS availability.{0,20}entry has a deadline/i.test(x.textContent)); return e ? e.textContent.replace(/\s+/g, ' ').slice(0, 220) : 'NOT FOUND' })
  L(tag, 'LOGIC row:', t)
  await backToSans(page, size, 2026, 10)
}
const setCut = async (label, fn, save = true) => {
  await press(size, tid(page, 'sc-gear')); await tid(page, 'win-sansset').waitFor(); await page.waitForTimeout(250)
  await fn()
  L(label, 'worked example (draft):', (await tid(page, 'sset-example').innerText().catch(() => '-')).replace(/\s+/g, ' '))
  await press(size, tid(page, save ? 'sset-save' : 'sset-cancel')); await page.waitForTimeout(400)
}
const line1 = await how('DEFAULT')
L('all five lines:', JSON.stringify(line1))
await shot(page, `p410-${size}-how-default`)
await logicRow('DEFAULT')
// file two entries: Oct 12 (late under the default) and Oct 26 (not yet late) — then read each one's own words
await backToSans(page, size, 2026, 10)
for (const [d, who] of [['2026-10-12', 'yeti'], ['2026-10-26', 'ipman']]) {
  await press(size, cell(page, d), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
  await fileCommit(page, size, who, { f: true }); await page.click('#inpEditSave'); await page.waitForTimeout(450)
  await tid(page, 'win-sansday-x').click().catch(() => {}); await page.waitForTimeout(200)
}
const lateWords = async tag => {
  const out = {}
  for (const d of ['2026-10-12', '2026-10-26']) {
    if (!(await tid(page, 'win-sansday').count()) || !(await tid(page, 'win-sansday').getAttribute('aria-label')).includes(String(+d.slice(8)))) { if (await tid(page, 'win-sansday').count()) await tid(page, 'win-sansday-x').click(); await press(size, cell(page, d), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
    await page.waitForTimeout(250)
    const late = tid(page, 'win-sansday').locator('[data-testid="sd-late"]')
    if (await late.count()) { await press(size, late.first()); await page.waitForTimeout(250); out[d] = 'LATE: ' + (await tid(page, 'win-sansday').locator('[data-testid="sd-latenote"]').innerText().catch(() => '(no note)')).replace(/\s+/g, ' ') } else out[d] = 'not late'
  }
  L(tag, 'LATE words:', JSON.stringify(out))
  await shot(page, `p410-${size}-late-${tag.replace(/\W/g, '')}`)
  await tid(page, 'win-sansday-x').click().catch(() => {})
}
await lateWords('default')
// view another month: the words must be the entry's own (Oct), not the viewed month's
await toMonth(page, size, 2026, 11); await how('viewing NOV'); await toMonth(page, size, 2026, 10)
// 1. DAYS mode, 7 days
await setCut('days 7', async () => { await tid(page, 'sset-mode-days').click(); await tid(page, 'sset-lead').fill('7') })
await how('SAVED days 7'); await logicRow('SAVED days 7'); await lateWords('days7')
// 2. WEEKDAY mode: Friday, 1 week before
await setCut('weekday', async () => { await tid(page, 'sset-mode-wd').click(); await tid(page, 'sset-wd').selectOption({ label: 'Friday' }).catch(async () => { await tid(page, 'sset-wd').selectOption('4') }); await tid(page, 'sset-weeks').selectOption('1') })
await how('SAVED Fri 1 week'); await logicRow('SAVED Fri 1wk'); await lateWords('fri1')
await shot(page, `p410-${size}-how-fri`)
// 3. a cancelled draft changes nothing
await setCut('draft cancelled', async () => { await tid(page, 'sset-mode-days').click(); await tid(page, 'sset-lead').fill('30') }, false)
await how('AFTER CANCELLED draft'); await logicRow('AFTER CANCELLED draft')
// ✕ and Escape too
await press(size, tid(page, 'sc-gear')); await tid(page, 'win-sansset').waitFor(); await tid(page, 'sset-mode-days').click(); await tid(page, 'sset-lead').fill('45'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
L('after Escape: window', await tid(page, 'win-sansset').count()); await how('AFTER Escape draft')
console.log(errors.join('|'))
await ctx.close(); await browser.close()
