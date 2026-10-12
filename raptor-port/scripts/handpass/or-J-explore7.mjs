import { open, shot, errs, browser } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
const t = page.locator('[data-admcat="users"]'); if (await t.count()) { await t.first().click(); await page.waitForTimeout(500) }
await page.locator('[data-acct="achex"] .acc-tap').click(); await page.waitForTimeout(700)
await shot(page, 'x-admin-hex')
console.log(await page.evaluate(() => [...document.querySelectorAll('button, [data-testid]')].filter(b => b.offsetParent && /delete|archive|remove|post/i.test((b.innerText || '') + (b.dataset.testid || ''))).map(b => b.dataset.testid + '|' + (b.innerText||'').trim().slice(0, 50)).join('\n')))
await ctx.close(); await browser.close()
