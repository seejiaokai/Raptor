// fixture2: the same world with the week of Jul 20 loaded (pressed through the week button), saved as state2.json
import { launch, go, say, IMG } from './wlib.mjs'
import path from 'node:path'
say('fixture2 v1')
const { browser, ctx, page } = await launch('chromium', false, true)
await go(page, 'editsched')
await page.getByRole('button', { name: 'Jul 20' }).click(); await page.waitForTimeout(900)
await page.reload(); await page.waitForTimeout(800)
if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(800) }
await go(page, 'editsched')
say('chips after reload', await page.locator('#eWeek .oilcount').count(), 'first day', await page.locator('#eWeek .day').first().innerText().then(t => t.slice(0, 20)))
await ctx.storageState({ path: path.join(IMG, '..', 'state2.json') })
await browser.close()
