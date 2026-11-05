// Walker A, part 7: S19 follow-up - what is the .saveband still in the page after signing in
import { L, VER, shot, sleep } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a7')
for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, ctx } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1200)
  await L.signOut(page); await page.waitForSelector('#login'); await sleep(600)
  await L.signIn(page, 'us', 'us'); await sleep(1200)
  const d = await page.evaluate(() => [...document.querySelectorAll('.saveband, .savestat.failed')].map(e => { const b = e.getBoundingClientRect(), cs = getComputedStyle(e); return { cls: e.className, parent: e.parentElement.className + '#' + e.parentElement.id, rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], display: cs.display, vis: cs.visibility, pos: cs.position, z: cs.zIndex, text: e.textContent.replace(/\s+/g, ' ').slice(0, 40), hiddenAncestor: !!e.closest('[hidden],[style*="display: none"],[style*="display:none"]') } }))
  L.note(`S19b-${sfx}`, d)
  await shot(page, `S19b-member-top-${sfx}`, { x: 0, y: 0, width: size === 'desktop' ? 1536 : 402, height: 200 })
  await ctx.close()
}
await L.finish('mgb-walk-a7').catch(() => {})
process.exit(0)
