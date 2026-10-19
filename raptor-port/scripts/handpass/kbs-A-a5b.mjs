import { open, go, version, shot, tapBox, scenario } from './kbs-A-lib.mjs'
version('a5b')
const { browser, page, errors } = await open()
await go(page, 'inputs')
for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button.abtn', { hasText: '‹' }).first().tap(); await page.waitForTimeout(400) }
await tapBox(page, page.locator('[data-icday="2026-07-13"]'))
await page.waitForTimeout(900)
for (let i = 0; i < 12; i++) {
  await tapBox(page, page.getByRole('button', { name: '+ Note' })); await page.waitForTimeout(400)
  await page.keyboard.type('n' + i); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
}
await shot(page, 'A5c-many-notes')
const notes = page.locator('.ic-poppuck-edit')
await scenario(page, 'A5c', page.locator('[data-ppedit]').last(), { what: 'inputs day: edit box of the 12th note, low in the day panel', skipLow: true, inWindow: true, resolve: () => page.evaluateHandle(() => document.activeElement) })
await browser.close()
