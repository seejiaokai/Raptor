import { open, version, scenario } from './kbs-A-lib.mjs'
version('a17')
const { browser, page, errors } = await open({ login: false })
await page.waitForSelector('#lpass'); await page.waitForTimeout(600)
await scenario(page, 'A17', page.locator('#lpass'), { what: 'Sign-in page password box', skipLow: true })
console.log('errors', errors); await browser.close()
