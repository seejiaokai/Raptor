import { open, go, version, shot, tapBox, scenario } from './kbs-A-lib.mjs'
version('a11')
const { browser, page, errors } = await open()
await go(page, 'admin')
await tapBox(page, page.locator('#page-admin button, #page-admin [role=button]', { hasText: /^Users/ }).first())
await page.waitForTimeout(900)
await scenario(page, 'A11', page.locator('#accAddName'), { what: 'Admin Users: new person form lowest box (sign-in name)' })
console.log('errors', errors)
await browser.close()
