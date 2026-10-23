import { L, snap } from './h.mjs'
console.log('mk-nowso v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'admin'); await page.waitForTimeout(800)
const rows = () => page.locator('#page-admin button:has-text("WSO"):not(:has-text("Archived"))')
let n = await rows().count(), guard = 0
console.log('WSO rows before', n)
while (n > 0 && guard++ < 60) {
  await rows().first().click(); await page.waitForTimeout(250)
  await page.getByRole('button', { name: 'Archive', exact: true }).click(); await page.waitForTimeout(400)
  n = await rows().count()
}
console.log('WSO rows after', n)
console.log('ERR', JSON.stringify(errors))
await ctx.storageState({ path: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-nowso.json' })
await browser.close()
