/* host probe — [KEYBOARD-SCROLL] walker B's B7: "Red from" 2 under Amber 3 — does Save say why it keeps 5? */
import { open, version, tapBox } from './kbs-A-lib.mjs'
version('host-b7-1')
const { browser, page } = await open()
await page.evaluate(() => window.go('logic')); await page.waitForTimeout(700)
await page.evaluate(() => document.querySelector('[data-lgopen="sans"]').click()); await page.waitForTimeout(600)
const red = page.locator('input.sset-num').nth(2)
await tapBox(page, red); await page.keyboard.type('2')
console.log('red box', await red.inputValue())
await page.locator('button', { hasText: /^Save$/ }).last().click(); await page.waitForTimeout(500)
console.log('message', await page.evaluate(() => document.querySelector('[data-testid="sset-err"]')?.textContent || 'NONE'))
await page.screenshot({ path: 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-b7-save-refused.png' })
await browser.close()
