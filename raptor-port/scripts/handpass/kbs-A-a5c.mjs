import { open, go, version, shot, tapBox, keysUp, keysDown, state } from './kbs-A-lib.mjs'
version('a5c')
const { browser, page } = await open()
await go(page, 'inputs')
for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button.abtn', { hasText: '‹' }).first().tap(); await page.waitForTimeout(400) }
await tapBox(page, page.locator('[data-icday="2026-07-13"]'))
await page.waitForTimeout(900)
for (let i = 0; i < 12; i++) { await tapBox(page, page.getByRole('button', { name: '+ Note' })); await page.waitForTimeout(400); await page.keyboard.type('n' + i); await page.keyboard.press('Enter'); await page.waitForTimeout(300) }
const probe = (tag) => page.evaluate((tag) => {
  const a = document.activeElement; let sc = a.parentElement
  while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight + 1)) sc = sc.parentElement
  const r = a.getBoundingClientRect(); const s = sc && sc.getBoundingClientRect()
  return `${tag}: box ${Math.round(r.top)}-${Math.round(r.bottom)} scroller=${sc && (sc.id || sc.className)} st=${sc && sc.scrollTop} max=${sc && sc.scrollHeight - sc.clientHeight} scrollerRect=${s && Math.round(s.top)}-${s && Math.round(s.bottom)}`
}, tag)
await tapBox(page, page.locator('[data-ppedit]').last())
await page.waitForTimeout(500)
console.log(await probe('tapped'))
await keysUp(page)
console.log(await probe('keys up'))
await keysDown(page)
console.log(await probe('keys down'))
await browser.close()
